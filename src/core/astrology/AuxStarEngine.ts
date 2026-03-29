/**
 * AuxStarEngine.ts — An định các phụ tinh (Lục Cát, Lục Sát, sao cố định)
 * Source: .agents/skills/ziwei-algorithm/SKILL.md §9
 */

import type { Palace, Star, TenCan } from '../types/ZiweiTypes';
import { getStarNguHanh } from './NguHanhEngine';

// ============================================================
// BẢNG TRA CỨU PHỤ TINH
// ============================================================

/**
 * Thiên Khôi theo Thiên Can năm sinh
 * Source: SKILL.md §9 Lục Cát
 */
const THIEN_KHOI_BY_CAN: Record<TenCan, number> = {
  'Giáp': 1, 'Mậu': 1,        // Sửu (index 1)
  'Ất': 0, 'Kỷ': 0,           // Tý (index 0)
  'Bính': 11, 'Đinh': 11,     // Hợi (index 11)
  'Canh': 6, 'Tân': 6,        // Ngọ (index 6)
  'Nhâm': 3, 'Quý': 3,        // Mão (index 3)
};

/**
 * Lộc Tồn theo Thiên Can năm sinh
 * Giáp→Dần, Ất→Mão, Bính/Mậu→Tỵ, Đinh/Kỷ→Ngọ,
 * Canh→Thân, Tân→Dậu, Nhâm→Hợi, Quý→Tý
 */
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

/**
 * Kình Dương theo Thiên Can năm sinh
 * Source: SKILL.md §9 Lục Sát
 */
const KINH_DUONG_BY_CAN: Record<TenCan, number> = {
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

/**
 * Hỏa Tinh theo (Địa Chi năm, Địa Chi giờ)
 */
const HOA_TINH_TABLE: Record<number, number[]> = {
  2: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1],
  6: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1],
  10: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1],
  3: [3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2],
  7: [3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2],
  11: [3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2],
  0: [11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  4: [11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  8: [11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  1: [10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  5: [10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  9: [10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
};

const YEAR_CAN_ORDER: TenCan[] = ['Giáp','Ất','Bính','Đinh','Mậu','Kỷ','Canh','Tân','Nhâm','Quý'];

const TRIET_KHONG_BY_CAN: Record<TenCan, [number, number]> = {
  'Giáp': [8, 9],  // Thân, Dậu
  'Ất': [6, 7],    // Ngọ, Mùi
  'Bính': [4, 5],  // Thìn, Tỵ
  'Đinh': [2, 3],  // Dần, Mão
  'Mậu': [0, 1],   // Tý, Sửu
  'Kỷ': [8, 9],
  'Canh': [6, 7],
  'Tân': [4, 5],
  'Nhâm': [2, 3],
  'Quý': [0, 1],
};

const TUAN_KHONG_BY_XUN_INDEX: Array<[number, number]> = [
  [10, 11], // Giáp Tý tuần -> Tuất, Hợi không
  [8, 9],   // Giáp Tuất tuần -> Thân, Dậu không
  [6, 7],   // Giáp Thân tuần -> Ngọ, Mùi không
  [4, 5],   // Giáp Ngọ tuần -> Thìn, Tỵ không
  [2, 3],   // Giáp Thìn tuần -> Dần, Mão không
  [0, 1],   // Giáp Dần tuần -> Tý, Sửu không
];

// ============================================================
// HÀM TẠO SAO PHỤ
// ============================================================

function createAuxStar(
  name: string,
  chiIndex: number,
  category: Star['category'],
): Star {
  const normalizedIdx = ((chiIndex % 12) + 12) % 12;
  return {
    name,
    category,
    nguHanh: getStarNguHanh(name),
    brightness: '',
    palaceIndex: normalizedIdx,
  };
}

function placeAux(palaces: Palace[], starName: string, chiIndex: number, category: Star['category']): void {
  const idx = ((chiIndex % 12) + 12) % 12;
  palaces[idx]!.auxStars.push(createAuxStar(starName, idx, category));
}

function resolveSexagenaryIndex(yearCanIndex: number, yearChiIndex: number): number {
  for (let sexagenaryIndex = 0; sexagenaryIndex < 60; sexagenaryIndex += 1) {
    if (sexagenaryIndex % 10 === yearCanIndex && sexagenaryIndex % 12 === yearChiIndex) {
      return sexagenaryIndex;
    }
  }

  return 0;
}

// ============================================================
// AN LỤC CÁT TINH
// ============================================================

/**
 * An Lục Cát Tinh:
 * Tả Phù, Hữu Bật, Thiên Khôi, Thiên Việt, Văn Xương, Văn Khúc
 */
export function placeLucCatTinh(
  palaces: Palace[],
  lunarMonth: number,   // 1-12
  yearCanIndex: number, // 0-9
  hourChiIndex: number, // 0-11
): Palace[] {
  const result = palaces.map(p => ({ ...p, auxStars: [...p.auxStars] }));
  const yearCan = YEAR_CAN_ORDER[yearCanIndex]!;

  // Lộc Tồn: mốc neo cho vòng Bác Sĩ và nhiều sao phụ khác
  const locTonIdx = LOC_TON_BY_CAN[yearCan];
  placeAux(result, 'Lộc Tồn', locTonIdx, 'cat');

  // Tả Phù: Tháng 1 ở Dần(2), đếm thuận
  const taPhuIdx = (2 + lunarMonth - 1) % 12;
  placeAux(result, 'Tả Phù', taPhuIdx, 'support');

  // Hữu Bật: Tháng 1 ở Tuất(10), đếm ngược
  const huuBatIdx = ((10 - lunarMonth + 1) + 12) % 12;
  placeAux(result, 'Hữu Bật', huuBatIdx, 'support');

  // Thiên Khôi: theo Can năm
  const khoiIdx = THIEN_KHOI_BY_CAN[yearCan] ?? 1;
  placeAux(result, 'Thiên Khôi', khoiIdx, 'cat');

  // Thiên Việt: đối cung với Thiên Khôi
  const vietIdx = (khoiIdx + 6) % 12;
  placeAux(result, 'Thiên Việt', vietIdx, 'cat');

  // Văn Xương: Giờ Tý → Tuất(10), đếm ngược
  const xuongIdx = ((10 - hourChiIndex) + 12) % 12;
  placeAux(result, 'Văn Xương', xuongIdx, 'cat');

  // Văn Khúc: Giờ Tý → Thìn(4), đếm thuận
  const khucIdx = (4 + hourChiIndex) % 12;
  placeAux(result, 'Văn Khúc', khucIdx, 'cat');

  return result;
}

// ============================================================
// AN LỤC SÁT TINH
// ============================================================

/**
 * An Lục Sát Tinh:
 * Kình Dương, Đà La, Hỏa Tinh, Linh Tinh, Địa Không, Địa Kiếp
 */
export function placeLucSatTinh(
  palaces: Palace[],
  yearCanIndex: number, // 0-9
  yearChiIndex: number, // 0-11
  hourChiIndex: number, // 0-11
): Palace[] {
  const result = palaces.map(p => ({ ...p, auxStars: [...p.auxStars] }));
  const yearCan = YEAR_CAN_ORDER[yearCanIndex]!;

  // Kình Dương
  const kinhIdx = KINH_DUONG_BY_CAN[yearCan] ?? 6;
  placeAux(result, 'Kình Dương', kinhIdx, 'sha');

  // Đà La: trước Kình Dương 1 cung
  const daLaIdx = (kinhIdx - 1 + 12) % 12;
  placeAux(result, 'Đà La', daLaIdx, 'sha');

  const hoaTinhTable = HOA_TINH_TABLE[yearChiIndex];
  if (hoaTinhTable) {
    const hoaIdx = hoaTinhTable[hourChiIndex] ?? 0;
    placeAux(result, 'Hỏa Tinh', hoaIdx, 'sha');
    placeAux(result, 'Linh Tinh', (hoaIdx + 6) % 12, 'sha');
  }

  // Địa Không: Giờ Tý → Hợi(11), đếm ngược
  const diaKhongIdx = ((11 - hourChiIndex) + 12) % 12;
  placeAux(result, 'Địa Không', diaKhongIdx, 'sha');

  // Địa Kiếp: Giờ Tý → Hợi(11), đếm thuận
  const diaKiepIdx = (11 + hourChiIndex) % 12;
  placeAux(result, 'Địa Kiếp', diaKiepIdx, 'sha');

  return result;
}

// ============================================================
// SAO CỐ ĐỊNH + TUẦN KHÔNG / TRIỆT KHÔNG
// ============================================================

/**
 * An các sao cố định theo cung chức năng
 * Source: SKILL.md §9 Sao Cố Định
 */
export function placeFixedStars(palaces: Palace[]): Palace[] {
  const result = palaces.map(p => ({ ...p, auxStars: [...p.auxStars] }));

  // Thiên La: cố định tại Thìn (chiIndex=4)
  placeAux(result, 'Thiên La', 4, 'fixed');

  // Địa Võng: cố định tại Tuất (chiIndex=10)
  placeAux(result, 'Địa Võng', 10, 'fixed');

  // Thiên Thương: cố định tại cung Nô Bộc
  const noBocPalace = result.find(p => p.palaceName === 'Nô Bộc');
  if (noBocPalace) {
    placeAux(result, 'Thiên Thương', noBocPalace.chiIndex, 'fixed');
  }

  // Thiên Sứ: cố định tại cung Tật Ách
  const tatAchPalace = result.find(p => p.palaceName === 'Tật Ách');
  if (tatAchPalace) {
    placeAux(result, 'Thiên Sứ', tatAchPalace.chiIndex, 'fixed');
  }

  return result;
}

/**
 * Tính Tuần Không và Triệt Không
 * Tuần Không: 2 cung cuối trong vòng Tuần (60 hoa giáp)
 * Triệt Không: 2 cung theo Can năm
 *
 * Tính Tuần Không và Triệt Không từ năm Can Chi
 */
export function calcTuanTrietKhong(
  palaces: Palace[],
  yearCanIndex: number,
  yearChiIndex: number,
): Palace[] {
  const result = palaces.map(p => ({ ...p }));

  const sexagenaryIndex = resolveSexagenaryIndex(yearCanIndex, yearChiIndex);
  const xunIndex = Math.floor(sexagenaryIndex / 10);
  const [tuan1, tuan2] = TUAN_KHONG_BY_XUN_INDEX[xunIndex] ?? [10, 11];
  const yearCan = YEAR_CAN_ORDER[yearCanIndex]!;
  const [triet1, triet2] = TRIET_KHONG_BY_CAN[yearCan];

  if (result[tuan1]) result[tuan1]!.hasTuanKhong = true;
  if (result[tuan2]) result[tuan2]!.hasTuanKhong = true;
  if (result[triet1]) result[triet1]!.hasTrinhKhong = true;
  if (result[triet2]) result[triet2]!.hasTrinhKhong = true;

  return result;
}
