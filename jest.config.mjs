/** Node-side tests for the A/B harness. Component tests are added from Phase 1. */
export default {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.mjs', '<rootDir>/tests/**/*.test.ts', '<rootDir>/tests/**/*.test.tsx'],
  transform: {},
  moduleFileExtensions: ['mjs', 'js', 'ts', 'tsx', 'json'],
};
