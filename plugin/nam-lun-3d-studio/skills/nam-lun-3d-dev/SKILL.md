---
name: nam-lun-3d-dev
description: Hỗ trợ phát triển, mở rộng, cân bằng quái, kiểm thử mobile, HUD, bản đồ, kỹ năng và triển khai website Nấm Lùn – Khu Rừng Tinh Linh 3D (Three.js). Sử dụng khi người dùng yêu cầu sửa lỗi hoặc nâng cấp chính dự án GitHub thanhmade/--L-n-3D.
---

# Nấm Lùn 3D — Game Development Skill

## Nguồn và phạm vi

- Repository duy nhất: `https://github.com/thanhmade/--L-n-3D`; nhánh nguồn: `main`.
- Live site tham chiếu: `https://nam-lun-khu-rung-tinh-linh-3d.vercel.app`.
- Bản nguồn ban đầu: v0.2.0 (HTML, CSS, Three.js game logic; procedural 3D, không rig FBX).
- Tài liệu bắt buộc: `README.md`, `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/QA-CHECKLIST.md`, `docs/YEU-CAU-DU-AN.md`.
- Skill là hướng dẫn làm việc, **không tích hợp sẵn** công cụ GitHub, Vercel, máy ảo hay backend. Dùng công cụ thực được cấp quyền khi cần, không giả vờ đã deploy.

## Quy trình cho mọi thay đổi

1. Xác nhận repo, nhánh, phiên bản hiện có; đọc đúng tệp nguồn liên quan.
2. Mô tả hiện trạng và mục tiêu bằng tiếng Việt, nêu nguyên nhân của lỗi khi có thể.
3. Tạo bản vá nhỏ, ưu tiên `game.js` cho logic, `style.css` cho layout, `index.html` cho DOM; không làm vỡ save.
4. Chạy `npm run lint`, `npm test`; kiểm tra thủ công bằng browser, ưu tiên Android Chrome trong môi trường thực.
5. Báo file, thay đổi, kết quả thử, URL, commit, giới hạn chưa kiểm chứng. Chỉ push/deploy khi được ủy quyền.

## Khi người dùng nói giao diện che khuất trên điện thoại

- Kiểm tra cả portrait, landscape thật, landscape giả lập CSS (class `force-landscape`), điện thoại notch/safe area và chiều cao <= 420px.
- Bảo đảm HUD không đè joystick, nút skill, nhiệm vụ/overlay che không gian combat; để nhiệm vụ gấp/mở.
- Tránh khóa màn hình bằng code bất chấp chính sách trình duyệt. Fullscreen và `screen.orientation.lock('landscape')` chỉ được **yêu cầu**, có thể bị từ chối; tiếp tục cho người chơi điều khiển được khi từ chối.
- Khi có lỗi, ghi ảnh + kích thước viewport + hành vi chạm + browser; test lại cả orientation fallback và chế độ dọc ban đầu.

## Khi người dùng yêu cầu quái khó hơn

- Đọc `DIFFICULTY`, vùng và vòng lặp enemy trong `game.js`, không đổi chỉ HP mà bỏ quên đòn đánh/tốc độ/telegraph.
- Phân biệt quái thường và tinh anh; các level tham chiếu: 1, 5, 9; ba mức `story`, `challenge`, `nightmare`.
- Thiết kế theo các đại lượng đo được: thời gian hạ quái, sát thương/trận, tỉ lệ né đòn, thời gian hồi skill, khả năng người chơi mới đi map.
- Đòn mạnh phải có cảnh báo nhìn được trên mobile, có cửa sổ né hợp lý; tránh chuỗi tấn công không thể phản ứng.
- Đảm bảo quái không đánh xuyên bản đồ hoặc tấn công ngoài vùng hit hợp lệ; không tự tuyên bố đã cân bằng nếu chưa chơi thử.

## Khi mở rộng bản đồ, nhiệm vụ và boss

- Bảo toàn 3 vùng gốc: Làng Nấm Ánh Sao LV1, Rừng Đom Đóm LV3, Đầm Pha Lê LV5; thêm nội dung qua cấu hình dữ liệu thay vì rải hardcode.
- Với vùng mới, liệt kê: ID, cấp mở, cửa vào/ra, mob/boss, rơi đồ, nhiệm vụ, vật thể cản đường, điểm spawn và độ khó.
- Trước khi đưa asset từ Tripo3D/FBX vào: kiểm tra quyền sử dụng, tỉ lệ, rig, animation, vật liệu, kích thước file và ngân sách hiệu năng mobile.
- Không tự thêm ảnh tham chiếu/asset người dùng chưa đồng ý vào GitHub.

## Khi động tới tiến trình người chơi

- Giữ khóa save `nam-lun-phieu-luu-save-v1`, không xóa dữ liệu cũ hay reset âm thầm.
- Thay schema phải có migration/default/clamp và test từ save v0.1/v0.2, kể cả đổi domain (localStorage không tự đồng bộ).
- Không đề xuất lưu dữ liệu nhạy cảm trong localStorage; tính năng tài khoản/cloud phải được yêu cầu riêng.

## Khi người dùng muốn phát hành

- Chạy test, xác minh tên repository và Vercel project thực; xác nhận trạng thái công khai hay bảo vệ.
- Chỉ gọi công cụ GitHub/Vercel khi đã kết nối và được phép. Giữ nguyên repo khác, không đổi quyền private/public vô cớ.
- Kiểm tra READY/HTTP 200 **không đủ** để khẳng định WebGL đã chơi được: cần kiểm tra console, input và gameplay trên thiết bị mục tiêu.

## Mẫu bàn giao

**Đã làm:** mô tả cụ thể. **Đã kiểm thử:** lệnh/browsers/kết quả. **Chưa kiểm thử:** công khai rõ. **Mã nguồn:** file/commit/PR. **Website:** URL/status nếu triển khai thật. **Tiếp theo:** đề xuất tối đa 3 ưu tiên.
