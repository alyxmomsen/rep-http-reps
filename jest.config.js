module.exports = {
    testEnvironment: 'node',
    testMatch: [
        '**/__tests__/**/*.test.js', // поддержка старого стиля
        'app/**/*.test.js', // поддержка тестов рядом с кодом
    ],
    collectCoverageFrom: [
        'app/**/*.js',
        '!app/**/*.test.js',
        '!app/**/__tests__/**',
    ],
};
