module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'airbnb-base',
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
    'prettier/prettier': [
      1,
      {
        trailingComma: 'es5',
        singleQuote: true,
      },
    ],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_+' }],
    'object-curly-newline': [
      'error',
      {
        ObjectExpression: { consistent: true, multiline: true },
        ObjectPattern: { consistent: true, multiline: true },
        ImportDeclaration: 'never',
        ExportDeclaration: { multiline: true, minProperties: 3 },
      },
    ],
    indent: ['error', 2, { ignoredNodes: ['PropertyDefinition'] }],
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
