---
name: ziwei-algorithm
description: >
  Tri thức chiêm tinh học cốt lõi cho thuật toán an sao Tử Vi Đẩu Số.
  Agent PHẢI đọc file này trước khi viết bất kỳ logic tính toán chiêm tinh nào.
  Các công thức trong file này là chính xác và không được tự ý suy diễn hoặc thay đổi.
---

# Skill: Thuật Toán Tử Vi Đẩu Số

## 1. Chuyển Đổi Lịch (Solar → Lunar)

Sử dụng thư viện `@dqcai/vn-lunar`:

```typescript
import { Lunar } from '@dqcai/vn-lunar';

const lunar = Lunar.fromDate(new Date(year, month - 1, day));
const lunarDay   = lunar.getDay();
const lunarMonth = lunar.getMonth();
const lunarYear  = lunar.getYear();
const isLeap     = lunar.isLeap();
```

## 2. Giờ Sinh → Địa Chi (12 múi giờ)

```
Tý  : 23:00 - 00:59  → index 0
Sửu : 01:00 - 02:59  → index 1
Dần : 03:00 - 04:59  → index 2
Mão : 05:00 - 06:59  → index 3
Thìn: 07:00 - 08:59  → index 4
Tỵ  : 09:00 - 10:59  → index 5
Ngọ : 11:00 - 12:59  → index 6
Mùi : 13:00 - 14:59  → index 7
Thân: 15:00 - 16:59  → index 8
Dậu : 17:00 - 18:59  → index 9
Tuất: 19:00 - 20:59  → index 10
Hợi : 21:00 - 22:59  → index 11
```

## 3. Định Vị Cung Mệnh

**Thuật toán:**
1. Bắt đầu tại cung **Dần** (index 2 trong mảng Địa Chi theo thứ tự: Tý=0)
2. Đi **thuận** (chiều kim đồng hồ trên mệnh bàn = tăng index) đến tháng âm lịch
   - Tháng 1 = Dần, Tháng 2 = Mão, ..., Tháng 12 = Sửu
3. Từ điểm vừa đến, đi **ngược** (index giảm) đến giờ sinh (Địa Chi giờ)
4. Kết quả là Địa Chi của **Cung Mệnh**

```typescript
// Thứ tự Địa Chi trên mệnh bàn (chiều thuận kim đồng hồ từ góc dưới trái):
// Dần(2), Mão(3), Thìn(4), Tỵ(5), Ngọ(6), Mùi(7), Thân(8), Dậu(9), Tuất(10), Hợi(11), Tý(0), Sửu(1)
const BOARD_ORDER = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1]; // Địa Chi index

function calcMenhChi(lunarMonth: number, hourChi: number): number {
  // Tháng 1 bắt đầu ở Dần
  const thangPos = (lunarMonth - 1); // 0-indexed từ Dần
  // Đi ngược giờ sinh
  const menhPos = ((thangPos - hourChi) + 12) % 12;
  return BOARD_ORDER[menhPos]; // Địa Chi index (0-11)
}
```

## 4. 12 Cung Chức Năng

Sau khi có Cung Mệnh, điền 11 cung theo chiều **ngược kim đồng hồ**:

```
Thứ tự: Mệnh → Phụ Mẫu → Phúc Đức → Điền Trạch → Quan Lộc → 
        Nô Bộc → Thiên Di → Tật Ách → Tài Bạch → Tử Tức → 
        Phu Thê → Huynh Đệ → (về lại Mệnh)
```

## 5. Ngũ Hành Nạp Âm Cục

Tra bảng từ (Thiên Can + Địa Chi) của Cung Mệnh:

```typescript
// Bảng Cục theo Can Chi của Cung Mệnh
// Key = [canIndex * 12 + chiIndex], Value = cục (2,3,4,5,6)
const NAP_AM_CUC: Record<string, number> = {
  'Giáp-Tý': 4, 'Ất-Sửu': 4,   // Kim Tứ Cục
  'Bính-Dần': 6, 'Đinh-Mão': 6, // Hỏa Lục Cục
  'Mậu-Thìn': 6, 'Kỷ-Tỵ': 6,   // Hỏa Lục Cục
  'Canh-Ngọ': 2, 'Tân-Mùi': 2,  // Thủy Nhị Cục
  'Nhâm-Thân': 2, 'Quý-Dậu': 2, // Thủy Nhị Cục
  'Giáp-Tuất': 3, 'Ất-Hợi': 3,  // Mộc Tam Cục
  'Bính-Tý': 3, 'Đinh-Sửu': 3,  // Mộc Tam Cục
  'Mậu-Dần': 5, 'Kỷ-Mão': 5,   // Thổ Ngũ Cục
  'Canh-Thìn': 5, 'Tân-Tỵ': 5,  // Thổ Ngũ Cục
  'Nhâm-Ngọ': 6, 'Quý-Mùi': 6,  // Hỏa Lục Cục
  'Giáp-Thân': 4, 'Ất-Dậu': 4,  // Kim Tứ Cục
  'Bính-Tuất': 3, 'Đinh-Hợi': 3,// Mộc Tam Cục
  'Mậu-Tý': 2, 'Kỷ-Sửu': 2,   // Thủy Nhị Cục
  'Canh-Dần': 3, 'Tân-Mão': 3,  // Mộc Tam Cục
  'Nhâm-Thìn': 6, 'Quý-Tỵ': 6,  // Hỏa Lục Cục
  'Giáp-Ngọ': 5, 'Ất-Mùi': 5,  // Thổ Ngũ Cục
  'Bính-Thân': 4, 'Đinh-Dậu': 4,// Kim Tứ Cục
  'Mậu-Tuất': 3, 'Kỷ-Hợi': 3,  // Mộc Tam Cục
  'Canh-Tý': 4, 'Tân-Sửu': 4,  // Kim Tứ Cục
  'Nhâm-Dần': 5, 'Quý-Mão': 5,  // Thổ Ngũ Cục
  'Giáp-Thìn': 6, 'Ất-Tỵ': 6,  // Hỏa Lục Cục
  'Bính-Ngọ': 2, 'Đinh-Mùi': 2, // Thủy Nhị Cục
  'Mậu-Thân': 2, 'Kỷ-Dậu': 2,  // Thủy Nhị Cục
  'Canh-Tuất': 5, 'Tân-Hợi': 5, // Thổ Ngũ Cục
  'Nhâm-Tý': 3, 'Quý-Sửu': 3,  // Mộc Tam Cục
  'Giáp-Dần': 5, 'Ất-Mão': 5,  // Thổ Ngũ Cục
  'Bính-Thìn': 4, 'Đinh-Tỵ': 4, // Kim Tứ Cục
  'Mậu-Ngọ': 6, 'Kỷ-Mùi': 6,  // Hỏa Lục Cục
  'Canh-Thân': 6, 'Tân-Dậu': 6, // Hỏa Lục Cục
  'Nhâm-Tuất': 2, 'Quý-Hợi': 2, // Thủy Nhị Cục
};
```

## 6. Tìm Vị Trí Sao Tử Vi

**Công thức:**
- Lấy số ngày âm lịch (ngayAm), chia cho số cục (cuc), lấy dư
- Tra bảng lookup `ZIWEI_LOOKUP[cuc][remainder]` → palace index (Địa Chi index)

```typescript
// Bảng lookup vị trí Tử Vi
// Dựa trên: dư = (ngayAm % cuc) và từng loại cục
const ZIWEI_LOOKUP: Record<number, Record<number, number>> = {
  2: { 0: 6, 1: 2 },        // Thủy Nhị Cục (dư 0→Ngọ, dư 1→Dần)
  3: { 0: 9, 1: 3, 2: 6 },  // Mộc Tam Cục
  4: { 0: 10, 1: 0, 2: 3, 3: 6 }, // Kim Tứ Cục  
  5: { 0: 11, 1: 1, 2: 4, 3: 7, 4: 10 }, // Thổ Ngũ Cục
  6: { 0: 6, 1: 9, 2: 0, 3: 3, 4: 6, 5: 9 }, // Hỏa Lục Cục
};

function findZiweiPalace(ngayAm: number, cuc: number): number {
  const remainder = ngayAm % cuc;
  return ZIWEI_LOOKUP[cuc][remainder];
}
```

## 7. An 14 Chính Tinh

### Chòm Tử Vi (tính từ vị trí sao Tử Vi = Z):

```
Tử Vi    : Z
Thiên Cơ : (Z - 1 + 12) % 12
Thái Dương: (Z - 3 + 12) % 12  -- BỎ QUA các cung không hợp lệ
Vũ Khúc  : (Z - 4 + 12) % 12
Thiên Đồng: (Z - 5 + 12) % 12
Liêm Trinh: (Z - 8 + 12) % 12
```

### Chòm Thiên Phủ (đối xứng qua trục Dần-Thân):

```typescript
// Thiên Phủ luôn đối xứng qua trục Dần(2) - Thân(8) với Tử Vi
// Công thức: thienPhu = (4 - ziweiPos + 12) % 12
// Ví dụ: Tử Vi ở Dần(2) → Thiên Phủ ở Dần(2); Tử Vi ở Tý(0) → Thiên Phủ ở Thìn(4)
function findThienPhuPalace(ziweiPos: number): number {
  return (4 - ziweiPos + 12) % 12;
}
```

### An sao từ Thiên Phủ (P = vị trí Thiên Phủ):

```
Thiên Phủ: P
Thái Âm  : (P + 1) % 12
Tham Lang: (P + 2) % 12
Cự Môn   : (P + 3) % 12
Thiên Tướng: (P + 4) % 12
Thiên Lương: (P + 5) % 12
Thất Sát : (P + 6) % 12
Phá Quân : (P + 10) % 12  ← KHÔNG phải +7
```

## 8. Tứ Hóa Theo Thiên Can Năm Sinh

```typescript
// [Hóa Lộc, Hóa Quyền, Hóa Khoa, Hóa Kỵ]
const TU_HOA: Record<string, [string, string, string, string]> = {
  'Giáp': ['Liêm Trinh',  'Phá Quân',   'Vũ Khúc',    'Thái Dương'],
  'Ất':   ['Thiên Cơ',   'Thiên Lương', 'Tử Vi',      'Thái Âm'],
  'Bính': ['Thiên Đồng', 'Thiên Cơ',   'Văn Xương',  'Liêm Trinh'],
  'Đinh': ['Thái Âm',   'Thiên Đồng', 'Thiên Cơ',   'Cự Môn'],
  'Mậu':  ['Tham Lang',  'Thái Âm',    'Hữu Bật',    'Thiên Cơ'],
  'Kỷ':   ['Vũ Khúc',   'Tham Lang',  'Thiên Lương', 'Văn Khúc'],
  'Canh': ['Thái Dương', 'Vũ Khúc',   'Thái Âm',    'Thiên Đồng'],
  'Tân':  ['Cự Môn',    'Thái Dương', 'Văn Khúc',   'Văn Xương'],
  'Nhâm': ['Thiên Lương', 'Tử Vi',    'Tả Phù',     'Vũ Khúc'],
  'Quý':  ['Phá Quân',  'Cự Môn',    'Thái Âm',    'Tham Lang'],
};
```

## 9. An Phụ Tinh Quan Trọng

### Lục Cát Tinh:
- **Tả Phù**: Theo tháng âm — Tháng 1 ở Thìn(4), đếm thuận
- **Hữu Bật**: Theo tháng âm — Tháng 1 ở Tuất, đếm ngược
- **Thiên Khôi**: Theo Thiên Can năm: Giáp/Mậu → Sửu; Ất/Kỷ → Tý; Bính/Đinh → Hợi; Canh/Tân → Ngọ; Nhâm/Quý → Mão
- **Thiên Việt**: Theo Thiên Can năm: Giáp/Mậu → Mùi(7); Ất/Kỷ → Thân(8); Bính/Đinh → Dậu(9); Canh/Tân → Dần(2); Nhâm/Quý → Tỵ(5)
- **Văn Xương**: Theo giờ sinh — Giờ Tý → Tuất, đếm ngược
- **Văn Khúc**: Theo giờ sinh — Giờ Tý → Thìn, đếm thuận

### Lục Sát Tinh:
- **Kình Dương**: Theo Thiên Can năm — Giáp→Mão, Ất→Thìn, Bính/Mậu→Ngọ, Đinh/Kỷ→Mùi, Canh→Dậu, Tân→Tuất, Nhâm→Tý, Quý→Sửu
- **Đà La**: Trước Kình Dương 1 cung (đếm ngược)
- **Hỏa Tinh**: Theo Địa Chi năm và giờ sinh (tra bảng)
- **Linh Tinh**: Theo Địa Chi năm và giờ sinh (tra bảng, không phải đối cung với Hỏa Tinh)

### Sao Cố Định:
- **Thiên Thương**: Cố định tại cung Nô Bộc
- **Thiên Sứ**: Cố định tại cung Tật Ách
- **Thiên La**: Cố định tại Thìn (index 4)
- **Địa Võng**: Cố định tại Tuất (index 10)
