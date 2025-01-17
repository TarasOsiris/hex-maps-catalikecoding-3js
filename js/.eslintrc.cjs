/* eslint-env node */
module.exports = {
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    root: true,
    rules: {
        'semi': ['error', 'always'], // Enforce semicolons always
        'no-mixed-spaces-and-tabs': ["error", "smart-tabs"],
    }
};
