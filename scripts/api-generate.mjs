import { spawn, spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import treeKill from 'tree-kill';

const treeKillAsync = promisify(treeKill);

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const backendDir = join(root, 'apps', 'backend');
const frontendDir = join(root, 'apps', 'frontend');

const port = process.env.API_PORT || '3000';
const openApiUrl =
    process.env.ORVAL_OPENAPI_URL ||
    `http://127.0.0.1:${port}/api/v1/docs-json`;

/** @type {import('node:child_process').ChildProcess | null} */
let backend = null;

async function shutdown() {
    if (!backend) return;
    const pid = backend.pid;
    backend = null;
    if (pid == null) return;
    try {
        await treeKillAsync(pid, 'SIGTERM');
    } catch {
        try {
            process.kill(pid, 'SIGTERM');
        } catch {
            // ignore
        }
    }
}

async function waitForOpenApi(timeoutMs = 120_000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        if (
            backend &&
            (backend.exitCode !== null || backend.signalCode !== null)
        ) {
            throw new Error(
                `Бэкенд завершился (code=${backend.exitCode}, signal=${backend.signalCode}) до появления OpenAPI.`,
            );
        }
        try {
            const res = await fetch(openApiUrl, {
                signal: AbortSignal.timeout(3000),
            });
            if (res.ok) return;
        } catch {
            // ignore
        }
        await new Promise((r) => setTimeout(r, 500));
    }
    throw new Error(
        `Не дождались OpenAPI по адресу ${openApiUrl} за ${timeoutMs} мс. Убедитесь, что БД доступна и API_PORT в .env совпадает с портом бэкенда.`,
    );
}

process.on('SIGINT', async () => {
    await shutdown();
    process.exit(130);
});

backend = spawn('npx', ['nest', 'start'], {
    cwd: backendDir,
    shell: true,
    stdio: 'inherit',
    env: { ...process.env },
});

backend.on('error', (err) => {
    console.error('Не удалось запустить бэкенд:', err);
    process.exit(1);
});

try {
    await waitForOpenApi();
    const gen = spawnSync('npx', ['orval', '--config', 'orval.config.ts'], {
        cwd: frontendDir,
        shell: true,
        stdio: 'inherit',
        env: {
            ...process.env,
            ORVAL_OPENAPI_URL: openApiUrl,
        },
    });
    const code = gen.status ?? 1;
    await shutdown();
    process.exit(code);
} catch (e) {
    console.error(e);
    await shutdown();
    process.exit(1);
}
