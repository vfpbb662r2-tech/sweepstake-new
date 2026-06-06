/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["../../.eslintrc.js", "expo"],
  env: {
    browser: true,
    "react-native/react-native": true,
  },
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  plugins: ["react-native"],
  rules: {
    "react-native/no-unused-styles": "error",
    "react-native/split-platform-components": "error",
    "react-native/no-inline-styles": "warn",
    "react-native/no-color-literals": "warn",
  },
};