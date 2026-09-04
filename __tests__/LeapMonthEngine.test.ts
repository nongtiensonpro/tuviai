/**
 * LeapMonthEngine.test.ts — Độ chính xác an sao cho người sinh THÁNG NHUẬN
 * (Giai đoạn 2 — tailieu/KE-HOACH-NANG-CAO-DO-CHINH-XAC-LAP-LA-SO.md, mục L1)
 *
 * Chuẩn Nam phái phổ biến nhất tại VN (lyso.vn + nhiều sách đồng thuận):
 *   'first_half' (mặc định): ngày 1–15 nhuận → an theo tháng TRƯỚC; 16+ → tháng SAU.
 * Năm kiểm chứng thực: 2023 nhuận tháng 2 (Quý Mão), 2025 nhuận tháng 6 (Ất Tỵ).
 */

import { solarToLunar, resolveMonthForStarring } from '../src/core/calendar/LunarConverter';
import { buildZiweiChart } from '../src/core/astrology/ChartBuilder';
import { getMonthCanChi } from '../src/core/calendar/LunarConverter';
import type { SolarDate } from '../src/core/types/ZiweiTypes';

describe('resolveMonthForStarring — bảng quyết định 4 mode × ngày biên', () => {
  it('tháng THƯỜNG luôn giữ nguyên tháng, mọi mode', () => {
    for (const mode of ['first_half', 'prev', 'next'] as const) {
      expect(resolveMonthForStarring(3, false, 10, mode)).toBe(3);
      expect(resolveMonthForStarring(12, false, 25, mode)).toBe(12);
      expect(resolveMonthForStarring(1, false, 1, mode)).toBe(1);
    }
  });

  it('month 2 nhuận + first_half: ngày ≤15 → tháng 1; ngày ≥16 → tháng 3', () => {
    expect(resolveMonthForStarring(2, true, 1, 'first_half')).toBe(1);
    expect(resolveMonthForStarring(2, true, 15, 'first_half')).toBe(1);
    expect(resolveMonthForStarring(2, true, 16, 'first_half')).toBe(3);
    expect(resolveMonthForStarring(2, true, 30, 'first_half')).toBe(3);
  });

  it('month 2 nhuận + prev/next: cả tháng về 1 hoặc 3', () => {
    expect(resolveMonthForStarring(2, true, 1, 'prev')).toBe(1);
    expect(resolveMonthForStarring(2, true, 30, 'prev')).toBe(1);
    expect(resolveMonthForStarring(2, true, 1, 'next')).toBe(3);
    expect(resolveMonthForStarring(2, true, 30, 'next')).toBe(3);
  });

  it('quay vòng biên năm: prev tháng 1 → 12; next tháng 12 → 1; first_half nửa sau wrap', () => {
    // 'prev': cả tháng nhuận về tháng trước → tháng 1 nhuận → tháng 12 năm trước
    expect(resolveMonthForStarring(1, true, 5, 'prev')).toBe(12);
    expect(resolveMonthForStarring(12, true, 5, 'prev')).toBe(11);
    // 'next': cả tháng nhuận về tháng sau → tháng 12 nhuận → tháng 1
    expect(resolveMonthForStarring(12, true, 5, 'next')).toBe(1);
    expect(resolveMonthForStarring(1, true, 5, 'next')).toBe(2);
    // 'first_half' ngày 20 (nửa sau) → tháng SAU: tháng 1 nhuận → 2; tháng 12 nhuận → 1 (wrap)
    expect(resolveMonthForStarring(1, true, 20, 'first_half')).toBe(2);
    expect(resolveMonthForStarring(12, true, 20, 'first_half')).toBe(1);
  });
});

describe('solarToLunar — monthForStarring trên ngày thật', () => {
  // 2023 nhuận tháng 2: 22/03/2023 = mùng 1 tháng 2 nhuận Quý Mão
  it('22/03/2023 10h → âm 1/2 nhuận; first_half → an theo tháng 1', () => {
    const l = solarToLunar({ day: 22, month: 3, year: 2023, hour: 10 });
    expect(l.isLeap).toBe(true);
    expect(l.month).toBe(2);
    expect(l.day).toBe(1);
    expect(l.monthForStarring).toBe(1);
  });

  it('11/04/2023 10h → ngày 21 tháng 2 nhuận → first_half → an theo tháng 3', () => {
    const l = solarToLunar({ day: 11, month: 4, year: 2023, hour: 10 });
    expect(l.isLeap).toBe(true);
    expect(l.monthForStarring).toBe(3);
  });

  it('mode prev/next áp dụng đúng qua solarToLunar', () => {
    const prev = solarToLunar({ day: 22, month: 3, year: 2023, hour: 10, leapMonthMode: 'prev' });
    const next = solarToLunar({ day: 22, month: 3, year: 2023, hour: 10, leapMonthMode: 'next' });
    expect(prev.monthForStarring).toBe(1);
    expect(next.monthForStarring).toBe(3);
  });

  it('người sinh tháng thường: monthForStarring === month (không đổi hành vi cũ)', () => {
    for (const s of [
      { day: 12, month: 6, year: 2000, hour: 5 },
      { day: 10, month: 12, year: 1994, hour: 19 },
      { day: 27, month: 9, year: 1998, hour: 9 },
    ]) {
      const l = solarToLunar(s as SolarDate);
      expect(l.monthForStarring).toBe(l.month);
    }
  });
});

describe('buildZiweiChart — lá số tháng nhuận đổi theo mode', () => {
  // Sinh 22/03/2023 (mùng 1 tháng 2 nhuận) giờ Tý:
  // - first_half/prev → an theo tháng 1 → Mệnh = tháng1(2) - giờ Tý(0) → Dần... tính cụ thể
  it('cung Mệnh khác nhau giữa prev (tháng 1) và next (tháng 3)', () => {
    const base = { day: 22, month: 3, year: 2023, hour: 0 } as SolarDate;
    const cPrev = buildZiweiChart({ ...base, leapMonthMode: 'prev' }, 'male');
    const cNext = buildZiweiChart({ ...base, leapMonthMode: 'next' }, 'male');
    // Tháng 1 vs tháng 3 → vị trí tháng khác nhau 2 cung → Mệnh chắc chắn khác 2 cung
    // (trừ trường hợp giờ sinh bù đúng — giờ Tý=0 không bù)
    expect(cPrev.cungMenhChi).not.toBe(cNext.cungMenhChi);
  });

  it('đổi mode KHÔNG đổi năm can chi (năm sinh thật); Cục ĐƯỢC PHÉP đổi do cung Mệnh dịch', () => {
    const base = { day: 22, month: 3, year: 2023, hour: 6 } as SolarDate;
    const a = buildZiweiChart({ ...base, leapMonthMode: 'prev' }, 'male');
    const b = buildZiweiChart({ ...base, leapMonthMode: 'next' }, 'male');
    expect(a.namCanChi.displayName).toBe('Quý Mão');
    expect(b.namCanChi.displayName).toBe('Quý Mão');
    // Cục tính theo can chi CUNG MỆNH — tháng an sao đổi (1 ↔ 3) → cung Mệnh dịch
    // 2 cung → Cục khác là HỢP LÝ, không phải bug. Ghi nhận hành vi này tường minh:
    expect(a.tenCuc).not.toBe(b.tenCuc);
  });

  it('Can tháng dùng cho an Cung Mệnh khớp tháng an sao (không phải tháng nhuận thật)', () => {
    // Năm Quý (canIndex 9), ngũ hổ遁: 戊癸之年正月起甲寅 → tháng 1 = Giáp Dần
    const mc = getMonthCanChi(1, 9);
    expect(mc.can).toBe('Giáp');
    expect(mc.chi).toBe('Dần');
  });
});

describe('Lá số tháng nhuận — fixture hành vi mặc định', () => {
  it('mặc định first_half: biên 15/16 tháng 2 nhuận 2023 (15/2 nhuận → tháng 1; 16/2 nhuận → tháng 3)', () => {
    // 05/04/2023 = 15 tháng 2 nhuận (nửa đầu)
    const firstHalf = solarToLunar({ day: 5, month: 4, year: 2023, hour: 8 });
    expect(firstHalf.isLeap).toBe(true);
    expect(firstHalf.day).toBe(15);
    expect(firstHalf.monthForStarring).toBe(1);
    // 06/04/2023 = 16 tháng 2 nhuận (nửa sau)
    const secondHalf = solarToLunar({ day: 6, month: 4, year: 2023, hour: 8 });
    expect(secondHalf.day).toBe(16);
    expect(secondHalf.monthForStarring).toBe(3);
  });

  it('2025 nhuận tháng 6: 25/07/2025 (mùng 1 tháng 6 nhuận) → first_half → tháng 5', () => {
    const l = solarToLunar({ day: 25, month: 7, year: 2025, hour: 8 });
    expect(l.isLeap).toBe(true);
    expect(l.month).toBe(6);
    expect(l.day).toBe(1);
    expect(l.monthForStarring).toBe(5);
  });

  it('mode none (chuẩn lasotuvi/iztro): tháng nhuận an theo chính số tháng đó', () => {
    // Xác minh runtime iztro 2.6 + py_iztro (backend lasotuvi.com):
    // sinh 25/07/2025 giờ Thìn (mùng 1/6 nhuận) → Mệnh tại MÃO (an theo tháng 6)
    const l = solarToLunar({ day: 25, month: 7, year: 2025, hour: 8, leapMonthMode: 'none' });
    expect(l.isLeap).toBe(true);
    expect(l.monthForStarring).toBe(6);
    const chart = buildZiweiChart({ day: 25, month: 7, year: 2025, hour: 8, leapMonthMode: 'none' }, 'male');
    expect(chart.cungMenhChi).toBe('Mão'); // = iztro/lasotuvi (Thái Dương + Thiên Lương cư Mệnh)
    const menhStars = chart.palaces.find(p => p.palaceName === 'Mệnh')!.mainStars.map(s => s.name);
    expect(menhStars.length).toBe(2);
    expect(menhStars).toContain('Thái Dương');
    expect(menhStars).toContain('Thiên Lương');
  });
});
