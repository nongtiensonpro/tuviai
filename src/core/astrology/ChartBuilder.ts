/**
 * ChartBuilder.ts — Orchestrator: kết hợp tất cả engine để tạo ZiweiChart hoàn chỉnh
 * Đây là entry point duy nhất cho toàn bộ quá trình tính toán mệnh bàn
 */

import type { SolarDate, ZiweiChart, NguHanhCuc } from '../types/ZiweiTypes';
import { CUC_NAME, TWELVE_CHI } from '../types/ZiweiTypes';
import { solarToLunar, getNamCanChi, getYearCanChi } from '../calendar/LunarConverter';
import {
  calcMenhChiIndex,
  calcThanChiIndex,
  calcNguHanhCuc,
  buildPalaces,
} from './PalaceCalculator';
import { findZiweiPosition, placeMainStars } from './ZiweiEngine';
import {
  placeLucCatTinh,
  placeLucSatTinh,
  placeFixedStars,
  calcTuanTrietKhong,
} from './AuxStarEngine';
import { applySihua } from './SihuaEngine';

/**
 * Hàm chính: Tính toán và trả về ZiweiChart đầy đủ
 *
 * Quy trình:
 * 1. Chuyển Solar → Lunar
 * 2. Tính Can Chi năm → Cung Mệnh → Cục Ngũ Hành
 * 3. Khởi tạo 12 cung
 * 4. An 14 chính tinh (ZiweiEngine)
 * 5. An phụ tinh: Lục Cát, Lục Sát (AuxStarEngine)
 * 6. An sao cố định + Tuần/Triệt Không
 * 7. Áp dụng Tứ Hóa Phi Tinh (SihuaEngine)
 * 8. Đóng gói thành ZiweiChart
 */
export function buildZiweiChart(solar: SolarDate, gender: 'male' | 'female'): ZiweiChart {
  // Step 1: Chuyển lịch
  const lunar = solarToLunar(solar);

  // Step 2: Can Chi năm
  const namCanChi = getNamCanChi(lunar.year);
  const yearCanChi = getYearCanChi(lunar.year);

  // Step 3: Vị trí Cung Mệnh
  const menhChiIndex = calcMenhChiIndex(lunar.month, lunar.hourChiIndex);
  const menhChi = TWELVE_CHI[menhChiIndex]!;

  // Step 4: Vị trí Cung Thân
  const thanChiIndex = calcThanChiIndex(lunar.month);
  const thanChi = TWELVE_CHI[thanChiIndex]!;

  // Step 5: Ngũ Hành Nạp Âm Cục của Cung Mệnh
  // Can của Cung Mệnh
  const { can: menhCan } = getMenhCanChi(menhChiIndex, yearCanChi.canIndex);
  const nguHanhCuc = calcNguHanhCuc(menhCan, menhChi);
  const tenCuc = CUC_NAME[nguHanhCuc];

  // Step 6: Xây dựng 12 cung cơ bản (chưa có sao)
  let palaces = buildPalaces(menhChiIndex, namCanChi, yearCanChi.canIndex);

  // Step 7: Tìm vị trí sao Tử Vi
  const ziweiPos = findZiweiPosition(lunar.day, nguHanhCuc);

  // Step 8: An 14 chính tinh
  palaces = placeMainStars(palaces, ziweiPos);

  // Step 9: An Lục Cát Tinh
  palaces = placeLucCatTinh(
    palaces,
    lunar.month,
    yearCanChi.canIndex,
    lunar.hourChiIndex,
  );

  // Step 10: An Lục Sát Tinh
  palaces = placeLucSatTinh(
    palaces,
    yearCanChi.canIndex,
    yearCanChi.chiIndex,
    lunar.hourChiIndex,
  );

  // Step 11: An sao cố định (Thiên La, Địa Võng, Thiên Thương, Thiên Sứ)
  palaces = placeFixedStars(palaces);

  // Step 12: Tuần Không / Triệt Không
  palaces = calcTuanTrietKhong(palaces, yearCanChi.canIndex, yearCanChi.chiIndex);

  // Step 13: Tứ Hóa
  palaces = applySihua(palaces, namCanChi.can);

  return {
    solarDate: solar,
    lunarDate: lunar,
    gender,
    namCanChi,
    nguHanhCuc,
    tenCuc,
    cungMenhIndex: menhChiIndex,
    cungMenhChi: menhChi,
    cungThanIndex: thanChiIndex,
    cungThanChi: thanChi,
    palaces,
    calculatedAt: Date.now(),
  };
}

/**
 * Helper nội bộ: Lấy Can của Cung Mệnh
 * Dựa trên Can Dần theo năm + offset từ Dần đến menhChiIndex
 */
function getMenhCanChi(
  menhChiIndex: number,
  yearCanIndex: number,
): { can: import('../types/ZiweiTypes').TenCan; canIndex: number } {
  const TEN_CAN = ['Giáp','Ất','Bính','Đinh','Mậu','Kỷ','Canh','Tân','Nhâm','Quý'] as const;
  const DAN_CAN_START: Record<number, number> = {
    0: 2, 1: 4, 2: 6, 3: 8, 4: 0,
    5: 2, 6: 4, 7: 6, 8: 8, 9: 0,
  };
  const danStart = DAN_CAN_START[yearCanIndex] ?? 0;
  const offset = (menhChiIndex - 2 + 12) % 12;
  const canIndex = (danStart + offset) % 10;
  return {
    can: TEN_CAN[canIndex] as import('../types/ZiweiTypes').TenCan,
    canIndex,
  };
}

/**
 * Serialize ZiweiChart thành JSON để gửi cho Gemini AI
 * Chỉ bao gồm thông tin cần thiết cho việc luận giải
 */
export function chartToPromptContext(chart: ZiweiChart): string {
  const context = {
    thongTinCoBan: {
      ngaySinh: `${chart.solarDate.day}/${chart.solarDate.month}/${chart.solarDate.year}`,
      gioDia: chart.lunarDate.hourChi,
      namCanChi: chart.namCanChi.displayName,
      gioiTinh: chart.gender === 'male' ? 'Nam' : 'Nữ',
      nguHanhCuc: chart.tenCuc,
      cungMenh: chart.cungMenhChi,
      cungThan: chart.cungThanChi,
    },
    cungBan: chart.palaces.map(p => ({
      diaChi: p.chi,
      tenCung: p.palaceName,
      chinhTinh: p.mainStars.map(s => `${s.name}(${s.brightness})${s.sihua ? `[Hóa ${s.sihua}]` : ''}`),
      phuTinh: p.auxStars.map(s => `${s.name}${s.sihua ? `[Hóa ${s.sihua}]` : ''}`),
      tuanKhong: p.hasTuanKhong,
    })),
  };
  return JSON.stringify(context, null, 2);
}
