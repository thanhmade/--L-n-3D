# Kiến trúc game Nấm Lùn 3D v0.2.0

## Tổng quan

```text
Trình duyệt (WebGL, input, audio)
   ├── index.html       giao diện, HUD, menu, overlay
   ├── style.css        desktop/mobile CSS, landscape fallback
   ├── game.js          Three.js scene + loop + gameplay state
   ├── manifest.webmanifest + icon.svg
   └── localStorage     trạng thái người chơi trên trình duyệt
                     └── không có backend/đồng bộ tài khoản
```

## Điểm nối hiện có

- **Game 3D:** `game.js` import Three.js r187 từ jsDelivr, fallback unpkg; khởi tạo WebGLRenderer, scene, camera, ánh sáng, mặt đất và thực thể dạng hình học.
- **Vùng:** `ZONES` trong `game.js` quy định ba khu vực và cấp vào; game tạo bản đồ bằng đối tượng 3D procedural.
- **Tiến trình:** `defaultSave()`, `readSave()` và `saveGame()` điều khiển dữ liệu LV/EXP/HP/MP/xu/nhiệm vụ/độ khó. Key dữ liệu: `nam-lun-phieu-luu-save-v1`.
- **Gameplay:** input từ bàn phím/joystick và bốn kỹ năng; quái có hành vi truy đuổi, đòn đánh và đòn mạnh báo trước; HUD nhận các cập nhật liên tục.
- **Mobile:** fullscreen + `screen.orientation.lock()` là API bị giới hạn quyền, có class `force-landscape` để giả lập xoay khi cần.

## Mở rộng đề xuất (chưa có)

Trong giai đoạn sau có thể trích `game.js` thành các mô-đun `core`, `world`, `combat`, `character`, `ui`, `save`. Chưa nên tái cấu trúc quá lớn trước khi có test gameplay. Hướng nâng cấp: boss riêng, quest data-driven, equipment/inventory, model GLB có rig/animation và tối ưu draw calls/culling.

## Luồng dữ liệu save

`Trạng thái trong RAM` → `saveGame()` → localStorage. Khi mở trang → `readSave()` → chuẩn hóa giá trị (clamp/default) → khởi tạo world. Khi thay save schema phải giữ khả năng tải save cũ hoặc thực hiện migration và test.
