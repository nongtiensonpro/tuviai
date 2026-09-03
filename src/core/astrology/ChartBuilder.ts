/**
 * ChartBuilder.ts — Orchestrator: kết hợp tất cả engine để tạo ZiweiChart hoàn chỉnh
 * Đây là entry point duy nhất cho toàn bộ quá trình tính toán mệnh bàn
 */

import type { SolarDate, ZiweiChart, NguHanhCuc, Palace, Star } from '../types/ZiweiTypes';
import { CUC_NAME, TWELVE_CHI } from '../types/ZiweiTypes';
import { solarToLunar, getNamCanChi, getYearCanChi, getCungMenhCan } from '../calendar/LunarConverter';
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
import { placeAllMinorStars } from './MinorStarEngine';
import { applySihua } from './SihuaEngine';
import {
  calcAmDuongNamNu,
  calcAmDuongLy,
  calcMenhCucSinhKhac,
  calcMenhChu,
  calcThanChu,
  calcTrangSinh,
  calcDaiHan,
  getNapAmInfo,
} from './AdvancedCalculator';

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
  const thanChiIndex = calcThanChiIndex(lunar.month, lunar.hourChiIndex);
  const thanChi = TWELVE_CHI[thanChiIndex]!;

  // Step 5: Ngũ Hành Nạp Âm Cục của Cung Mệnh
  // Can của Cung Mệnh
  const { can: menhCan } = getCungMenhCan(menhChiIndex, yearCanChi.canIndex);
  const nguHanhCuc = calcNguHanhCuc(menhCan, menhChi);
  const tenCuc = CUC_NAME[nguHanhCuc];
  const napAmInfo = getNapAmInfo(namCanChi.can, namCanChi.chi);

  // Step 6: Các thông số Học thuật Cổ điển (Mệnh Chủ, Thân Chủ, Âm Dương...)
  const { amDuong, isThuanHanh } = calcAmDuongNamNu(yearCanChi.canIndex, gender);
  const amDuongLy = calcAmDuongLy(menhChiIndex, yearCanChi.canIndex);
  const menhCucSinhKhac = calcMenhCucSinhKhac(napAmInfo.nguHanh, nguHanhCuc);
  const menhChu = calcMenhChu(menhChiIndex);
  const thanChu = calcThanChu(yearCanChi.chiIndex);

  // Step 7: Xây dựng 12 cung cơ bản (chưa có sao)
  let palaces = buildPalaces(menhChiIndex, namCanChi, yearCanChi.canIndex);

  // Gắn Đại Hạn, Tràng Sinh và nhãn Thân
  palaces.forEach(p => {
    p.daiHan = calcDaiHan(nguHanhCuc, isThuanHanh, menhChiIndex, p.chiIndex);
    p.trangSinh = calcTrangSinh(nguHanhCuc, isThuanHanh, p.chiIndex);
    p.isThanPalace = p.chiIndex === thanChiIndex;
  });

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

  // Step 12.5: An toàn bộ 70+ Bàng tinh Tạp diệu
  palaces = placeAllMinorStars(
    palaces,
    yearCanChi.canIndex,
    yearCanChi.chiIndex,
    lunar.month,
    lunar.day,
    lunar.hourChiIndex,
    gender === 'male' ? 'Nam' : 'Nữ',
    nguHanhCuc
  );

  // Step 12.6: Mượn chính tinh cho các cung Vô Chính Diệu
  palaces = applyBorrowedStars(palaces);

  // Step 13: Tứ Hóa
  palaces = applySihua(palaces, namCanChi.can);

  return {
    solarDate: solar,
    lunarDate: lunar,
    gender,
    namCanChi,
    banMenh: napAmInfo.name,
    nguHanhCuc,
    tenCuc,
    amDuongLy,
    amDuongNamNu: amDuong,
    menhCucSinhKhac,
    menhChu,
    thanChu,
    cungMenhIndex: menhChiIndex,
    cungMenhChi: menhChi,
    cungThanIndex: thanChiIndex,
    cungThanChi: thanChi,
    palaces,
    calculatedAt: Date.now(),
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

/**
 * Logic mượn chính tinh từ cung xung chiếu cho các cung Vô Chính Diệu (VCD)
 */
function applyBorrowedStars(palaces: Palace[]): Palace[] {
  return palaces.map(p => {
    if (p.mainStars.length === 0) {
      // Tìm cung xung chiếu (cách 6 cung)
      const oppositeIdx = (p.chiIndex + 6) % 12;
      const oppositePalace = palaces[oppositeIdx]!;
      
      // Mượn các chính tinh
      p.borrowedStars = oppositePalace.mainStars.map((s: Star) => ({
        ...s,
        palaceIndex: p.chiIndex // Cập nhật vị trí tọa lạc mới
      }));
    }
    return p;
  });
}
