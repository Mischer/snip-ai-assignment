import js from '@eslint/js';
import globals from 'globals';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';

export default [
    js.configs.recommended,
    {
        files: ['**/*.ts', '**/*.test.ts', 'tests/**/*.ts'],
        languageOptions: {
            parser: tsparser,
            ecmaVersion: 2021,
            sourceType: 'module',
            globals: { ...globals.node, ...vitest.environments.env.globals },
        },
        plugins: { '@typescript-eslint': tseslint, vitest },
        rules: {
            ...tseslint.configs.recommended.rules,
            curly: ['error', 'all'],
            '@typescript-eslint/no-unused-vars': ['warn'],
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
    prettier,
    { ignores: ['dist/**', 'node_modules/**'] },
];
