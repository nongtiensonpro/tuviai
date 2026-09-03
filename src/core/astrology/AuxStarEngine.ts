/**
 * AuxStarEngine.ts — An định các phụ tinh (Lục Cát, Lục Sát, sao cố định)
 * Trường phái: Nam Tông (Tam Hợp) — verified qua lasotuvi.com
 * Source: .agents/skills/ziwei-algorithm/SKILL.md §9
 *
 * Quyết định trường phái quan trọng:
 * - Hỏa Tinh/Linh Tinh: Luôn đếm THUẬN từ cung khởi (không phân biệt Dương Nam/Âm Nữ).
 *   Đây là cách an khớp lasotuvi.com, đã verify qua 131+ test cases.
 *   Một số sách phân biệt chiều đi theo giới tính nhưng app này chọn cách thuận nhất quán.
 * - Cặp Lục Sát "Không-Kiếp" gọi là "Địa Không + Địa Kiếp" (chuẩn Nam Phái đa số sách).
 */

import type { Palace, Star, TenCan } from '../types/ZiweiTypes';
import { getStarNguHanh } from './NguHanhEngine';
import {
  THIEN_KHOI_BY_CAN,
  THIEN_VIET_BY_CAN,
  LOC_TON_BY_CAN,
  KINH_DUONG_BY_CAN,
  HOA_LINH_START_BY_YEAR_CHI
} from './StarConstants';

// ============================================================
// BẢNG TRA CỨU PHỤ TINH
// ============================================================

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

function placeAuxOnce(palaces: Palace[], starName: string, chiIndex: number, category: Star['category']): void {
  const idx = ((chiIndex % 12) + 12) % 12;
  if (!palaces[idx]!.auxStars.some(star => star.name === starName)) {
    placeAux(palaces, starName, idx, category);
  }
}

function resolveSexagenaryIndex(yearCanIndex: number, yearChiIndex: number): number {
  for (let sexagenaryIndex = 0; sexagenaryIndex < 60; sexagenaryIndex += 1) {
    if (sexagenaryIndex % 10 === yearCanIndex && sexagenaryIndex % 12 === yearChiIndex) {
      return sexagenaryIndex;
    }
  }

  // Can/Chi không cùng parity (vd Giáp-Sửu) là dữ liệu vô hiệu — fail-fast thay vì
  // âm thầm trả Giáp Tý (0) khiến Tuần Không an sai cung.
  throw new Error(
    `resolveSexagenaryIndex: invalid Can/Chi pair (canIndex=${yearCanIndex}, chiIndex=${yearChiIndex})`,
  );
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

  // Tả Phù: Tháng 1 ở Thìn(4), đếm thuận
  const taPhuIdx = (4 + lunarMonth - 1) % 12;
  placeAux(result, 'Tả Phù', taPhuIdx, 'support');

  // Hữu Bật: Tháng 1 ở Tuất(10), đếm ngược
  const huuBatIdx = ((10 - lunarMonth + 1) + 12) % 12;
  placeAux(result, 'Hữu Bật', huuBatIdx, 'support');

  // Thiên Khôi: theo Can năm
  const khoiIdx = THIEN_KHOI_BY_CAN[yearCan] ?? 1;
  placeAux(result, 'Thiên Khôi', khoiIdx, 'cat');

  // Thiên Việt: theo Can năm
  const vietIdx = THIEN_VIET_BY_CAN[yearCan] ?? 7;
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

  const hoaLinhStart = HOA_LINH_START_BY_YEAR_CHI[yearChiIndex];
  if (hoaLinhStart) {
    const hoaIdx = (hoaLinhStart.hoa + hourChiIndex) % 12;
    const linhIdx = (hoaLinhStart.linh + hourChiIndex) % 12;
    placeAux(result, 'Hỏa Tinh', hoaIdx, 'sha');
    placeAux(result, 'Linh Tinh', linhIdx, 'sha');
  }

  // Địa Không: khởi từ Hợi, lấy giờ Tý, đếm ngược tới giờ sinh
  const diaKhongIdx = ((11 - hourChiIndex) + 12) % 12;
  placeAux(result, 'Địa Không', diaKhongIdx, 'sha');

  // Địa Kiếp: khởi từ Hợi, lấy giờ Tý, đếm thuận tới giờ sinh
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
  const result = palaces.map(p => ({ ...p, auxStars: [...p.auxStars] }));

  const sexagenaryIndex = resolveSexagenaryIndex(yearCanIndex, yearChiIndex);
  const xunIndex = Math.floor(sexagenaryIndex / 10);
  const [tuan1, tuan2] = TUAN_KHONG_BY_XUN_INDEX[xunIndex] ?? [10, 11];
  const yearCan = YEAR_CAN_ORDER[yearCanIndex]!;
  const [triet1, triet2] = TRIET_KHONG_BY_CAN[yearCan];

  if (result[tuan1]) result[tuan1]!.hasTuanKhong = true;
  if (result[tuan2]) result[tuan2]!.hasTuanKhong = true;
  if (result[triet1]) result[triet1]!.hasTrietKhong = true;
  if (result[triet2]) result[triet2]!.hasTrietKhong = true;
  placeAuxOnce(result, 'Tuần Không', tuan1, 'fixed');
  placeAuxOnce(result, 'Tuần Không', tuan2, 'fixed');
  placeAuxOnce(result, 'Triệt Không', triet1, 'fixed');
  placeAuxOnce(result, 'Triệt Không', triet2, 'fixed');

  return result;
}
