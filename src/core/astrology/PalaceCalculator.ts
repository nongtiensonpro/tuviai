/**
 * PalaceCalculator.ts — Định vị 12 cung và tính Ngũ Hành Nạp Âm Cục
 * Xem: .agents/skills/ziwei-algorithm/SKILL.md §3, §4, §5
 */

import type {
  TenCan, TwoelveChi, NguHanhCuc, TenCuc,
  PalaceName, Palace, LunarDate, NamCanChi
} from '../types/ZiweiTypes';
import {
  TWELVE_CHI, CUC_NAME, PALACE_NAMES_ORDER
} from '../types/ZiweiTypes';
import { getCungMenhCan } from '../calendar/LunarConverter';

// ============================================================
// HÀM TÍNH CUNG MỆNH VÀ CỤC
// ============================================================

/**
 * Tính index Địa Chi của Cung Mệnh
 * Source: SKILL.md §3
 *
 * Thuật toán:
 * - Tháng 1 âm lịch = cung Dần (chiIndex=2)
 * - Đếm thuận theo tháng: tháng N → chiIndex = (1 + N) % 12
 * - Từ đó đếm ngược theo giờ sinh: menhChi = thangChi - hourChiIndex (mod 12)
 */
export function calcMenhChiIndex(lunarMonth: number, hourChiIndex: number): number {
  // Tháng 1 = Dần(2), Tháng 2 = Mão(3)... Tháng 12 = Sửu(1)
  const thangChiIndex = (lunarMonth + 1) % 12;
  // Đi ngược chiều giờ sinh
  return ((thangChiIndex - hourChiIndex) + 12) % 12;
}

/**
 * Tính index Địa Chi của Cung Thân
 * Cung Thân bắt đầu từ Dần(2) với Tháng 1, đếm thuận
 * Tháng 1→Dần, Tháng 2→Thân, Tháng 3→Mão... => pattern khác
 *
 * Quy tắc cụ thể:
 * Cung Thân: Tháng 1,7=Dần; Tháng 2,8=Thân; Tháng 3,9=Tý;
 *            Tháng 4,10=Ngọ; Tháng 5,11=Mão; Tháng 6,12=Dậu
 */
export function calcThanChiIndex(lunarMonth: number): number {
  // Mảng 12 vị trí cung Thân theo tháng (1-indexed)
  const THAN_BY_MONTH: number[] = [
    0,  // placeholder
    2,  // Tháng 1: Dần
    8,  // Tháng 2: Thân
    0,  // Tháng 3: Tý
    6,  // Tháng 4: Ngọ
    3,  // Tháng 5: Mão
    9,  // Tháng 6: Dậu
    2,  // Tháng 7: Dần
    8,  // Tháng 8: Thân
    0,  // Tháng 9: Tý
    6,  // Tháng 10: Ngọ
    3,  // Tháng 11: Mão
    9,  // Tháng 12: Dậu
  ];
  return THAN_BY_MONTH[lunarMonth] ?? 2;
}

// ============================================================
// NGŨ HÀNH NẠP ÂM CỤC
// ============================================================

/**
 * Tính Ngũ Hành Nạp Âm Cục của Cung Mệnh
 * Tra bảng theo Thiên Can và Địa Chi của Cung Mệnh.
 * Xem SKILL.md §5
 */
export function calcNguHanhCuc(menhCan: TenCan, menhChi: TwoelveChi): NguHanhCuc {
  const key = `${menhCan}-${menhChi}`;
  
  const NAP_AM_CUC: Record<string, NguHanhCuc> = {
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

  return (NAP_AM_CUC[key] ?? 2) as NguHanhCuc;
}

export function getTenCuc(cuc: NguHanhCuc): TenCuc {
  return CUC_NAME[cuc];
}

// ============================================================
// XÂY DỰNG 12 CUNG
// ============================================================

/**
 * Tạo array 12 cung cơ bản, chưa có sao
 * - palaces[i] = cung có Địa Chi index = i (i=0→Tý, 1→Sửu,...)
 * - Cung Mệnh tại menhChiIndex, các cung còn lại điền ngược chiều kim đồng hồ
 *   (chiều ngược = chiIndex tăng dần → thực ra là đếm xuôi array)
 *
 * Thứ tự cung chức năng (ngược kim đồng hồ trên mệnh bàn = chiIndex tăng):
 * Mệnh(0) → Phụ Mẫu(+1) → Phúc Đức(+2) → ... → Huynh Đệ(+11)
 */
export function buildPalaces(
  menhChiIndex: number,
  namCanChi: NamCanChi,
  yearCanIndex: number,
): Palace[] {
  const palaces: Palace[] = [];

  for (let chiIdxInCycle = 0; chiIdxInCycle < 12; chiIdxInCycle++) {
    // chiIndex thực của cung này
    const chiIndex = chiIdxInCycle;
    const chi = TWELVE_CHI[chiIndex] as TwoelveChi;

    // Tên cung chức năng: offset từ Cung Mệnh theo chiều tăng chiIndex
    const palaceOffset = (chiIndex - menhChiIndex + 12) % 12;
    const palaceName = PALACE_NAMES_ORDER[palaceOffset] as PalaceName;

    // Thiên Can của cung: tính từ Can Dần + offset
    const { can, canIndex } = getCungMenhCan(chiIndex, yearCanIndex);

    palaces.push({
      chiIndex,
      chi,
      can,
      canIndex,
      palaceName,
      mainStars: [],
      auxStars: [],
      borrowedStars: [],
      sihua: [],
      trangSinh: '',
      daiHan: 0,
      isThanPalace: false,
      hasTuanKhong: false,
      hasTrinhKhong: false,
    });
  }

  return palaces;
}

/**
 * Tiện ích: Lấy Palace theo tên cung chức năng
 */
export function getPalaceByName(palaces: Palace[], name: PalaceName): Palace | undefined {
  return palaces.find(p => p.palaceName === name);
}

/**
 * Tiện ích: Lấy Palace tại chiIndex cụ thể
 */
export function getPalaceByChiIndex(palaces: Palace[], chiIndex: number): Palace {
  return palaces[chiIndex]!;
}
