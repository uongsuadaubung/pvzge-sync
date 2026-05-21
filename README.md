# PvZGE Sync Browser Extension 🌻🎮

[![Svelte 5](https://img.shields.io/badge/Svelte-5-ff3e00?style=for-the-badge&logo=svelte&logoColor=white)](https://svelte.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Esbuild](https://img.shields.io/badge/Esbuild-0.28-ffcf00?style=for-the-badge&logo=esbuild&logoColor=black)](https://esbuild.github.io)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-4285f4?style=for-the-badge&logo=google-chrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](https://opensource.org/licenses/ISC)

Một browser extension mã nguồn mở giúp tự động đồng bộ hóa đám mây, tự động thu thập tài nguyên và sao lưu tiến trình ngoại tuyến cho tựa game **Plants vs. Zombies Gardenless Edition (PvZGE)** trên trang web chính thức [play.pvzge.com](https://play.pvzge.com).

Dự án được viết bằng **Svelte 5 (Runes)**, **TypeScript**, **Sass/SCSS**, đóng gói bằng **Esbuild** và chạy tốt trên cả Google Chrome lẫn Mozilla Firefox.

---

## ⚡ Các tính năng chính

### 1. 🔄 Tự động đồng bộ với Cloud (GitHub Gist)
* **Tránh mất save:** Extension tự động so sánh dữ liệu save game trên máy của bạn (Local) và trên mạng (Cloud) để bạn không bị tải đè nhầm file cũ.
* **Tự động lưu:** Tự động tải save game lên Cloud sau mỗi khoảng thời gian bạn đặt (ví dụ: 5, 10, 30 phút...).
* **Giữ nguyên thời gian chơi:** Giữ lại thông tin ngày giờ trong file save để tránh bị lỗi đếm giờ hoặc reset sự kiện trong game.
* **Hỏi khi lệch file:** Nếu file save trên máy và trên cloud khác nhau, extension sẽ hiện bảng so sánh để bạn chọn giữ bản nào.

### 2. ☀️ Tự động nhặt vật phẩm (Auto Collect)
Tự động nhặt Mặt Trời, Tiền Vàng, Xu Bạc rơi trên sân đấu giúp bạn rảnh tay tập trung bày trận.

### 3. 💾 Tải save về máy tính (Offline Backup)
Bạn có thể tải file save (.json) về máy tính để cất đi, hoặc import file đã có từ máy tính vào lại game mà không cần mạng.

### 4. 🌐 Hỗ trợ 2 ngôn ngữ
Hỗ trợ chuyển đổi dễ dàng giữa **Tiếng Việt 🇻🇳** và **English 🇬🇧**.

### 5. 🎨 Giao diện Glassmorphism trực quan
Giao diện kiểu mờ kính đẹp mắt, dễ sử dụng trên cả máy tính và điện thoại.

---

## 🛠️ Hướng dẫn cài đặt (Installation Guide)

Sản phẩm sau khi được build thành công sẽ nằm trong thư mục `/dist`. Bạn có thể cài đặt bản giải nén này vào trình duyệt của mình:

### 1. Dành cho Google Chrome & Các trình duyệt Chromium (Edge, Brave, CocCoc, Opera...)
1. Đảm bảo bạn đã chạy lệnh build và có thư mục `dist/chrome` (hoặc giải nén tệp `dist/chrome.zip`).
2. Mở trình duyệt, truy cập địa chỉ [chrome://extensions/](chrome://extensions/).
3. Bật công tắc **Developer mode** (Chế độ nhà phát triển) ở góc trên bên phải.
4. Nhấp vào nút **Load unpacked** (Tải tiện ích đã giải nén) ở góc bên trái.
5. Trỏ tới thư mục `dist/chrome` trên máy tính của bạn và nhấn **Select Folder**.
6. Ghim biểu tượng Extension lên thanh công cụ của trình duyệt và bắt đầu trải nghiệm!

### 2. Dành cho Mozilla Firefox
#### Cách 1: Cài đặt tạm thời (Dành cho nhà phát triển - sẽ mất khi tắt trình duyệt)
1. Mở Firefox, truy cập địa chỉ [about:debugging#/runtime/this-firefox](about:debugging#/runtime/this-firefox).
2. Nhấp vào nút **Load Temporary Add-on...** (Tải Add-on tạm thời...).
3. Trỏ tới thư mục `dist/firefox` trên máy tính và chọn tệp `manifest.json`.

#### Cách 2: Cài đặt vĩnh viễn (Yêu cầu Firefox Developer Edition hoặc Firefox Nightly)
1. Mở Firefox Developer/Nightly, truy cập địa chỉ `about:config`.
2. Tìm từ khóa `xpinstall.signatures.required` và nhấp đúp để chuyển giá trị thành `false`.
3. Truy cập địa chỉ [about:addons](about:addons), bấm vào biểu tượng bánh răng cài đặt ở góc trên bên phải -> Chọn **Install Add-on From File...** (Cài đặt add-on từ tệp...).
4. Chọn tệp `dist/firefox.zip` của bạn để cài đặt vĩnh viễn.

---

## 🔑 Hướng dẫn tạo GitHub Token để lưu save

Để tự động đồng bộ save game lên mạng, extension cần kết nối với GitHub Gist cá nhân của bạn. Các bước thực hiện như sau:

1. **Đăng nhập:** Đăng nhập vào tài khoản [GitHub](https://github.com) của bạn.
2. **Tạo nhanh Token:** Bấm vào link này để mở nhanh trang tạo Token: [Tạo nhanh GitHub Token (Gist)](https://github.com/settings/tokens/new?description=PVZGE%20Sync&scopes=gist).
3. **Cài đặt:**
   * **Note:** Đặt tên gợi nhớ (ví dụ: `PvZGE Save`).
   * **Expiration:** Chọn **No expiration** (Không hết hạn) để không bị lỗi đồng bộ sau này.
   * **Scopes:** Đảm bảo ô **gist** đã được tích chọn (đây là quyền duy nhất extension cần).
4. **Tạo & Lưu:** Cuộn xuống dưới cùng và bấm nút màu xanh lá **Generate token**.
5. **Điền vào extension:** Copy mã Token vừa hiển thị (bắt đầu bằng `ghp_`). Bấm vào icon extension trên trình duyệt, chọn **Cài đặt**, dán mã Token vào ô rồi bấm **Lưu**.

> [!WARNING]
> **LƯU Ý:** Tuyệt đối không chia sẻ Token này cho người khác. Extension chỉ lưu Token ngay trên máy tính của bạn và gửi trực tiếp tới GitHub, không đi qua bất kỳ server nào khác.

---

## 📂 Sơ đồ cấu trúc thư mục dự án

```text
pvzge-sync/
├── .github/              # Cấu hình GitHub Actions
├── dist/                 # Thư mục chứa sản phẩm sau khi build (Chrome & Firefox)
├── src/                  # Mã nguồn chính của dự án
│   ├── components/       # Các thành phần giao diện (Svelte 5)
│   ├── domains/          # Xử lý logic chính
│   │   ├── game/         # Đọc/ghi save game & Schema kiểm tra save
│   │   ├── github/       # Kết nối với GitHub Gist API
│   │   └── sync/         # Logic so sánh file save để đồng bộ
│   ├── extension/        # Điểm khởi chạy của Extension
│   │   ├── background.ts # Service Worker nền quản lý Alarm và API
│   │   └── content.ts    # Content Script tiêm vào game (Auto Collect & Storage)
│   ├── icons/            # Các biểu tượng ứng dụng với kích thước khác nhau
│   ├── images/           # Tài nguyên hình ảnh hướng dẫn sử dụng
│   ├── locales/          # File ngôn ngữ lưu trữ JSON (vi.json, en.json)
│   ├── shared/           # Trạng thái chung, dịch thuật, cấu hình constants
│   ├── views/            # Các trang giao diện chính (Main, Settings, Guide, Notice)
│   ├── guide.html        # Trang hướng dẫn chi tiết
│   ├── manifest.json     # File cấu hình của Chrome Extension (Manifest V3)
│   └── popup.html        # Giao diện popup khi nhấp vào icon
├── build.js              # Script NodeJS đóng gói dự án bằng Esbuild
├── version.mjs           # Script nâng cấp phiên bản tự động
├── package.json          # Quản lý dependencies và script định nghĩa
└── tsconfig.json         # Cấu hình dự án TypeScript
```

---

## 🏗️ Lệnh phát triển (For Developers)

### 1. Cài đặt các thư viện phụ thuộc
Trước khi bắt đầu, hãy cài đặt đầy đủ các thư viện devDependencies cần thiết:
```bash
npm install
```

### 2. Biên dịch và Đóng gói dự án
Chạy script NodeJS tự động biên dịch toàn bộ mã nguồn:
```bash
node build.js
```

> [!NOTE]
> **Quy trình hoạt động của lệnh `build.js`:**
> 1. **Kiểm tra chuẩn mã nguồn:** Tự động chạy `eslint src` (`npm run lint`) để rà soát lỗi code.
> 2. **Kiểm tra kiểu dữ liệu:** Chạy `svelte-check` (`npm run check`) để xác thực an toàn kiểu dữ liệu TypeScript & Svelte.
> 3. **Biên dịch SCSS:** Sử dụng bộ biên dịch `sass` chuyển đổi tệp stylesheet `src/styles/app.scss` thành tệp tin css thuần cho popup và trang hướng dẫn của cả Chrome lẫn Firefox.
> 4. **Đóng gói JS/TS/Svelte:** Sử dụng `esbuild` biên dịch và tối ưu hóa (minify) mã nguồn TypeScript/Svelte 5 với hiệu năng siêu tốc.
> 5. **Sao chép & Xử lý tài nguyên:** Tự động sao chép các tệp tin HTML, các biểu tượng `icons/` và hình ảnh hướng dẫn `images/` vào thư mục đích.
> 6. **Cấu hình riêng cho Firefox:** Script tự động điều chỉnh tệp `manifest.json` trong thư mục Firefox (chuyển đổi cấu trúc khởi chạy service worker sang script nền chuẩn Firefox, chèn mã định danh Gecko `pvzge-sync@uongsuadaubung.github.io` và loại bỏ các trường không tương thích).
> 7. **Tạo gói cài đặt nhanh:** Đóng gói toàn bộ mã nguồn thành tệp tin nén `chrome.zip` và `firefox.zip` nằm trong thư mục `/dist` sẵn sàng để chia sẻ.

### 3. Tự động nâng cấp phiên bản (Version Bumping)
Để nâng cấp phiên bản của extension đồng bộ trong `package.json`, `src/manifest.json` và `package-lock.json`, bạn có thể chạy script chuyên dụng:
```bash
# Nâng cấp patch version (ví dụ: 0.7.0 -> 0.7.1)
node version.mjs --patch

# Nâng cấp minor version (ví dụ: 0.7.0 -> 0.8.0)
node version.mjs --minor

# Nâng cấp major version (ví dụ: 0.7.0 -> 1.0.0)
node version.mjs --major
```

---

Chúc bạn chơi game vui vẻ trên **play.pvzge.com**! Nếu gặp khó khăn gì, hãy bấm nút **Hướng dẫn** ngay trên extension để xem hình ảnh minh họa chi tiết. 🌻🔥
