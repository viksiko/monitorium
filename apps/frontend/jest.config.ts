export default {
    displayName: 'frontend',
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    rootDir: './',
    testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
    moduleNameMapper: {
        // Обработка CSS и картинок, чтобы Jest не ломался
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
    },
};
