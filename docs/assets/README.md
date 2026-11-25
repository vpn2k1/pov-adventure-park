# POV Adventure Park — Asset Pack (Prototype)

Bộ asset dùng cho project React Native + Expo / R3F native đã thiết kế. Copy thư mục `assets/` vào root dự án. Giữ `level-assets.json` và `manifest.json` để tham chiếu. Mọi hình ảnh sử dụng WebP; mô hình là GLB, âm thanh PCM WAV, metadata JSON.

## Nội dung
- branding: logo, icon, splash từ bộ trước.
- textures: 15 ảnh bề mặt 512×512 (bao gồm nước, bọt, máng màu, kim loại, gỗ, đá, tuyết, cỏ, cát, bê tông, cao su); texture tạo thủ tục với wrap noise.
- sprites: 16 ảnh RGBA tách nền, cây, props, nhân vật POV, VFX. Atlas 1024×1024 có tọa độ pixel trong `atlases/sprites.json`.
- backgrounds: 4 ảnh nền phong cảnh 2D; không phải skybox 360.
- ui/icons: 12 icon trong suốt; dùng cùng React Native Text để bản địa hóa.
- thumbnails: 12 ảnh placeholder, vẽ từ hình học đường đi với sprite POV; không phải screenshot game.
- models: 12 level GLB, 8 modular GLB dài 8m, 8 props/vehicle GLB.
- sounds: 6 loop môi trường, 9 SFX tổng hợp. WAV mono PCM 16 bit, 22050 Hz. Không có giọng đọc hay nhạc nền.
- paths: 12 bộ mẫu đường đi theo mét, khung camera và trạng thái closed.

## Tích hợp
1. Dùng GLTFLoader / useGLTF native khi đã xác nhận tương thích R3F, Expo GL và Metro; khai báo `.glb`, `.webp`, `.wav` trong assetExts nếu thiếu. Với asset local dùng `require()` tĩnh / Expo Asset, không dynamic require từ chuỗi JSON.
2. `level-assets.json` là bảng ánh xạ, không phải loader. Tạo registry require tĩnh hoặc codegen từ bảng. Tải GLB trước countdown. GLB có vật liệu màu low-poly; texture WebP là file rời, chưa gắn vào material. Gắn texture bằng tên mesh/material, đặt RepeatWrapping và sRGB color space cho albedo. Kiểm tra hỗ trợ WebP của loader native; nếu cần dùng phương án decode/upload tương thích.
3. Path bắt đầu (0,0,0), X phải, Y lên, Z âm hướng tiến. Mẫu khoảng 0.75m; dùng s làm khoảng cách tích lũy, nội suy position và frame (quaternion), sau đó + right*lateral + up*eyeHeight. Mesh dựng theo chính path này. HalfWidth lấy từ config level. Độ cong và slope lấy từ spec, bank được đưa vào frame. Các ranh giới segment chưa được làm mượt; xử lý transition đồng bộ mesh/path/physics nếu thay đổi.
4. Mesh chỉ hiển thị, không thay thế điều kiện fail của RideEngine. Đối với L06/L12 cổng chia nhánh là marker trên một spline, chưa có hai nhánh vật lý; L11 config gốc chưa có vòng lộn đứng, nên mesh chưa có inversion thật. L10 theo đoạn dốc giả lập rơi trong config, model tower là prop riêng. Không diễn giải các model prototype như mô hình đường trượt thực tế có thể xây dựng.
5. Sprite cây/đá dùng billboard; chân/xe/bè dùng camera overlay. Ảnh POV có thể crop theo thiết bị. VFX dùng particle, không phải chuỗi animation.
6. Audio dùng expo-audio; preload, loop ambient; giảm âm lượng khi pause, fade khi fail. WAV loop được tổng hợp tuần hoàn, vẫn cần thử loop trên thiết bị.
7. Native app icon/splash của Expo có thể yêu cầu PNG tại build; chuyển đổi riêng, không đổi các WebP trong pack.

## Nguồn và phạm vi
Sprite sheet và branding được tạo bằng AI cho dự án này; texture, background, UI, preview, GLB và WAV được dựng bằng thuật toán cho prototype. Không sử dụng asset bên thứ ba tải từ internet. Không có cam kết quyền độc quyền. Các hình minh họa poster/concept hiển thị trong cuộc trò chuyện không phải inventory; số file thực là manifest. Đây là pack prototype, chưa có mesh nhân vật rigged, PBR normal map, skybox 360, animation chuyên nghiệp hoặc final art.

Xem `QA.md` và `manifest.json` để kiểm tra file thật.
