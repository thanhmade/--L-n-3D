# Cài đặt, vận hành và triển khai

## Điều kiện

- Browser WebGL2/WebGL hỗ trợ ES modules, kết nối Internet để tải thư viện Three.js r187.
- Node.js v20+ cho máy chủ dev và bài kiểm thử; không cần npm dependencies để chạy.

## Chạy tại máy

```bash
git clone https://github.com/thanhmade/--L-n-3D.git
cd ./--L-n-3D
npm run dev
```

Mở http://127.0.0.1:5173/ và xác nhận tiêu đề v0.2.0. Để dừng máy chủ: `Ctrl+C`.

## Kiểm tra trước phát hành

```bash
npm test
npm run lint
```

Chạy checklist trên Android Chrome, Android webview và màn hình desktop. Đặc biệt thử máy không tự xoay để kiểm chứng CSS fallback.

## Triển khai tĩnh trên Vercel

1. Cấp cho Vercel quyền đọc repo **đúng** `thanhmade/--L-n-3D`.
2. Import Project (framework **Other**, root `./`, không có build command/output directory).
3. Xác nhận các đường dẫn `/`, `/style.css`, `/game.js`, `/manifest.webmanifest`, `/icon.svg` trả 200.
4. Kiểm tra trang mới ở chế độ không đăng nhập; nếu bảo vệ SSO bật, chỉ tắt trong đúng project khi chủ dự án muốn công khai.
5. Không đổi domain/site production khác khi chưa có yêu cầu.

**Quan trọng:** project Vercel có sẵn tại `https://nam-lun-khu-rung-tinh-linh-3d.vercel.app/` có thể đang deploy từ upload tệp riêng. Đẩy GitHub **không có nghĩa** website đã tự động cập nhật; chỉ tự cập nhật nếu đã liên kết Git ở đúng project.

## Triển khai thủ công khác

Các dịch vụ hỗ trợ static hosting (Netlify, Cloudflare Pages, GitHub Pages) có thể phân phối thư mục gốc. `manifest.webmanifest` dùng đường dẫn tuyệt đối `/`, cần chỉnh `start_url/scope/icons` nếu host site dưới subpath (ví dụ GitHub Pages `/<repo>/`).

## Xử lý sự cố

- **Màn hình đen:** mở DevTools, kiểm tra WebGL, lỗi import CDN `three@0.187.0`.
- **Điện thoại không xoay:** mở bằng Chrome hoặc cài PWA nếu trình duyệt hỗ trợ, bật tự xoay ở hệ thống; thử nút ⛶; fallback chỉ xoay giao diện.
- **Các bảng che nhân vật:** kiểm tra CSS `pointer:coarse`, `max-height`, `safe-area`, `force-landscape`.
- **Save mất:** localStorage theo domain và trình duyệt, có thể bị xóa khi clear data; không đồng bộ giữa điện thoại và PC.
- **Khác LV sau reload:** kiểm tra key `nam-lun-phieu-luu-save-v1` và logic chuẩn hóa trong `readSave()`.
