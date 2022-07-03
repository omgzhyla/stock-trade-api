module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    jsx: false
  },
  rules: {
    "no-unused-vars": ["error", {"args": "all", "argsIgnorePattern": "^_"}]
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:prettier/recommended',
  ]
};
