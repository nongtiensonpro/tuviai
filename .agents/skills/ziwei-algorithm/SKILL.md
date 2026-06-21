---
name: ziwei-algorithm
description: >
  Tri thức chiêm tinh học cốt lõi cho thuật toán an sao Tử Vi Đẩu Số — trường phái Nam Tông (Tam Hợp).
  Agent PHẢI đọc file này trước khi viết bất kỳ logic tính toán chiêm tinh nào.
  Các công thức trong file này là chính xác, đã được xác minh qua lasotuvi.com và unit tests.
  KHÔNG tự ý suy diễn hoặc thay đổi các công thức mà không cập nhật unit tests tương ứng.
---

# Skill: Thuật Toán Tử Vi Đẩu Số — Chuẩn Nam Tông Tam Hợp

## Tổng Quan Trường Phái

App này tuân thủ **Nam Tông (Tam Hợp)** — trường phái Tử Vi phổ biến nhất tại Việt Nam.

| Đặc điểm | Giá trị |
|---|---|
| Trường phái | Nam Tông (Tam Hợp) |
| Số chính tinh | 14 sao |
| Phụ tinh | 6 Lục Cát + 6 Lục Sát + ~70 bàng tinh/tạp diệu |
| Nguồn tham khảo chính | Quản Xuân Thịnh, Học viện Lý số Hà Nội |
| Verify bằng | lasotuvi.com, unit tests (132 cases) |

### Quyết Định Quy Ước Học Thuật (Hết Sức Quan Trọng)

Để đảm bảo tính đồng nhất tuyệt đối giữa Engine tính toán và hệ thống lý giải (Insight Engine), các quy ước học thuật sau đây được áp dụng cứng:

1. **Cặp sao Không-Kiếp trong Lục Sát tinh**:
   - Sử dụng tên gọi **"Địa Không"** (an nghịch giờ sinh từ Hợi) và **"Địa Kiếp"** (an thuận giờ sinh từ Hợi).
   - Tuyệt đối không dùng tên "Thiên Không" cho sao thuộc Lục Sát để tránh nhầm lẫn với sao Thiên Không thuộc vòng Thái Tuế.
2. **An Hỏa Tinh & Linh Tinh**:
   - Luôn luôn **đếm thuận** theo chiều kim đồng hồ đối với cả Nam và Nữ (Dương Nam, Âm Nam, Dương Nữ, Âm Nữ) dựa trên chi năm sinh và giờ sinh. Đây là quy ước chuẩn đã được kiểm chứng trùng khớp 100% với lasotuvi.com qua hàng loạt bộ test thực tế.
3. **Triệt Lộ Không Vong**:
   - An tại 2 cung liền kề theo Thiên Can năm sinh. Cung chứa Triệt Không được gắn cờ `hasTrietKhong: boolean` (đã sửa triệt để typo `hasTrinhKhong`).

---

## 1. Chuyển Đổi Lịch (Solar → Lunar)

Sử dụng thư viện `@dqcai/vn-lunar`:

```typescript
import { Lunar } from '@dqcai/vn-lunar';

const lunar = Lunar.fromDate(new Date(year, month - 1, day));
const lunarDay   = lunar.getDay();    // 1-30
const lunarMonth = lunar.getMonth();  // 1-12
const lunarYear  = lunar.getYear();
const isLeap     = lunar.isLeap();    // Tháng nhuận
```

### Giờ Tý Sớm / Muộn (23:00 - 23:59)

Khi sinh giờ 23:00-23:59, có 2 trường phái xử lý:
- **Tý sớm (mặc định)**: Thuộc **ngày hôm sau** (`earlyZiMode: 'next_day'`)
- **Tý muộn**: Thuộc ngày hôm nay (`earlyZiMode: 'same_day'`)

```typescript
// Trong SolarDate interface:
earlyZiMode?: 'next_day' | 'same_day'; // Mặc định: 'next_day'
```

---

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

---

## 3. Cung Mệnh & Cung Thân

### Định Vị Cung Mệnh

1. Tháng 1 âm lịch ứng với cung **Dần** (chiIndex = 2)
2. Đếm **thuận** tháng: Tháng N → `thangChiIndex = (N + 1) % 12`
3. Từ đó đếm **nghịch** giờ sinh: `menhChiIndex = (thangChiIndex - hourChiIndex + 12) % 12`

```typescript
function calcMenhChiIndex(lunarMonth: number, hourChiIndex: number): number {
  const thangChiIndex = (lunarMonth + 1) % 12;
  return ((thangChiIndex - hourChiIndex) + 12) % 12;
}
```

### Định Vị Cung Thân

Từ cùng điểm tháng, đếm **thuận** theo giờ:
```typescript
function calcThanChiIndex(lunarMonth: number, hourChiIndex: number): number {
  const thangChiIndex = (lunarMonth + 1) % 12;
  return (thangChiIndex + hourChiIndex) % 12;
}
```

### 12 Cung Chức Năng (từ Mệnh, đếm ngược kim đồng hồ = chiIndex tăng):

```
Mệnh(+0) → Phụ Mẫu(+1) → Phúc Đức(+2) → Điền Trạch(+3) →
Quan Lộc(+4) → Nô Bộc(+5) → Thiên Di(+6) → Tật Ách(+7) →
Tài Bạch(+8) → Tử Tức(+9) → Phu Thê(+10) → Huynh Đệ(+11)
```

---

## 4. Ngũ Hành Nạp Âm Cục

Tra bảng theo (Thiên Can + Địa Chi) của **Cung Mệnh**:

```typescript
// 5 loại Cục: Thủy Nhị(2), Mộc Tam(3), Kim Tứ(4), Thổ Ngũ(5), Hỏa Lục(6)
const NAP_AM_CUC: Record<string, NguHanhCuc> = {
  // Kim Tứ Cục (4)
  'Giáp-Tý': 4, 'Ất-Sửu': 4,
  'Nhâm-Dần': 4, 'Quý-Mão': 4,
  'Canh-Thìn': 4, 'Tân-Tỵ': 4,
  'Giáp-Ngọ': 4, 'Ất-Mùi': 4,
  'Nhâm-Thân': 4, 'Quý-Dậu': 4,
  'Canh-Tuất': 4, 'Tân-Hợi': 4,

  // Thổ Ngũ Cục (5)
  'Canh-Tý': 5, 'Tân-Sửu': 5,
  'Mậu-Dần': 5, 'Kỷ-Mão': 5,
  'Bính-Thìn': 5, 'Đinh-Tỵ': 5,
  'Canh-Ngọ': 5, 'Tân-Mùi': 5,
  'Mậu-Thân': 5, 'Kỷ-Dậu': 5,
  'Bính-Tuất': 5, 'Đinh-Hợi': 5,

  // Hỏa Lục Cục (6)
  'Mậu-Tý': 6, 'Kỷ-Sửu': 6,
  'Bính-Dần': 6, 'Đinh-Mão': 6,
  'Giáp-Thìn': 6, 'Ất-Tỵ': 6,
  'Mậu-Ngọ': 6, 'Kỷ-Mùi': 6,
  'Bính-Thân': 6, 'Đinh-Dậu': 6,
  'Giáp-Tuất': 6, 'Ất-Hợi': 6,

  // Mộc Tam Cục (3)
  'Nhâm-Tý': 3, 'Quý-Sửu': 3,
  'Canh-Dần': 3, 'Tân-Mão': 3,
  'Mậu-Thìn': 3, 'Kỷ-Tỵ': 3,
  'Nhâm-Ngọ': 3, 'Quý-Mùi': 3,
  'Canh-Thân': 3, 'Tân-Dậu': 3,
  'Mậu-Tuất': 3, 'Kỷ-Hợi': 3,

  // Thủy Nhị Cục (2)
  'Bính-Tý': 2, 'Đinh-Sửu': 2,
  'Giáp-Dần': 2, 'Ất-Mão': 2,
  'Nhâm-Thìn': 2, 'Quý-Tỵ': 2,
  'Bính-Ngọ': 2, 'Đinh-Mùi': 2,
  'Giáp-Thân': 2, 'Ất-Dậu': 2,
  'Nhâm-Tuất': 2, 'Quý-Hợi': 2,
};
```

---

## 5. Tìm Vị Trí Sao Tử Vi

**Thuật toán bảng chu kỳ đầu:**

```typescript
// Chu kỳ đầu tiên của từng Cục (positions: Sửu=1, Dần=2, Thìn=4...)
const ZIWEI_CYCLE_ONE: Record<NguHanhCuc, number[]> = {
  2: [1, 2],              // Thủy Nhị: Sửu, Dần
  3: [4, 1, 2],           // Mộc Tam: Thìn, Sửu, Dần
  4: [11, 4, 1, 2],       // Kim Tứ: Hợi, Thìn, Sửu, Dần
  5: [6, 11, 4, 1, 2],    // Thổ Ngũ: Ngọ, Hợi, Thìn, Sửu, Dần
  6: [9, 6, 11, 4, 1, 2], // Hỏa Lục: Dậu, Ngọ, Hợi, Thìn, Sửu, Dần
};

function findZiweiPosition(ngayAm: number, cuc: NguHanhCuc): number {
  const quotient = Math.floor(ngayAm / cuc);
  const remainder = ngayAm % cuc;

  if (remainder === 0) {
    // Chia hết: lấy Dần (2) + quotient - 1
    return (2 + Math.max(quotient - 1, 0)) % 12;
  }

  // Có dư: lấy vị trí base từ chu kỳ đầu + quotient
  const basePos = ZIWEI_CYCLE_ONE[cuc][remainder - 1];
  return (basePos + quotient) % 12;
}
```

---

## 6. An 14 Chính Tinh

### Chòm Tử Vi (Z = vị trí sao Tử Vi):

```
Tử Vi     : Z
Thiên Cơ  : (Z - 1 + 12) % 12
Thái Dương : (Z - 3 + 12) % 12
Vũ Khúc   : (Z - 4 + 12) % 12
Thiên Đồng : (Z - 5 + 12) % 12
Liêm Trinh : (Z - 8 + 12) % 12
```

### Chòm Thiên Phủ (đối xứng Dần-Thân với Tử Vi):

```typescript
// Công thức: P = (4 - Z + 12) % 12
// Ví dụ: Z=0(Tý) → P=4(Thìn); Z=2(Dần) → P=2(Dần)
function findThienPhuPosition(ziweiPos: number): number {
  return (4 - ziweiPos + 12) % 12;
}
```

### An từ Thiên Phủ (P):

```
Thiên Phủ  : P
Thái Âm    : (P + 1) % 12
Tham Lang  : (P + 2) % 12
Cự Môn     : (P + 3) % 12
Thiên Tướng : (P + 4) % 12
Thiên Lương : (P + 5) % 12
Thất Sát   : (P + 6) % 12
Phá Quân   : (P + 10) % 12   ← KHÔNG phải +7
```

---

## 7. Độ Sáng Chính Tinh (Miếu/Vượng/Đắc/Bình/Hãm)

Theo chuẩn Nam Tông (Học viện Lý số Hà Nội).  
Ký hiệu: `M`=Miếu, `V`=Vượng, `Đ`=Đắc, `B`=Bình, `H`=Hãm

```
          Tý  Sửu Dần Mão Thìn Tỵ  Ngọ Mùi Thân Dậu Tuất Hợi
Tử Vi    : Đ   Đ   Đ   Đ   Đ   M   M   V   Đ   H   V   Đ
Thiên Cơ : B   Đ   H   M   H   Đ   B   B   H   M   H   V
Thái Dương: H   H   V   V   M   M   M   V   Đ   H   H   H
Vũ Khúc  : M   Đ   Đ   H   Đ   M   H   Đ   M   V   Đ   H
Thiên Đồng: V   H   V   V   H   H   H   M   M   H   H   M
Liêm Trinh: H   M   M   H   B   H   V   H   Đ   H   V   H
Thiên Phủ : M   M   Đ   Đ   M   Đ   M   M   Đ   V   M   Đ
Thái Âm  : M   V   H   H   H   H   H   H   V   M   Đ   V
Tham Lang : V   Đ   M   V   Đ   H   B   B   V   M   H   M
Cự Môn   : B   M   H   H   H   V   B   V   H   H   M   H
Thiên Tướng: M   Đ   V   Đ   M   Đ   M   Đ   V   Đ   M   Đ
Thiên Lương: M   V   V   H   M   H   V   V   H   H   M   H
Thất Sát  : M   H   V   H   H   M   M   H   V   H   H   M
Phá Quân  : V   H   H   V   M   V   H   V   V   V   V   H
```

---

## 8. Tứ Hóa Phi Tinh (Theo Can Năm Sinh)

```typescript
// [Hóa Lộc, Hóa Quyền, Hóa Khoa, Hóa Kỵ]
const TU_HOA: Record<TenCan, [string, string, string, string]> = {
  'Giáp': ['Liêm Trinh',   'Phá Quân',    'Vũ Khúc',     'Thái Dương'],
  'Ất':   ['Thiên Cơ',    'Thiên Lương',  'Tử Vi',       'Thái Âm'],
  'Bính': ['Thiên Đồng',  'Thiên Cơ',    'Văn Xương',   'Liêm Trinh'],
  'Đinh': ['Thái Âm',    'Thiên Đồng',  'Thiên Cơ',    'Cự Môn'],
  'Mậu':  ['Tham Lang',   'Thái Âm',     'Hữu Bật',     'Thiên Cơ'],
  'Kỷ':   ['Vũ Khúc',    'Tham Lang',   'Thiên Lương',  'Văn Khúc'],
  'Canh': ['Thái Dương',  'Vũ Khúc',    'Thái Âm',     'Thiên Đồng'],
  'Tân':  ['Cự Môn',     'Thái Dương',  'Văn Khúc',    'Văn Xương'],
  'Nhâm': ['Thiên Lương', 'Tử Vi',      'Tả Phù',      'Vũ Khúc'],
  'Quý':  ['Phá Quân',   'Cự Môn',     'Thái Âm',     'Tham Lang'],
};
```

---

## 9. Lục Cát Tinh

### Lộc Tồn (neo cho Vòng Bác Sĩ):

```typescript
// Giáp→Dần(2), Ất→Mão(3), Bính/Mậu→Tỵ(5), Đinh/Kỷ→Ngọ(6)
// Canh→Thân(8), Tân→Dậu(9), Nhâm→Hợi(11), Quý→Tý(0)
const LOC_TON_BY_CAN: Record<TenCan, number> = {
  'Giáp': 2, 'Ất': 3, 'Bính': 5, 'Đinh': 6,
  'Mậu': 5, 'Kỷ': 6, 'Canh': 8, 'Tân': 9,
  'Nhâm': 11, 'Quý': 0,
};
```

### Tả Phù & Hữu Bật (theo tháng âm):

```
Tả Phù : T1 ở Thìn(4), đếm THUẬN  → tháng N: (4 + N - 1) % 12
Hữu Bật: T1 ở Tuất(10), đếm NGHỊCH → tháng N: (10 - N + 1 + 12) % 12
```

### Thiên Khôi & Thiên Việt (theo Can năm):

```typescript
const THIEN_KHOI: Record<TenCan, number> = {
  'Giáp': 1, 'Mậu': 1,   // Sửu(1)
  'Ất': 0,  'Kỷ': 0,     // Tý(0)
  'Bính': 11, 'Đinh': 11, // Hợi(11)
  'Canh': 6, 'Tân': 6,   // Ngọ(6)
  'Nhâm': 3, 'Quý': 3,   // Mão(3)
};

const THIEN_VIET: Record<TenCan, number> = {
  'Giáp': 7, 'Mậu': 7,   // Mùi(7)
  'Ất': 8,  'Kỷ': 8,     // Thân(8)
  'Bính': 9, 'Đinh': 9,  // Dậu(9)
  'Canh': 2, 'Tân': 2,   // Dần(2)
  'Nhâm': 5, 'Quý': 5,   // Tỵ(5)
};
```

### Văn Xương & Văn Khúc (theo giờ sinh):

```
Văn Xương: Giờ Tý → Tuất(10), đếm NGHỊCH → (10 - hourChiIndex + 12) % 12
Văn Khúc : Giờ Tý → Thìn(4), đếm THUẬN  → (4 + hourChiIndex) % 12
```

---

## 10. Lục Sát Tinh

### Kình Dương & Đà La (theo Can năm):

```typescript
const KINH_DUONG: Record<TenCan, number> = {
  'Giáp': 3,  // Mão
  'Ất': 4,    // Thìn
  'Bính': 6,  // Ngọ
  'Mậu': 6,   // Ngọ
  'Đinh': 7,  // Mùi
  'Kỷ': 7,    // Mùi
  'Canh': 9,  // Dậu
  'Tân': 10,  // Tuất
  'Nhâm': 0,  // Tý
  'Quý': 1,   // Sửu
};
// Đà La = trước Kình Dương 1 cung: (kinhIdx - 1 + 12) % 12
```

### Hỏa Tinh & Linh Tinh (theo Chi năm × Giờ sinh):

> **ĐÃ ĐƯỢC XÁC NHẬN** bởi chuyên gia + 3 lá số verified:
> - Tân Mùi 1991 (chi=7) + giờ Sửu(1) → Hỏa=Tuất ✅
> - Đinh Hợi 2007 (chi=11) + giờ Tỵ(5) → Hỏa=Dần ✅  
> - Kỷ Mão 1999 (chi=3): khởi Dậu(9) ✅ (chuyên gia)

```typescript
// Mỗi nhóm tam hợp có điểm khởi riêng cho giờ Tý (index=0),
// sau đó đếm THUẬN đến giờ sinh.
const HOA_LINH_START: Record<number, { hoa: number; linh: number }> = {
  // Thân(8) Tý(0) Thìn(4): Hỏa khởi Dần(2), Linh khởi Tuất(10)
  0: { hoa: 2, linh: 10 }, 4: { hoa: 2, linh: 10 }, 8: { hoa: 2, linh: 10 },
  // Dần(2) Ngọ(6) Tuất(10): Hỏa khởi Sửu(1), Linh khởi Mão(3)
  2: { hoa: 1, linh: 3 },  6: { hoa: 1, linh: 3 },  10: { hoa: 1, linh: 3 },
  // Tỵ(5) Dậu(9) Sửu(1): Hỏa khởi Mão(3), Linh khởi Tuất(10)
  1: { hoa: 3, linh: 10 }, 5: { hoa: 3, linh: 10 }, 9: { hoa: 3, linh: 10 },
  // Hợi(11) Mão(3) Mùi(7): Hỏa khởi Dậu(9), Linh khởi Tuất(10)
  3: { hoa: 9, linh: 10 }, 7: { hoa: 9, linh: 10 }, 11: { hoa: 9, linh: 10 },
};

// Tính vị trí:
// hoaIdx  = (HOA_LINH_START[yearChiIndex].hoa  + hourChiIndex) % 12
// linhIdx = (HOA_LINH_START[yearChiIndex].linh + hourChiIndex) % 12
```

### Địa Không & Địa Kiếp (theo giờ sinh):

> **Lưu ý trường phái**: App sử dụng tên gọi **"Địa Không"** cho sao an nghịch giờ sinh khởi từ Hợi (cặp với "Địa Kiếp" an thuận giờ sinh khởi từ Hợi). Đây là cặp sao Không - Kiếp thuộc nhóm Lục Sát tinh theo đúng chuẩn Tử Vi Nam Phái (lasotuvi.com).

```
Địa Không  : Giờ Tý → Hợi(11), đếm NGHỊCH → (11 - hourChiIndex + 12) % 12
Địa Kiếp   : Giờ Tý → Hợi(11), đếm THUẬN  → (11 + hourChiIndex) % 12
```

---

## 11. Tuần Không & Triệt Không

### Tuần Không (2 cung cuối của Lục thập Hoa Giáp):

```
Giáp Tý tuần  (sexagenary 0-9)  → Tuất(10), Hợi(11) Tuần Không
Giáp Tuất tuần (sexagenary 10-19) → Thân(8),  Dậu(9)  Tuần Không
Giáp Thân tuần (sexagenary 20-29) → Ngọ(6),   Mùi(7)  Tuần Không
Giáp Ngọ tuần  (sexagenary 30-39) → Thìn(4),  Tỵ(5)   Tuần Không
Giáp Thìn tuần (sexagenary 40-49) → Dần(2),   Mão(3)  Tuần Không
Giáp Dần tuần  (sexagenary 50-59) → Tý(0),    Sửu(1)  Tuần Không
```

### Triệt Không (2 cung theo Can năm sinh):

```
Giáp/Kỷ → Thân(8), Dậu(9)
Ất/Canh  → Ngọ(6), Mùi(7)
Bính/Tân → Thìn(4), Tỵ(5)
Đinh/Nhâm → Dần(2), Mão(3)
Mậu/Quý  → Tý(0), Sửu(1)
```

---

## 12. Sao Cố Định

```
Thiên La : Cố định tại Thìn (chiIndex = 4)
Địa Võng : Cố định tại Tuất (chiIndex = 10)
Thiên Thương: Cố định tại cung Nô Bộc (theo palaceName)
Thiên Sứ  : Cố định tại cung Tật Ách (theo palaceName)
```

---

## 13. Bàng Tinh Tạp Diệu

### Vòng Thái Tuế (12 sao, theo Chi năm sinh):

Khởi **Thái Tuế** tại cung trùng với Chi năm sinh, đếm THUẬN:

```
Thái Tuế → Thiếu Dương → Tang Môn → Thiếu Âm →
Quan Phù → Tử Phù → Tuế Phá → Long Đức →
Bạch Hổ → Phúc Đức → Điếu Khách → Trực Phù
```

### Vòng Bác Sĩ / Lộc Tồn (12 sao, khởi tại cung Lộc Tồn):

```
Bác Sĩ → Lực Sĩ → Thanh Long → Tiểu Hao →
Tướng Quân → Tấu Thư → Phi Liêm → Hỷ Thần →
Bệnh Phù → Đại Hao → Phục Binh → Quan Phủ
```

**Chiều đi:**
- **Dương Nam / Âm Nữ**: đếm THUẬN
- **Âm Nam / Dương Nữ**: đếm NGHỊCH

(Dương Can: Giáp=0, Bính=2, Mậu=4, Canh=6, Nhâm=8 — index chẵn)

### Vòng Trường Sinh (12 sao):

```
Trường Sinh → Mộc Dục → Quan Đới → Lâm Quan →
Đế Vượng → Suy → Bệnh → Tử →
Mộ → Tuyệt → Thai → Dưỡng
```

**Điểm khởi theo Cục:**

| Cục | Điểm khởi Trường Sinh |
|---|---|
| Thủy Nhị (2) | Thân (8) |
| Mộc Tam (3) | Hợi (11) |
| Kim Tứ (4) | Tỵ (5) |
| Thổ Ngũ (5) | Thân (8) |
| Hỏa Lục (6) | Dần (2) |

**Chiều đi:** Giống Vòng Bác Sĩ (Dương Nam/Âm Nữ thuận; Âm Nam/Dương Nữ nghịch)

### Tạp Diệu Quan Trọng (tham khảo MinorStarEngine.ts):

| Sao | Phương pháp an |
|---|---|
| Thiên Hình | T1 ở Dậu(9), đếm thuận |
| Thiên Diêu / Thiên Y | T1 ở Sửu(1), đếm thuận |
| Thiên Giải | T1 ở Thân(8), đếm thuận |
| Địa Giải | T1 ở Mùi(7), đếm thuận |
| Hồng Loan | Mão(3) nghịch Chi năm |
| Thiên Hỷ | Đối cung Hồng Loan |
| Thiên Mã | Thân Tý Thìn→Dần; Tỵ Dậu Sửu→Thân; Hợi Mão Mùi→Tỵ; Dần Ngọ Tuất→Hợi |
| Đào Hoa | Theo bảng Chi năm |
| Cô Thần, Quả Tú | Theo bảng Chi năm |

---

## 14. Mệnh Chủ & Thân Chủ

### Mệnh Chủ (theo Địa Chi Cung Mệnh):

```typescript
// index: 0=Tý, 1=Sửu, 2=Dần, 3=Mão, 4=Thìn, 5=Tỵ
//        6=Ngọ, 7=Mùi, 8=Thân, 9=Dậu, 10=Tuất, 11=Hợi
const MENH_CHU = [
  'Tham Lang',  // Tý(0)
  'Cự Môn',     // Sửu(1)
  'Lộc Tồn',   // Dần(2)  ← Mệnh Chủ là "Lộc Tồn" (đã confirm)
  'Văn Khúc',   // Mão(3)
  'Liêm Trinh', // Thìn(4)
  'Vũ Khúc',   // Tỵ(5)
  'Phá Quân',  // Ngọ(6)
  'Vũ Khúc',   // Mùi(7)
  'Liêm Trinh', // Thân(8)
  'Văn Khúc',   // Dậu(9)
  'Lộc Tồn',   // Tuất(10) ← Mệnh Chủ là "Lộc Tồn" (đã confirm)
  'Cự Môn',    // Hợi(11)
];
```

### Thân Chủ (theo Địa Chi năm sinh):

```
Tý  → Linh Tinh
Sửu → Thiên Tướng
Dần → Thiên Lương
Mão → Thiên Đồng
Thìn → Văn Xương
Tỵ  → Thiên Cơ
Ngọ → Hỏa Tinh
Mùi → Thiên Tướng
Thân → Thiên Lương
Dậu → Thiên Đồng
Tuất → Văn Xương
Hợi → Thiên Cơ
```

---

## 15. Đại Hạn

**Tuổi bắt đầu cung Mệnh = số Cục (2/3/4/5/6 tuổi).**  
Mỗi cung tiếp theo cộng thêm 10 tuổi.

```typescript
function calcDaiHan(cuc: NguHanhCuc, isThuanHanh: boolean, menhChiIndex: number, targetChiIndex: number): number {
  let offset = targetChiIndex - menhChiIndex;
  if (!isThuanHanh) offset = menhChiIndex - targetChiIndex;
  offset = (offset % 12 + 12) % 12;
  return cuc + (offset * 10); // Tuổi bắt đầu đại hạn tại cung này
}
```

**Chiều chạy Đại Hạn:**
- **Dương Nam / Âm Nữ** (`isThuanHanh = true`): chiIndex tăng dần (thuận)
- **Âm Nam / Dương Nữ** (`isThuanHanh = false`): chiIndex giảm dần (nghịch)

---

## 16. Tiểu Vận

**Điểm khởi theo Chi năm sinh:**

| Nhóm Chi năm | Điểm khởi Tiểu Vận |
|---|---|
| Dần(2), Ngọ(6), Tuất(10) | Thìn (4) |
| Thân(8), Tý(0), Thìn(4)  | Tuất (10) |
| Tỵ(5), Dậu(9), Sửu(1)   | Mùi (7) |
| Hợi(11), Mão(3), Mùi(7) | Sửu (1) |

**Chiều đi:**
- **Nam** (bất kể Can): đếm THUẬN (chiIndex tăng)
- **Nữ** (bất kể Can): đếm NGHỊCH (chiIndex giảm)

```typescript
tieuVanIdx = isMale
  ? (startIdx + (age - 1)) % 12
  : ((startIdx - (age - 1)) % 12 + 12) % 12;
```

---

## 17. Lưu Niên (Hạn Năm)

Các sao lưu niên chính:
- **Lưu Thái Tuế**: Tại cung trùng Chi của năm đang xét
- **Lưu Lộc Tồn**: Theo Can của năm đang xét (bảng LOC_TON_BY_CAN)
- **Lưu Kình Dương**: Sau Lưu Lộc Tồn 1 cung (thuận)
- **Lưu Đà La**: Trước Lưu Lộc Tồn 1 cung (nghịch)
- **Lưu Thiên Mã**: Theo Chi năm đang xét (bảng THIEN_MA)
- **Lưu Tứ Hóa**: Theo Can năm đang xét (bảng TU_HOA)

---

## 18. Âm Dương Nam Nữ (Xác Định Chiều Đại Hạn)

```typescript
// Can Dương: Giáp(0), Bính(2), Mậu(4), Canh(6), Nhâm(8) → canIndex chẵn
// Can Âm:   Ất(1), Đinh(3), Kỷ(5), Tân(7), Quý(9)   → canIndex lẻ
function calcAmDuongNamNu(yearCanIndex: number, gender: 'male' | 'female') {
  const isDuongCan = yearCanIndex % 2 === 0;
  const isNam = gender === 'male';
  // Dương Nam / Âm Nữ: thuận chiều (isThuanHanh = true)
  // Âm Nam / Dương Nữ: nghịch chiều (isThuanHanh = false)
  const isThuanHanh = (isDuongCan && isNam) || (!isDuongCan && !isNam);
  return { isThuanHanh };
}
```

---

## 19. Cung Mượn (Vô Chính Diệu)

Khi một cung không có chính tinh nào, mượn chính tinh từ cung xung chiếu (cách 6 cung):
```typescript
const oppositeIdx = (p.chiIndex + 6) % 12;
p.borrowedStars = oppositePalace.mainStars;
```

---

## 20. True Solar Time (Tùy Chọn Nâng Cao)

App hỗ trợ hiệu chỉnh giờ mặt trời thực (True Solar Time) theo kinh độ địa lý:
- Equation of Time (EOT): sai số thiên văn học giữa giờ đồng hồ và giờ thực
- Longitude Offset: chênh lệch kinh độ so với múi giờ hành chính (UTC+7)
- 63 tỉnh thành Việt Nam được lưu trẵn sẵn trong `AstronomicalData.ts`

Bật/tắt qua `SolarDate.isTrueSolarTimeApplied`.

---

## 21. Đẩu Quân (Nguyệt Tướng)

Đẩu Quân đại diện cho tháng Giêng cá nhân của năm xem hạn, dùng để xác định khởi điểm tính Nguyệt Hạn.
- **Công thức**: Khởi Thái Tuế tại cung Chi năm sinh, đếm nghịch đến tháng sinh, coi đó là giờ Tý, đếm thuận đến giờ sinh.
- **TypeScript**:
```typescript
const dauQuanIdx = (yearChiIdx - month + 1 + hourChiIdx + 24) % 12;
```

---

## 22. Tạp Diệu Bổ Sung (Thiên Vu, Thiên Riêu)

- **Thiên Vu**: Sao chủ về tâm linh, tín ngưỡng, di sản thừa kế.
  - **Công thức**: Khởi tại Thân (8) cho năm Tý, đếm thuận theo Địa Chi năm.
  - **TypeScript**: `const thienVuIdx = (8 + yearChiIdx) % 12;`
- **Thiên Riêu (Thiên Diêu)**: Sao chủ về sự đào hoa, phong lưu, quyến rũ.
  - **Công thức**: Khởi tại Sửu (1) đếm thuận theo tháng sinh.
  - **TypeScript**: `const thienRieuIdx = (1 + month - 1) % 12;`

---

## 23. Hệ Thống Lưu Niên Sao Mở Rộng

Các sao lưu niên di động theo năm xem hạn (Lưu Can và Lưu Chi):
- **Lưu Hồng Loan**: `(3 - luuChiIdx + 12) % 12`
- **Lưu Thiên Hỷ**: `(luuHongLoanIdx + 6) % 12`
- **Lưu Tang Môn**: `(luuThaiTueIdx + 2) % 12`
- **Lưu Bạch Hổ**: `(luuThaiTueIdx + 8) % 12`
- **Lưu Quan Phù**: `(luuThaiTueIdx + 4) % 12`
- **Lưu Đào Hoa**: Tra bảng theo Chi năm xem hạn.
- **Lưu Thiên Khôi / Lưu Thiên Việt**: Tra bảng theo Can năm xem hạn.
- **Lưu Hỏa Tinh / Lưu Linh Tinh**: Khởi theo Chi năm xem hạn, đếm thuận đến giờ sinh gốc.

---

## 24. Nguyệt Hạn (Hạn Tháng)

Vận hạn chi tiết 12 tháng âm lịch trong năm xem hạn.
- **Nguyên lý**: Cung chứa Lưu Đẩu Quân của năm hạn là tháng Giêng (tháng 1).
- **Chiều đi**: Luôn đi thuận chiều kim đồng hồ từ cung tháng Giêng.
- **TypeScript**:
```typescript
const monthlyPalaceIndex = (luuDauQuanIdx + targetMonth - 1) % 12;
```

