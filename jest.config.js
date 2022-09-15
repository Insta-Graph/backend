/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: ['!src/types/**/*.ts', 'src/**/*'],
  coveragePathIgnorePatterns: ['.*test$', '/node_modules/', 'src/locales/'],
  coverageReporters: ['lcov', 'text', 'cobertura'],
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 75,
      lines: 65,
      statements: 70,
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
  },
};
