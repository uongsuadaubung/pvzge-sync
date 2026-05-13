import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // Các rules cần thiết cho TypeScript:
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }], // Cảnh báo biến không dùng (bỏ qua biến bắt đầu bằng _)
      "@typescript-eslint/consistent-type-imports": "error", // Bắt buộc dùng `import type` khi import types/interfaces (giúp build nhanh hơn)
      "@typescript-eslint/no-non-null-assertion": "warn", // Cảnh báo khi dùng dấu `!` (VD: obj!.prop) vì nó phá vỡ type safety
      "@typescript-eslint/no-explicit-any": "error", // Chặn hoàn toàn việc dùng any
      // Các rules về Format & Style:
      "quotes": ["error", "double"],
      "indent": ["error", 2, { "SwitchCase": 1 }], // Indent 2 spaces, có indent cho case trong switch
      "semi": ["error", "always"],                 // Bắt buộc dùng dấu chấm phẩy (;) ở cuối câu
      "comma-dangle": ["error", "always-multiline"], // Bắt buộc có dấu phẩy cuối cùng ở object/array nhiều dòng
      "object-curly-spacing": ["error", "always"], // Bắt buộc có khoảng trắng trong ngoặc nhọn: { foo: bar }
      "no-trailing-spaces": "error",               // Không cho phép khoảng trắng dư thừa ở cuối dòng
      "eol-last": ["error", "always"],             // Luôn có một dòng trống ở cuối file
      "arrow-parens": ["error", "always"],         // Luôn có ngoặc đơn ở arrow function: (x) => x
      "keyword-spacing": ["error", { "before": true, "after": true }], // Khoảng trắng trước/sau các từ khóa (if, else, for...)
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", "temp_js/**", "build.js"],
  },
);
