module.exports = {
  // The root directory of your project.
  rootDir: __dirname,

  // The test environment that will be used.
  testEnvironment: "node",

  roots: ["./src"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
      },
    ],
  },
  //testRegex: "(/__tests__/.*|(.|/)(test|spec)).tsx?$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  // The test files that should be run.
  testMatch: ["**/__tests__/**/*.ts", "**/**/*.tests.ts"],

  // The reporters that should be used.
  reporters: ["default"],

  // The coverage reporter that should be used.
  coverageReporters: ["json", "lcov"],

  // The path to the coverage report file.
  coveragePathIgnorePatterns: ["/node_modules/", "/__tests__/"],

  // The maximum number of test files that should be run in parallel.
  //maxWorkers: 1,

  // The number of milliseconds to wait before killing a test that is running too long.
  testTimeout: 10000,

  // A list of paths to modules that run some code to configure or set up the testing framework before each test.
  setupFilesAfterEnv: ["./jest.setup.ts"],
};
