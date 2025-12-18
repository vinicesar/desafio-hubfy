// jest.config.cjs
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./", 
});

const customJestConfig = {
  testEnvironment: "node",

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },

  testMatch: ["**/tests/**/*.test.ts"],

  testTimeout: 30000, 

  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
};

module.exports = createJestConfig(customJestConfig);
