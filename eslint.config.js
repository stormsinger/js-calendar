import js from "@eslint/js";
import globals from "globals";

export default [
    js.configs.recommended,
    {
        files: ["js/**/*.js"],
        ignores: ["js/**/*.test.js"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                ...globals.browser
            }
        },
        rules: {
            // Possible errors
            "no-console": "warn",
            "no-debugger": "error",

            // Best practices
            "eqeqeq": ["error", "always"],
            "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
            "no-var": "error",
            "prefer-const": "error",

            // Style consistency
            "semi": ["error", "always"],
            "quotes": ["error", "double", { "avoidEscape": true }]
        }
    },
    {
        // Relax rules for test files
        files: ["js/**/*.test.js"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                ...globals.node
            }
        },
        rules: {
            "no-unused-vars": "warn",
            "prefer-const": "error",
            "no-var": "error"
        }
    }
];
