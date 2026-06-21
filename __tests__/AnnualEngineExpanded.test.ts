import { buildZiweiChart } from '../src/core/astrology/ChartBuilder';
import { buildAnnualChart } from '../src/core/astrology/AnnualEngine';
import type { SolarDate } from '../src/core/types/ZiweiTypes';

describe('AnnualEngineExpanded - Phase 2', () => {
  // Male profile: Mậu Dần 27/09/1998 hour Tỵ (9:00 AM) -> hourChiIndex = 5 (Tỵ)
  const maleSolarDate: SolarDate = {
    day: 27,
    month: 9,
    year: 1998,
    hour: 9,
  };

  it('should correctly place all target year annual stars for 2026 (Bính Ngọ) including expanded ones', () => {
    const chart = buildZiweiChart(maleSolarDate, 'male');
    const annual2026 = buildAnnualChart(chart, 2026);

    const findStar = (name: string) => {
      for (const p of annual2026.palaces) {
        const star = p.annualStars.find(s => s.name === name);
        if (star) return p.chiIndex;
      }
      return -1;
    };

    // Expected positions for 2026 (Bính Ngọ, Can=Bính, Chi=Ngọ=6):
    expect(findStar('Lưu Hồng Loan')).toBe(9);  // Dậu
    expect(findStar('Lưu Thiên Hỷ')).toBe(3);   // Mão
    expect(findStar('Lưu Tang Môn')).toBe(8);   // Thân
    expect(findStar('Lưu Bạch Hổ')).toBe(2);    // Dần
    expect(findStar('Lưu Quan Phù')).toBe(10);  // Tuất
    expect(findStar('Lưu Đào Hoa')).toBe(3);    // Mão
    expect(findStar('Lưu Thiên Khôi')).toBe(11); // Hợi
    expect(findStar('Lưu Thiên Việt')).toBe(9);  // Dậu

    // Birth hour = Tỵ (5), Target year Chi = Ngọ (6) -> Hỏa khởi Sửu (1), Linh khởi Mão (3)
    // Lưu Hỏa Tinh = (1 + 5) % 12 = 6 (Ngọ)
    // Lưu Linh Tinh = (3 + 5) % 12 = 8 (Thân)
    expect(findStar('Lưu Hỏa Tinh')).toBe(6);
    expect(findStar('Lưu Linh Tinh')).toBe(8);
  });

  it('should populate annualSihua property correctly for target year', () => {
    const chart = buildZiweiChart(maleSolarDate, 'male');
    // Target year 2026 Bính Ngọ: Bính can -> Đồng Lộc, Cơ Quyền, Xương Khoa, Liêm Kỵ
    const annual2026 = buildAnnualChart(chart, 2026);

    const activeSihua = annual2026.palaces
      .flatMap(p => p.annualSihua || [])
      .map(s => `${s.starName}-${s.type}`);

    expect(activeSihua).toContain('Thiên Đồng-Lộc');
    expect(activeSihua).toContain('Thiên Cơ-Quyền');
    expect(activeSihua).toContain('Văn Xương-Khoa');
    expect(activeSihua).toContain('Liêm Trinh-Kỵ');
  });
});
