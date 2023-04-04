module.exports = {
    env: {
        "es2021": true,
        "node": true
    },
    // extends: ['airbnb-typescript/base'],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 12,
        sourceType: "module"
    },
    plugins: [
        "@typescript-eslint"
    ],
    rules: {
        "indent": ["error", "tab"]
    },
};
