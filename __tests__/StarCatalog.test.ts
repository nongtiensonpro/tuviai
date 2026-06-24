import { buildZiweiChart } from '../src/core/astrology/ChartBuilder';
import { getStarNguHanh } from '../src/core/astrology/NguHanhEngine';
import {
  getNatalStarCount,
  getNatalStarDefinitions,
  NATAL_STAR_TARGET,
  STAR_CATALOG,
} from '../src/core/astrology/StarCatalog';
import { REFERENCE_CHART_FIXTURES } from './fixtures/referenceCharts';

describe('StarCatalog', () => {
  it('tracks current natal coverage separately from annual stars', () => {
    expect(getNatalStarCount()).toBeGreaterThanOrEqual(106);
    expect(getNatalStarCount()).toBeGreaterThanOrEqual(NATAL_STAR_TARGET);
  });

  it('has no duplicate star definitions', () => {
    const names = STAR_CATALOG.map(star => star.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('resolves ngu hanh for every natal star in the catalog', () => {
    for (const star of getNatalStarDefinitions()) {
      expect(getStarNguHanh(star.name)).toMatch(/^(Kim|Mộc|Thủy|Hỏa|Thổ)$/);
    }
  });

  it('places Thien Khong with Thieu Duong in the Thai Tue cycle', () => {
    const chart = buildZiweiChart({ day: 12, month: 6, year: 2000, hour: 5 }, 'female');
    const thieuDuongPalace = chart.palaces.find(p =>
      p.auxStars.some(star => star.name === 'Thiếu Dương')
    );
    const thienKhongPalace = chart.palaces.find(p =>
      p.auxStars.some(star => star.name === 'Thiên Không')
    );

    expect(thienKhongPalace?.chiIndex).toBe(thieuDuongPalace?.chiIndex);
  });

  it('keeps Thien Khong and Dia Khong as distinct stars in a complete chart', () => {
    const chart = buildZiweiChart({ day: 27, month: 9, year: 1998, hour: 9 }, 'male');
    const thienKhongCount = chart.palaces.reduce(
      (count, palace) => count + palace.auxStars.filter(star => star.name === 'Thiên Không').length,
      0,
    );
    const diaKhongCount = chart.palaces.reduce(
      (count, palace) => count + palace.auxStars.filter(star => star.name === 'Địa Không').length,
      0,
    );

    expect(thienKhongCount).toBe(1);
    expect(diaKhongCount).toBe(1);
  });

  it('does not catalog a natal star that never appears in reference charts', () => {
    const observedNatalStars = new Set<string>();

    for (const fixture of REFERENCE_CHART_FIXTURES) {
      const chart = buildZiweiChart(fixture.input.solarDate, fixture.input.gender);
      chart.palaces.forEach(palace => {
        palace.mainStars.forEach(star => observedNatalStars.add(star.name));
        palace.auxStars.forEach(star => observedNatalStars.add(star.name));
      });
    }

    const missing = getNatalStarDefinitions()
      .filter(star => star.scope === 'natal')
      .map(star => star.name)
      .filter(name => !observedNatalStars.has(name));

    expect(missing).toEqual([]);
  });
});
