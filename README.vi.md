# PvZGE Sync Browser Extension 🌻🎮

[![SolidJS](https://img.shields.io/badge/SolidJS-1.9-2c4f7c?style=for-the-badge&logo=solid&logoColor=white)](https://solidjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Deno](https://img.shields.io/badge/Deno-2.x-black?style=for-the-badge&logo=deno&logoColor=white)](https://deno.com)
[![Esbuild](https://img.shields.io/badge/Esbuild-0.28-ffcf00?style=for-the-badge&logo=esbuild&logoColor=black)](https://esbuild.github.io)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-4285f4?style=for-the-badge&logo=google-chrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](https://opensource.org/licenses/ISC)

Một browser extension mã nguồn mở giúp tự động đồng bộ hóa đám mây, tự động thu
thập tài nguyên và sao lưu tiến trình ngoại tuyến cho tựa game **Plants vs.
Zombies Gardenless Edition (PvZGE)** trên trang web chính thức
[play.pvzge.com](https://play.pvzge.com).

Dự án này được xây dựng bằng **SolidJS**, **TypeScript**, **Sass/SCSS**, chạy
trên nền **Deno v2**, được đóng gói bằng **Esbuild**, và hoạt động mượt mà trên
cả Google Chrome lẫn Mozilla Firefox.

---

## ⚡ Các tính năng chính

### 1. 🔄 Tự động đồng bộ với Cloud (GitHub Gist)

- **Tránh mất save:** Tự động so sánh dữ liệu save game trên máy (local) và đám
  mây (cloud) để tránh việc vô tình ghi đè tiến trình mới hơn.
- **Tự động lưu định kỳ:** Tự động tải save lên cloud theo khoảng thời gian tùy
  chỉnh (ví dụ: mỗi 5, 10, 30 phút...).
- **Toàn vẹn thời gian:** Giữ lại thông tin ngày giờ chính xác bên trong dữ liệu
  save để tránh lỗi đồng hồ trong game hoặc reset sự kiện.
- **Xử lý xung đột:** Hiển thị màn hình so sánh trực quan song song nếu save ở
  local và cloud khác nhau, cho phép bạn tự chọn giữ bản nào.
- **Thông báo động đẹp mắt:** Hiển thị các thông báo dạng glassmorphism cao cấp,
  sinh động khi tải lên, tải xuống thành công hoặc khi không có thay đổi nào
  mới.

### 2. ☀️ Tự động nhặt vật phẩm (Auto Collect)

Tự động nhặt Mặt Trời, Xu Vàng, Xu Bạc và các vật phẩm xuất hiện trên sân đấu
giúp bạn hoàn toàn tập trung vào việc bày binh bố trận phòng thủ.

### 3. 💾 Sao lưu & Khôi phục Ngoại tuyến (Offline Backup & Restore)

Tải trực tiếp save game hiện tại về máy tính dưới dạng tệp `.json`, hoặc import
tệp save sẵn có để khôi phục tiến trình ngay lập tức mà không cần mạng. Các
thông báo đã được việt hóa hoàn toàn giúp hiển thị chi tiết khi xuất/nhập thành
công.

### 4. 🌐 Hỗ trợ đa ngôn ngữ

Dễ dàng chuyển đổi giữa **Tiếng Anh 🇬🇧** và **Tiếng Việt 🇻🇳**.

### 5. 🎨 Giao diện Glassmorphism tuyệt đẹp

Giao diện popup kiểu mờ kính hiện đại, đẹp mắt, phản hồi mượt mà và tối ưu hóa
cho cả máy tính lẫn các màn hình kích thước nhỏ trên trình duyệt.

---

## 🛠️ Hướng dẫn cài đặt

Sau khi build xong, các file chạy chính thức sẽ được biên dịch vào thư mục
`/dist`. Bạn có thể cài đặt thư mục đã giải nén này vào trình duyệt của mình:

### 1. Dành cho Google Chrome & các trình duyệt nhân Chromium (Edge, Brave, Opera, Cốc Cốc...)

1. Chạy lệnh build và đảm bảo bạn có thư mục `dist/chrome` (hoặc giải nén tệp
   `dist/chrome.zip`).
2. Mở Chrome và truy cập địa chỉ [chrome://extensions/](chrome://extensions/).
3. Bật **Developer mode** (Chế độ nhà phát triển) bằng công tắc ở góc trên bên
   phải.
4. Nhấp vào nút **Load unpacked** (Tải tiện ích đã giải nén) ở góc trên bên
   trái.
5. Chọn thư mục `dist/chrome` trên máy tính của bạn.
6. Ghim biểu tượng extension lên thanh công cụ và tận hưởng!

### 2. Dành cho Mozilla Firefox

#### Cách 1: Cài đặt tạm thời (Dành cho phát triển - sẽ tự động mất khi tắt trình duyệt)

1. Mở Firefox và truy cập địa chỉ
   [about:debugging#/runtime/this-firefox](about:debugging#/runtime/this-firefox).
2. Bấm nút **Load Temporary Add-on...** (Tải Add-on Tạm thời...).
3. Chọn tệp `manifest.json` bên trong thư mục `dist/firefox`.

#### Cách 2: Cài đặt vĩnh viễn (Yêu cầu phiên bản Firefox Developer Edition hoặc Firefox Nightly)

1. Truy cập địa chỉ `about:config` trên Firefox.
2. Tìm từ khóa `xpinstall.signatures.required` và nhấp đúp để chuyển giá trị
   thành `false`.
3. Đi tới trang [about:addons](about:addons), click biểu tượng bánh răng cài đặt
   ở góc trên bên phải, và chọn **Install Add-on From File...** (Cài đặt add-on
   từ tệp...).
4. Chọn tệp `dist/firefox.zip` để cài đặt vĩnh viễn.

---

## 🐳 Chạy PVZGE cục bộ (Docker / Podman)

Nếu bạn muốn chơi ngoại tuyến (offline) hoặc tự lưu trữ máy chủ game của riêng
mình, bạn có thể khởi chạy gói container PVZGE cục bộ bằng **Docker** hoặc
**Podman**. Tiện ích đã được cấu hình sẵn quyền truy cập cho địa chỉ
`http://localhost/*` để tự động nhận diện và đồng bộ dữ liệu save giống hệt như
trên trang chính thức.

### 1. Sử dụng Docker

Chạy lệnh sau trong terminal của bạn để tải xuống hình ảnh mới nhất và chạy game
tại cổng `8080`:

```bash
docker run -d -p 8080:80 --name pvzge gaozih/pvzge:latest
```

### 2. Sử dụng Podman

Nếu bạn thích dùng container không cần quyền root (rootless):

```bash
podman run -d -p 8080:80 --name pvzge docker.io/gaozih/pvzge:latest
```

Sau khi chạy xong, hãy truy cập địa chỉ
[http://localhost:8080](http://localhost:8080) trên trình duyệt của bạn. Bảng
popup đồng bộ sẽ lập tức nhận diện màn hình chơi và cho phép bạn sao lưu/phục
hồi tiến trình chơi bình thường.

---

## 🔑 Hướng dẫn tạo GitHub Token để lưu save

Để kết nối an toàn tiến trình game của bạn với đám mây, extension sử dụng tính
năng GitHub Gist cá nhân. Hãy làm theo các bước đơn giản sau:

1. **Đăng nhập:** Đăng nhập vào tài khoản [GitHub](https://github.com) của bạn.
2. **Tạo nhanh Token:** Bấm vào đường link được định cấu hình sẵn này để mở
   trang tạo Token:
   [Tạo nhanh GitHub Token (Gist)](https://github.com/settings/tokens/new?description=PVZGE%20Sync&scopes=gist).
3. **Cài đặt:**
   - **Note:** Nhập mô tả gợi nhớ (ví dụ: `PvZGE Save`).
   - **Expiration:** Chọn **No expiration** (Không hết hạn) để tránh lỗi đồng bộ
     trong tương lai.
   - **Scopes:** Hãy chắc chắn ô **gist** đã được tích chọn (đây là quyền duy
     nhất extension yêu cầu).
4. **Tạo:** Cuộn xuống dưới cùng và nhấp vào nút **Generate token** màu xanh lá.
5. **Lưu cài đặt:** Sao chép chuỗi mã Token vừa được tạo (bắt đầu bằng `ghp_`).
   Mở extension, bấm vào **Cài đặt** (Settings), dán vào trường GitHub Token và
   chọn **Lưu**.

> [!WARNING]
> **LƯU Ý QUAN TRỌNG VỀ BẢO MẬT:** Tuyệt đối không chia sẻ GitHub Token của bạn
> cho bất kỳ ai. Extension chỉ lưu trữ Token này cục bộ bên trong bộ nhớ an toàn
> của trình duyệt và giao tiếp trực tiếp với các API của GitHub. Không có bất kỳ
> máy chủ trung gian hay bên thứ ba nào được sử dụng.

---

## 📂 Sơ đồ cấu trúc thư mục

```text
pvzge-sync/
├── .github/              # Cấu hình các workflow cho GitHub Actions
├── dist/                 # Thư mục chứa sản phẩm biên dịch (Chrome & Firefox)
├── src/                  # Mã nguồn chính của extension
│   ├── components/       # Các component UI (SolidJS)
│   ├── domains/          # Logic cốt lõi của các nghiệp vụ chính
│   │   ├── game/         # Bộ đọc/ghi dữ liệu save game & kiểm tra schema
│   │   ├── github/       # API client giao tiếp với GitHub Gist
│   │   └── sync/         # Logic so sánh file save & quản lý đồng bộ
│   ├── extension/        # Điểm khởi chạy của Extension
│   │   ├── background.ts # Script nền quản lý báo thức (alarm) & lịch trình đồng bộ
│   │   └── content.ts    # Content script tiêm trực tiếp vào play.pvzge.com (Auto Collect & hook lưu trữ)
│   ├── icons/            # Biểu tượng ứng dụng ở nhiều kích cỡ
│   ├── images/           # Hình ảnh & sơ đồ sử dụng trong hướng dẫn
│   ├── locales/          # File dịch thuật đa ngôn ngữ dưới dạng JSON (en.json, vi.json)
│   ├── shared/           # Tiện ích chung, hằng số, và quản lý i18n
│   │   ├── i18n.ts       # Công cụ xử lý đa ngôn ngữ
│   │   └── store.ts      # Store quản lý state toàn cục (SolidJS reactive store)
│   ├── views/            # Các màn hình chính (Màn hình Home, Cài đặt, Hướng dẫn, Hộp thoại thông báo)
│   ├── guide.html        # Trang hướng dẫn chi tiết dành cho người dùng
│   ├── manifest.json     # File cấu hình Extension (Manifest V3)
│   └── popup.html        # File HTML neo (anchor) của popup
├── build.ts              # Trình biên dịch esbuild & hậu xử lý cho từng nền tảng (TypeScript)
├── deno.json             # Cấu hình Deno & các tác vụ (thay thế package.json / tsconfig.json)
├── deno.lock             # File lock của Deno quản lý các dependency an toàn
└── version.ts            # Script tự động cập nhật số phiên bản (TypeScript)
```

---

## 🏗️ Lệnh phát triển & Đóng gói

Dự án này sử dụng **Deno** nguyên bản để phát triển, lint, format, và đóng gói.

### 1. Build Extension

Biên dịch, liên kết và đóng gói các tệp zip thành phẩm:

```bash
deno task build
```

> [!NOTE]
> **Quy trình hoạt động bên dưới của trình biên dịch `build.ts`:**
>
> 1. **Biên dịch SCSS:** Sử dụng trình biên dịch Sass của Deno để chuyển đổi
>    `src/styles/app.scss` thành các tệp CSS tối giản cho cả hai nền tảng.
> 2. **Đóng gói esbuild:** Liên kết và thu gọn (minify) các component TypeScript
>    và SolidJS với tốc độ cực nhanh.
> 3. **Sao chép tài nguyên:** Sao chép các tệp HTML, tài nguyên, hình ảnh và
>    icon đến các thư mục đích tương ứng của từng nền tảng.
> 4. **Chuẩn hóa Manifest cho Firefox:** Điều chỉnh tệp `manifest.json` để tương
>    thích với Firefox (chuyển đổi service worker sang script nền chuẩn, nhúng
>    mã định danh Gecko `pvzge-sync@uongsuadaubung.github.io`, và loại bỏ các cờ
>    cấu hình chỉ có trên Chrome).
> 5. **Đóng gói dạng Zip:** Tạo các tệp nén `chrome.zip` và `firefox.zip` trong
>    `/dist` giúp phân phối dễ dàng.

### 2. Kiểm tra lỗi (Linting) & Định dạng (Formatting)

Xác thực các quy tắc định dạng và tự động format tệp nguồn sử dụng các công cụ
tích hợp sẵn của Deno:

```bash
# Chạy linter kiểm tra code nghiêm ngặt (đã kích hoạt quy tắc cấm sử dụng kiểu 'any')
deno task lint

# Định dạng lại toàn bộ mã nguồn theo chuẩn chung
deno task fmt
```

### 3. Tự động tăng số phiên bản

Tự động cập nhật chuỗi phiên bản trong tệp `src/manifest.json` theo định dạng
ngày tháng tương thích (`yyyy.m.d`):

```bash
# Tự động tạo mới hoặc tăng số phiên bản hôm nay (ví dụ: 2026.5.26)
deno task bump-version
```

> [!NOTE]
> **Logic của Cơ chế Phiên bản theo Ngày:**
>
> - **Tự động chuyển ngày:** Chạy lệnh vào ngày mới sẽ tự khởi tạo phiên bản là
>   `yyyy.m.d` (ví dụ: `2026.5.27`).
> - **Phát hành nhiều lần trong ngày (Revision):** Nếu chạy nhiều lần trong cùng
>   một ngày, kịch bản sẽ tự động chèn và tăng số revision phụ ở phân đoạn thứ 4
>   (ví dụ: `2026.5.26` ➔ `2026.5.26.1` ➔ `2026.5.26.2`). Cách này giúp tuân thủ
>   tuyệt đối quy định 4 phân đoạn của Chrome & Firefox Extension mà vẫn hỗ trợ
>   build không giới hạn số lần một ngày.
> - **Tương thích Firefox:** Định dạng này loại bỏ hoàn toàn số 0 đi đầu ở Tháng
>   và Ngày (dùng `.5` thay vì `.05`), đảm bảo vượt qua 100% các vòng kiểm duyệt
>   nghiêm ngặt của Firefox Add-ons (AMO).

---

Chúc các bạn chơi game vui vẻ tại **play.pvzge.com**! Nếu cần bất kỳ sự trợ giúp
nào, hãy bấm nút **Hướng dẫn** ngay trên giao diện extension để xem các bước
minh họa trực quan. 🌻🔥
