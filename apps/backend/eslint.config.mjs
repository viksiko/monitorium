// eslint.config.js
import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';
import ts from 'typescript-eslint';

export default ts.config(
    {
        ignores: ['dist/**', 'node_modules/**', 'eslint.config.js', 'prisma/seed/**/*.ts'],
    },
    js.configs.recommended,
    ...ts.configs.recommended,
    {
        plugins: {
            import: importPlugin,
        },
    },
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },
            ecmaVersion: 2022,
            sourceType: 'module',
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-floating-promises': 'warn',
            '@typescript-eslint/no-unsafe-argument': 'warn',
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            '@typescript-eslint/explicit-function-return-type': [
                'error',
                {
                    allowExpressions: false,
                    allowTypedFunctionExpressions: true,
                },
            ],

            'import/order': [
                'error',
                {
                    groups: [
                        'builtin',
                        'external',
                        'parent',
                        'sibling',
                        'index',
                        'object',
                        'type',
                    ],
                    pathGroups: [
                        {
                            pattern: '@/**/**',
                            group: 'parent',
                            position: 'before',
                        },
                    ],
                    alphabetize: { order: 'asc', caseInsensitive: true },
                },
            ],
            'sort-imports': [
                'error',
                {
                    ignoreCase: true,
                    ignoreDeclarationSort: true,
                    ignoreMemberSort: false,
                    memberSyntaxSortOrder: [
                        'none',
                        'all',
                        'multiple',
                        'single',
                    ],
                    allowSeparatedGroups: false,
                },
            ],
        },
    },
);
