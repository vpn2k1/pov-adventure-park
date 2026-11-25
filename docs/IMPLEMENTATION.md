# Trạng thái triển khai 25/11/2026
Mã nguồn prototype, chưa xác minh native. Dùng Expo SDK 58 / RN 0.88 / R3F 9.8.2, React 19.3.0. Chưa có lockfile vì npm registry không truy cập được trong môi trường authoring.

| Phase | Kết quả | Gate |
|---|---|---|
| P0 | Cấu hình Expo, GL, sensor, touch, hướng dẫn setup | OPEN: install, expo-doctor, Android thật, sign, FPS |
| P1 | Engine TS, 12 level, fixed timestep, procedural path + U/rail geometry, HUD, thất bại | Engine gốc: 10/10 test tại môi trường Node/tsc; renderer chưa test |
| P2 | Home, park, ride, pause, calibrate, settings RHF/Zod, Zustand/AsyncStorage, retry, next, cue audio/haptic, comfort | OPEN: native typecheck, E2E, persistence error/retry |
| P3 | L01–L03 dùng rule riêng và chung scene | OPEN: playtest và device profiling |
| P4 | 12 rule config có thể chọn sau unlock; rock/gate/landing events | PARTIAL: split gates là marker, chưa có geometry nhánh thật; L11 chưa lộn đứng, L10 mô phỏng dốc; không có checkpoint/editor |
| P5 | UI theme, warning text, giảm roll, 3 cue tổng hợp | OPEN: toàn bộ asset gốc, artwork, loop audio, VI/EN, device matrix |
| P6 | EAS profiles | OPEN: signing, native build, store release |

## Feature trace (Spec → Plan → Code → Review → Test)
- F01 (tilt/pause): specs 03/04, P0/P1 → use-motion-input, session, ride → clamp/stale/background review → cần Android/iOS sign/stale tests.
- F02 (rules): specs 02/03, P1/P3/P4 → reference-engine + levels → code review terminal single-fire; test engine 10/10 trên bản gốc trước import, CI cần chạy lại GitHub.
- F03 (render): specs 04/08 → path, ride-scene → geometry procedural review; GL/FPS chưa xác minh.
- F04 (settings): specs 05/07 → game-store, settings → zod input và save; test native pending.
- F05 (progress): specs 05/07 → records + unlock + reset; kết quả lưu stars và bestTime, không lưu raw sensor; test restart pending.
- F06 (navigation): specs 05 → router stack + guards, kết quả overlay thay route riêng ở prototype; E2E pending.
- F07 (feedback): specs 08 → audio cue và Haptics, comfort; loop audio và full VFX pending.

Giới hạn: chưa import các asset WebP/GLB/WAV gốc do môi trường không truy cập mạng Git trực tiếp. Cảnh hiện tại procedural độc lập; 3 âm cue WAV tạo bằng code riêng. Không tuyên bố game production, APK, FPS hay tương thích native đã kiểm chứng. Chưa triển khai obfuscation/release R8 (cần signed build và test). Không đổi stack, không thêm backend hoặc quảng cáo.
