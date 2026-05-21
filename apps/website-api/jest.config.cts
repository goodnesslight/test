const { readFileSync } = require('fs');

const swcJestConfig: Record<string, unknown> = JSON.parse(
  readFileSync(`${__dirname}/.spec.swcrc`, 'utf-8')
);

swcJestConfig.swcrc = false;

module.exports = {
  displayName: 'api',
  testEnvironment: 'node',
  coverageDirectory: 'test-output/jest/coverage',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]s$': ['@swc/jest', swcJestConfig],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
};
