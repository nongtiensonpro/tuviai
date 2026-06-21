import type { ZiweiChart, MonthlyChart, MonthlyPalace } from '../types/ZiweiTypes';
import { buildAnnualChart } from './AnnualEngine';

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
  const birthMonth = chart.lunarDate.month;
  const birthHourChiIdx = chart.lunarDate.hourChiIndex;
  const luuDauQuanIdx = (luuThaiTueIdx - birthMonth + 1 + birthHourChiIdx + 24) % 12;

  // 3. Tính vị trí cung hạn tháng cần xem (đi thuận từ tháng Giêng)
  const monthlyPalaceIndex = (luuDauQuanIdx + targetMonth - 1) % 12;

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
