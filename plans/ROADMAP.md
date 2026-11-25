# Roadmap triển khai
Giả định 1 lập trình viên RN/TS có kinh nghiệm, Android trước; 6–9 tuần full-time cho bản 12 level dùng asset đơn giản, chưa gồm polishing/store review. Đây là ước lượng lập kế hoạch, không cam kết tiến độ. Mỗi phase phải qua gate, không làm đồng thời 12 level trước khi engine ổn định.

| Phase | Ước tính | Deliverables | Gate (exit criteria) |
|---|---|---|---|
| P0 — Spike | 2–3 ngày | Expo dev build, R3F scene, sensor, touch, FPS baseline | 2 Android thật: đúng dấu tilt, mesh render 60s ≥30fps; lock dependencies |
| P1 — Core | 4–6 ngày | Level schema, path mesh, fixed-step engine, slide rule, camera, failure, scripted tests | L01 có pass/fail reproducible; pause/retry sạch; không NaN/terminal kép |
| P2 — Vertical slice | 5–7 ngày | L01 hoàn chỉnh, Router stack, calibrate, settings RHF, Zustand save, audio/FX | Cold start→ride→fail/retry→finish→unlock; 10 retries không leak/crash |
| P3 — MVP | 5–7 ngày | L02 tunnel + L03 rail, catalog, progression, comfort, touch | 3 level có rule riêng, pass/fail trace, test 10–20 users; KPI GDD |
| P4 — Content expansion | 8–12 ngày | L04–L12, raft/ice/fall strategies, branching, checkpoints practice, editor nội bộ tùy nguồn lực | 12 level validate, pass/fail scripts, branch geometry, checkpoint không unlock |
| P5 — Polish/QA | 5–8 ngày | Art/audio, VI/EN, accessibility, perf matrix, iOS spike | 30fps floor, không lỗi P0/P1, full run + lifecycle matrix |
| P6 — Release | 3–5 ngày | EAS preview/production, store assets, privacy, signing, QA sign-off | Signed build, offline E2E, release notes/rollback; iOS nếu đạt gate |

## Milestone quyết định
- Nếu P0 không đạt FPS hoặc sensor latency ổn định, giảm mesh/texture/DPR, so sánh vanilla Three + expo-gl; nếu vẫn không đạt, đánh giá native engine hoặc Unity như ADR riêng, không âm thầm đổi stack.
- P1 không đạt điều khiển: sửa calibration/deadzone/smoothing và path physics, không tăng content.
- P3: nếu playtest không hiểu hướng tilt, tăng cue và tutorial; nếu quá khó giảm speed/curvature, tăng grace. Chỉ P4 sau khi 3 level thú vị và playable.
- P4 branch/loop phức tạp có thể defer nếu budget; báo phạm vi release rõ ràng. P6 backend/cloud/monetization chỉ khi yêu cầu riêng.
