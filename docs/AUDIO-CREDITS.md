# 🎼 Âm thanh & Giấy phép — NẤM LÙN 3D v0.3.0

Tất cả âm thanh bên dưới được chọn từ trang tài sản gốc có ghi **CC0 1.0**. Tệp tải về được giữ trong dự án (chỉ trong output deploy, có thể tạo lại bằng `python3 scripts/download_audio.py`). Ghi nguồn rõ ràng dù CC0 thường không yêu cầu để người đóng góp được công nhận.

| Tên trong game | Tác giả | Nguồn gốc CC0 | Khi nào phát |
| --- | --- | --- | --- |
| **Town Theme RPG** (`village.mp3`) | cynicmusic | https://opengameart.org/content/town-theme-rpg | Làng Nấm Ánh Sao, không khí thư giãn |
| **Forest Ambience** (`forest.mp3`) | TinyWorlds | https://opengameart.org/content/forest-ambience | Rừng Đom Đóm, huyền ảo và thiên nhiên |
| **Crystal Cave** (`crystal.mp3`) | **Alex McCulloch / Pro Sensory** | https://opengameart.org/content/crystal-cave | Đầm Pha Lê, không khí bí ẩn |
| **Fairy Battles** (`battle.ogg`) | MintoDog | https://opengameart.org/content/fairy-battles | Khi gặp/đánh quái, nhạc chiến đấu |
| **Ambient Bird Sounds** (`birds.ogg`) | isaiah658 | https://opengameart.org/content/ambient-bird-sounds | Tiếng chim nhỏ ở làng và rừng |
| **80 CC0 RPG SFX** | rubberduck | https://opengameart.org/content/80-cc0-rpg-sfx | Kiếm, phép thuật, bị thương, quái, nhặt xu, tăng cấp và cường hóa |
| **50 RPG Sound Effects** | Kenney (Kenney.nl) | https://opengameart.org/content/50-rpg-sound-effects | Bộ sưu tập hiệu ứng phụ trợ và bước chân |

**Lưu ý quyền tác giả:** Trang *Crystal Cave* dù gắn giấy phép CC0 còn yêu cầu “please include my name in your project's credits, Alex McCulloch”. Đã ghi tên đầy đủ tại đây.

## Cách lấy tài nguyên

```bash
python3 scripts/download_audio.py
```

Lệnh lấy trực tiếp **5 tệp nhạc/ambient** và **hai ZIP SFX** từ các URL OpenGameArt, kiểm tra đúng định dạng rồi trích xuất các `.ogg` cần thiết. Vercel chạy `python3 scripts/build_site.py` để sinh `dist/` và đưa toàn bộ âm thanh lên **cùng domain với game**; trình duyệt không cần truy cập OpenGameArt khi chơi. Khi các URL nguồn thay đổi hoặc website nguồn ngừng phục vụ, quy trình build sẽ báo lỗi, không giả lập thành đã tải thành công.

## Giọng NPC tiếng Việt

- **Lời thoại NPC là văn bản được viết riêng** cho game này, không lấy hay sao chép giọng nhân vật phim/bản quyền.
- Trên web sử dụng **Web Speech API** của thiết bị (`speechSynthesis`), chỉ sử dụng giọng có `lang` là tiếng Việt (`vi-*`). Các vai có nhịp nói và cao độ khác nhau.
- Thiết bị **chưa cài giọng tiếng Việt** sẽ hiển thị phụ đề và thông báo rõ lý do; đây không phải file MP3 giọng người thu sẵn và chất lượng phát âm phụ thuộc Android/iOS/trình duyệt.
- Người chơi chủ động nhấn **Bắt đầu**, sau đó chạm NPC; không bật tiếng trước hành động của người chơi. Khi thoại, nhạc nền được giảm âm lượng tự động.

### Kiểm tra trước khi phát hành

1. Mở web → Bắt đầu → nghe nhạc Làng; đến gần các NPC để bật thoại.
2. Chuyển qua Rừng và Đầm → nghe nhạc chuyển vùng; đến gần quái → nghe nhạc chiến đấu.
3. Thử hiệu ứng chém, phép, lướt, nhận sát thương, nhặt xu và tăng cấp.
4. Trên Android kiểm tra `Cài đặt > Ngôn ngữ > Văn bản thành giọng nói` và tải giọng **tiếng Việt** nếu hội thoại chỉ có phụ đề.
5. Giảm **âm lượng nhạc** khi cần nghe thoại; kiểm tra nút tắt tiếng hoạt động với nhạc, hiệu ứng và giọng.
