import type { TenCan } from '../types/ZiweiTypes';

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
