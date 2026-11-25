# Setup Expo (thực hiện tại máy dev có Internet)
Baseline SDK 58 được công bố 15/10/2026; kiểm tra tương thích tại thời điểm cài. Không cung cấp package-lock chưa qua install. Gói reference-engine độc lập không phải Expo app.

```sh
npx create-expo-app@latest pov-adventure-park-app --template default@sdk-58
cd pov-adventure-park-app
# Nếu template SDK-specific không còn khả dụng: xem Expo docs và dùng template tương thích, kiểm tra SDK trong package.json.
npx expo install expo-dev-client expo-gl expo-asset expo-sensors expo-audio expo-haptics expo-screen-orientation expo-keep-awake @react-native-async-storage/async-storage
# Expo Router đã có trong template; nếu thiếu dùng official manual install.
npm install three @react-three/fiber zustand react-hook-form zod @hookform/resolvers
npm install -D @types/three prettier
npx expo install --check
npx expo-doctor
```
Check `npm ls react react-native three @react-three/fiber expo-gl`; đối chiếu R3F peer React version, Expo SDK. Không dùng --force/--legacy-peer-deps để che lỗi. Nếu conflict, tìm version tương thích và ghi ADR. Kiểm tra Metro GLB/texture asset extensions khi cần. `import { Canvas, useFrame } from '@react-three/fiber/native'` (không DOM, window, web-only loader). P0 ưu tiên mesh procedural; sau đó thêm GLB.

```sh
npx expo run:android       # Android SDK/JDK theo SDK docs, thiết bị thật hoặc emulator để kiểm tra UI
npx expo start --dev-client
# iOS cần macOS + Xcode hoặc EAS; thử bằng iPhone thật
```
Config `orientation: "portrait"`, bundle IDs do chủ dự án quyết định, motion usage description rõ ràng (expo-sensors config plugin theo docs), EAS profile development/preview/production. Cài app permissions cần thiết, build lại khi thêm plugin. Dùng npx expo install react-native-gesture-handler nếu touch nâng cao cần; optional Reanimated + react-native-worklets phải khớp SDK. Test library cài tại P1/P2: `npx expo install jest-expo jest @testing-library/react-native --dev` (kiểm tra version peer); template lint dùng `npx expo lint`; CI typecheck `npx tsc --noEmit`.

Sau P0 commit package.json + lockfile, ghi bảng device/versions, copy `levels`, schema và reference engine logic sang source mục tiêu. Không copy package.json reference-engine thay app package.json. RN runtime được tạo riêng, chưa chạy ở môi trường tạo spec.
