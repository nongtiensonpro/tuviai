# BÁO CÁO ĐIỀU TRA BẢNG ĐỘ SÁNG 14 CHÍNH TINH (GĐ3 — 2026-09-03)

## Câu hỏi nghiên cứu
Bảng miếu/vượng/đắc/bình/hãm trong `StarConstants.ts` (nguồn: Học viện Lý số Hà Nội)
có chính xác không? Có nên thay bằng bảng engine mã nguồn mở iztro không?

## Phương pháp
Đối chiếu chéo 4 nguồn độc lập:
1. **tuviai** — bảng gốc Lý số HN (nguồn SKILL.md)
2. **iztro 2.6.0** — engine OSS chuẩn 紫微斗數全書, chạy runtime sinh 5 lá số thật (70 mẫu star×cung), lấy brightness trực tiếp
3. **mangekj.com** — bảng tra 庙旺利平陷 5 cột công khai
4. **horos.vn** — nền tảng tử vi VN hiện đại, bài "Miếu Vượng Đắc Bình Hãm" liệt kê vị trí Miếu đủ 13 sao

## Kết quả

| Cặp so sánh | Khớp | Lệch |
|---|---|---|
| tuviai vs iztro runtime (70 mẫu) | 16 | **54** |
| iztro runtime vs mangekj (66 ô so được) | 17 | **49** |
| horos vs iztro (vị trí Miếu, 13 sao) | 2 | 11 |

**Quan trọng nhất**: ngay cả 2 nguồn Trung Hoa (iztro và mangekj) cũng lệch nhau 49/66 ô.
Đây là hiện tượng đã biết trong giới nghiên cứu: 《紫微斗數全書》 và 《紫微斗數全集》
in hai bảng 庙陷 khác nhau, mỗi trường phái/nhà xuất bản chọn bảng riêng.

Vị trí có đồng thuận cao (3+ nguồn): Thái Dương Miếu@Ngọ ("Nhật Lệ Trung Thiên"),
Vũ Khúc Miếu@Thìn/Tuất/Sửu/Mùi, Phá Quân Miếu@Tý/Ngọ.

## Kết luận học thuật
1. Bảng độ sáng **không phải công thức cố định** — là quy ước trường phái.
2. "Sửa theo iztro" = đổi trường phái (sang chuẩn TQ《全书》), KHÔNG phải tăng độ chính xác.
3. App từ đầu theo chuẩn Nam Tông VN (Lý số HN), fixtures + 131 test case đã verify
   theo chuẩn này → **giữ nguyên bảng** là quyết định nhất quán.

## Hành động kỹ thuật đã thực hiện
1. Tách bảng `BRIGHTNESS` từ ZiweiEngine.ts sang `StarConstants.ts` (export) + comment nguồn + tranh chấp.
2. `__tests__/BrightnessTable.test.ts`: khóa 168 ô từng ký tự — sửa bảng âm thầm sẽ fail đúng ô.
3. Ghi chú các ô đồng thuận đa nguồn trong test (hậu kiểm chứng lại sau này).

## Tài liệu tham khảo
- iztro: https://iztro.com / npm iztro@2.6.0 (STARS_INFO trong lib/data/stars.js)
- mangekj.com/ziwei-palaces/miaowang
- horos.vn/blog/post/mieu-vuong-dac-binh-ham-la-gi...
- 紫微斗數全書 (wikisource) — an主星 quyết
