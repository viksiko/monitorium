// apps/backend/jest.config.js
module.exports = {
    displayName: 'backend',

    preset: 'ts-jest',

    testEnvironment: 'node',

    rootDir: __dirname,

    testMatch: ['<rootDir>/src/**/*.spec.ts'],

    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1',
        '^@src/(.*)$': '<rootDir>/src/$1',
        '^@libs/(.*)$': '<rootDir>/libs/$1',
        '^@shared/middleware$': '<rootDir>/libs/middleware/src',
        '^@shared/middleware/(.*)$': '<rootDir>/libs/middleware/src/$1',
        '^@shared/filter': '<rootDir>/libs/filter/src',
        '^@shared/filter/(.*)$': '<rootDir>/libs/filter/src/$1',
        '^@shared/interceptor': '<rootDir>/libs/interceptor/src',
        '^@shared/interceptor/(.*)$': '<rootDir>/libs/interceptor/src/$1',
        '^@monorepo/types$': '<rootDir>/../../packages/types/src',
        // '^@monorepo/types/(.*)$': '<rootDir>/../../packages/types/src/$1',
        // '^uuid$': require.resolve('uuid'),
    },

    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.module.ts',
        '!src/main.ts',
        '!src/**/*.dto.ts',
    ],

    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

    // transformIgnorePatterns: [
    //     // Разрешаем Jest транспилировать uuid, даже если он в node_modules
    //     '/node_modules/(?!uuid)/',
    // ],
};
