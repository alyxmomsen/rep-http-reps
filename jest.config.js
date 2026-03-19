module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'app/**/*.js',
    '!app/**/*.test.js',
    '!app/**/__tests__/**'
  ]
};