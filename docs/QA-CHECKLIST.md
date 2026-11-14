# QA Checklist — Game Nấm Lùn 3D v0.2.0

Ghi lại **thiết bị/OS/browser, tỷ lệ màn hình, LV, vùng, độ khó**, ảnh hoặc video nếu có lỗi.

## Desktop

- [ ] 1920×1080: màn hình mở đầu và UI không che nút chính.
- [ ] WASD / mũi tên di chuyển; chuột đổi góc camera.
- [ ] J/L/K/H tác dụng và trạng thái cooldown/MP cập nhật đúng.
- [ ] M mở bản đồ; E tương tác cổng.
- [ ] Đánh quái: quái nhận hit, bị hạ, thưởng EXP/xu và có quái mới.
- [ ] Lên LV hiển thị màn hình tăng cấp, tăng chỉ số.

## Android / iOS / mobile webview

- [ ] Dọc: nút bắt đầu và chọn độ khó đều thấy, không cắt màn hình.
- [ ] Ngang 16:9: minimap/nhiệm vụ/HUD không đè joystick hoặc 4 nút kỹ năng.
- [ ] Máy màn hình thấp hoặc tỷ lệ 20:9: không mất nút tương tác.
- [ ] Nhấn Bắt đầu → thử fullscreen/landscape; khi bị chặn vẫn chơi được.
- [ ] Nút ⛶ xử lý khi browser từ chối orientation lock.
- [ ] Chạm joystick và vuốt camera không làm trang cuộn/zoom sai.
- [ ] Nhiệm vụ gấp/mở hoạt động và không che quái.

## Chiến đấu và độ khó

- [ ] Độ khó Dễ / Thử thách / Ác mộng thay đổi sức quái đúng.
- [ ] LV1 và LV9: sức mạnh quái tăng phù hợp, không một-hit toàn bộ.
- [ ] Quái tinh anh có nhiều HP/đánh mạnh hơn quái thường.
- [ ] Đòn mạnh xuất hiện vùng cảnh báo trước khi gây sát thương.
- [ ] Lướt né đúng timing; không bị stun lock vô hạn.
- [ ] Quái không đánh khi ngoài tầm hoặc xuyên vật cản (nếu đã thêm collision).

## Tiến trình

- [ ] Lên LV3 mở Rừng Đom Đóm; LV5 mở Đầm Pha Lê.
- [ ] Reload vẫn giữ LV, XP, xu, nhiệm vụ và độ khó.
- [ ] Sử dụng dữ liệu save v0.1 cũ không làm crash.
- [ ] Chết và hồi sinh không xóa LV/EXP.
- [ ] Nút Chơi lại hỏi xác nhận rồi mới xóa save cục bộ.

## Phát hành

- [ ] `npm test` đạt.
- [ ] `npm run lint` đạt.
- [ ] URL production trả HTTP 200; CSS/JS/manifest/icon tải thành công.
- [ ] WebGL chạy thực tế trên thiết bị đích (không chỉ kiểm tra HTTP 200).
- [ ] Không có mật khẩu/token/API secret trong mã nguồn hoặc log.

## Audio & NPC v0.3.0
- [ ] Sau click **Bắt đầu**, nhạc vùng thứ nhất phát được; không autoplay trước click.
- [ ] Thấy quái gần, nhạc chuyển sang chiến đấu; khi ra xa chuyển về nhạc vùng.
- [ ] Chuyển cổng nghe nhạc khác, không có 2 bản nhạc phát to cùng lúc.
- [ ] Âm thanh chém, phép, trúng đòn, vật phẩm, tăng LV đúng hành động.
- [ ] Kiểm tra 7 NPC, thoại theo từng vai nghề, phụ đề, nút tiếp câu và nghe lại.
- [ ] NPC Thầy thuốc, Thương nhân, Kiểm lâm, Tiên nữ, Thợ rèn áp dụng xu và hiệu quả chính xác.
- [ ] Tắt tiếng / điều chỉnh nhạc, SFX, voice lưu qua reload.
- [ ] Android Chrome cài giọng Việt vi-VN; máy không có voice vẫn có phụ đề.
- [ ] Đường dẫn assets/audio/... trả HTTP 200 đúng content-type và dung lượng.
