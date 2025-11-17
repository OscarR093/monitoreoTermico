module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '../',
  testRegex: 'test/.*\\.e2e-spec\\.ts$',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/main.ts',
    '!**/node_modules/**',
  ],
  coverageDirectory: './coverage',
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './test-reports',
        filename: 'e2e-test-report.html',
        pageTitle: 'E2E Test Report - Backend Monitoreo Térmico',
        expand: true,
      },
    ],
  ],
};