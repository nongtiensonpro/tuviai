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
 * Theo phép an cổ điển:
 * - Bắt đầu từ Dần là tháng Giêng, đếm thuận tới tháng sinh
 * - Từ điểm đó gọi là giờ Tý, tiếp tục đếm thuận tới giờ sinh
 */
export function calcThanChiIndex(lunarMonth: number, hourChiIndex: number): number {
  const thangChiIndex = (lunarMonth + 1) % 12;
  return (thangChiIndex + hourChiIndex) % 12;
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
    'Giáp-Tý': 4, 'Ất-Sửu': 4,
    'Nhâm-Dần': 4, 'Quý-Mão': 4,
    'Canh-Thìn': 4, 'Tân-Tỵ': 4,
    'Giáp-Ngọ': 4, 'Ất-Mùi': 4,
    'Nhâm-Thân': 4, 'Quý-Dậu': 4,
    'Canh-Tuất': 4, 'Tân-Hợi': 4,

    'Canh-Tý': 5, 'Tân-Sửu': 5,
    'Mậu-Dần': 5, 'Kỷ-Mão': 5,
    'Bính-Thìn': 5, 'Đinh-Tỵ': 5,
    'Canh-Ngọ': 5, 'Tân-Mùi': 5,
    'Mậu-Thân': 5, 'Kỷ-Dậu': 5,
    'Bính-Tuất': 5, 'Đinh-Hợi': 5,

    'Mậu-Tý': 6, 'Kỷ-Sửu': 6,
    'Bính-Dần': 6, 'Đinh-Mão': 6,
    'Giáp-Thìn': 6, 'Ất-Tỵ': 6,
    'Mậu-Ngọ': 6, 'Kỷ-Mùi': 6,
    'Bính-Thân': 6, 'Đinh-Dậu': 6,
    'Giáp-Tuất': 6, 'Ất-Hợi': 6,

    'Nhâm-Tý': 3, 'Quý-Sửu': 3,
    'Canh-Dần': 3, 'Tân-Mão': 3,
    'Mậu-Thìn': 3, 'Kỷ-Tỵ': 3,
    'Nhâm-Ngọ': 3, 'Quý-Mùi': 3,
    'Canh-Thân': 3, 'Tân-Dậu': 3,
    'Mậu-Tuất': 3, 'Kỷ-Hợi': 3,

    'Bính-Tý': 2, 'Đinh-Sửu': 2,
    'Giáp-Dần': 2, 'Ất-Mão': 2,
    'Nhâm-Thìn': 2, 'Quý-Tỵ': 2,
    'Bính-Ngọ': 2, 'Đinh-Mùi': 2,
    'Giáp-Thân': 2, 'Ất-Dậu': 2,
    'Nhâm-Tuất': 2, 'Quý-Hợi': 2,
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
      hasTrietKhong: false,
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
