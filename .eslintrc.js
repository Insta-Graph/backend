module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'airbnb-base',
    'prettier',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    project: ['./tsconfig.json'],
  },
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_+' }],
    indent: 'off',
    'class-methods-use-this': 'off',
    'import/extensions': 'off',
    'comma-dangle': 'off',
    'no-underscore-dangle': 'off',
    'implicit-arrow-linebreak': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_*' }],
    '@typescript-eslint/ban-ts-comment': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: ['**/*.test.js', '**/*.test.ts', '**/mocked_data/*.ts'],
      },
    ],
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts'],
        paths: ['src'],
      },
    },
  },
};
