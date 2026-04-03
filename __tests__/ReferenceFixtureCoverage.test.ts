import { REFERENCE_CHART_FIXTURES } from './fixtures/referenceCharts';
import type { TenCuc } from '../src/core/types/ZiweiTypes';

describe('Reference fixture coverage', () => {
  it('giữ tối thiểu 10 fixture để regression không bị mỏng đi', () => {
    expect(REFERENCE_CHART_FIXTURES.length).toBeGreaterThanOrEqual(10);
  });

  it('phủ đủ cả 5 loại Cục', () => {
    const coveredCucs = new Set(REFERENCE_CHART_FIXTURES.map(fixture => fixture.expected.tenCuc));

    const expectedCucs: TenCuc[] = [
      'Thủy Nhị Cục',
      'Mộc Tam Cục',
      'Kim Tứ Cục',
      'Thổ Ngũ Cục',
      'Hỏa Lục Cục',
    ];

    expect(Array.from(coveredCucs).sort()).toEqual(expectedCucs.sort());
  });

  it('mỗi Cục có ít nhất 2 fixture để tránh tối ưu cục bộ quanh một case', () => {
    const cucCounts = REFERENCE_CHART_FIXTURES.reduce<Record<TenCuc, number>>((acc, fixture) => {
      acc[fixture.expected.tenCuc] += 1;
      return acc;
    }, {
      'Thủy Nhị Cục': 0,
      'Mộc Tam Cục': 0,
      'Kim Tứ Cục': 0,
      'Thổ Ngũ Cục': 0,
      'Hỏa Lục Cục': 0,
    });

    expect(cucCounts['Thủy Nhị Cục']).toBeGreaterThanOrEqual(2);
    expect(cucCounts['Mộc Tam Cục']).toBeGreaterThanOrEqual(2);
    expect(cucCounts['Kim Tứ Cục']).toBeGreaterThanOrEqual(2);
    expect(cucCounts['Thổ Ngũ Cục']).toBeGreaterThanOrEqual(2);
    expect(cucCounts['Hỏa Lục Cục']).toBeGreaterThanOrEqual(2);
  });

  it('phủ đủ cả 4 tổ hợp âm dương nam nữ', () => {
    const groups = new Set(REFERENCE_CHART_FIXTURES.map(fixture => fixture.expected.amDuongNamNu));

    expect(groups.has('Dương Nam')).toBe(true);
    expect(groups.has('Dương Nữ')).toBe(true);
    expect(groups.has('Âm Nam')).toBe(true);
    expect(groups.has('Âm Nữ')).toBe(true);
  });

  it('mỗi fixture đều phải có checkpoint để regression kiểm được nhiều hơn lớp thông tin lõi', () => {
    REFERENCE_CHART_FIXTURES.forEach(fixture => {
      expect(fixture.expected.checkpoints.length).toBeGreaterThan(0);
    });
  });
});
