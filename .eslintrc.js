// eslint-disable-next-line @typescript-eslint/no-require-imports
const prettierConfig = require('./.prettierrc.js');

module.exports = {
  root: true,
  overrides: [
    {
      files: '*.ts',
      env: {
        es2021: true,
        node: true,
        jest: true,
      },
      extends: ['airbnb-base', 'airbnb-typescript/base', 'prettier'],
      plugins: ['prettier'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
        project: './tsconfig.json'
      },
      rules: {
        'prettier/prettier': ['error', prettierConfig],
        'max-nested-callbacks': 'off',
        'import/extensions': ['error', { ts: 'never' }],
        'import/prefer-default-export': 'off',
        'no-underscore-dangle': 'off',
        'class-methods-use-this': 'off'
      },
    },
    {
      files: '*.js',
      env: {
        node: true,
      },
      extends: ['airbnb-base', 'prettier'],
      plugins: ['prettier'],
      rules: {
        'prettier/prettier': ['error', prettierConfig],
      },
    },
  ],
  ignorePatterns: ['src/generated/**/*', 'scripts/**/*'],
};
