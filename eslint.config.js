import js from '@eslint/js';
import globals from 'globals';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import vue from 'eslint-plugin-vue';
import vueEslintParser from 'vue-eslint-parser';
import prettier from 'eslint-plugin-prettier';

export default [
  {
    ignores: ['node_modules/', 'dist/', '.nuxt/', '.output/', '.wrangler/'],
  },
  {
    files: ['**/*.js', '**/*.ts'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parser: typescriptParser,
      globals: {
        ...globals.browser,
        ...globals.node,
        // Nuxt 3/4 globals
        defineNuxtConfig: 'readonly',
        defineEventHandler: 'readonly',
        createError: 'readonly',
        getHeader: 'readonly',
        getRouterParam: 'readonly',
        readBody: 'readonly',
        $fetch: 'readonly',
        // Vue 3 globals
        ref: 'readonly',
        reactive: 'readonly',
        shallowRef: 'readonly',
        computed: 'readonly',
        watch: 'readonly',
        onMounted: 'readonly',
        onUnmounted: 'readonly',
        // Pinia globals
        defineStore: 'readonly',
        storeToRefs: 'readonly',
        // H3 globals
        getRequestIP: 'readonly',
        setHeader: 'readonly',
        // Cloudflare Workers/Wrangler globals
        D1Database: 'readonly',
        // Additional H3 helpers
        getCookie: 'readonly',
        setCookie: 'readonly',
        deleteCookie: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      prettier,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...typescriptEslint.configs.recommended.rules,
      'prettier/prettier': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueEslintParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        parser: typescriptParser,
      },
      globals: {
        ...globals.browser,
        // Vue 3 template globals
        ref: 'readonly',
        reactive: 'readonly',
        shallowRef: 'readonly',
        computed: 'readonly',
        watch: 'readonly',
        onMounted: 'readonly',
        onUnmounted: 'readonly',
        // Nuxt 3/4 globals in templates
        useHead: 'readonly',
        useRoute: 'readonly',
        useRouter: 'readonly',
        useAsyncData: 'readonly',
        useFetch: 'readonly',
        defineProps: 'readonly',
        defineEmits: 'readonly',
        defineExpose: 'readonly',
      },
    },
    plugins: {
      vue: vue,
      prettier: prettier,
    },
    processor: vue.processors['.vue'],
    rules: {
      ...vue.configs['flat/recommended'].rules,
      'prettier/prettier': 'error',
      'vue/multi-word-component-names': 'off',
    },
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
    },
  },
];
