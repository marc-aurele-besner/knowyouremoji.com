import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier";
import eslintReact from "@eslint-react/eslint-plugin";
import reactPlugin from "eslint-plugin-react";

// eslint-plugin-react (pulled in by eslint-config-next) is not compatible with
// ESLint 10 — see https://github.com/jsx-eslint/eslint-plugin-react/issues/3977.
// Disable every react/* rule so the broken rule create() never runs, and rely
// on @eslint-react/eslint-plugin below for React coverage.
const disabledReactRules = Object.fromEntries(
  Object.keys(reactPlugin.rules).map((name) => [`react/${name}`, "off"]),
);

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettierConfig,
  {
    rules: disabledReactRules,
  },
  eslintReact.configs["recommended-typescript"],
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
