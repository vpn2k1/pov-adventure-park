# 02 — Level design
| ID | Name | Family | Cơ chế | Thua |
|---|---|---|---|---|
| L01 | Aqua Starter | slide | Cua nhẹ, học nghiêng vào trong cua | EJECT_SLIDE |
| L02 | Spiral Tunnel | slide | Cua S, ống kín | HIT_WALL / EJECT_SLIDE |
| L03 | Sky Coaster | rail | Giữ cân bằng trên ray | DERAIL |
| L04 | Jungle Rapids | raft | Dòng xiết, đá | HIT_ROCK / CAPSIZE |
| L05 | Ice Dash | ice | Ma sát thấp | OFF_TRACK |
| L06 | Split Flume | slide | Chọn cổng trái/phải; nhánh nhập lại | WRONG_GATE / EJECT_SLIDE |
| L07 | Canyon Coaster | rail | Cua liên tục dung sai hẹp | DERAIL |
| L08 | Storm Rapids | raft | Dòng xiết thay đổi, đá | HIT_ROCK / CAPSIZE |
| L09 | Snow Slope | ice | Slalom | WRONG_GATE / OFF_TRACK |
| L10 | Drop Tower | fall | Giữ cân bằng khi rơi và hãm | UNSTABLE_LANDING |
| L11 | Loop Coaster | rail | Vòng lộn, banking liên tục | DERAIL |
| L12 | Aqua Master | slide | S, tunnel, nhánh | EJECT_SLIDE / HIT_WALL / WRONG_GATE |
L01 180m: 0–30 giữa, 30–70 cua phải, 70–100 phục hồi, 100–145 cua trái, 145–180 về đích. Cua phải curvature dương, drift trái, nghiêng phải để bù. Tạo mesh và path từ cùng config; segment phủ liên tục; slope dương xuống; bank dương vào cua. Gate crossing single-fire, route ghi vào session. Mỗi level phải có trace thắng và thua.
Prototype hiện tại L06/L12 chỉ có gate logic/marker, chưa tách spline; L11 chưa lộn đứng; L10 dốc lớn chưa tháp đứng thực. Xem docs/IMPLEMENTATION.md.
