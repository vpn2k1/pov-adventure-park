# Bằng chứng kiểm thử hiện tại
## Đã chạy local (Node 22 / TypeScript)
- `cd reference-engine && npm test` — PASS 10/10 trên engine gốc; SHA nội dung engine trùng bản GitHub: f79ec882b77860a929ed4f5485ced56e5def08b8. Level JSON được chuyển cùng số liệu (định dạng số nguyên khác .0).
- `tsc -p tsconfig.core.json && node --test tests/path-session.test.cjs` — PASS 4/4 trong workspace test độc lập, cùng source path/session và dữ liệu mẫu. Kiểm tra frame finite, chiều dài, clamp, pause/retry, terminal once, timestep 30/60.
- Native deps chưa install được (môi trường không resolve npm/GitHub). Chưa chạy typecheck toàn app, Expo export/build hoặc device tests. Không có APK.

## Device gate (chưa chạy)
1. Cold launch → park → L01 calibrate ổn định → start; xác nhận dấu trái/phải ở Android/iOS; dùng đảo hướng nếu cần.
2. Nghiêng sai liên tục → warning → fail → retry; hold đúng hướng → finish → L02 unlock; kill/relaunch → record còn.
3. Permission denied / flat / stale / app background → pause, không advance; chọn touch → countdown.
4. L02 trong tunnel → HIT_WALL; L03 → DERAIL; L04 rock; L05 off-track; L06/L12 cổng; L10 landing.
5. Test 30/60FPS, 10 retries, memory/GL context lifecycle; comfort mode; audio và haptic; small phone safe area.
6. Settings invalid → reject; cancel không đổi; reset progress cần xác nhận; persistence lỗi → show notice.
7. Run install, expo-doctor, typecheck, build dev, QA Android thật; iOS sau. Không phát hành nếu fail.
