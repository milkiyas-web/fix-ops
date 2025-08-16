module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'js'],
    testMatch: ['**/__test__/**/*.test.ts'],
    setupFiles: ['<rootDir>/jest.setup.js'],
}; 