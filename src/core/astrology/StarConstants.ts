import type { StarBrightness, TenCan } from '../types/ZiweiTypes';

/**
 * Chuẩn hóa chỉ số cung về [0, 11] — dùng chung cho mọi phép an sao vòng.
 * Khác với `% 12` của JS (trả số âm), mod12 luôn trả index hợp lệ.
 */
export function mod12(value: number): number {
  return ((value % 12) + 12) % 12;
}


export const LOC_TON_BY_CAN: Record<TenCan, number> = {
  'Giáp': 2,
  'Ất': 3,
  'Bính': 5,
  'Đinh': 6,
  'Mậu': 5,
  'Kỷ': 6,
  'Canh': 8,
  'Tân': 9,
  'Nhâm': 11,
  'Quý': 0,
};

export const THIEN_MA_BY_YEAR_CHI: Record<number, number> = {
  0: 2, 1: 11, 2: 8, 3: 5, 4: 2, 5: 11,
  6: 8, 7: 5, 8: 2, 9: 11, 10: 8, 11: 5,
};

export const DAO_HOA_BY_YEAR_CHI: Record<number, number> = {
  0: 9, 1: 6, 2: 3, 3: 0, 4: 9, 5: 6,
  6: 3, 7: 0, 8: 9, 9: 6, 10: 3, 11: 0,
};

export const THIEN_KHOI_BY_CAN: Record<TenCan, number> = {
  'Giáp': 1, 'Mậu': 1,   // Sửu
  'Ất': 0, 'Kỷ': 0,     // Tý
  'Bính': 11, 'Đinh': 11, // Hợi
  'Canh': 6, 'Tân': 6,   // Ngọ
  'Nhâm': 3, 'Quý': 3,   // Mão
};

export const THIEN_VIET_BY_CAN: Record<TenCan, number> = {
  'Giáp': 7, 'Mậu': 7,   // Mùi
  'Ất': 8, 'Kỷ': 8,     // Thân
  'Bính': 9, 'Đinh': 9,  // Dậu
  'Canh': 2, 'Tân': 2,   // Dần
  'Nhâm': 5, 'Quý': 5,   // Tỵ
};

export const HOA_LINH_START_BY_YEAR_CHI: Record<number, { hoa: number; linh: number }> = {
  0: { hoa: 2, linh: 10 }, 4: { hoa: 2, linh: 10 }, 8: { hoa: 2, linh: 10 },
  2: { hoa: 1, linh: 3 },  6: { hoa: 1, linh: 3 },  10: { hoa: 1, linh: 3 },
  1: { hoa: 3, linh: 10 }, 5: { hoa: 3, linh: 10 }, 9: { hoa: 3, linh: 10 },
  3: { hoa: 9, linh: 10 }, 7: { hoa: 9, linh: 10 }, 11: { hoa: 9, linh: 10 },
};

export const TU_HOA_TABLE: Record<TenCan, [string, string, string, string]> = {
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

export const KINH_DUONG_BY_CAN: Record<TenCan, number> = {
  'Giáp': 3,
  'Ất': 4,
  'Bính': 6,
  'Mậu': 6,
  'Đinh': 7,
  'Kỷ': 7,
  'Canh': 9,
  'Tân': 10,
  'Nhâm': 0,
  'Quý': 1,
};

// ============================================================
// BẢNG ĐỘ SÁNG 14 CHÍNH TINH (M/V/Đ/B/H × 12 ĐỊA CHI)
// ============================================================
// NGUỒN: Học viện Lý số Hà Nội (chuẩn Nam Tông mà app theo từ đầu).
// chiIndex: 0=Tý, 1=Sửu, 2=Dần, 3=Mão, 4=Thìn, 5=Tỵ, 6=Ngọ, 7=Mùi, 8=Thân, 9=Dậu, 10=Tuất, 11=Hợi
//
// ⚠️ GHI CHÚ HỌC THUẬT (điều tra 2026-09 — xem tailieu/ kế hoạch GĐ3):
// Bảng miếu/vượng/đắc/bình/hãm KHÔNG phải công thức cố định mà là quy ước
// trường phái. Đối chiếu 4 nguồn độc lập cho 4 bảng khác nhau:
//   - iztro 2.6.0 (chuẩn 紫微斗數全書): lệch 54/70 mẫu runtime so với bảng này
//   - mangekj.com (bảng tra TQ): iztro cũng chỉ khớp 17/66 với nó
//   - horos.vn (VN hiện đại): vị trí Miếu khác cả iztro lẫn bảng này
// Ngay cả 2 nguồn Trung Hoa cũng không khớp nhau (《全书》 vs 《全集》 in bảng khác nhau).
// → App giữ chuẩn Lý số HN cho NHẤT QUÁN với fixtures + luận giải đã verify.
// → KHÔNG đổi bảng này khi không có quyết định đổi trường phái một cách tường minh.
// Bảng đã khóa bằng __tests__/BrightnessTable.test.ts (168 ô).

export const BRIGHTNESS: Record<string, StarBrightness[]> = {
  // [Tý, Sửu, Dần, Mão, Thìn, Tỵ, Ngọ, Mùi, Thân, Dậu, Tuất, Hợi]
  '紫微': ['Đ', 'Đ', 'Đ', 'Đ', 'Đ', 'M', 'M', 'V', 'Đ', 'H', 'V', 'Đ'],
  '天機': ['B', 'Đ', 'H', 'M', 'H', 'Đ', 'B', 'B', 'H', 'M', 'H', 'V'],
  '太陽': ['H', 'H', 'V', 'V', 'M', 'M', 'M', 'V', 'Đ', 'H', 'H', 'H'],
  '武曲': ['M', 'Đ', 'Đ', 'H', 'Đ', 'M', 'H', 'Đ', 'M', 'V', 'Đ', 'H'],
  '天同': ['V', 'H', 'V', 'V', 'H', 'H', 'H', 'M', 'M', 'H', 'H', 'M'],
  '廉貞': ['H', 'M', 'M', 'H', 'B', 'H', 'V', 'H', 'Đ', 'H', 'V', 'H'],
  '天府': ['M', 'M', 'Đ', 'Đ', 'M', 'Đ', 'M', 'M', 'Đ', 'V', 'M', 'Đ'],
  '太陰': ['M', 'V', 'H', 'H', 'H', 'H', 'H', 'H', 'V', 'M', 'Đ', 'V'],
  '貪狼': ['V', 'Đ', 'M', 'V', 'Đ', 'H', 'B', 'B', 'V', 'M', 'H', 'M'],
  '巨門': ['B', 'M', 'H', 'H', 'H', 'V', 'B', 'V', 'H', 'H', 'M', 'H'],
  '天相': ['M', 'Đ', 'V', 'Đ', 'M', 'Đ', 'M', 'Đ', 'V', 'Đ', 'M', 'Đ'],
  '天梁': ['M', 'V', 'V', 'H', 'M', 'H', 'V', 'V', 'H', 'H', 'M', 'H'],
  '七殺': ['M', 'H', 'V', 'H', 'H', 'M', 'M', 'H', 'V', 'H', 'H', 'M'],
  '破軍': ['V', 'H', 'H', 'V', 'M', 'V', 'H', 'V', 'V', 'V', 'V', 'H'],
};