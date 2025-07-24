module.exports = {
  moduleFileExtensions: ["ts", "tsx", "js", "json"],
  testRegex: ".*\\.spec\\.ts$",
  rootDir: "src",
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
  testPathIgnorePatterns: ["build"],
};
