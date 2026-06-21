import { buildZiweiChart } from '../src/core/astrology/ChartBuilder';
import { buildMonthlyChart } from '../src/core/astrology/MonthlyEngine';
import type { SolarDate } from '../src/core/types/ZiweiTypes';

describe('MonthlyEngine - Phase 3', () => {
  // Male profile: Mậu Dần 27/09/1998 hour Tỵ (9:00 AM) -> Month=9, hourChiIndex = 5 (Tỵ)
  const maleSolarDate: SolarDate = {
    day: 27,
    month: 9,
    year: 1998,
    hour: 9,
  };

  it('should throw an error for target month out of 1-12 range', () => {
    const chart = buildZiweiChart(maleSolarDate, 'male');
    expect(() => buildMonthlyChart(chart, 2026, 0)).toThrow();
    expect(() => buildMonthlyChart(chart, 2026, 13)).toThrow();
  });

  it('should correctly calculate Monthly Palace Index based on Đẩu Quân (Nguyệt Tướng)', () => {
    const chart = buildZiweiChart(maleSolarDate, 'male');
    
    // For target year 2026 (Bính Ngọ -> luuThaiTueIdx = 6)
    // birthMonth = 9, birthHour = 5 (Tỵ)
    // Month 1 (Lưu Đẩu Quân) = (6 - 9 + 1 + 5 + 24) % 12 = 4 (Thìn)
    
    // Month 1: Thìn (4)
    const monthly1 = buildMonthlyChart(chart, 2026, 1);
    expect(monthly1.monthlyPalaceIndex).toBe(4);
    expect(monthly1.palaces.find(p => p.chiIndex === 4)?.isMonthlyPalace).toBe(true);

    // Month 2: Tỵ (5)
    const monthly2 = buildMonthlyChart(chart, 2026, 2);
    expect(monthly2.monthlyPalaceIndex).toBe(5);

    // Month 5: Thân (8)
    const monthly5 = buildMonthlyChart(chart, 2026, 5);
    expect(monthly5.monthlyPalaceIndex).toBe(8);
  });
});
