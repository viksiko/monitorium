// jest.config.ts
import type { Config } from 'jest';

const config: Config = {
    verbose: true,
    // Список путей к конфигам ваших приложений
    projects: [
        '<rootDir>/apps/backend/jest.config.js',
        '<rootDir>/apps/frontend/jest.config.ts',
    ],
};

export default config;
