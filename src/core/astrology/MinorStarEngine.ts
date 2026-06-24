/**
 * MinorStarEngine.ts — Engine an định các Bàng Tinh, Tạp Diệu (121 sao Tử Vi Đẩu Số)
 * Bao gồm: Vòng Thái Tuế, Vòng Lộc Tồn (Bác sĩ), Nhật Nguyệt Thời Tuế Hệ sao, Vòng Tướng Tinh.
 * Được tái cấu trúc trong Milestone 4 để tối ưu hóa tính an toàn (immutability) và khả năng kiểm toán.
 */

import type { Palace, Star } from '../types/ZiweiTypes';
import { getStarNguHanh } from './NguHanhEngine';
import { DAO_HOA_BY_YEAR_CHI, THIEN_MA_BY_YEAR_CHI } from './StarConstants';

// ============================================================
// BẢNG TRA CỨU TĨNH HỌC THUẬT (Nam Phái Tam Hợp)
// ============================================================

const CO_THAN_BY_YEAR_CHI: Readonly<Record<number, number>> = {
  0: 2, 1: 2, 2: 5, 3: 5, 4: 5, 5: 8,
  6: 8, 7: 8, 8: 11, 9: 11, 10: 11, 11: 2,
};

const QUA_TU_BY_YEAR_CHI: Readonly<Record<number, number>> = {
  0: 10, 1: 10, 2: 1, 3: 1, 4: 1, 5: 4,
  6: 4, 7: 4, 8: 7, 9: 7, 10: 7, 11: 10,
};

const KIEP_SAT_BY_YEAR_CHI: Readonly<Record<number, number>> = {
  0: 5, 1: 2, 2: 11, 3: 8, 4: 5, 5: 2,
  6: 11, 7: 8, 8: 5, 9: 2, 10: 11, 11: 8,
};

const HOA_CAI_BY_YEAR_CHI: Readonly<Record<number, number>> = {
  0: 4, 1: 1, 2: 10, 3: 7, 4: 4, 5: 1,
  6: 10, 7: 7, 8: 4, 9: 1, 10: 10, 11: 7,
};

const PHA_TOAI_BY_YEAR_CHI: Readonly<Record<number, number>> = {
  0: 5, 1: 1, 2: 9, 3: 5, 4: 1, 5: 9,
  6: 5, 7: 1, 8: 9, 9: 5, 10: 1, 11: 9,
};

// ============================================================
// HÀM HELPER KHỞI TẠO VÀ CHÈN SAO
// ============================================================

function createMinorStar(name: string, palaceIndex: number, category: Star['category'] = 'fixed'): Star {
  return {
    name,
    category,
    nguHanh: getStarNguHanh(name),
    brightness: '',
    palaceIndex: ((palaceIndex % 12) + 12) % 12,
  };
}

function placeStar(palaces: Palace[], name: string, idx: number, category: Star['category'] = 'fixed'): void {
  const normIdx = ((idx % 12) + 12) % 12;
  palaces[normIdx]!.auxStars.push(createMinorStar(name, normIdx, category));
}

// ============================================================
// HÀM HELPER AN SAO DÙNG CHUNG (Milestone 4 Refactoring)
// ============================================================

/**
 * Helper an vòng 12 sao thuận hoặc nghịch.
 * @param offsets Mảng vị trí lệch nếu chỉ an các sao lẻ không liên tục (ví dụ: vòng Tướng Tinh)
 */
function placeVongStars(
  palaces: Palace[],
  startIdx: number,
  starNames: string[],
  isThuan: boolean,
  category: Star['category'] = 'fixed',
  offsets?: number[]
): void {
  for (let i = 0; i < starNames.length; i++) {
    const starName = starNames[i];
    if (!starName) continue;
    const offset = offsets ? offsets[i]! : i;
    const idx = isThuan ? (startIdx + offset) : (startIdx - offset + 12);
    placeStar(palaces, starName, idx, category);
  }
}

/**
 * Helper an sao theo Thiên Can năm sinh.
 */
function placeStarByCan(
  palaces: Palace[],
  starName: string,
  yearCanIdx: number,
  map: number[] | Record<number, number>,
  category: Star['category'] = 'fixed'
): void {
  const idx = (map as any)[yearCanIdx];
  if (idx !== undefined) {
    placeStar(palaces, starName, idx, category);
  }
}

/**
 * Helper an sao theo Địa Chi năm sinh.
 */
function placeStarByChi(
  palaces: Palace[],
  starName: string,
  yearChiIdx: number,
  formulaOrMap: number | ((chi: number) => number) | Record<number, number> | number[],
  category: Star['category'] = 'fixed'
): void {
  let idx: number;
  if (typeof formulaOrMap === 'function') {
    idx = formulaOrMap(yearChiIdx);
  } else if (Array.isArray(formulaOrMap) || typeof formulaOrMap === 'object') {
    idx = (formulaOrMap as any)[yearChiIdx];
  } else {
    idx = formulaOrMap;
  }
  placeStar(palaces, starName, idx, category);
}

/**
 * Helper an sao theo Tháng sinh âm lịch.
 */
function placeStarByMonth(
  palaces: Palace[],
  starName: string,
  month: number,
  formulaOrMap: ((m: number) => number) | Record<number, number> | number[],
  category: Star['category'] = 'fixed'
): void {
  let idx: number;
  if (typeof formulaOrMap === 'function') {
    idx = formulaOrMap(month);
  } else if (Array.isArray(formulaOrMap) || typeof formulaOrMap === 'object') {
    idx = (formulaOrMap as any)[month];
  } else {
    idx = formulaOrMap;
  }
  placeStar(palaces, starName, idx, category);
}

// ============================================================
// AN CÁC VÒNG SAO LỚN
// ============================================================

/**
 * 1. An Vòng Thái Tuế (12 sao + Thiên Không)
 * Khởi Thái Tuế tại cung Địa chi Năm sinh. Tính thuận.
 */
function placeVongThaiTue(palaces: Palace[], yearChiIdx: number): void {
  const stars = [
    'Thái Tuế', 'Thiếu Dương', 'Tang Môn', 'Thiếu Âm', 
    'Quan Phù', 'Tử Phù', 'Tuế Phá', 'Long Đức', 
    'Bạch Hổ', 'Phúc Đức', 'Điếu Khách', 'Trực Phù'
  ];
  placeVongStars(palaces, yearChiIdx, stars, true, 'fixed');
  // Thiên Không thuộc vòng Thái Tuế và đồng cung Thiếu Dương
  placeStar(palaces, 'Thiên Không', yearChiIdx + 1, 'sha');
}

/**
 * 2. An Vòng Lộc Tồn / Bác Sĩ (12 sao)
 * Bác sĩ khởi tại cung Lộc Tồn. Dương Nam Âm Nữ đi Thuận, Âm Nam Dương Nữ đi Nghịch.
 */
function placeVongLocTonBacSi(
  palaces: Palace[],
  locTonIdx: number,
  gender: 'Nam' | 'Nữ',
  yearCanIdx: number
): void {
  const stars = [
    'Bác Sĩ', 'Lực Sĩ', 'Thanh Long', 'Tiểu Hao',
    'Tướng Quân', 'Tấu Thư', 'Phi Liêm', 'Hỷ Thần',
    'Bệnh Phù', 'Đại Hao', 'Phục Binh', 'Quan Phủ'
  ];
  const isDuong = yearCanIdx % 2 === 0;
  const isThuan = (isDuong && gender === 'Nam') || (!isDuong && gender === 'Nữ');
  placeVongStars(palaces, locTonIdx, stars, isThuan, 'fixed');
}

/**
 * 3. An Vòng Trường Sinh (12 sao)
 * Khởi tại Sinh địa của Cục. Nam Dương Nữ Âm đi Thuận, Nam Âm Nữ Dương đi Nghịch.
 */
function placeVongTrangSinh(
  palaces: Palace[], 
  nguHanhCuc: number, 
  gender: 'Nam' | 'Nữ', 
  yearCanIdx: number
): void {
  const stars = [
    'Trường Sinh', 'Mộc Dục', 'Quan Đới', 'Lâm Quan',
    'Đế Vượng', 'Suy', 'Bệnh', 'Tử',
    'Mộ', 'Tuyệt', 'Thai', 'Dưỡng'
  ];
  const mapCucToStart: Record<number, number> = { 2: 8, 3: 11, 4: 5, 5: 8, 6: 2 };
  const startIdx = mapCucToStart[nguHanhCuc] ?? 8;
  const isDuong = yearCanIdx % 2 === 0;
  const isThuan = (isDuong && gender === 'Nam') || (!isDuong && gender === 'Nữ');
  placeVongStars(palaces, startIdx, stars, isThuan, 'fixed');
}

// ============================================================
// AN TẠP DIỆU (HỆ THÁNG, NGÀY, GIỜ, NĂM)
// ============================================================

function placeTapDieu(
  palaces: Palace[], 
  yearCanIdx: number,
  yearChiIdx: number, 
  month: number,
  day: number,
  hourChiIdx: number
): void {
  // === 3.1. An theo Tháng sinh ===
  placeStarByMonth(palaces, 'Thiên Hình', month, m => (9 + m - 1) % 12, 'sha');
  placeStarByMonth(palaces, 'Thiên Diêu', month, m => (1 + m - 1) % 12, 'sha');
  placeStarByMonth(palaces, 'Thiên Y', month, m => (1 + m - 1) % 12, 'cat');
  placeStarByMonth(palaces, 'Thiên Giải', month, m => (8 + m - 1) % 12, 'cat');
  placeStarByMonth(palaces, 'Địa Giải', month, m => (7 + m - 1) % 12, 'cat');
  placeStarByMonth(palaces, 'Thiên Riêu', month, m => (1 + m - 1) % 12, 'sha');
  placeStarByMonth(palaces, 'Nguyệt Giải', month, m => (8 + Math.floor((m - 1) / 2)) % 12, 'cat');
  placeStarByMonth(palaces, 'Âm Sát', month, m => (2 - ((m - 1) % 6) * 2 + 12) % 12, 'sha');
  placeStarByMonth(palaces, 'Thiên Nguyệt', month, {
    1: 10, 2: 5, 3: 4, 4: 2, 5: 7, 6: 3, 7: 11, 8: 7, 9: 5, 10: 6, 11: 0, 12: 2
  }, 'sha');
  placeStarByMonth(palaces, 'Nguyệt Yếm', month, m => (10 - (m - 1) + 12) % 12, 'sha');
  placeStarByMonth(palaces, 'Nguyệt Hình', month, m => {
    const map = [5, 2, 8, 11];
    return map[(m - 1) % 4]!;
  }, 'sha');

  // === 3.2. An theo Ngày sinh ===
  const taPhuIdx = (4 + month - 1) % 12;
  placeStar(palaces, 'Tam Thai', taPhuIdx + day - 1, 'cat');

  const huuBatIdx = (10 - month + 1 + 12) % 12;
  placeStar(palaces, 'Bát Tọa', huuBatIdx - day + 1 + 12, 'cat');

  const vanXuongIdx = (10 - hourChiIdx + 12) % 12;
  placeStar(palaces, 'Ân Quang', vanXuongIdx + day - 2 + 12, 'cat');

  const vanKhucIdx = (4 + hourChiIdx) % 12;
  placeStar(palaces, 'Thiên Quý', vanKhucIdx - (day - 1) - 1 + 24, 'cat');

  // === 3.3. An theo Giờ sinh ===
  placeStar(palaces, 'Thai Phụ', vanKhucIdx + 2, 'cat');
  placeStar(palaces, 'Phong Cáo', vanKhucIdx - 2 + 12, 'cat');
  
  // === 3.4. An theo Địa Chi năm sinh ===
  placeStarByChi(palaces, 'Đào Hoa', yearChiIdx, DAO_HOA_BY_YEAR_CHI, 'cat');
  placeStarByChi(palaces, 'Hồng Loan', yearChiIdx, chi => (3 - chi + 12) % 12, 'cat');
  placeStarByChi(palaces, 'Thiên Hỷ', yearChiIdx, chi => (3 - chi + 12 + 6) % 12, 'cat');
  placeStarByChi(palaces, 'Cô Thần', yearChiIdx, CO_THAN_BY_YEAR_CHI, 'sha');
  placeStarByChi(palaces, 'Quả Tú', yearChiIdx, QUA_TU_BY_YEAR_CHI, 'sha');
  placeStarByChi(palaces, 'Kiếp Sát', yearChiIdx, KIEP_SAT_BY_YEAR_CHI, 'sha');
  placeStarByChi(palaces, 'Hoa Cái', yearChiIdx, HOA_CAI_BY_YEAR_CHI, 'cat');
  placeStarByChi(palaces, 'Phá Toái', yearChiIdx, PHA_TOAI_BY_YEAR_CHI, 'sha');
  placeStarByChi(palaces, 'Thiên Khốc', yearChiIdx, chi => (6 - chi + 12) % 12, 'sha');
  placeStarByChi(palaces, 'Thiên Hư', yearChiIdx, chi => (6 + chi) % 12, 'sha');
  placeStarByChi(palaces, 'Long Trì', yearChiIdx, chi => (4 + chi) % 12, 'cat');
  placeStarByChi(palaces, 'Phượng Các', yearChiIdx, chi => (10 - chi + 12) % 12, 'cat');
  placeStarByChi(palaces, 'Giải Thần', yearChiIdx, chi => (10 - chi + 12) % 12, 'cat');
  placeStarByChi(palaces, 'Thiên Mã', yearChiIdx, THIEN_MA_BY_YEAR_CHI, 'cat');
  placeStarByChi(palaces, 'Thiên Đức', yearChiIdx, chi => (9 + chi) % 12, 'cat');
  placeStarByChi(palaces, 'Nguyệt Đức', yearChiIdx, chi => (5 + chi) % 12, 'cat');
  placeStarByChi(palaces, 'Thiên Vu', yearChiIdx, chi => (8 + chi) % 12, 'sha');

  // Đẩu Quân (Nguyệt Tướng): khởi Thái Tuế nghịch tháng sinh thuận giờ sinh
  placeStarByChi(palaces, 'Đẩu Quân', yearChiIdx, chi => (chi - month + 1 + hourChiIdx + 24) % 12, 'sha');

  // Quốc Ấn, Đường Phù (Khởi từ Lộc Tồn)
  const locTonPalace = palaces.find(p => p.auxStars.some(s => s.name === 'Lộc Tồn'));
  const locTonIdx = locTonPalace ? locTonPalace.chiIndex : 2;
  placeStar(palaces, 'Quốc Ấn', locTonIdx + 8, 'cat');
  placeStar(palaces, 'Đường Phù', locTonIdx - 7 + 12, 'cat');

  // === 3.5. An theo Thiên Can năm sinh ===
  placeStarByCan(palaces, 'Thiên Quan', yearCanIdx, [7, 4, 5, 2, 3, 9, 11, 9, 10, 6], 'cat');
  placeStarByCan(palaces, 'Thiên Phúc', yearCanIdx, [9, 8, 0, 11, 3, 2, 6, 5, 6, 5], 'cat');
  placeStarByCan(palaces, 'Lưu Hà', yearCanIdx, [9, 10, 7, 4, 5, 6, 8, 3, 11, 2], 'sha');
  placeStarByCan(palaces, 'Thiên Trù', yearCanIdx, [5, 6, 0, 5, 6, 8, 2, 6, 9, 10], 'cat');
  placeStarByCan(palaces, 'Lưu Niên Văn Tinh', yearCanIdx, [5, 6, 8, 9, 8, 9, 11, 0, 2, 3], 'cat');
  placeStarByCan(palaces, 'Thiên Khố', yearCanIdx, [5, 6, 7, 8, 5, 6, 11, 0, 2, 3], 'cat');

  // === 3.6. An Vòng Tướng Tinh (8 sao mới, bỏ qua 4 sao trùng) ===
  const tuongTinhStartMap: Record<number, number> = {
    2: 6, 6: 6, 10: 6,   // Dần Ngọ Tuất khởi Ngọ (6)
    8: 0, 0: 0, 4: 0,   // Thân Tý Thìn khởi Tý (0)
    5: 9, 9: 9, 1: 9,   // Tỵ Dậu Sửu khởi Dậu (9)
    11: 3, 3: 3, 7: 3,  // Hợi Mão Mùi khởi Mão (3)
  };
  const tuongTinhStartIdx = tuongTinhStartMap[yearChiIdx] ?? 0;
  const tuongTinhStars = [
    'Tướng Tinh', 'Phan An', 'Tức Thần', 'Tai Sát', 'Thiên Sát', 'Chỉ Bối', 'Nguyệt Sát', 'Vong Thần'
  ];
  placeVongStars(palaces, tuongTinhStartIdx, tuongTinhStars, true, 'fixed', [0, 1, 3, 6, 7, 8, 10, 11]);
}

// ============================================================
// HÀM KHỞI CHẠY CHÍNH (ORCHESTRATOR)
// ============================================================

/**
 * Hàm Orchestrator chính: Gắn tất cả Bàng tinh vào Mệnh Bàn.
 * Yêu cầu phải được gọi SAU KHI đã an Lộc Tồn từ AuxStarEngine.
 * 
 * Được refactor trong Milestone 4 để đảm bảo tính bất biến (immutability) 
 * bằng cách clone sâu/nông an toàn trước khi thực hiện chèn sao.
 */
export function placeAllMinorStars(
  palaces: Palace[],
  yearCanIdx: number,
  yearChiIdx: number,
  month: number,
  day: number,
  hourChiIdx: number,
  gender: 'Nam' | 'Nữ',
  nguHanhCuc: number
): Palace[] {
  // 1. Clone an toàn mảng và thuộc tính auxStars của từng cung để tránh mutate input ngoài ý muốn
  const result = palaces.map(p => ({
    ...p,
    auxStars: [...p.auxStars],
  }));

  // 2. Tìm cung chứa Lộc Tồn để an Vòng Bác Sĩ
  const locTonPalace = result.find(p => p.auxStars.some(s => s.name === 'Lộc Tồn'));
  const locTonIdx = locTonPalace ? locTonPalace.chiIndex : 2; // Mặc định Dần nếu lỗi (ít xảy ra)

  // 3. An các vòng sao lớn
  placeVongThaiTue(result, yearChiIdx);
  placeVongLocTonBacSi(result, locTonIdx, gender, yearCanIdx);
  placeVongTrangSinh(result, nguHanhCuc, gender, yearCanIdx);
  
  // 4. An các tạp diệu
  placeTapDieu(result, yearCanIdx, yearChiIdx, month, day, hourChiIdx);
  
  // 5. Thiên Tài, Thiên Thọ tính từ Mệnh/Thân, xử lý sau cùng
  const menhPalace = result.find(p => p.palaceName === 'Mệnh');
  const thanPalace = result.find(p => p.isThanPalace);
  if (menhPalace) {
    placeStar(result, 'Thiên Tài', menhPalace.chiIndex + yearChiIdx, 'cat');
  }
  if (thanPalace) {
    placeStar(result, 'Thiên Thọ', thanPalace.chiIndex + yearChiIdx, 'cat');
  }

  return result;
}
