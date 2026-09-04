# KẾ HOẠCH NÂNG CAO ĐỘ CHÍNH XÁC LẬP LÁ SỐ — TỬ VI AI

> Ngày lập: 2026-09-03 · Phạm vi: `src/core/` (engine lập lá số) + `__tests__/` (fixtures)
> Phương pháp luận: audit tĩnh toàn bộ engine + chạy probe thực tế bằng Jest + đối chiếu nguồn công khai
> Ràng buộc: giữ 100% static (AGENTS.md), mọi thay đổi thuật toán phải kèm test, chạy `npm test` sau mỗi bước

---

## 0. Kết quả khảo sát (nền của kế hoạch)

- Repo Astro 6 + React 19 + TS strict, Jest 30; **22 suites / 167 tests — tất cả PASS** (chạy ngày 2026-09-03).
- Engine: `ChartBuilder` điều phối 12 module trong `src/core/astrology/` + 3 module `src/core/calendar/`.
- Catalog sao: `getNatalStarCount() = 121` (đạt target Milestone 3 trong NAM_PHAI_TU_VI_UPGRADE_PLAN.md).
- MCP `codebase-memory-mcp` v0.10.0 đã có sẵn trên máy (`C:\Users\nongt\AppData\Local\Programs\codebase-memory-mcp\`), đã re-index `D-tuviai` (928 nodes / 1707 edges) — không cần cài thêm MCP nào khác.
- Working tree đang có thay đổi CHƯA COMMIT thuộc mảng AI/UI (ApiKeySetup, useAnalysisAiState, AgentRouterService mới) — **không liên quan engine**, nhưng cần commit trước khi sửa core để dễ hồi tố.

### Bằng chứng từ probe thực tế (chạy qua Jest, đã xóa file probe sau khi chạy)

| Case | Đầu vào | Engine trả ra | Đánh giá |
|---|---|---|---|
| P1 | 15/04/2023 10h | âm **25/02 nhuận 2023 (Quý Mão)** | ✅ lịch chuẩn (2023 nhuận tháng 2) → nhưng kéo theo hệ quả P2 |
| P2 | lá số sinh tháng nhuận | `lunarDate.isLeap=true` nhưng MỌI hàm an sao chỉ nhận `month` thô | ❌ **tháng nhuận bị bỏ qua hoàn toàn** |
| P3 | 04/02/2024 09h (trước Lập xuân 16:26) | năm âm 25/12/2023, can chi **Quý Mão** | ⚠️ đúng nếu theo mốc mùng 1 Tết, SAI nếu theo tiết khí Lập xuân — chưa tài liệu hóa quy ước |
| P4 | 12/06/2000 23h `next_day` vs `same_day` | ngày âm 12/5 vs 11/5 | ✅ cơ chế Tý sớm hoạt động |
| P5 | 12/06/2000 5h Nữ | 123 sao distinct, đủ 14 chính tinh, VCD/mượn đúng | ✅ nhưng xem L2/L3 về độ sáng & fixture |
| P6 | catalog vs engine | không sao nào engine sinh mà catalog thiếu; không sao natal nào thiếu ngũ hành | ✅ (chỉ 17 sao `scope:'annual'` thiếu ngũ hành — xem L6) |

---

## 1. DANH MỤC LỖI / RỦI RO ĐÃ XÁC MINH (theo mức nghiêm trọng)

### ✅ L1 — ĐÃ GIẢI QUYẾT (2026-09-03, Giai đoạn 2, commit 9a362de)
- `LeapMonthMode = 'first_half' (mặc định) | 'prev' | 'next'` + `LunarDate.monthForStarring`.
- Quy đổi TẬP TRUNG một chỗ duy nhất: `resolveMonthForStarring()` trong LunarConverter.
- Mọi engine (Mệnh/Thân, Lục Cát, 70+ tạp diệu, Đẩu Quân lưu niên) đọc `monthForStarring`.
- Chain đầy đủ: BirthForm (UI selector) → worker → calibrateSolarDate → ChartWorkerInput.
- Prompt AI nhận metadata "sinh tháng X nhuận, an sao theo tháng Y".
- 13 test mới (LeapMonthEngine.test.ts) trên năm thật 2023N2/2025N6, biên 15/16.
- Lá số cũ KHÔNG đổi (24 suites / 196 tests xanh, tsc sạch, build static OK).
- Fix kèm 2 lỗi TS tồn đọng của mảng AI (InsightBuilder dấu phẩy kép; GeminiService thiếu content_blocked).
- `solarToLunar()` trả `isLeap`, nhưng `buildZiweiChart()` chỉ truyền `lunar.month` vào mọi engine con → người sinh tháng nhuận bị an sao như tháng thường, và **không có cách nào chọn trường phái**.
- Chuẩn Nam phái phổ biến (lyso.vn + nhiều nguồn đồng thuận): **ngày 1→15 tháng nhuận tính tháng trước, 16→hết tính tháng sau**; sách khác có quy tắc "lùi 1 ngày giữ tháng" hoặc "coi như tháng trước".
- **Fix**: thêm `LeapMonthMode = 'first_half' | 'second_half' | 'prev' | 'next'` vào `SolarDate` + `ChartWorkerInput`; mặc định `'first_half'`; quy đổi ở ĐÚNG MỘT CHỖ là `solarToLunar` (trả thêm `monthForStarring`), mọi engine dùng giá trị đã quy đổi; UI BirthForm thêm selector; metadata ghi vào chart để prompt AI biết.
- **Test**: bảng các tháng nhuận thật (2023 nhuận 2, 2025 nhuận 6) × ngày biên (1, 15, 16, 30) × 4 mode; fixture lá số tháng nhuận lấy từ nguồn công khai.

### ✅ L2 — ĐÃ GIẢI QUYẾT (2026-09-03, Giai đoạn 1): nhận định ban đầu là NHẦM
- Nhận định cũ "Đồng–Âm chỉ đồng cung Sửu/Mùi" là **sai** — tôi đã nhớ nhầm cặp sao.
- Đối chứng bằng công thức độc lập (offset chòm Tử Vi -1/-3/-4/-5/-8 + chòm Thiên Phủ P+1..P+10) xác nhận
  9 cặp sao kinh điển đúng cổ bản 紫微斗數全書: 紫府=寅申, **同阴=子午** (Tý/Ngọ!), 同巨=丑未, 同梁=寅申,
  武贪=丑未, 机梁=辰戌, 廉府=辰戌, 廉相=子午, 日月=丑未.
- Kết luận: **engine ĐÚNG ngay từ đầu**, fixture EarlyZi (Đồng+Âm tại Tý) cũng ĐÚNG.
- Đã khóa bằng `__tests__/EngineInvariants.test.ts` (9 cặp × bộ mẫu 672 lá số) — engine giờ có
  "tripwire" cấu trúc: bất kỳ ai sửa nhầm công thức chính tinh đều fail ngay.
- Bài học kỷ luật: KHÔNG kết luận "engine sai" khi chưa chạy đối chứng độc lập; kỳ vọng tự chế
  trong probe không phải bằng chứng.

### ✅ L3 — ĐÃ GIẢI QUYẾT (2026-09-03, Giai đoạn 3) — GIỮ BẢNG, KHÔNG ĐỔI
- Điều tra 4 nguồn (tuviai/Lý số HN, iztro 2.6.0 runtime, mangekj.com, horos.vn):
  4 bảng KHÁC NHAU, ngay cả iztro vs mangekj (2 nguồn TQ) còn lệch 49/66 ô.
- Kết luận: bảng độ sáng là QUY ƯỚC TRƯỜNG PHÁI (hiện tượng《全书》vs《全集》), không có bảng "đúng" tuyệt đối.
- Hành động: giữ bảng Lý số HN (nhất quán fixtures + 131 case đã verify); tách ra StarConstants.ts
  với comment nguồn + tranh chấp; test khóa 168 ô (BrightnessTable.test.ts).
- Chi tiết đầy đủ: tailieu/DIEU-TRA-BANG-DO-SANG-14-CHINH-TINH.md

### 🟠 L4 — Ranh giới Lập xuân vs mùng 1 Tết chưa tài liệu hóa
- Can chi năm tính theo **năm âm lịch (mùng 1 Tết)** qua `getYearCanChi(lunar.year)` — hợp lệ theo đa số phần mềm VN, nhưng trường phái tiết khí đổi can chi tại **Lập xuân**; lá số sinh 01→04/02 hàng năm có thể lệch giữa hai trường phái.
- **Fix (nhỏ)**: KHÔNG đổi mặc định; tài liệu hóa quy ước vào SKILL.md + README; (tùy chọn giai đoạn 2) cờ `yearBoundary: 'tet' | 'lichun'` với bảng 24 tiết khí tính bằng công thức thiên văn rút gọn, vẫn TS thuần.
- **Test**: fixture case 04/02/2024 (trước Lập xuân) khóa hành vi hiện tại để sau này đổi có chủ đích.

### ✅ L5 — ĐÃ GIẢI QUYẾT (2026-09-03, Giai đoạn 3): KHÔNG phải bug
- Đối chiếu tuvi.cohoc.net + tuvisonkhiem.vn: "Thái Tuế coi là tháng 1, tính NGƯỢC đến tháng sinh,
  đặt giờ Tý chạy THUẬN đến giờ sinh" → `(yearChi - month + 1 + hourChi) mod 12`.
- Code hiện tại = ĐÚNG CHUẨN. Nghi ngờ ban đầu do diễn giải chữ "đếm nghịch tháng sinh"
  (nghịch (month-1) bước, không phải -month). SKILL.md đã diễn đạt đúng, giữ nguyên.

### ✅ L6 — ĐÃ GIẢI QUYẾT (2026-09-03, Giai đoạn 3) + bắt được bug thật
- Đã thêm `nguHanh` tường minh cho 17 sao annual trong StarCatalog.
- getStarNguHanh chuyển sang catalog-first, 3-step lookup.
- BUG THẬT bị test bắt ngay: sao natal "Lưu Hà" (Sông Chảy) bị cơ chế strip "Lưu " phá tên
  thành "Hà" → throw. Đã sửa: tra tên gốc TRƯỚC, chỉ strip khi không khớp.
- Test: 17 sao annual resolve không strip; ngũ hành Lưu X = ngũ hành X; Lưu Hà OK; fail-fast tên lạ.

### 🟡 L7 — Giờ Tý muộn 00:00–00:59 chưa có lựa chọn tách riêng
- `hourToChiIndex(0)=0` đúng lịch; quy ước "Tý muộn thuộc ngày hôm trước" của một số thầy chưa có cấu hình. Ghi nhận là **tùy chọn**, không phải bug.

### 🟢 L8 — Vệ tinh code
- `ChartBuilder.getMenhCanChi` trùng lặp `LunarConverter.getCungMenhCan` → gộp 1 nguồn.
- `placeStarByCan/ByChi/ByMonth` dùng `(map as any)` — vi phạm rule-typescript-types → thay bằng union type tường minh.
- `resolveSexagenaryIndex` fallback 0 khi can/chi vô hiệu → nên throw.
- `MonthlyEngine` dùng `+24` thay helper mod chuẩn → thống nhất `mod12`.

---

## 2. KẾ HOẠCH THỰC HIỆN (4 giai đoạn; mỗi giai đoạn kết thúc bằng `npm test` xanh + commit riêng)

### ✅ GIAI ĐOẠN 1 — HOÀN THÀNH (commit f47261a, 2026-09-03)
- 23 suites / 183 tests xanh (167 → 183).
- mod12 helper dùng chung; bỏ hết `as any`; resolveSexagenaryIndex fail-fast; gộp getMenhCanChi trùng.
- EngineInvariants.test.ts: 9 cặp cổ bản + đủ 14 chính tinh + đối xứng TF + VCD mượn + mod12.
- SKILL.md §5/§6 chú thích cổ bản đúng (parity + 9 cặp).
1. Commit các thay đổi AI/UI đang treo (không đụng engine) — xác nhận message với user.
2. Gộp helper trùng; bỏ `as any`; `resolveSexagenaryIndex` throw khi vô hiệu; thêm `mod12` dùng chung.
3. Test bất biến cấu trúc (không phụ thuộc fixture): đủ 14 chính tinh; mỗi cung 0–2 chính tinh; Tử Vi–Thiên Phủ đối xứng Dần–Thân; cặp Đồng–Âm chỉ Sửu/Mùi; exhaustive `findZiweiPosition` 30 ngày × 5 cục đối chiếu bảng tra cứng.
4. SKILL.md: mục "Quy ước trường phái" ghi rõ mốc năm = mùng 1 Tết, Tý sớm mặc định next_day.

### ✅ GIAI ĐOẠN 2 — HOÀN THÀNH (commit 9a362de, 2026-09-03)
Đã làm: L1 đầy đủ (xem trên). Còn lại trong giai đoạn: bổ sung ≥2 fixture tháng nhuận lấy từ lasotuvi/xemtuvi (khóa bằng lá số thật công khai thay vì chỉ test hành vi engine).
1. Điều tra L2 tới cùng (nguồn đối chiếu trước, sửa engine sau — cấm sửa engine theo fixture mù).
2. Thiết kế L1: `LeapMonthMode` xuyên suốt `SolarDate → solarToLunar → monthForStarring → ChartBuilder → engines`; mặc định `first_half`; BirthForm thêm dropdown; prompt context ghi "sinh tháng nhuận X, an sao theo tháng Y".
3. Fixture mới: ≥2 lá số tháng nhuận (2023N2, 2025N6) từ nguồn công khai, đủ checkpoint.
4. Test: bảng mode × ngày biên; **snapshot diff toàn bộ fixture cũ** để chắc chắn người không sinh tháng nhuận không đổi lá số.

### GIAI ĐOẠN 3 — Độ sáng + Đẩu Quân + ngũ hành lưu niên (1 ngày)
1. L3: diff bảng miếu/hãm đa nguồn, sửa ô lệch nếu có, test khóa 168 ô.
2. L5: verify Đẩu Quân bằng nguồn tham chiếu, thống nhất code ↔ SKILL.md.
3. L6: ngũ hành tường minh 17 sao annual + test quét catalog.

### GIAI ĐOẠN 4 — Bộ lá số chuẩn phủ rộng & phòng thủ dài hạn (1–2 ngày)
1. Ma trận fixture: phủ 10 can × 12 chi (chọn 12–16 lá số), 12 giờ sinh, Tý sớm/muộn, tháng nhuận, biên Lập xuân, VCD mượn sao, Tuần/Triệt đồng cung.
2. Test tách theo nhóm công thức (lịch / Mệnh-Thân / Cục / Tử Vi / chính tinh / Tứ Hóa / phụ tinh / đại hạn-tiểu vận) để fail chỉ đúng module.
3. (Tùy chọn, cần user duyệt) cờ `yearBoundary:'lichun'` + bảng tiết khí; audit chéo 100 lá số ngẫu nhiên với engine开源 iztro bằng script offline (chỉ lúc kiểm tra, không đưa vào app).
4. Cập nhật `NAM_PHAI_TU_VI_UPGRADE_PLAN.md`: Milestone 3 đạt (121 sao), thêm Milestone 8 "Độ chính xác biên" (nhuận / tiết khí / Tý sớm) với tiêu chí nghiệm thu.

---

## 3. TIÊU CHÍ NGHIỆM THU TOÀN KẾ HOẠCH
- `npm test` xanh, số test TĂNG (167 → ≥210), không xóa/sửa test để "cho qua".
- Không lá số đúng nào đổi kết quả sau mỗi giai đoạn (diff snapshot fixture cũ trước/sau từng commit).
- Mọi công thức sửa đổi có comment nguồn + SKILL.md cập nhật cùng commit.
- `npm run build` static thành công; không server-side; không API key hardcode.
- Mỗi fixture mới có `sourceUrl` mở được để user kiểm chứng độc lập.

## 4. RỦI RO & KIỂM SOÁT
| Rủi ro | Kiểm soát |
|---|---|
| Sửa engine làm lệch lá số đã khóa | full regression trước & sau mỗi commit nhỏ; diff có chủ đích |
| Nguồn web mâu thuẫn nhau | ≥2 nguồn đồng thuận mới đổi công thức; ghi cả nguồn phản biện vào sourceNote |
| Tháng nhuận nhiều quy tắc khác nhau | mặc định `first_half` (phổ biến nhất VN) + user chọn được mode |
| Fixture đang khóa cái sai (L2) | điều tra nguồn trước khi sửa bên nào |

## 5. GHI CHÚ CÔNG CỤ
- `codebase-memory-mcp` v0.10.0 (đã cài sẵn): `search_graph` / `trace_path` / `get_code_snippet` để tra cứu kiến trúc; re-index sau mỗi giai đoạn lớn.
- document-rag-mcp: không phù hợp repo code (roots trỏ thư mục tài liệu) — không dùng ở đây.
- Máy này `terminal`/`read_file`/`write_file` hỏng do Windows ASLR: mọi I/O + test chạy qua `execute_code` + `subprocess` gọi `npm.cmd` (đã kiểm chứng: 167 tests ~20s).
