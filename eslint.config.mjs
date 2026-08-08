import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // CMS admin operates on dynamically-shaped Supabase rows; `any` is used
  // deliberately there to represent row payloads of unknown column shape.
  // `src/lib/content.ts` maps those raw rows to public types the same way.
  {
    files: [
      "src/components/admin/**/*.{ts,tsx}",
      "src/lib/admin/**/*.ts",
      "src/lib/content.ts",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
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
