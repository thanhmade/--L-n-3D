## v0.3.0 — 14/11/2026

- Thay hiệu ứng tổng hợp bằng bộ SFX CC0 Kenney + rubberduck.
- Nhạc 3 vùng, nhạc giao tranh chuyển mượt và lớp ambience tiếng chim; có thanh âm lượng riêng.
- 7 NPC với lời thoại tiếng Việt chuyên ngành, hội thoại nhiều câu, bấm/chạm NPC trực tiếp; dịch vụ gắn HP/MP/xu/bình máu.
- Đọc thoại bằng giọng vi-VN trên thiết bị (phụ đề nếu chưa có voice), hạ nhạc khi NPC nói.
- Ghi nguồn/licence đầy đủ và có quy trình build tải media từ OpenGameArt.

# CHANGELOG

Mọi thay đổi lớn của Nấm Lùn – Khu Rừng Tinh Linh 3D.

## [0.2.0] — 2026-11-14

### Giao diện & mobile
- HUD HP/MP/EXP được thu gọn, có nhiệm vụ thu/mở, tối ưu vùng chơi điện thoại.
- Thêm nút fullscreen/landscape; thử `screen.orientation.lock('landscape')` khi browser cho phép.
- Fallback bố cục ngang mô phỏng nếu không có quyền khóa hướng xoay hệ điều hành.

### Combat
- AI quái nhiều HP hơn, phát hiện/đuổi nhanh hơn; sát thương và độ khó theo LV.
- Đòn mạnh có hiển thị báo trước, quái tinh anh; 3 mức Dễ/Thử thách/Ác mộng.
- Dữ liệu lưu cũ dùng lại key `nam-lun-phieu-luu-save-v1`.

### Developer experience
- Chuẩn hóa repository, README, docs, skill, plugin skills-only, kiểm thử và máy chủ dev tĩnh.

## [0.1.0] — 2026-11-14
- Bản chơi thử Three.js với 3 vùng, nhiệm vụ, quái, EXP/LV, xu, 4 kỹ năng và điều khiển PC/mobile.
