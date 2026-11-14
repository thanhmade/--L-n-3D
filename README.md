<div align="center">
  <img src="assets/nam-lun-banner.svg" alt="Nấm Lùn – Khu Rừng Tinh Linh 3D" width="100%" />

  # 🍄 NẤM LÙN — KHU RỪNG TINH LINH 3D

  **Mini action-RPG 3D trên trình duyệt · Chibi fantasy · Three.js**

  [![Phiên bản](https://img.shields.io/badge/version-v0.3.0-8df3d4?style=flat-square)](#nhật-ký-phiên-bản)
  [![Nền tảng](https://img.shields.io/badge/platform-Web%20%7C%20Android%20%7C%20Desktop-264b46?style=flat-square)](#nền-tảng--điều-khiển)
  [![Three.js](https://img.shields.io/badge/Three.js-r187-000000?style=flat-square&logo=threedotjs)](https://threejs.org/)
  [![Trạng thái](https://img.shields.io/badge/status-Playable%20Prototype-fc9b8b?style=flat-square)](#giới-hạn-hiện-tại)

  **[🎮 CHƠI GAME TRỰC TUYẾN](https://nam-lun-khu-rung-tinh-linh-3d.vercel.app)** · **[📖 Cài đặt](#chạy-trên-máy-tính)** · **[🧩 Skill/Plugin](#-skill--plugin-chatgpt)**
</div>

---

## ✨ Giới thiệu

Hóa thân thành **Bé Nấm Mộng Mơ**, dạo qua những khu rừng thần tiên, chiến đấu với quái, thu thập xu tinh linh, tích lũy EXP và mở khóa bản đồ theo cấp độ. Đây là **bản chơi thử v0.3.0**, không phải game thương mại hoàn chỉnh.

| Hệ thống | Đã có trong v0.3.0 |
| --- | --- |
| Đồ họa | Thế giới 3D tạo bằng hình học Three.js; phong cách chibi cổ tích |
| Thám hiểm | 3 vùng, cổng dịch chuyển theo LV, minimap |
| Chiến đấu | Chém, phép, lướt, hồi máu; quái có AI, tấn công và đòn mạnh báo trước |
| Tiến trình | HP, MP, EXP, LV, xu, số quái, nhiệm vụ và lưu trò chơi |
| Độ khó | **Dễ**, **Thử thách** (mặc định), **Ác mộng**; quái mạnh dần theo cấp |
| Thiết bị | PC với bàn phím/chuột, điện thoại với joystick/nút cảm ứng |
| Trình bày mobile | HUD thu gọn, nhiệm vụ thu gọn, thử fullscreen/landscape và bố cục dự phòng |


## 🎧 Nhạc nền, hiệu ứng, giọng nói v0.3.0

Game hiện có **nhạc CC0** riêng cho **Làng Nấm Ánh Sao** (nhạc cổ tích nhẹ), **Rừng Đom Đóm** (âm hưởng rừng), **Đầm Pha Lê** (huyền bí), nhạc **chiến đấu** khi có quái áp sát, tiếng **chim rừng** và các hiệu ứng chém, phép, trúng đòn, rơi xu, vật phẩm, lên cấp. Âm lượng nhạc / ambient / hiệu ứng / giọng có thể chỉnh độc lập trong **Hướng dẫn → Nhạc & giọng nói**.

Có **7 NPC chuyên ngành**: Già làng (nhiệm vụ), Thầy thuốc (hồi HP/MP), Thương nhân (bình hồi máu), Kiểm lâm (bảo hộ), Tiên nữ (hồi MP), Học giả (chiến thuật) và Thợ rèn (cường hóa). **Nhấn trực tiếp vào NPC** (hoặc đến gần rồi nhấn `E`), chọn lượt hội thoại, nghe lại, hoặc dùng dịch vụ. Phụ đề tiếng Việt luôn hiển thị. Lời nói sử dụng giọng **vi-VN của điện thoại/máy tính** qua Web Speech API; nếu thiết bị chưa cài giọng Việt, game không đọc sai bằng tiếng Anh mà hiện hướng dẫn cài giọng.

**Giấy phép/ghi nguồn:** [docs/AUDIO-CREDITS.md](docs/AUDIO-CREDITS.md) (Kenney, rubberduck, cynicmusic, TinyWorlds, MintoDog, isaiah658, Alex McCulloch). Audio được tải từ nguồn gốc CC0 **khi build** và phục vụ từ cùng domain, không hotlink khi chơi.

```bash
python3 scripts/download_audio.py   # tải nhạc + 2 pack hiệu ứng CC0
npm run build                     # tạo dist/ đầy đủ, gồm assets/audio
npm test && npm run lint          # kiểm tra mã + NPC + âm thanh
```

**Triển khai Vercel v0.3:** Build Command `python3 scripts/build_site.py`, Output Directory `dist`, framework Other. Build cần truy cập OpenGameArt để tải tài nguyên CC0.

## 🗺️ Thế giới

| Bản đồ | Cấp vào vùng | Mô tả |
| --- | :---: | --- |
| 🌟 Làng Nấm Ánh Sao | LV 1+ | Khu tân thủ, nhiệm vụ đầu tiên |
| ✨ Rừng Đom Đóm | LV 3+ | Rừng sâu nhiều sinh vật hơn |
| 💎 Đầm Pha Lê | LV 5+ | Vùng tiến cấp tiếp theo |

> Di chuyển đến cổng phát sáng và tương tác khi đạt cấp yêu cầu. Các vùng được tạo từ hình học thủ tục, **chưa có mô hình GLB/FBX/rig được nhập từ Tripo3D**.

## 🎮 Nền tảng & điều khiển

| Hành động | Máy tính | Điện thoại |
| --- | --- | --- |
| Di chuyển | `W A S D` / phím mũi tên | Joystick trái |
| Xoay camera | Kéo chuột | Vuốt vùng thế giới 3D |
| Chém cận chiến | `J` hoặc `Space` | **CHÉM** |
| Bắn phép | `L` | **PHÉP** |
| Lướt né | `K` | **LƯỚT** |
| Dùng bình máu | `H` | **HỒI MÁU** |
| Tương tác cổng | `E` | Nút tương tác khi tới gần |
| Mở bản đồ | `M` | Biểu tượng bản đồ |

**Điện thoại:** xoay ngang để có vùng nhìn tốt nhất. Khi nhấn **Bắt đầu**, game *yêu cầu* fullscreen và khóa landscape nếu trình duyệt cho phép. Website **không thể ép hệ điều hành tự xoay** trên mọi Android/iOS hoặc webview; chế độ ngang mô phỏng chỉ là phương án dự phòng. Trên Android, có thể mở bằng Chrome và bật xoay màn hình ở cài đặt máy.

## 🚀 Chạy trên máy tính

**Yêu cầu:** trình duyệt mới có WebGL, Internet (Three.js được nạp từ CDN), Node.js 20+ nếu muốn chạy server/kiểm thử tích hợp sẵn.

```bash
git clone https://github.com/thanhmade/--L-n-3D.git
cd ./--L-n-3D
npm run dev
```

Mở **http://127.0.0.1:5173/**. Nếu không muốn cài Node.js, có thể chạy một HTTP server tĩnh bất kỳ trong thư mục này, ví dụ `python -m http.server 8000` rồi mở `http://localhost:8000`.

```bash
npm test         # kiểm tra tài nguyên và cấu hình bằng Node built-in test
npm run lint     # kiểm tra cú pháp JS
```

> Chạy với HTTP server thay vì mở `file://` để tránh giới hạn module ES và tài nguyên trình duyệt. Lệnh chạy không đòi npm install vì game không khai báo dependency cài cục bộ.

## 🎼 Nhạc nền, hiệu ứng và NPC có tiếng Việt (v0.3.0)

Game có **4 bản nhạc nền theo ngữ cảnh**: Làng Nấm Ánh Sao (vui tươi), Rừng Đom Đóm (huyền bí), Đầm Pha Lê (lung linh), chiến đấu (dồn dập), kèm tiếng nền rừng và hiệu ứng đòn đánh, phép, nhặt xu, lên cấp, hồi máu. Âm nhạc tự chuyển mượt giữa các vùng và giảm nhỏ khi nhân vật đang đọc lời.

Có **6 NPC tương tác**, dùng **tiếng Việt có phụ đề**: Già làng, Thầy thuốc, Thương nhân, Võ sư, Tiên nữ, Người giữ Pha Lê. Người chơi chạm trực tiếp lên mô hình hoặc bấm `E` khi đến gần, nghe giới thiệu/hướng dẫn, chọn các dịch vụ tùy vai trò. Giọng nói chạy bằng **Web Speech `vi-VN` trên thiết bị**; cần cài giọng tiếng Việt để có phát âm phù hợp, không bảo đảm giống nhau trên mọi trình duyệt. Nhấn `🎵` để chỉnh riêng âm lượng nhạc, hiệu ứng, giọng nói.

Tất cả **bản thu nền/SFX trong v0.3 đều là nguồn OpenGameArt CC0**, đọc đầy đủ [nguồn, tác giả, giấy phép và danh mục tệp](docs/AM-THANH-NGUON-VA-GIAY-PHEP.md). Chi tiết NPC và giá dịch vụ: [NPC-VA-LOI-THOAI.md](docs/NPC-VA-LOI-THOAI.md).

## 🌐 Triển khai Vercel

Dự án là **static website**, không cần máy chủ ứng dụng hoặc tài khoản người chơi.

1. Vào Vercel → **Add New Project** → import `thanhmade/--L-n-3D` (cấp quyền GitHub nếu cần).
2. Framework Preset: **Other**; Root Directory: `./`; Build Command: `python3 scripts/build_site.py`; Output Directory: `dist`.
3. Deploy và xác nhận mở được `/`, `/game.js`, `/style.css`, `/manifest.webmanifest`.
4. Muốn đẩy thay đổi lên một dự án Vercel đã tồn tại, **kết nối đúng repository này với project đó trước**. Không tự suy đoán site cũ đã liên kết Git.

Website đang tham chiếu: **https://nam-lun-khu-rung-tinh-linh-3d.vercel.app**. Việc cập nhật repository **không tự động cập nhật website** nếu dự án Vercel chưa kết nối repo tương ứng.

## 🗂️ Cấu trúc repository

```text
.
├── index.html                 # HUD, màn hình mở đầu, menu và nút thao tác
├── style.css                  # Giao diện PC/mobile, landscape fallback
├── game.js                    # Scene/Camera, gameplay, AI, chiến đấu, save, NPC
├── audio.js                   # GameAudio, playlist, SFX, Web Speech tiếng Việt
├── npc-dialogues.js           # 6 NPC, thoại nghề nghiệp và nhiệm vụ
├── assets/audio/              # Nhạc và hiệu ứng CC0 gói cùng website
├── icon.svg                   # Biểu tượng ứng dụng
├── manifest.webmanifest       # Thiết lập nhận diện ứng dụng web
├── assets/nam-lun-banner.svg  # Hình tiêu đề README (minh họa SVG)
├── docs/                      # Kiến trúc, triển khai, QA, lịch sử yêu cầu
├── scripts/serve.mjs          # Máy chủ tĩnh cho phát triển cục bộ
├── tests/                     # Kiểm tra tĩnh với node --test
├── skills/nam-lun-3d-dev/     # Skill hướng dẫn cộng tác AI
├── plugin/nam-lun-3d-studio/  # Mã nguồn plugin ChatGPT skills-only
├── AGENTS.md                  # Quy ước dành cho coding agent
├── CHANGELOG.md
├── CONTRIBUTING.md
└── package.json
```

## 🤖 Skill & Plugin ChatGPT

- **Skill:** [`skills/nam-lun-3d-dev/SKILL.md`](skills/nam-lun-3d-dev/SKILL.md) — hướng dẫn AI đọc cấu trúc mã, cân bằng quái, mở rộng map và kiểm thử mobile.
- **Plugin:** [`plugin/nam-lun-3d-studio/`](plugin/nam-lun-3d-studio/) — bộ manifest và skill tương ứng để đóng gói cho ChatGPT. Đây là **plugin skills-only**, không phải backend, không tự có quyền GitHub hoặc Vercel nếu chưa kết nối công cụ đó.
- **Quy tắc:** đọc `AGENTS.md` và skill trước khi thay đổi. Chỉ push/deploy khi có ủy quyền cụ thể; không thay các dự án khác.

Ví dụ lệnh cho trợ lý AI: `Dùng skill nam-lun-3d-dev kiểm tra HUD điện thoại ngang, đánh giá độ khó quái LV9 và đề xuất bản sửa.`

## 🧪 Kiểm thử & chất lượng

- **Tự động:** `npm test` và `npm run lint` kiểm tra cấu trúc, tài nguyên tham chiếu và cú pháp; đây **không thay thế** kiểm thử chơi WebGL thực tế.
- **Thủ công:** theo checklist tại [`docs/QA-CHECKLIST.md`](docs/QA-CHECKLIST.md), đặc biệt Android Chrome dọc/ngang, webview, hồi sinh, nâng cấp, tương tác cổng và reload localStorage.
- **Khả năng tương thích:** game cần WebGL và kết nối tới CDN `three@0.187.0`; CDN bị chặn sẽ hiện lỗi. Chức năng xoay ngang phụ thuộc API và quyền của trình duyệt.

## ⚠️ Giới hạn hiện tại

- Bản mẫu **một người chơi**; dữ liệu lưu **trong localStorage** của từng trình duyệt; không đồng bộ tài khoản hay server.
- Chưa có inventory/trang bị thật, đồng bộ online, mua bán, multiplayer, Boss riêng hoặc animation rig GLB/FBX.
- Mô hình/hiệu ứng tạo bằng Three.js thuần, không phải tài sản hoặc nhân vật chính thức của Pixar; "phong cách huyền ảo" chỉ mô tả định hướng mỹ thuật.
- Chưa cam kết FPS/độ ổn định trên tất cả điện thoại; các thiết bị cấu hình thấp có thể giảm hiệu năng.

## 📝 Nhật ký phiên bản

Chi tiết tại [CHANGELOG.md](CHANGELOG.md). Phiên bản **v0.3.0**: nhạc + SFX CC0 từ nguồn đã kiểm chứng, hội thoại 6 NPC tiếng Việt, giao thương và huấn luyện. v0.3.0 vẫn giữ HUD mobile và AI quái cải tiến.

## 👤 Tác giả & bản quyền

**Nguyễn Trung Thành** · Dự án trò chơi giáo dục và khám phá 3D.

Mã game của dự án do tác giả quản lý. Three.js dùng theo giấy phép **MIT** của dự án Three.js; chi tiết tại [threejs.org](https://threejs.org/). Repository **chưa công bố giấy phép tái sử dụng mã nguồn**; vui lòng xin phép chủ sở hữu trước khi phân phối lại.
