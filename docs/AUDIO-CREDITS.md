# 🎼 Âm thanh có bản quyền sử dụng hợp lệ — NẤM LÙN 3D v0.3.1

## Nhạc nền và không gian (CC0)

| Ngữ cảnh | Tệp chạy trong game | Tác phẩm · tác giả · nguồn |
| --- | --- | --- |
| Làng Nấm Ánh Sao | `music/village.mp3` | **Town Theme RPG** — cynicmusic, [OpenGameArt](https://opengameart.org/content/town-theme-rpg) |
| Rừng Đom Đóm | `music/forest.ogg` | **Iremos Forest Theme Loop** — beardalaxy, [OpenGameArt](https://opengameart.org/content/iremos-forest-theme-loop) |
| Đầm Pha Lê | `music/crystal.mp3` | **Crystal Cave** — Alex McCulloch / Pro Sensory, [OpenGameArt](https://opengameart.org/content/crystal-cave) |
| Chiến đấu | `music/battle.ogg` | **Hope (Orchestral Battle Music)** — MintoDog, [OpenGameArt](https://opengameart.org/content/hopeorchestral-battle-music) |
| Âm thanh thiên nhiên | `music/ambience.mp3` | **Forest Ambience** — TinyWorlds, [OpenGameArt](https://opengameart.org/content/forest-ambience) |

Các tệp được tải tại bước build vào `public/assets/audio`, phục vụ từ **cùng tên miền website**, không cần truy cập OpenGameArt khi chơi. Giấy phép nguồn theo **CC0 1.0**. Ghi công đầy đủ cho Alex McCulloch theo yêu cầu ghi nguồn tại trang Crystal Cave.

## Hiệu ứng âm thanh (CC0)

- `sfx/spell.ogg`, `sfx/warp.ogg`: **Magic Spell SFX** — JaggedStone, [OpenGameArt](https://opengameart.org/content/magic-spell-sfx).
- `sfx/hit.ogg`, `sfx/hurt.ogg`, `sfx/defeat.ogg`: **5 Hit Sounds + Dying** — TinyWorlds, [OpenGameArt](https://opengameart.org/content/5-hit-sounds-dying).
- `sfx/coin.ogg`: **Coin Drop** — Vinrax, [OpenGameArt](https://opengameart.org/content/coin-drop).
- `sfx/level.mp3`, `sfx/pickup.mp3`, `sfx/ui.mp3`, `sfx/warning.mp3`: **7 Assorted Sound Effects** — Joth, [OpenGameArt](https://opengameart.org/content/7-assorted-sound-effects-menu-level-up).

**Quan trọng:** Một hiệu ứng có thể dùng cho nhiều sự kiện tương tự (vd. trúng đòn/quái bị thương, chuyển cảnh/lướt). Mọi đường dẫn trong `audio.js` phải tồn tại trong `scripts/fetch-audio.mjs`. Không đổi tên file trong mã game mà quên sửa pipeline. Chạy `npm run build` để sao chép game và tải đúng tài nguyên, sau đó phát hành thư mục `public/`.

## 7 NPC có lời thoại tiếng Việt

Hội thoại do game biên soạn riêng, hiển thị phụ đề và dùng Web Speech `speechSynthesis` của thiết bị với giọng `vi-VN`: Già Làng (nhiệm vụ), Thầy thuốc (chữa trị), Thương nhân (mua vật phẩm), Kiểm lâm (bảo hộ), Tiên nữ (pháp lực), Học giả (kiến thức), Thợ rèn (cường hóa). Nếu máy không có giọng tiếng Việt, game giữ **phụ đề**, không phát giọng tiếng Anh đọc sai. Người chơi mở khóa âm thanh khi bấm Bắt đầu. Nhạc giảm âm lượng khi NPC nói.

## Kiểm thử

Đã kiểm tra trực tiếp trên website: `village.mp3`, `forest.ogg`, `crystal.mp3`, `battle.ogg`, `ambience.mp3` và các tệp `hit.ogg`, `hurt.ogg`, `defeat.ogg`, `spell.ogg`, `warp.ogg`, `coin.ogg`, `level.mp3`, `pickup.mp3`, `ui.mp3`, `warning.mp3` đều trả **HTTP 200**. Giọng TTS cần kiểm tra thêm trên thiết bị Android/iOS thực tế.
