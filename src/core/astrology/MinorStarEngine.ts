/**
 * MinorStarEngine.ts — Engine an định các Bàng Tinh, Tạp Diệu (108 sao Tử Vi Đẩu Số)
 * Bao gồm: Vòng Thái Tuế, Vòng Lộc Tồn (Bác sĩ), Nhật Nguyệt Thời Tuế Hệ sao.
 */

import type { Palace, Star } from '../types/ZiweiTypes';
import { getStarNguHanh } from './NguHanhEngine';
import { DAO_HOA_BY_YEAR_CHI, THIEN_MA_BY_YEAR_CHI } from './StarConstants';

function createMinorStar(name: string, palaceIndex: number, category: Star['category'] = 'fixed'): Star {
  return {
    name,
    category,
    nguHanh: getStarNguHanh(name),
    brightness: '',
    palaceIndex: ((palaceIndex % 12) + 12) % 12,
  };
}

function placeStar(palaces: Palace[], name: string, idx: number, category: Star['category'] = 'fixed') {
  const normIdx = ((idx % 12) + 12) % 12;
  palaces[normIdx]!.auxStars.push(createMinorStar(name, normIdx, category));
}

// Bảng thuộc tính sinh Dần, Thân, Tỵ, Hợi (phục vụ Cô Thần, Quả Tú, Kiếp Sát, Hoa Cái...)
const SAN_HE: Record<number, number[]> = {
  // Dần(2), Ngọ(6), Tuất(10)
  2: [2, 6, 10], 6: [2, 6, 10], 10: [2, 6, 10],
  // Thân(8), Tý(0), Thìn(4)
  8: [8, 0, 4], 0: [8, 0, 4], 4: [8, 0, 4],
  // Tỵ(5), Dậu(9), Sửu(1)
  5: [5, 9, 1], 9: [5, 9, 1], 1: [5, 9, 1],
  // Hợi(11), Mão(3), Mùi(7)
  11: [11, 3, 7], 3: [11, 3, 7], 7: [11, 3, 7],
};

const CO_THAN_BY_YEAR_CHI: Record<number, number> = {
  0: 2, 1: 2, 2: 5, 3: 5, 4: 5, 5: 8,
  6: 8, 7: 8, 8: 11, 9: 11, 10: 11, 11: 2,
};

const QUA_TU_BY_YEAR_CHI: Record<number, number> = {
  0: 10, 1: 10, 2: 1, 3: 1, 4: 1, 5: 4,
  6: 4, 7: 4, 8: 7, 9: 7, 10: 7, 11: 10,
};

const KIEP_SAT_BY_YEAR_CHI: Record<number, number> = {
  0: 5, 1: 2, 2: 11, 3: 8, 4: 5, 5: 2,
  6: 11, 7: 8, 8: 5, 9: 2, 10: 11, 11: 8,
};

const HOA_CAI_BY_YEAR_CHI: Record<number, number> = {
  0: 4, 1: 1, 2: 10, 3: 7, 4: 4, 5: 1,
  6: 10, 7: 7, 8: 4, 9: 1, 10: 10, 11: 7,
};

const PHA_TOAI_BY_YEAR_CHI: Record<number, number> = {
  0: 5, 1: 1, 2: 9, 3: 5, 4: 1, 5: 9,
  6: 5, 7: 1, 8: 9, 9: 5, 10: 1, 11: 9,
};

/**
 * 1. An Vòng Thái Tuế (12 sao)
 * Khởi Thái Tuế tại cung Địa chi Năm sinh. Tính thuận.
 */
function placeVongThaiTue(palaces: Palace[], yearChiIdx: number) {
  const stars = [
    'Thái Tuế', 'Thiếu Dương', 'Tang Môn', 'Thiếu Âm', 
    'Quan Phù', 'Tử Phù', 'Tuế Phá', 'Long Đức', 
    'Bạch Hổ', 'Phúc Đức', 'Điếu Khách', 'Trực Phù'
  ];
  for (let i = 0; i < 12; i++) {
    placeStar(palaces, stars[i]!, yearChiIdx + i, 'fixed');
  }
}

/**
 * 2. An Vòng Lộc Tồn / Bác Sĩ (12 sao)
 * Bác sĩ khởi tại cung Lộc Tồn, Dương Nam Âm Nữ đi Thuận, Âm Nam Dương Nữ đi Nghịch.
 */
function placeVongLocTonBacSi(palaces: Palace[], locTonIdx: number, gender: 'Nam' | 'Nữ', yearCanIdx: number) {
  const stars = [
    'Bác Sĩ', 'Lực Sĩ', 'Thanh Long', 'Tiểu Hao',
    'Tướng Quân', 'Tấu Thư', 'Phi Liêm', 'Hỷ Thần',
    'Bệnh Phù', 'Đại Hao', 'Phục Binh', 'Quan Phủ'
  ];
  // Xác định m Dương: Giáp, Bính, Mậu, Canh, Nhâm là Dương (0, 2, 4, 6, 8)
  const isDuong = yearCanIdx % 2 === 0;
  const isThuan = (isDuong && gender === 'Nam') || (!isDuong && gender === 'Nữ');

  for (let i = 0; i < 12; i++) {
    const idx = isThuan ? (locTonIdx + i) : (locTonIdx - i + 12);
    placeStar(palaces, stars[i]!, idx, 'fixed');
  }
}

/**
 * 2.5. An Vòng Trường Sinh (12 sao)
 * Khởi tại Sinh địa của Cục. Nam Dương Nữ Âm đi Thuận, Nam Âm Nữ Dương đi Nghịch.
 */
function placeVongTrangSinh(
  palaces: Palace[], 
  nguHanhCuc: number, 
  gender: 'Nam' | 'Nữ', 
  yearCanIdx: number
) {
  const stars = [
    'Trường Sinh', 'Mộc Dục', 'Quan Đới', 'Lâm Quan',
    'Đế Vượng', 'Suy', 'Bệnh', 'Tử',
    'Mộ', 'Tuyệt', 'Thai', 'Dưỡng'
  ];
  
  // Vị trí khởi Trường Sinh theo Cục
  // Thủy(2) -> Thân(8), Mộc(3) -> Hợi(11), Kim(4) -> Tỵ(5), Thổ(5) -> Thân(8), Hỏa(6) -> Dần(2)
  const mapCucToStart: Record<number, number> = { 2: 8, 3: 11, 4: 5, 5: 8, 6: 2 };
  const startIdx = mapCucToStart[nguHanhCuc] ?? 8;

  const isDuong = yearCanIdx % 2 === 0;
  const isThuan = (isDuong && gender === 'Nam') || (!isDuong && gender === 'Nữ');

  for (let i = 0; i < 12; i++) {
    const idx = isThuan ? (startIdx + i) : (startIdx - i + 12);
    placeStar(palaces, stars[i]!, idx, 'fixed');
  }
}

/**
 * 3. Tạp Diệu: Nguyệt Hệ (Tháng), Nhật Hệ (Ngày), Thời Hệ (Giờ), Tuế Hệ (Năm)
 */
function placeTapDieu(
  palaces: Palace[], 
  yearCanIdx: number, yearChiIdx: number, 
  month: number, day: number, hourChiIdx: number
) {
  // === Theo Tháng ===
  // Thiên Hình: Tháng 1 tại Dậu (9), đếm thuận
  placeStar(palaces, 'Thiên Hình', 9 + month - 1, 'sha');
  // Thiên Diêu, Thiên Y: Tháng 1 tại Sửu (1), đếm thuận
  placeStar(palaces, 'Thiên Diêu', 1 + month - 1, 'sha');
  placeStar(palaces, 'Thiên Y', 1 + month - 1, 'cat');
  // Thiên Giải: Tháng 1 tại Thân (8), đếm thuận
  placeStar(palaces, 'Thiên Giải', 8 + month - 1, 'cat');
  // Địa Giải: Tháng 1 tại Mùi (7), đếm thuận
  placeStar(palaces, 'Địa Giải', 7 + month - 1, 'cat');
  // === Theo Ngày ===
  // Tam Thai: Từ Tả Phù (Tháng 1 tại Thìn 4, thuận) + ngày - 1
  const taPhuIdx = (4 + month - 1) % 12;
  placeStar(palaces, 'Tam Thai', taPhuIdx + day - 1, 'cat');
  // Bát Tọa: Từ Hữu Bật (Tháng 1 tại Tuất 10, nghịch) - ngày + 1
  const huuBatIdx = (10 - month + 1 + 12) % 12;
  placeStar(palaces, 'Bát Tọa', huuBatIdx - day + 1 + 12, 'cat');
  // Ân Quang: lấy Văn Xương làm ngày 1, đếm thuận tới ngày sinh rồi lùi 1 cung
  const vanXuongIdx = (10 - hourChiIdx + 12) % 12;
  placeStar(palaces, 'Ân Quang', vanXuongIdx + day - 2 + 12, 'cat');
  // Thiên Quý: lấy Văn Khúc làm ngày 1, đếm nghịch tới ngày sinh rồi lùi 1 cung
  const vanKhucIdx = (4 + hourChiIdx) % 12;
  placeStar(palaces, 'Thiên Quý', vanKhucIdx - (day - 1) - 1 + 24, 'cat');

  // === Theo Giờ ===
  // Thai Phụ: Văn Khúc + 2, Phong Cáo: Văn Khúc - 2
  placeStar(palaces, 'Thai Phụ', vanKhucIdx + 2, 'cat');
  placeStar(palaces, 'Phong Cáo', vanKhucIdx - 2 + 12, 'cat');
  
  // === Theo Năm ===
  // Đào Hoa: Tý/Ngọ/Mão/Dậu sinh -> Dần Ngọ Tuất -> Mão (3)...
  placeStar(palaces, 'Đào Hoa', DAO_HOA_BY_YEAR_CHI[yearChiIdx] ?? 3, 'cat');

  // Hồng Loan: Mão (3) lùi theo Chi Năm (Tý=0)
  const hongLoanIdx = (3 - yearChiIdx + 12) % 12;
  placeStar(palaces, 'Hồng Loan', hongLoanIdx, 'cat');
  // Thiên Hỷ: Đối cung Hồng Loan
  placeStar(palaces, 'Thiên Hỷ', hongLoanIdx + 6, 'cat');

  // Cô Thần: Tam hợp Dần Mão Thìn -> Tỵ(5), Tỵ Ngọ Mùi -> Thân(8), Thân Dậu Tuất -> Hợi(11), Hợi Tý Sửu -> Dần(2)
  placeStar(palaces, 'Cô Thần', CO_THAN_BY_YEAR_CHI[yearChiIdx] ?? 2, 'sha');

  // Quả Tú: Tam hợp lùi -> Dần Mão Thìn -> Sửu(1), Tỵ Ngọ Mùi -> Thìn(4), Thân Dậu Tuất -> Mùi(7), Hợi Tý Sửu -> Tuất(10)
  placeStar(palaces, 'Quả Tú', QUA_TU_BY_YEAR_CHI[yearChiIdx] ?? 10, 'sha');

  // Kiếp Sát: Cung đầu của tam hợp Thủy/Mộc/Hỏa/Kim
  placeStar(palaces, 'Kiếp Sát', KIEP_SAT_BY_YEAR_CHI[yearChiIdx] ?? 11, 'sha');

  // Hoa Cái: Dần Ngọ Tuất -> Tuất(10)...
  placeStar(palaces, 'Hoa Cái', HOA_CAI_BY_YEAR_CHI[yearChiIdx] ?? 10, 'cat');

  // Phá Toái theo nhóm Tý/Ngọ/Mão/Dậu, Dần/Thân/Tỵ/Hợi, Thìn/Tuất/Sửu/Mùi
  placeStar(palaces, 'Phá Toái', PHA_TOAI_BY_YEAR_CHI[yearChiIdx] ?? 5, 'sha');

  // Thiên Khốc: Từ Ngọ (6) lùi theo tuổi
  placeStar(palaces, 'Thiên Khốc', 6 - yearChiIdx + 12, 'sha');
  // Thiên Hư: Từ Ngọ (6) tiến theo tuổi
  placeStar(palaces, 'Thiên Hư', 6 + yearChiIdx, 'sha');

  // Long Trì: Từ Thìn (4) thuận theo năm
  placeStar(palaces, 'Long Trì', 4 + yearChiIdx, 'cat');
  // Phượng Các: Từ Tuất (10) nghịch theo năm
  const phuongCacIdx = (10 - yearChiIdx + 12) % 12;
  placeStar(palaces, 'Phượng Các', phuongCacIdx, 'cat');
  // Giải Thần đồng cung với Phượng Các
  placeStar(palaces, 'Giải Thần', phuongCacIdx, 'cat');

  // Thiên Quan, Thiên Phúc theo Thiên Can năm sinh
  const thienQuanMap = [7, 4, 5, 2, 3, 9, 11, 9, 10, 6]; // Giáp->Mùi...
  const thienPhucMap = [9, 8, 0, 11, 3, 2, 6, 5, 6, 5];
  placeStar(palaces, 'Thiên Quan', thienQuanMap[yearCanIdx]!, 'cat');
  placeStar(palaces, 'Thiên Phúc', thienPhucMap[yearCanIdx]!, 'cat');

  // Lưu Hà: Tùy Can Năm
  const luuHaMap = [9, 10, 7, 4, 5, 6, 8, 3, 11, 2];
  placeStar(palaces, 'Lưu Hà', luuHaMap[yearCanIdx]!, 'sha');

  // Thiên Trù: Tùy Can Năm
  const thienTruMap = [5, 6, 0, 5, 6, 8, 2, 6, 9, 10];
  placeStar(palaces, 'Thiên Trù', thienTruMap[yearCanIdx]!, 'cat');

  // Thiên Mã: Dần Ngọ Tuất mã ở Thân(8)...
  placeStar(palaces, 'Thiên Mã', THIEN_MA_BY_YEAR_CHI[yearChiIdx] ?? 8, 'cat');

  // Thiên Đức, Nguyệt Đức khởi theo năm
  placeStar(palaces, 'Thiên Đức', 9 + yearChiIdx, 'cat');
  placeStar(palaces, 'Nguyệt Đức', 5 + yearChiIdx, 'cat');

  // Quốc Ấn, Đường Phù (Khởi từ Lộc Tồn)
  const locTonPalace = palaces.find(p => p.auxStars.some(s => s.name === 'Lộc Tồn'));
  const locTonIdx = locTonPalace ? locTonPalace.chiIndex : 2;
  placeStar(palaces, 'Quốc Ấn', locTonIdx + 8, 'cat');
  placeStar(palaces, 'Đường Phù', locTonIdx - 7 + 12, 'cat');

  // Đẩu Quân (Nguyệt Tướng): khởi Thái Tuế nghịch tháng sinh thuận giờ sinh
  const dauQuanIdx = (yearChiIdx - month + 1 + hourChiIdx + 24) % 12;
  placeStar(palaces, 'Đẩu Quân', dauQuanIdx, 'sha');

  // Thiên Vu: Khởi tại Thân(8) cho năm Tý, đếm thuận theo năm
  const thienVuIdx = (8 + yearChiIdx) % 12;
  placeStar(palaces, 'Thiên Vu', thienVuIdx, 'sha');

  // Thiên Riêu: Khởi tại Sửu(1) đếm thuận theo tháng
  const thienRieuIdx = (1 + month - 1) % 12;
  placeStar(palaces, 'Thiên Riêu', thienRieuIdx, 'sha');
}

/**
 * Hàm Orchestrator chính: Gắn tất cả Bàng tinh vào Mệnh Bàn.
 * Yêu cầu phải được gọi SAU KHI đã an Lộc Tồn từ AuxStarEngine.
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
  // Tìm cung chứa Lộc Tồn để an Vòng Bác Sĩ
  const locTonPalace = palaces.find(p => p.auxStars.some(s => s.name === 'Lộc Tồn'));
  const locTonIdx = locTonPalace ? locTonPalace.chiIndex : 2; // Mặc định Dần nếu lỗi (ít xảy ra)

  placeVongThaiTue(palaces, yearChiIdx);
  placeVongLocTonBacSi(palaces, locTonIdx, gender, yearCanIdx);
  placeVongTrangSinh(palaces, nguHanhCuc, gender, yearCanIdx);
  placeTapDieu(palaces, yearCanIdx, yearChiIdx, month, day, hourChiIdx);
  
  // Thiên Tài, Thiên Thọ tính từ Mệnh/Thân, xử lý sau cùng
  const menhPalace = palaces.find(p => p.palaceName === 'Mệnh');
  const thanPalace = palaces.find(p => p.isThanPalace);
  if (menhPalace) {
    placeStar(palaces, 'Thiên Tài', menhPalace.chiIndex + yearChiIdx, 'cat');
  }
  if (thanPalace) {
    placeStar(palaces, 'Thiên Thọ', thanPalace.chiIndex + yearChiIdx, 'cat');
  }

  return palaces;
}
