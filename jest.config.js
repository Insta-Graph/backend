/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: ['!src/types/**/*.ts', 'src/**/*'],
  coveragePathIgnorePatterns: [
    '.*test$',
    '/node_modules/',
    'src/locales/',
    'src/constants/',
    'src/index',
    'src/lambda',
  ],
  coverageReporters: ['lcov', 'text', 'cobertura'],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: {
    '^utils/(.*)$': '<rootDir>/src/utils/$1',
    '^resolvers/(.*)$': '<rootDir>/src/resolvers/$1',
    '^types/(.*)$': '<rootDir>/src/types/$1',
    '^entity/(.*)$': '<rootDir>/src/entity/$1',
    '^constants/(.*)$': '<rootDir>/src/constants/$1',
    '^mocked_data/(.*)$': '<rootDir>/src/mocked_data/$1',
    '^middleware/(.*)$': '<rootDir>/src/middleware/$1',
  },
};

process.env = Object.assign(process.env, {
  ENVIRONMENT: 'development',
});
