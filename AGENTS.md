# AGENTS.md — Quy tắc làm việc với Nấm Lùn 3D

## Nguồn chuẩn
- Repository chính: `https://github.com/thanhmade/--L-n-3D`, nhánh `main`.
- Website tham chiếu: `https://nam-lun-khu-rung-tinh-linh-3d.vercel.app`.
- Phiên bản source khởi tạo: v0.2.0. Không ghép mã của Game-3D-Than-Thoai hoặc viet-village-3d vào dự án này khi không được yêu cầu.

## Bắt đầu trước khi sửa
1. Đọc README, `docs/ARCHITECTURE.md`, `docs/QA-CHECKLIST.md`, skill `skills/nam-lun-3d-dev/SKILL.md`.
2. Tái hiện lỗi và nêu cụ thể đường đi/chức năng. Ưu tiên sửa nguyên nhân, không chỉnh CSS ngẫu nhiên.
3. Tách rõ dữ liệu đang có, tính năng cần làm và tính năng chỉ đề xuất.
4. Bảo toàn localStorage key `nam-lun-phieu-luu-save-v1` và cấu trúc save, hoặc cung cấp migration tương thích.
5. Không thêm server đăng nhập/thu thập dữ liệu cá nhân khi chưa được yêu cầu.

## Không được làm
- Không tự động push/deploy, thay quyền public/private hoặc sửa GitHub repo khác ngoài phạm vi được ủy quyền.
- Không commit bí mật, token, `.env`, tài khoản, dữ liệu người dùng.
- Không tuyên bố "xoay ngang tự động 100%"; browser có thể không cho `screen.orientation.lock`.
- Không giới thiệu asset chibi procedural hiện tại là mô hình Pixar có bản quyền.

## Tiêu chí hoàn thành
- `npm test` và `npm run lint` xanh.
- Kiểm tra PC, màn hình 16:9 và điện thoại dọc/ngang; không che joystick/nút/hud.
- Cân bằng quái theo LV, tránh đánh trúng quá xa và kiểm tra kỹ năng/telegraph.
- Báo danh sách file, test chạy, commit, URL (nếu có) và điểm chưa kiểm thử thực tế.
