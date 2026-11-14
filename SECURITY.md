# SECURITY

- Đây là ứng dụng **tĩnh, một người chơi**, không có backend, không đăng nhập và không giao dịch tài chính.
- Chỉ lưu tiến trình trong `localStorage` trên thiết bị. Khi xóa dữ liệu web, save có thể mất; không có cloud backup.
- Không gửi khóa API, token, mật khẩu, thông tin cá nhân hay file `.env` vào issues/commits.
- Xử lý nội dung do người dùng nhập trước khi hiển thị để tránh XSS nếu sau này thêm chat/tên nhân vật tùy chỉnh.
- Phụ thuộc CDN Three.js; kiểm tra phiên bản, chính sách CSP và khả năng tải mô-đun trước khi đưa lên production.
- Đối với lỗ hổng nghiêm trọng, liên hệ chủ repository qua GitHub trước khi đăng issue công khai.
