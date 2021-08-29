const isProduction = process.env === 'production';
const ALLOW = 0;
const WARN = 1;
const ERROR = 2;

module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
    browser: true,
    'jest/globals': true,
  },
  globals: {
    Spotify: 'readonly',
  },
  // .vue ファイルの template のパーサー
  parser: 'vue-eslint-parser',
  parserOptions: {
    // .vue ファイルの script と .ts ファイルのパーサー
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020,
    sourceType: 'module',
    extraFileExtensions: ['.vue'],
  },
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    // @typescript-eslint/eslint-plugin と @nuxtjs/eslint-config を拡張
    '@nuxtjs/eslint-config-typescript',
    'plugin:vue/recommended',
    // eslint-plugin-vue を拡張
    'plugin:nuxt/recommended',
    'airbnb-base',
  ],
  plugins: [
    '@typescript-eslint',
    'jest',
  ],
  rules: {
    'no-console': isProduction
      ? [ERROR, { allow: ['info', 'warn', 'error'] }]
      : [WARN, { allow: ['info', 'warn', 'error'] }],
    'no-debugger': isProduction
      ? ERROR
      : WARN,
    'no-multiple-empty-lines': [ERROR, { max: 2 }],
    // TypeScript でチェック
    'no-undef': ALLOW,
    camelcase: ALLOW,
    'lines-between-class-members': ALLOW,
    'arrow-body-style': ALLOW,
    'max-len': [
      ERROR,
      120,
      2,
      {
        ignoreUrls: true,
        ignoreComments: true,
        ignoreRegExpLiterals: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
      },
    ],

    /**
     * eslint-plugin-import
     */
    // import するときの拡張子の有無
    'import/extensions': [
      2,
      {
        js: 'never',
        ts: 'never',
        scss: 'never',
        // *.vue ファイルを ts として読み込むために拡張子必須
        vue: 'always',
        json: 'always',
        worker: 'always',
        config: 'always',
      },
    ],
    // ts でチェック
    'import/no-unresolved': ALLOW,
    // dependencies, devDependencies にないパッケージからの import を許容
    'import/no-extraneous-dependencies': [ALLOW, { devDependencies: true }],
    // 'import/no-extraneous-dependencies': [1, { devDependencies: true }],
    'import/prefer-default-export': ALLOW,

    /**
     * eslint と @typescript-eslint 競合を防ぐ
     */
    // typescript-eslint の no-use-before-define を有効にする
    'no-use-before-define': ALLOW,
    '@typescript-eslint/no-use-before-define': ERROR,
    // typescript-eslint の no-unused-vars を有効にする
    'no-unused-vars': ALLOW,
    '@typescript-eslint/no-unused-vars': ERROR,
    semi: ALLOW,
    '@typescript-eslint/semi': [ERROR],
    '@typescript-eslint/member-delimiter-style': ERROR,

    'vue/valid-v-slot': [ERROR, { allowModifiers: true }],
  },
};
