import babelParser from '@babel/eslint-parser';
import reactPlugin from 'eslint-plugin-react';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ['@babel/preset-react'],
        },
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        process: 'readonly',
      },
    },
    plugins: { react: reactPlugin },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      semi: ['error', 'always'],
      quotes: ['error', 'double'],
      indent: ['error', 2],
      ...prettierConfig.rules,
    },
  },
];
