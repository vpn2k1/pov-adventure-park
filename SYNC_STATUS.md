# Trạng thái đồng bộ GitHub
- Đã có: mã Expo prototype, engine tham chiếu, 12 JSON level, catalog, roadmap, setup và một phần tài liệu; 3 WAV cue tạo bằng code. Xem docs/IMPLEMENTATION.md và qa/PROTOTYPE-TESTS.md.
- Chưa có: bộ 119 assets gốc đầy đủ và một số tài liệu gốc trong ZIP. Repo chạy cảnh procedural, không cần GLB/WebP gốc để dựng geometry. Không ghi đè code mới bằng ZIP cũ.
- Khi có bản Git ZIP gốc: giải nén ra folder tạm; copy assets gốc và manifest/level-assets vào clone mới, chỉ copy các tài liệu thiếu. Kiểm tra git diff rồi commit. Không copy .git cũ và không dùng merge -s ours (sẽ bỏ qua code mới).
- P0 native gate chưa đóng: không có lockfile, Expo build/GL/cảm biến trên máy thật chưa xác nhận.
