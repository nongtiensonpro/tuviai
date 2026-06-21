/**
 * AnnualEngine.ts — Engine an định các Lưu Sao và Tiểu Vận (Hạn năm)
 * Source: .agents/skills/ziwei-algorithm/SKILL.md §9 & Phase 4
 */

import type { ZiweiChart, AnnualPalace, AnnualChart, Star, TenCan, TwoelveChi, SihuaTrigger } from '../types/ZiweiTypes';
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

import {
  LOC_TON_BY_CAN,
  THIEN_MA_BY_YEAR_CHI,
  DAO_HOA_BY_YEAR_CHI,
  THIEN_KHOI_BY_CAN,
  THIEN_VIET_BY_CAN,
  HOA_LINH_START_BY_YEAR_CHI,
  TU_HOA_TABLE
} from './StarConstants';

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

  // - Lưu Hồng Loan
  const luuHongLoanIdx = (3 - luuChiIndex + 12) % 12;
  annualStars.push(createAnnualStar('Lưu Hồng Loan', luuHongLoanIdx));

  // - Lưu Thiên Hỷ
  const luuThienHyIdx = (luuHongLoanIdx + 6) % 12;
  annualStars.push(createAnnualStar('Lưu Thiên Hỷ', luuThienHyIdx));

  // - Lưu Tang Môn
  const luuTangMonIdx = (luuThaiTueIdx + 2) % 12;
  annualStars.push(createAnnualStar('Lưu Tang Môn', luuTangMonIdx));

  // - Lưu Bạch Hổ
  const luuBachHoIdx = (luuThaiTueIdx + 8) % 12;
  annualStars.push(createAnnualStar('Lưu Bạch Hổ', luuBachHoIdx));

  // - Lưu Quan Phù
  const luuQuanPhuIdx = (luuThaiTueIdx + 4) % 12;
  annualStars.push(createAnnualStar('Lưu Quan Phù', luuQuanPhuIdx));

  // - Lưu Đào Hoa
  const luuDaoHoaIdx = DAO_HOA_BY_YEAR_CHI[luuChiIndex] ?? 3;
  annualStars.push(createAnnualStar('Lưu Đào Hoa', luuDaoHoaIdx));

  // - Lưu Thiên Khôi
  const luuThienKhoiIdx = THIEN_KHOI_BY_CAN[luuCan] ?? 1;
  annualStars.push(createAnnualStar('Lưu Thiên Khôi', luuThienKhoiIdx));

  // - Lưu Thiên Việt
  const luuThienVietIdx = THIEN_VIET_BY_CAN[luuCan] ?? 7;
  annualStars.push(createAnnualStar('Lưu Thiên Việt', luuThienVietIdx));

  // - Lưu Hỏa Tinh
  const hourChiIdx = chart.lunarDate.hourChiIndex;
  const luuHoaStart = HOA_LINH_START_BY_YEAR_CHI[luuChiIndex]?.hoa ?? 2;
  const luuHoaTinhIdx = (luuHoaStart + hourChiIdx) % 12;
  annualStars.push(createAnnualStar('Lưu Hỏa Tinh', luuHoaTinhIdx));

  // - Lưu Linh Tinh
  const luuLinhStart = HOA_LINH_START_BY_YEAR_CHI[luuChiIndex]?.linh ?? 10;
  const luuLinhTinhIdx = (luuLinhStart + hourChiIdx) % 12;
  annualStars.push(createAnnualStar('Lưu Linh Tinh', luuLinhTinhIdx));

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

    const annualSihuaInPalace: SihuaTrigger[] = [];

    // Áp dụng Lưu Tứ Hóa vào các sao gốc trong cung
    if (sihuaStars) {
      for (let i = 0; i < 4; i++) {
        const starName = sihuaStars[i]!;
        const sihuaType = SIHUA_TYPES[i]!;

        // Check chính tinh
        let found = false;
        for (const s of copiedMainStars) {
          if (s.name === starName) {
            s.sihua = sihuaType; 
            found = true;
          }
        }

        // Check phụ tinh
        for (const s of copiedAuxStars) {
          if (s.name === starName) {
            s.sihua = sihuaType;
            found = true;
          }
        }

        if (found) {
          annualSihuaInPalace.push({
            starName,
            type: sihuaType,
            fromYear: false,
          });
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
      annualSihua: annualSihuaInPalace,
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
