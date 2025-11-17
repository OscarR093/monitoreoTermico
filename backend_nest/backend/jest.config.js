module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: 'src/.*\\.spec\\.ts$',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!**/node_modules/**',
    '!src/main.ts',
    '!src/app.module.ts',
    '!test/**'
  ],
  coverageDirectory: './coverage',
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './test-reports',
        filename: 'test-report.html',
        pageTitle: 'Test Report - Backend Monitoreo Térmico',
        expand: true,
      },
    ],
  ],
};