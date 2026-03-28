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
 * Phân tích: Tính qua giá trị Can và Chi.
 * Can: Giáp,Ất=1 | Bính,Đinh=2 | Mậu,Kỷ=3 | Canh,Tân=4 | Nhâm,Quý=5
 * Chi: Tý,Sửu,Ngọ,Mùi=0 | Dần,Mão,Thân,Dậu=1 | Thìn,Tỵ,Tuất,Hợi=2
 * Cục = Can + Chi (Nếu > 5 thì trừ 5)
 * Ánh xạ Nạp Âm: 1->Kim(4), 2->Thủy(2), 3->Hỏa(6), 4->Thổ(5), 5->Mộc(3)
 */
export function calcNguHanhCuc(menhCan: TenCan, menhChi: TwoelveChi): NguHanhCuc {
  const canMap: Record<TenCan, number> = {
    'Giáp': 1, 'Ất': 1, 'Bính': 2, 'Đinh': 2, 'Mậu': 3, 
    'Kỷ': 3, 'Canh': 4, 'Tân': 4, 'Nhâm': 5, 'Quý': 5
  };
  const chiMap: Record<TwoelveChi, number> = {
    'Tý': 0, 'Sửu': 0, 'Ngọ': 0, 'Mùi': 0,
    'Dần': 1, 'Mão': 1, 'Thân': 1, 'Dậu': 1,
    'Thìn': 2, 'Tỵ': 2, 'Tuất': 2, 'Hợi': 2
  };

  let sum = canMap[menhCan] + chiMap[menhChi];
  if (sum > 5) sum -= 5;

  const nạpÂmMap: Record<number, NguHanhCuc> = {
    1: 4, // Kim Tứ Cục
    2: 2, // Thủy Nhị Cục
    3: 6, // Hỏa Lục Cục
    4: 5, // Thổ Ngũ Cục
    5: 3, // Mộc Tam Cục
  };

  return nạpÂmMap[sum] as NguHanhCuc;
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
