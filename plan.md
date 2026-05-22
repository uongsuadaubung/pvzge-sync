# Kế hoạch chuyển đổi sang Deno + SolidJS (PvZGE Sync)

Tài liệu này chi tiết hóa toàn bộ kế hoạch di chuyển dự án `pvzge-sync` từ stack
cũ (**Node.js + Svelte 5**) sang stack mới (**Deno + SolidJS**).

---

## 🎯 Mục tiêu chuyển đổi

1. **Đơn giản hóa Tooling:** Loại bỏ `package.json`, `tsconfig.json`,
   `package-lock.json` và thư mục `node_modules` cục bộ. Thay thế bằng duy nhất
   một file `deno.json`.
2. **Hỗ trợ TypeScript gốc:** Deno chạy và kiểm tra kiểu TypeScript trực tiếp mà
   không cần cấu hình biên dịch phức tạp.
3. **Reactivity hiện đại và hiệu năng cao:** Chuyển đổi từ Svelte 5 Runes sang
   SolidJS Signals. Cả hai đều là fine-grained reactivity (không dùng Virtual
   DOM), giữ cho dung lượng extension siêu nhỏ và tốc độ tải tức thì.
4. **Trải nghiệm phát triển (DX) tốt hơn:** Khắc phục triệt để lỗi xung đột IDE
   (báo đỏ oan) giữa Deno và Svelte trong VS Code.

---

## 🛠️ Kiến trúc Stack mới đề xuất

- **Runtime:** Deno 2.x
- **Frontend Framework:** SolidJS 1.9+ (JSX / TSX)
- **CSS Preprocessor:** Sass (SCSS)
- **Bundler:** Esbuild (chạy trực tiếp thông qua Deno NPM specifier)
- **Dịch vụ đóng gói zip:** `npm:adm-zip` (chạy trên môi trường tương thích của
  Deno)

---

## 📂 Thay đổi cấu trúc thư mục

```diff
  pvzge-sync/
- ├── package.json          # LOẠI BỎ
- ├── package-lock.json     # LOẠI BỎ
- ├── tsconfig.json         # LOẠI BỎ
- ├── build.js              # LOẠI BỎ (Viết lại bằng TS)
- ├── version.mjs           # LOẠI BỎ (Viết lại bằng TS)
+ ├── deno.json             # THÊM MỚI (Cấu hình Deno, Import Map, Tasks)
+ ├── build.ts              # THÊM MỚI (Esbuild script bằng Deno)
+ ├── version.ts            # THÊM MỚI (Bump version script bằng Deno)
  ├── src/
- │   ├── components/*.svelte # LOẠI BỎ
- │   ├── views/*.svelte      # LOẠI BỎ
+ │   ├── components/*.tsx    # THÊM MỚI (Viết bằng SolidJS)
+ │   ├── views/*.tsx         # THÊM MỚI (Viết bằng SolidJS)
  │   ├── domains/            # Giữ nguyên code TS, cập nhật import
  │   └── extension/          # Giữ nguyên code TS, cập nhật types
```

---

## 📝 Chi tiết các cấu hình mới

### 1. Cấu hình `deno.json`

File `deno.json` sẽ là trung tâm quản lý toàn bộ dự án, bao gồm cấu hình JSX cho
SolidJS, định nghĩa các thư viện phụ thuộc (Import Map), và các lệnh chạy nhanh
(Tasks):

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "npm:solid-js",
    "lib": ["dom", "dom.iterable", "deno.ns"],
    "strict": true
  },
  "imports": {
    "solid-js": "npm:solid-js@^1.9.3",
    "solid-js/web": "npm:solid-js@^1.9.3/web",
    "esbuild": "npm:esbuild@^0.28.0",
    "esbuild-plugin-solid": "npm:esbuild-plugin-solid@^0.6.0",
    "sass": "npm:sass@^1.99.0",
    "adm-zip": "npm:adm-zip@^0.5.17",
    "zod": "npm:zod@^4.4.3",
    "@types/chrome": "npm:@types/chrome@^0.1.42"
  },
  "tasks": {
    "build": "deno run -A build.ts",
    "bump-version": "deno run -A version.ts",
    "lint": "deno lint"
  }
}
```

---

## 🔄 Quy trình di chuyển các Component (Svelte 5 $\rightarrow$ SolidJS)

Việc chuyển đổi từ Svelte 5 sang SolidJS rất trực quan do cả hai đều dùng triết
lý Reactive Signals:

### Ví dụ ánh xạ Reactive:

- **Trạng thái (State):**
  - Svelte 5: `let count = $state(0);`
  - SolidJS: `const [count, setCount] = createSignal(0);`
- **Trạng thái phái sinh (Derived):**
  - Svelte 5: `let doubled = $derived(count * 2);`
  - SolidJS: `const doubled = () => count() * 2;`
- **Hiệu ứng phụ (Effects):**
  - Svelte 5: `$effect(() => { console.log(count); });`
  - SolidJS: `createEffect(() => { console.log(count()); });`

### Minh họa chuyển đổi Component `Button`:

#### Bản cũ (`Button.svelte`):

```html
<script lang="ts">
  interface Props {
    type?: "button" | "submit";
    variant?: "primary" | "secondary";
    disabled?: boolean;
    onclick?: () => void;
    children?: any;
  }
  let {
    type = "button",
    variant = "primary",
    disabled = false,
    onclick,
    children,
  }: Props = $props();
</script>

<button {type} class="btn btn-{variant}" {disabled} on:click="{ onclick }">
  {@render children()}
</button>
```

#### Bản mới (`Button.tsx`):

```tsx
import type { JSX } from "solid-js";

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary";
  disabled?: boolean;
  onClick?: () => void;
  children: JSX.Element;
}

export function Button(props: ButtonProps) {
  return (
    <button
      type={props.type || "button"}
      class={`btn btn-${props.variant || "primary"}`}
      disabled={props.disabled || false}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}
```

---

## ⚡ Thiết lập Script Build mới (`build.ts`)

File `build.ts` viết bằng Deno sẽ sử dụng esbuild và plugin
`esbuild-plugin-solid` để biên dịch SolidJS siêu tốc:

```typescript
import * as path from "https://deno.land/std@0.224.0/path/mod.ts";
import { existsSync } from "https://deno.land/std@0.224.0/fs/mod.ts";
import esbuild from "esbuild";
import { solidPlugin } from "esbuild-plugin-solid";
import AdmZip from "adm-zip";

const __dirname = path.dirname(path.fromFileUrl(import.meta.url));
const distDir = path.join(__dirname, "dist");
const chromeDir = path.join(distDir, "chrome");
const firefoxDir = path.join(distDir, "firefox");
const srcDir = path.join(__dirname, "src");

// 1. Dọn dẹp thư mục cũ
[distDir, chromeDir, firefoxDir].forEach((dir) => {
  if (existsSync(dir)) Deno.removeSync(dir, { recursive: true });
  Deno.mkdirSync(dir, { recursive: true });
});

async function runBuild() {
  console.log("Compiling SCSS...");
  // Deno thực thi Sass biên dịch stylesheet
  const sassCmd = new Deno.Command("deno", {
    args: [
      "run",
      "-A",
      "npm:sass",
      "src/styles/app.scss",
      path.join(chromeDir, "popup.css"),
      "--no-source-map",
    ],
  });
  await sassCmd.output();

  console.log("Bundling SolidJS with Esbuild...");
  const entryPoints = [
    "extension/background.ts",
    "extension/content.ts",
    "popup-entry.tsx",
    "guide-entry.tsx",
  ].map((file) => path.join(srcDir, file));

  await esbuild.build({
    entryPoints,
    bundle: true,
    minify: true,
    platform: "browser",
    target: ["esnext"],
    outdir: chromeDir,
    plugins: [solidPlugin()],
  });

  // Tương tự, thực hiện copy asset, điều chỉnh manifest cho Firefox và zip file...
  console.log("Copying assets and packaging...");

  // Đóng gói zip sử dụng AdmZip qua Deno compatibility layer
  const zip = new AdmZip();
  zip.addLocalFolder(chromeDir);
  zip.writeZip(path.join(distDir, "chrome.zip"));

  console.log("🎉 Build hoàn tất bằng Deno!");
}

runBuild().catch((err) => {
  console.error("Build thất bại:", err);
  Deno.exit(1);
});
```

---

## 📈 Lộ trình triển khai (Migration Steps)

Chúng ta sẽ thực hiện di chuyển theo từng bước an toàn sau:

1. **Bước 1:** Khởi tạo cấu hình Deno (`deno.json`) và thiết lập các kịch bản
   chạy tác vụ (`tasks`).
2. **Bước 2:** Chuyển đổi các Component nhỏ dùng chung (`src/components/`) như
   Button, Input, Checkbox sang SolidJS (`.tsx`).
3. **Bước 3:** Chuyển đổi màn hình xung đột lưu trữ (`SyncConflict.svelte`) sang
   SolidJS.
4. **Bước 4:** Chuyển đổi các View lớn (`src/views/`) bao gồm Popup, Settings và
   Guide.
5. **Bước 5:** Viết lại file `build.ts` và `version.ts` bằng Deno.
6. **Bước 6:** Gỡ bỏ hoàn toàn cấu hình Node (`package.json`,
   `package-lock.json`, `node_modules`).
7. **Bước 7:** Kiểm thử thực tế trên cả Chrome và Firefox để đảm bảo Extension
   hoạt động mượt mà.
