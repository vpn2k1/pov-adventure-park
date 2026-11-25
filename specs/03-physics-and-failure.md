# 03 — Physics and failure
s m; v m/s; x phải dương; u [-1,1]; balance có thể vượt giới hạn. Fixed dt=1/60, clamp frame gap 0.1s, 6 substeps, pause không catch-up.
- Speed: v=clamp(v+(9.81*sin(slope)-drag*v)*dt,minSpeed,maxSpeed); advance s=v*dt.
- demand=v²*curvature-9.81*sin(bank). Slide/raft/ice: ax=steer*u-demand+flow(raft)-damping*vx-centering*x; integrate vx rồi x; risk=abs(x)/halfWidth. Closed tunnel clamp x=±1.15*halfWidth.
- Rail/fall: balance += (u*balanceGain-demand*balanceGain/steer-balance*balanceRecovery)*dt; fall demand=flow; visual x nhỏ; risk=abs(balance)/balanceLimit.
- risk≥0.7 warning, ≥1 tích lũy unsafeSec, dưới 1 giảm 2*dt; grace fail theo family. Events rock/gate/landing crossing (oldS,nextS]; fail > finish; terminal exactly once. Score safe ticks / riding ticks. Retry tạo state mới.
- Cảnh fail game giả lập: lệch camera nhẹ và fade, không thương tích. Tube/rock không xuyên thành. Comfort không đổi physics. UI 5–10Hz, warning bằng chữ + haptic/sound, stale >250ms pause.
Reference code: reference-engine/src/engine.ts, path/session adapters in src/domain. Production cần nội suy curvature và sweep collision, branch-specific path, transport frame cho vòng lộn.
