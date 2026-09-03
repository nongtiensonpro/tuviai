import type { ZiweiChart, MonthlyChart, MonthlyPalace } from '../types/ZiweiTypes';
import { buildAnnualChart } from './AnnualEngine';
import { mod12 } from './StarConstants';

/**
 * Lập lá số hạn tháng (Nguyệt Hạn) dựa trên sao Đẩu Quân (Lưu Đẩu Quân) làm điểm khởi đầu.
 *
 * @param chart - Bản gốc Mệnh bàn của đương số
 * @param targetYear - Năm xem hạn
 * @param targetMonth - Tháng xem hạn (1-12 âm lịch)
 * @returns MonthlyChart đầy đủ thông tin về hạn tháng
 */
export function buildMonthlyChart(chart: ZiweiChart, targetYear: number, targetMonth: number): MonthlyChart {
  if (targetMonth < 1 || targetMonth > 12) {
    throw new Error('Target month must be between 1 and 12');
  }

  // 1. Lấy thông tin hạn năm làm nền tảng
  const annualChart = buildAnnualChart(chart, targetYear);
  const luuThaiTueIdx = annualChart.luuThaiTuePalaceIndex;

  // 2. Tính vị trí tháng Giêng (Lưu Đẩu Quân): khởi Lưu Thái Tuế nghịch tháng sinh thuận giờ sinh
  // Tháng sinh để an Đẩu Quân — dùng tháng đã quy đổi nhuận cho nhất quán với natal chart
  const birthMonth = chart.lunarDate.monthForStarring;
  const birthHourChiIdx = chart.lunarDate.hourChiIndex;
  const luuDauQuanIdx = mod12(luuThaiTueIdx - birthMonth + 1 + birthHourChiIdx);

  // 3. Tính vị trí cung hạn tháng cần xem (đi thuận từ tháng Giêng)
  const monthlyPalaceIndex = mod12(luuDauQuanIdx + targetMonth - 1);

  // 4. Map 12 cung hạn năm sang hạn tháng
  const palaces: MonthlyPalace[] = annualChart.palaces.map(p => {
    const isMonthlyPalace = p.chiIndex === monthlyPalaceIndex;

    return {
      chiIndex: p.chiIndex,
      chi: p.chi,
      palaceName: p.palaceName,
      daiHan: p.daiHan,
      tieuVanAge: p.tieuVanAge,
      isTieuVan: p.isTieuVan,
      isLuuThaiTue: p.isLuuThaiTue,
      isMonthlyPalace,
      annualStars: p.annualStars,
      monthlyStars: [], // Các sao lưu tháng khác (nếu có bổ sung trong tương lai)
      mainStars: p.mainStars,
      auxStars: p.auxStars,
      annualSihua: p.annualSihua,
    };
  });

  return {
    targetYear,
    targetMonth,
    monthlyPalaceIndex,
    palaces,
  };
}
