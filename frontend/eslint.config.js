import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import ts from 'typescript'
import * as espree from 'espree'

const tsParser = {
  parse(code) {
    const transpiled = ts.transpileModule(code, {
      compilerOptions: {
        jsx: ts.JsxEmit.Preserve,
        target: ts.ScriptTarget.ES2020,
      },
    })
    return espree.parse(transpiled.outputText, {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
      tokens: true,
      comment: true,
      range: true,
      loc: true,
    })
  },
}

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-undef': 'off', // TypeScript compiler handles undeclared variables and types
      'no-unused-vars': 'off', // Handled by TypeScript compiler
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
])
