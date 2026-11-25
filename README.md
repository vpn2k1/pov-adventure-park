# POV Adventure Park — Bộ đặc tả & kế hoạch triển khai
**Phiên bản 1.0 | 25/11/2026 | Định hướng Android trước, iOS sau**

## Quyết định sản phẩm
Game 2.5D hybrid (máng/đường ray 3D, cảnh và hiệu ứng 2D), camera POV, màn hình dọc, tự tiến về trước. Nghiêng điện thoại trái/phải để giữ cân bằng, chọn đường, né nguy hiểm tự nhiên. Sai tư thế có thể mất kiểm soát, văng khỏi máng hoặc ray trong thế giới game. Không mô phỏng tai nạn thật, không hình ảnh thương tích. Thua → hiệu ứng ngắn → thử lại từ đầu/checkpoint.

Đây là **gói thiết kế kỹ thuật để triển khai**, không phải app Expo hoàn chỉnh hay APK. Có 12 cấu hình level, schema kiểm tra dữ liệu, mã TypeScript tham chiếu chạy độc lập và test. Cảnh 3D, spline thực, sensor native, UI, lưu dữ liệu và build mobile vẫn cần triển khai. Mọi ngưỡng vật lý, thời lượng, KPI là giả định thiết kế, cần playtest.

## Đọc theo thứ tự
| Tệp | Mục đích |
|---|---|
| AGENTS.md | Quy tắc cho AI coding agent / lập trình viên |
| specs/01-product-gdd.md | Phạm vi, gameplay, thắng/thua, tiến trình |
| specs/02-level-design.md | 12 level, luật riêng, authoring |
| specs/03-physics-and-failure.md | Công thức, fixed step, các rule, văng khỏi đường |
| specs/04-input-camera-render.md | Sensor, camera, 2.5D, UX an toàn |
| specs/05-ui-navigation-forms.md | Stack, màn hình, form, state, accessibility |
| specs/06-architecture-stack.md | Thư viện, cấu trúc source dự kiến, hook, data flow |
| specs/07-persistence-and-content.md | Schema, lưu tiến trình, retry, versioning |
| specs/08-performance-audio-assets.md | Ngân sách render, asset, sound, crash FX |
| specs/09-testing-release.md | QA, CI, build và release |
| plans/ROADMAP.md | Phase 0–6, deliverable, gate, phụ thuộc |
| plans/BACKLOG.csv | Task ID, phase, dependency, AC, priority |
| plans/DECISIONS.md | Giả định, lựa chọn, rủi ro |
| setup/INSTALL.md | Lệnh tạo Expo project và kiểm tra tương thích |
| setup/dependencies.json | Danh mục package theo phase |
| levels/catalog.json + levels/*.json | 12 level cấu hình mẫu |
| contracts/level.schema.json | JSON Schema 2020-12 |
| reference-engine/ | TypeScript mẫu + test chạy trên Node |
| qa/acceptance.md | Kịch bản nghiệm thu |
| SOURCES.md | Tài liệu kỹ thuật chính thức |

## Khởi động
1. Đọc AGENTS.md, GDD và roadmap. Chỉ làm Phase 0 trước.
2. Tạo project Expo riêng theo setup/INSTALL.md; không copy các docs thành Expo project.
3. Chạy `cd reference-engine && npm install && npm test` để kiểm tra engine tham chiếu; máy có `tsc` và Node thì có thể chạy `tsc -p tsconfig.json && node --test tests/*.test.cjs` mà không cài thêm.
4. Tích hợp mẫu theo contracts, dựng level L01. Sau khi đạt gate mới mở rộng 11 level còn lại.

## Asset pack tích hợp
- `assets/`: textures WebP, sprites, backgrounds, GLB, WAV, thumbnails, paths và branding.
- `level-assets.json`: bảng ánh xạ 12 level; `manifest.json`: inventory và SHA-256.
- `docs/assets/README.md` và `docs/assets/QA.md`: hướng dẫn tích hợp và giới hạn asset.
- `preview.webp`: ảnh xem trước asset.

Repository hiện có mã Expo prototype; native build và thiết bị thật chưa được xác minh. Giữ các đường dẫn asset tại root khi tích hợp app.

## Chạy mã prototype hiện tại
```bash
git clone https://github.com/vpn2k1/pov-adventure-park.git
cd pov-adventure-park
npm install
npx expo install --fix
npx expo-doctor
npm run typecheck
npm test
npx expo run:android
npm start
```
Dùng Node >=22.13, Android SDK/JDK tương thích Expo 58. Kiểm tra sensor và FPS trên máy thật. Nếu chưa có quyền sensor chọn chạm. Không force install peer dependencies. Không chạy create-expo-app đè lên repo.

Xem [trạng thái triển khai](docs/IMPLEMENTATION.md), [QA](qa/PROTOTYPE-TESTS.md) và [phần đồng bộ còn thiếu](SYNC_STATUS.md). 12 level có rule nhưng branch/loop thật chưa hoàn thành. Các asset gốc chưa đồng bộ toàn bộ; phần render hiện tại procedural.
