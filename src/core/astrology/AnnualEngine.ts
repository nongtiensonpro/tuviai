/**
 * AnnualEngine.ts — Engine an định các Lưu Sao và Tiểu Vận (Hạn năm)
 * Source: .agents/skills/ziwei-algorithm/SKILL.md §9 & Phase 4
 */

import type { ZiweiChart, AnnualPalace, AnnualChart, Star, TenCan, TwoelveChi } from '../types/ZiweiTypes';
import { TEN_CAN, TWELVE_CHI } from '../types/ZiweiTypes';
import { getYearCanChi } from '../calendar/LunarConverter';
import { getStarNguHanh } from './NguHanhEngine';

// ============================================================
// BẢNG TRA CỨU
// ============================================================

const TIEU_VAN_START_BY_YEAR_CHI: Record<number, number> = {
  2: 4, 6: 4, 10: 4,     // Dần, Ngọ, Tuất -> Thìn (index 4)
  8: 10, 0: 10, 4: 10,   // Thân, Tý, Thìn -> Tuất (index 10)
  5: 7, 9: 7, 1: 7,      // Tỵ, Dậu, Sửu -> Mùi (index 7)
  11: 1, 3: 1, 7: 1,     // Hợi, Mão, Mùi -> Sửu (index 1)
};

const LOC_TON_BY_CAN: Record<TenCan, number> = {
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

const THIEN_MA_BY_YEAR_CHI: Record<number, number> = {
  0: 2, 1: 11, 2: 8, 3: 5, 4: 2, 5: 11,
  6: 8, 7: 5, 8: 2, 9: 11, 10: 8, 11: 5,
};

const TU_HOA_TABLE: Record<TenCan, [string, string, string, string]> = {
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

const SIHUA_TYPES: ('Lộc' | 'Quyền' | 'Khoa' | 'Kỵ')[] = ['Lộc', 'Quyền', 'Khoa', 'Kỵ'];

// ============================================================
// HÀM TẠO LƯU SAO
// ============================================================

function createAnnualStar(name: string, palaceIndex: number): Star {
  const normIdx = ((palaceIndex % 12) + 12) % 12;
  return {
    name,
    category: 'other',
    nguHanh: getStarNguHanh(name.replace('Lưu ', '')),
    brightness: '',
    palaceIndex: normIdx,
  };
}

// ============================================================
// HÀM TÍNH TOÁN CHÍNH
// ============================================================

/**
 * Tính toán và lập lá số Hạn năm (Tiểu Vận & Lưu Niên) cho một năm mục tiêu
 *
 * @param chart - Bản gốc Mệnh bàn của đương số
 * @param targetYear - Năm Dương lịch muốn xem hạn (ví dụ: 2026)
 * @returns AnnualChart đầy đủ thông tin Tiểu Vận, Lưu Thái Tuế và các Lưu Sao
 */
export function buildAnnualChart(chart: ZiweiChart, targetYear: number): AnnualChart {
  const targetAge = targetYear - chart.lunarDate.year + 1;
  if (targetAge < 1) {
    throw new Error('Target year must be greater than or equal to birth year');
  }

  // 1. Tìm thông tin Can Chi của năm hạn đang xét
  const luuCanChi = getYearCanChi(targetYear);
  const luuCan = luuCanChi.can;
  const luuChiIndex = luuCanChi.chiIndex;

  // 2. Tính vị trí Cung Tiểu Vận
  const birthYearChiIdx = chart.namCanChi.chiIndex;
  const startIdx = TIEU_VAN_START_BY_YEAR_CHI[birthYearChiIdx] ?? 4;
  const isMale = chart.gender === 'male';

  let tieuVanIdx: number;
  if (isMale) {
    tieuVanIdx = (startIdx + (targetAge - 1)) % 12;
  } else {
    tieuVanIdx = ((startIdx - (targetAge - 1)) % 12 + 12) % 12;
  }

  // 3. Tính vị trí Cung Lưu Thái Tuế (trùng với Địa Chi của năm hạn)
  const luuThaiTueIdx = luuChiIndex;

  // 4. Khởi tạo danh sách Lưu Sao
  const annualStars: Star[] = [];

  // - Lưu Thái Tuế
  annualStars.push(createAnnualStar('Lưu Thái Tuế', luuThaiTueIdx));

  // - Lưu Lộc Tồn
  const luuLocTonIdx = LOC_TON_BY_CAN[luuCan] ?? 2;
  annualStars.push(createAnnualStar('Lưu Lộc Tồn', luuLocTonIdx));

  // - Lưu Kình Dương (sau Lưu Lộc Tồn 1 cung)
  annualStars.push(createAnnualStar('Lưu Kình Dương', luuLocTonIdx + 1));

  // - Lưu Đà La (trước Lưu Lộc Tồn 1 cung)
  annualStars.push(createAnnualStar('Lưu Đà La', luuLocTonIdx - 1 + 12));

  // - Lưu Thiên Mã
  const luuThienMaIdx = THIEN_MA_BY_YEAR_CHI[luuChiIndex] ?? 8;
  annualStars.push(createAnnualStar('Lưu Thiên Mã', luuThienMaIdx));

  // - Lưu Thiên Khốc
  const luuThienKhocIdx = (6 - luuChiIndex + 12) % 12;
  annualStars.push(createAnnualStar('Lưu Thiên Khốc', luuThienKhocIdx));

  // - Lưu Thiên Hư
  const luuThienHuIdx = (6 + luuChiIndex) % 12;
  annualStars.push(createAnnualStar('Lưu Thiên Hư', luuThienHuIdx));

  // 5. Tính toán Lưu Tứ Hóa và gắn vào các chính tinh / phụ tinh gốc
  const sihuaStars = TU_HOA_TABLE[luuCan];

  // Map 12 cung của Mệnh bàn sang 12 cung Hạn niên
  const palaces: AnnualPalace[] = chart.palaces.map(p => {
    const isPalaceTieuVan = p.chiIndex === tieuVanIdx;
    const isPalaceLuuThaiTue = p.chiIndex === luuThaiTueIdx;

    // Lọc lấy các Lưu Sao thuộc cung này
    const starsInPalace = annualStars.filter(s => s.palaceIndex === p.chiIndex);

    // Nhân bản danh sách sao gốc để không đột biến bản gốc
    const copiedMainStars = p.mainStars.map(s => ({ ...s }));
    const copiedAuxStars = p.auxStars.map(s => ({ ...s }));

    // Áp dụng Lưu Tứ Hóa vào các sao gốc trong cung
    if (sihuaStars) {
      for (let i = 0; i < 4; i++) {
        const starName = sihuaStars[i]!;
        const sihuaType = SIHUA_TYPES[i]!;

        // Check chính tinh
        for (const s of copiedMainStars) {
          if (s.name === starName) {
            // Chúng ta lưu Tứ Hóa Lưu vào một property mới để tránh ghi đè lên Tứ Hóa Gốc
            s.sihua = sihuaType; 
          }
        }

        // Check phụ tinh
        for (const s of copiedAuxStars) {
          if (s.name === starName) {
            s.sihua = sihuaType;
          }
        }
      }
    }

    return {
      chiIndex: p.chiIndex,
      chi: p.chi,
      palaceName: p.palaceName,
      daiHan: p.daiHan,
      isTieuVan: isPalaceTieuVan,
      isLuuThaiTue: isPalaceLuuThaiTue,
      tieuVanAge: isPalaceTieuVan ? targetAge : undefined,
      annualStars: starsInPalace,
      mainStars: copiedMainStars,
      auxStars: copiedAuxStars,
    };
  });

  return {
    targetYear,
    targetAge,
    tieuVanPalaceIndex: tieuVanIdx,
    luuThaiTuePalaceIndex: luuThaiTueIdx,
    palaces,
  };
}
