import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-empty-object-type": "warn",
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@google/generative-ai",
              message:
                "🛡️ SECURITY: Direct use of the Google AI SDK is forbidden in the frontend. Use the Tablawy secure backend proxy instead.",
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      "src/hooks/**/use*[aA][iI]*",
      "src/hooks/**/use*[gG]emini*",
      "src/hooks/**/use*[aA][iI][gG]eneration*",
      "src/hooks/**/use*[mM]agic*",
      "src/hooks/**/use*[cC]o[tT]eacher*",
      "src/features/ai/**/*.{ts,tsx}",
      "src/lib/**/*[aA][iI]*",
    ],
    rules: {
      // 🛡️ HARDENED SECURITY: Strict typing is required for AI-related code to ensure SSE buffering safety
      // and prevent runtime crashes during stream parsing.
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-empty-object-type": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "no-restricted-globals": [
        "error",
        {
          name: "fetch",
          message:
            "🛡️ REFINE V5 PATTERN: Do not use native fetch in AI features. Use Refine's useCustom or useCustomMutation for centralized auth, provider logic, and automatic error handling.",
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "axios",
              message:
                "🛡️ REFINE V5 PATTERN: Do not use axios directly in AI features. Use Refine's useCustom or useCustomMutation.",
            },
          ],
        },
      ],
    },
  },
  {
    // 🎚️ EXCEPTION: Streaming hooks require native fetch for SSE/ReadableStream support
    // which Refine's useCustom (built on standard fetch but with different return types)
    // might abstract away too much for the raw reader.
    files: ["src/hooks/**/use-ai-chat.ts", "src/hooks/**/use-ai-live-interaction.ts"],
    rules: {
      "no-restricted-globals": "off",
    },
  },
  eslintConfigPrettier
);
