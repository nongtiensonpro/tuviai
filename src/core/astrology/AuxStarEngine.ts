/**
 * AuxStarEngine.ts — An định các phụ tinh (Lục Cát, Lục Sát, sao cố định)
 * Source: .agents/skills/ziwei-algorithm/SKILL.md §9
 */

import type { Palace, Star, TenCan, TwoelveChi } from '../types/ZiweiTypes';

// ============================================================
// BẢNG TRA CỨU PHỤ TINH
// ============================================================

/**
 * Thiên Khôi theo Thiên Can năm sinh
 * Source: SKILL.md §9 Lục Cát
 */
const THIEN_KHOI_BY_CAN: Record<string, number> = {
  'Giáp': 1, 'Mậu': 1,        // Sửu (index 1)
  'Ất': 0, 'Kỷ': 0,           // Tý (index 0)
  'Bính': 11, 'Đinh': 11,     // Hợi (index 11)
  'Canh': 6, 'Tân': 6,        // Ngọ (index 6)
  'Nhâm': 3, 'Quý': 3,        // Mão (index 3)
};

/**
 * Kình Dương theo Thiên Can năm sinh
 * Source: SKILL.md §9 Lục Sát
 */
const KINH_DUONG_BY_CAN: Record<string, number> = {
  'Giáp': 3,  // Mão (3)
  'Ất': 4,    // Thìn (4)
  'Bính': 6,  // Ngọ (6) — Bính/Mậu
  'Mậu': 6,
  'Đinh': 7,  // Mùi (7) — Đinh/Kỷ
  'Kỷ': 7,
  'Canh': 9,  // Dậu (9)
  'Tân': 10,  // Tuất (10)
  'Nhâm': 0,  // Tý (0)
  'Quý': 1,   // Sửu (1)
};

/**
 * Hỏa Tinh theo (Địa Chi năm, Địa Chi giờ)
 * Source: tham khảo truyền thống Tử Vi Đẩu Số
 * Bảng: HoaTinh[yearChiIndex][hourChiIndex] = chiIndex
 */
const HOA_TINH_TABLE: Record<number, number[]> = {
  // yearChi: [Tý,Sửu,Dần,Mão,Thìn,Tỵ,Ngọ,Mùi,Thân,Dậu,Tuất,Hợi] = chiIndex Hỏa Tinh theo giờ
  2: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1],    // Dần, Ngọ, Tuất năm (chiChi=2,6,10)
  6: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1],
  10: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1],
  3: [3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2],    // Mão, Mùi, Hợi năm (chiChi=3,7,11)
  7: [3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2],
  11: [3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2],
  0: [11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],    // Tý, Thìn, Thân năm (chiChi=0,4,8)
  4: [11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  8: [11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  1: [10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9],    // Sửu, Tỵ, Dậu năm (chiChi=1,5,9)
  5: [10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  9: [10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
};

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
    brightness: '',
    palaceIndex: normalizedIdx,
  };
}

function placeAux(palaces: Palace[], starName: string, chiIndex: number, category: Star['category']): void {
  const idx = ((chiIndex % 12) + 12) % 12;
  palaces[idx]!.auxStars.push(createAuxStar(starName, idx, category));
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
  const yearCan = ['Giáp','Ất','Bính','Đinh','Mậu','Kỷ','Canh','Tân','Nhâm','Quý'][yearCanIndex]!;

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
  const yearCan = ['Giáp','Ất','Bính','Đinh','Mậu','Kỷ','Canh','Tân','Nhâm','Quý'][yearCanIndex]!;

  // Kình Dương
  const kinhIdx = KINH_DUONG_BY_CAN[yearCan] ?? 6;
  placeAux(result, 'Kình Dương', kinhIdx, 'sha');

  // Đà La: trước Kình Dương 1 cung
  const daLaIdx = (kinhIdx - 1 + 12) % 12;
  placeAux(result, 'Đà La', daLaIdx, 'sha');

  // Hỏa Tinh: theo bảng (năm Chi × giờ Chi)
  const hoaTinhTable = HOA_TINH_TABLE[yearChiIndex];
  if (hoaTinhTable) {
    const hoaIdx = hoaTinhTable[hourChiIndex] ?? 0;
    placeAux(result, 'Hỏa Tinh', hoaIdx, 'sha');

    // Linh Tinh: đối cung với Hỏa Tinh
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
 * Đây là tính năng nâng cao — implement cơ bản
 */
export function calcTuanTrietKhong(
  palaces: Palace[],
  yearCanIndex: number,
  yearChiIndex: number,
): Palace[] {
  const result = palaces.map(p => ({ ...p }));

  // Tuần = vị trí trong chu kỳ 60 = (canIndex * 12 + chiIndex) / 10 → bắt đầu Tuần
  // Tuần Không = chiIndex của 2 cung bị bỏ qua trong Tuần đó
  const tuanStart = yearCanIndex; // Simplified: từ Can năm
  const tuan1 = ((10 - tuanStart) + yearChiIndex) % 12;
  const tuan2 = (tuan1 + 1) % 12;

  if (result[tuan1]) result[tuan1]!.hasTuanKhong = true;
  if (result[tuan2]) result[tuan2]!.hasTuanKhong = true;

  return result;
}
