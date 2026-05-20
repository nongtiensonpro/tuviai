import { buildZiweiChart } from '../src/core/astrology/ChartBuilder';
import { buildAnnualChart } from '../src/core/astrology/AnnualEngine';
import type { SolarDate } from '../src/core/types/ZiweiTypes';

describe('AnnualEngine (Minor Period & Annual Stars) tests', () => {
  // Male profile: Mậu Dần 27/09/1998 hour Tỵ (9:00 AM)
  const maleSolarDate: SolarDate = {
    day: 27,
    month: 9,
    year: 1998,
    hour: 9,
  };

  // Female profile: Tân Mùi 13/08/1991 hour Sửu (1:00 AM)
  const femaleSolarDate: SolarDate = {
    day: 13,
    month: 8,
    year: 1991,
    hour: 1,
  };

  it('should correctly calculate target age', () => {
    const chart = buildZiweiChart(maleSolarDate, 'male');
    
    // Target year 2026
    const annual2026 = buildAnnualChart(chart, 2026);
    expect(annual2026.targetAge).toBe(29); // 2026 - 1998 + 1
    
    // Target year 1998 (birth year)
    const annual1998 = buildAnnualChart(chart, 1998);
    expect(annual1998.targetAge).toBe(1);
  });

  it('should throw an error for target year before birth year', () => {
    const chart = buildZiweiChart(maleSolarDate, 'male');
    expect(() => buildAnnualChart(chart, 1997)).toThrow();
  });

  it('should calculate correct Tieu Van and Luu Thai Tue palaces for Male (Dần Ngọ Tuất group)', () => {
    const chart = buildZiweiChart(maleSolarDate, 'male'); // Birth: Dần (index 2)
    
    // For 2026 (targetAge = 29, Male, clockwise)
    // Dần Ngọ Tuất starting index is 4 (Thìn)
    // (4 + 29 - 1) % 12 = 32 % 12 = 8 (Thân)
    const annual2026 = buildAnnualChart(chart, 2026);
    expect(annual2026.tieuVanPalaceIndex).toBe(8); // Thân
    
    // 2026 is year of Bính Ngọ (Chi = Ngọ = index 6)
    expect(annual2026.luuThaiTuePalaceIndex).toBe(6); // Ngọ
    
    // Check palaces flags
    const thanPalace = annual2026.palaces.find(p => p.chiIndex === 8);
    expect(thanPalace?.isTieuVan).toBe(true);
    expect(thanPalace?.tieuVanAge).toBe(29);

    const ngoPalace = annual2026.palaces.find(p => p.chiIndex === 6);
    expect(ngoPalace?.isLuuThaiTue).toBe(true);
  });

  it('should calculate correct Tieu Van for Female (Hợi Mão Mùi group)', () => {
    const chart = buildZiweiChart(femaleSolarDate, 'female'); // Birth: Mùi (index 7)
    
    // For 2026 (targetAge = 36, Female, counter-clockwise)
    // Hợi Mão Mùi starting index is 1 (Sửu)
    // (1 - (36 - 1) + 12 * 36) % 12 = (1 - 35 + 432) % 12 = 398 % 12 = 2 (Dần)
    const annual2026 = buildAnnualChart(chart, 2026);
    expect(annual2026.tieuVanPalaceIndex).toBe(2); // Dần
    expect(annual2026.luuThaiTuePalaceIndex).toBe(6); // 2026 is Ngọ (6)
  });

  it('should correctly place all target year annual stars for 2026 (Bính Ngọ)', () => {
    const chart = buildZiweiChart(maleSolarDate, 'male');
    const annual2026 = buildAnnualChart(chart, 2026);

    // 2026 Can = Bính, Chi = Ngọ (index 6)
    // Luu Loc Ton (Bính -> Tỵ = index 5)
    // Luu Kinh Duong (Loc Ton + 1 -> index 6)
    // Luu Da La (Loc Ton - 1 -> index 4)
    // Luu Thien Ma (Chi Ngo -> index 8)
    // Luu Thien Khoc ((6 - Chi) % 12 -> 6 - 6 = index 0)
    // Luu Thien Hu ((6 + Chi) % 12 -> 6 + 6 = index 0)

    const findStar = (name: string) => {
      for (const p of annual2026.palaces) {
        const star = p.annualStars.find(s => s.name === name);
        if (star) return p.chiIndex;
      }
      return -1;
    };

    expect(findStar('Lưu Thái Tuế')).toBe(6); // Ngọ
    expect(findStar('Lưu Lộc Tồn')).toBe(5); // Tỵ
    expect(findStar('Lưu Kình Dương')).toBe(6); // Ngọ
    expect(findStar('Lưu Đà La')).toBe(4); // Thìn
    expect(findStar('Lưu Thiên Mã')).toBe(8); // Thân
    expect(findStar('Lưu Thiên Khốc')).toBe(0); // Tý
    expect(findStar('Lưu Thiên Hư')).toBe(0); // Tý
  });

  it('should correctly apply Luu Tu Hoa for 2026 (Bính Can -> Đồng Lộc, Cơ Quyền, Xương Khoa, Liêm Kỵ)', () => {
    const chart = buildZiweiChart(maleSolarDate, 'male');
    const annual2026 = buildAnnualChart(chart, 2026);

    // Profile has Liêm Trinh (Mệnh tại Thìn / 4)
    // In Bính year, Liêm Trinh -> Hóa Kỵ
    const thinPalace = annual2026.palaces.find(p => p.chiIndex === 4);
    expect(thinPalace).toBeDefined();

    const liemTrinh = thinPalace?.mainStars.find(s => s.name === 'Liêm Trinh');
    expect(liemTrinh).toBeDefined();
    expect(liemTrinh?.sihua).toBe('Kỵ'); // Applied annual Hóa Kỵ

    // The original chart should not be mutated
    const originalLiemTrinh = chart.palaces[4]?.mainStars.find(s => s.name === 'Liêm Trinh');
    expect(originalLiemTrinh).toBeDefined();
    expect(originalLiemTrinh?.sihua).toBeUndefined(); // Original is unaffected
  });
});
