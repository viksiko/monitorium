import { defineConfig } from 'orval';

const port = process.env.API_PORT ?? '3000';
const openApiUrl = process.env.ORVAL_OPENAPI_URL ?? `http://localhost:${port}/api/v1/docs-json`;

export default defineConfig({
    monitorium: {
        input: {
            target: openApiUrl,
        },
        output: {
            mode: 'tags-split',
            target: './src/lib/generated/endpoints.ts',
            schemas: './src/lib/generated/model',
            client: 'axios-functions',
            httpClient: 'axios',
            prettier: false,
            clean: true,
            override: {
                mutator: {
                    path: './src/lib/orval-mutator.ts',
                    name: 'customInstance',
                },
            },
        },
    },
});
