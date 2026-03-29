import { buildZiweiChart } from '../src/core/astrology/ChartBuilder';
import type { Palace, ReferenceChartFixture } from '../src/core/types/ZiweiTypes';
import { REFERENCE_CHART_FIXTURES } from './fixtures/referenceCharts';

function getPalaceByName(chartPalaces: Palace[], palaceName: Palace['palaceName']): Palace {
  const palace = chartPalaces.find(item => item.palaceName === palaceName);
  if (!palace) {
    throw new Error(`Missing palace ${palaceName}`);
  }
  return palace;
}

function assertReferenceChart(fixture: ReferenceChartFixture) {
  const chart = buildZiweiChart(fixture.input.solarDate, fixture.input.gender);

  expect(chart.lunarDate.day).toBe(fixture.expected.lunarDate.day);
  expect(chart.lunarDate.month).toBe(fixture.expected.lunarDate.month);
  expect(chart.lunarDate.year).toBe(fixture.expected.lunarDate.year);
  expect(chart.lunarDate.hourChi).toBe(fixture.expected.lunarDate.hourChi);
  expect(chart.namCanChi.displayName).toBe(fixture.expected.namCanChi);
  expect(chart.amDuongNamNu).toBe(fixture.expected.amDuongNamNu);
  expect(chart.amDuongLy).toBe(fixture.expected.amDuongLy);
  expect(chart.tenCuc).toBe(fixture.expected.tenCuc);
  expect(chart.banMenh).toBe(fixture.expected.banMenh);
  expect(chart.cungMenhChi).toBe(fixture.expected.cungMenhChi);

  if (fixture.expected.cungThanChi) {
    expect(chart.cungThanChi).toBe(fixture.expected.cungThanChi);
  }

  const thanPalace = chart.palaces.find(palace => palace.isThanPalace);
  expect(thanPalace?.palaceName).toBe(fixture.expected.thanCuTaiCung);

  fixture.expected.checkpoints.forEach(checkpoint => {
    const palace = getPalaceByName(chart.palaces, checkpoint.palaceName);

    if (checkpoint.chi) {
      expect(palace.chi).toBe(checkpoint.chi);
    }

    expect(palace.daiHan).toBe(checkpoint.daiHan);

    if (checkpoint.trangSinh) {
      expect(palace.trangSinh).toBe(checkpoint.trangSinh);
    }

    if (checkpoint.isThanPalace !== undefined) {
      expect(palace.isThanPalace).toBe(checkpoint.isThanPalace);
    }

    if (checkpoint.hasTuanKhong !== undefined) {
      expect(palace.hasTuanKhong).toBe(checkpoint.hasTuanKhong);
    }

    if (checkpoint.hasTrietKhong !== undefined) {
      expect(palace.hasTrinhKhong).toBe(checkpoint.hasTrietKhong);
    }
  });
}

describe('Reference chart regression', () => {
  it.each(REFERENCE_CHART_FIXTURES)('$label', fixture => {
    assertReferenceChart(fixture);
  });
});
