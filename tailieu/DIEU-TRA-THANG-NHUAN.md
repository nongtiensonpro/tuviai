# ĐIỀU TRA THÁNG NHUẬN — 2 TRƯỜNG PHÁI CHÍNH (GĐ4, 2026-09-03)

## Phát hiện từ đối chiếu lasotuvi.com backend (mã nguồn mở)

Repo `quytttb/lasotuvi` (backend Python của lasotuvi.com) hiện chạy **py_iztro**
(wrapper iztro JS) với `by_solar(date, time_index, gender)` — không truyền
`fixLeap` riêng, và runtime xác minh: cả `fixLeap='D'` lẫn `'N'` đều cho
**cùng kết quả** — tháng nhuận được an sao theo CHÍNH SỐ THÁNG ĐÓ.

### Bằng chứng runtime (iztro 2.6.0, chạy local)
Sinh **25/07/2025 giờ Thìn** (= mùng 1 tháng 6 NHUẬN Ất Tỵ):
- iztro (fixLeap D và N giống hệt): `lunarMonth=6, isLeap=true` → **Mệnh tại Mão,
  Thái Dương + Thiên Lương cư Mệnh**
- lasotuvi backend cũ (chart_builder.py thuần Python): `EarthPlate(tt)` — cũng
  truyền thẳng tháng 6 (is_leap_month không hề được dùng để đổi tháng an sao)

## So sánh các trường phái

| Trường phái | Quy tắc | Mệnh cho case trên |
|---|---|---|
| **Sách VN truyền thống** (lyso.vn + nhiều sách) | ngày 1–15 nhuận → tháng trước; 16+ → tháng sau | **Dần** (Vũ Khúc + Thiên Tướng) |
| **lasotuvi.com / iztro / py_iztro** (app hiện đại) | tháng nhuận an theo chính số tháng đó | **Mão** (Thái Dương + Thiên Lương) |

## Quyết định (user chọn 2026-09-03)
- **Mặc định giữ `first_half`** (chuẩn sách VN truyền thống) — nhất quán với
  định hướng Nam Tông của app từ đầu.
- **Thêm mode `none`** vào LeapMonthMode + UI selector — user sinh tháng nhuận
  chọn được chuẩn lasotuvi nếu muốn đối chiếu.
- Đã khóa bằng test: `LeapMonthEngine.test.ts` verify mode `none` sinh đúng
  lá số lasotuvi (Mệnh Mão, Đồng... chứa Thái Dương + Thiên Lương).

## Ghi chú kỹ thuật
- Backend lasotuvi cũ (`build_earth_plate`) tính tiểu hạn theo công thức riêng
  (`shift_palace(11, -3*(year_branch-1))`) khác chuẩn Tuế khởi của tuviai —
  không áp dụng (app giữ chuẩn SKILL.md đã verify).
- `docs/doi-chieu-do-sang-va-cau-hoi-bo.md` trong repo lasotuvi-web cũng xác nhận
  quan điểm "phái nào hay thì tiếp thu, không khóa cứng một bảng" — nhất quán với
  kết luận GĐ3 về bảng độ sáng.
