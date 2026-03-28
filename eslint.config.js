import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

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
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
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
      "src/hooks/**/use*AI*",
      "src/hooks/**/use*Gemini*",
      "src/hooks/**/use*Generation*",
      "src/hooks/**/use*Magic*",
      "src/hooks/**/use*CoTeacher*",
      "src/features/ai/**/*.{ts,tsx}",
      "src/lib/ai-*.ts",
      "src/lib/*AI*",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": [
        "error",
        {
          message:
            "🛡️ HARDENED SECURITY: Strict typing is required for AI-related code to ensure SSE buffering safety and prevent runtime crashes during stream parsing.",
        },
      ],
      "@typescript-eslint/no-empty-object-type": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  }
);
