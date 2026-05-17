# PvZGE Sync Browser Extension 🌻🎮

Một browser extension cao cấp, bảo mật và cực kỳ tiện lợi giúp tự động đồng bộ hóa đám mây, tự động thu thập tài nguyên và sao lưu tiến trình ngoại tuyến cho tựa game **Plants vs. Zombies Game Edition (PvZGE)** trên trang web chính thức [play.pvzge.com](https://play.pvzge.com).

---

## ⚡ Các tính năng nổi bật (Key Features)

* **🔄 Tự động đồng bộ đám mây (Auto Cloud Sync):** Tự động sao lưu tiến trình chơi game của bạn lên đám mây (thông qua GitHub Gist cá nhân tuyệt đối bảo mật) theo chu kỳ thời gian tùy chỉnh (ví dụ: mỗi 5 phút, 10 phút, 30 phút...) mà không cần phải bấm nút thủ công.
* **☀️ Tự động thu thập (Auto Collect):** Tự động quét và giả lập click chuột nhặt Mặt Trời, Tiền Vàng, Xu Bạc xuất hiện trên màn hình trận đấu với tốc độ cực nhanh, giải phóng đôi tay để bạn tập trung vào chiến thuật phòng thủ.
* **💾 Sao lưu JSON Offline (Hard Backup):** Xuất trực tiếp dữ liệu tiến trình chơi game hiện tại về máy tính dưới dạng tệp tin `.json` để lưu trữ an toàn, hoặc tải tệp lưu trữ lên từ bất kỳ thiết bị nào mà không cần kết nối mạng.
* **🌐 Hỗ trợ đa ngôn ngữ (i18n):** Tự động chuyển đổi ngôn ngữ mượt mà giữa **Tiếng Việt 🇻🇳** và **English 🇬🇧** tùy thuộc vào cài đặt hoặc lựa chọn của bạn.
* **🎨 Thiết kế Glassmorphism hiện đại:** Giao diện người dùng tối ưu, bắt mắt, phản hồi cực nhanh, hỗ trợ hiệu ứng mượt mà và tương thích tốt trên cả màn hình máy tính lẫn thiết bị di động.

---

## 🛠️ Hướng dẫn cài đặt (Installation Guide)

Dự án sau khi được build thành công sẽ tạo ra sản phẩm nằm trong thư mục `/dist`. Bạn có thể cài đặt trực tiếp bản giải nén này vào trình duyệt của mình theo các bước đơn giản sau:

### 1. Dành cho Google Chrome (và các trình duyệt nhân Chromium như Edge, Brave, CocCoc...)

1. **Tải về và chuẩn bị:** Đảm bảo bạn đã có sẵn thư mục `dist/chrome` (hoặc giải nén tệp `chrome.zip` được build ra).
2. **Truy cập trang Quản lý Tiện ích:** Mở Chrome, truy cập địa chỉ [chrome://extensions/](chrome://extensions/) (hoặc vào `Menu` -> `Công cụ khác` -> `Tiện ích mở rộng`).
3. **Kích hoạt Chế độ nhà phát triển:** Bật công tắc **Developer mode** ở góc trên bên phải màn hình.
4. **Tải tiện ích đã giải nén:** Nhấp vào nút **Tải tiện ích đã giải nén** (Load unpacked) ở góc trên bên trái.
5. **Chọn thư mục:** Trỏ tới thư mục `dist/chrome` trên máy tính của bạn và nhấn **Open/Select Folder**.
6. **Hoàn tất:** Ghim biểu tượng Extension lên thanh công cụ của trình duyệt và bắt đầu sử dụng ngay lập tức!

---

### 2. Dành cho Mozilla Firefox

#### Cách 1: Cài đặt tạm thời (Dành cho nhà phát triển - Tiện ích sẽ biến mất khi tắt Firefox)
1. **Truy cập trang Debugging:** Mở Firefox, truy cập địa chỉ [about:debugging#/runtime/this-firefox](about:debugging#/runtime/this-firefox).
2. **Tải tiện ích tạm thời:** Nhấp vào nút **Tải Add-on tạm thời...** (Load Temporary Add-on...).
3. **Chọn tệp cấu hình:** Trỏ tới thư mục `dist/firefox` trên máy tính và chọn tệp `manifest.json` (hoặc bất kỳ tệp tin nào trong thư mục đó).
4. **Hoàn tất:** Extension sẽ xuất hiện trên thanh công cụ và sẵn sàng hoạt động ngay lập tức.

#### Cách 2: Cài đặt vĩnh viễn (Sử dụng Firefox Developer Edition hoặc Firefox Nightly)
1. **Truy cập cấu hình ẩn:** Mở Firefox Developer Edition, truy cập địa chỉ `about:config`.
2. **Bật cài đặt unsigned add-on:** Tìm từ khóa `xpinstall.signatures.required` và chuyển giá trị của nó thành `false`.
3. **Cài đặt tiện ích:** Truy cập địa chỉ [about:addons](about:addons), bấm vào biểu tượng bánh răng cài đặt ở phía trên bên phải -> Chọn **Cài đặt add-on từ tệp...** (Install Add-on From File...) -> Chọn tệp `firefox.zip` của bạn.

---

## 🔑 Hướng dẫn lấy Personal Access Token trên GitHub

Để tính năng đồng bộ hóa đám mây hoạt động, ứng dụng cần sử dụng lưu trữ bảo mật GitHub Gist của cá nhân bạn. Hãy làm theo 4 bước đơn giản sau:

1. **Đăng nhập GitHub:** Đăng nhập vào tài khoản [GitHub](https://github.com) của bạn.
2. **Tạo Token nhanh:** Nhấp vào đường liên kết được thiết lập sẵn này để đi thẳng tới trang tạo Token: [Tạo nhanh GitHub Personal Access Token (Gist)](https://github.com/settings/tokens/new?description=PVZGE%20Sync&scopes=gist).
3. **Cấu hình Token:**
   * **Note:** Đặt tên gợi nhớ (ví dụ: `PVZGE Sync`).
   * **Expiration (Thời hạn):** Khuyên dùng **No expiration** (Không hết hạn) để quá trình đồng bộ hóa không bị gián đoạn sau này.
   * **Scopes:** Đảm bảo ô **gist** đã được tích chọn (đây là quyền duy nhất extension cần).
4. **Tạo & Lưu:** Cuộn xuống dưới cùng và nhấn nút màu xanh lá **Generate token**. Sao chép chuỗi mã Token vừa hiển thị (bắt đầu bằng `ghp_`). 
5. **Kích hoạt:** Mở tab **Cài đặt** trên Extension của bạn, dán mã Token này vào ô nhập liệu và nhấn **Lưu**.

> ⚠️ **LƯU Ý BẢO MẬT:** Tuyệt đối KHÔNG chia sẻ mã Token này cho bất kỳ ai. Extension lưu trữ mã này hoàn toàn cục bộ trên máy tính của bạn và giao tiếp trực tiếp cực kỳ bảo mật tới API của GitHub.

---

## 🏗️ Lệnh phát triển (For Developers)

Dự án được phát triển sử dụng công nghệ hiện đại: **Svelte 5**, **TypeScript**, **SCSS**, đóng gói nhanh bởi **Esbuild**, kiểm tra tĩnh bởi **svelte-check** và lint bởi **ESLint**.

### Cài đặt thư viện dependencies:
```bash
npm install
```

### Biên dịch và đóng gói tự động:
```bash
node build.js
```

*Lệnh trên sẽ tự động chạy toàn bộ quy trình:*
1. Kiểm tra tĩnh lỗi kiểu dữ liệu toàn bộ code TypeScript và Svelte (`svelte-check`).
2. Kiểm tra chuẩn format code (`ESLint`).
3. Biên dịch toàn bộ các stylesheet Sass/SCSS thành CSS thuần.
4. Đóng gói mã nguồn JS/TS/Svelte bằng esbuild cực nhanh.
5. Sao chép toàn bộ tài nguyên (Manifest, icons, hình ảnh hướng dẫn...).
6. Tự động nén thành các tệp tin `chrome.zip` và `firefox.zip` nằm trong thư mục `/dist` sẵn sàng để phát hành.

---

Chúc bạn có những trải nghiệm chơi game **Plants vs. Zombies Game Edition** tuyệt vời nhất! Nếu gặp bất kỳ vấn đề gì, hãy mở mục **Hướng dẫn** ngay trên giao diện Extension để xem chi tiết. 🌟
