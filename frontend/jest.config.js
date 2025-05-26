// jest.config.js
/** @type {import("ts-jest").JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    // Handle CSS imports (if any)
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    // Handle image imports
    "\\.(gif|ttf|eot|svg|png)$": "<rootDir>/__mocks__/fileMock.js",
    // Alias to match tsconfig paths (if needed)
    // "^@components/(.*)$": "<rootDir>/src/components/$1",
  },
  transform: {
    // Use ts-jest for ts/tsx files
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
      },
    ],
  },
  // Ignore node_modules, except for specific modules if needed
  transformIgnorePatterns: [
    "/node_modules/",
    "\\.pnp\\.[^/]+$",
  ],
};

