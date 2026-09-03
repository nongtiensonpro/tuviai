/**
 * EngineInvariants.test.ts — Bất biến CẤU TRÚC & CỔ BẢN của 14 chính tinh
 * (Giai đoạn 1 — tailieu/KE-HOACH-NANG-CAO-DO-CHINH-XAC-LAP-LA-SO.md)
 *
 * Khác regression fixture (khóa theo lá số cụ thể), bộ test này khóa các quy luật
 * ĐÚNG THEO CỔ BẢN 紫微斗數全書 trên MỌI lá số engine sinh ra:
 * 9 cặp sao kinh điển + cấu trúc bố cục + đối xứng Tử Vi–Thiên Phủ + cung mượn.
 */

import { buildZiweiChart } from '../src/core/astrology/ChartBuilder';
import { findZiweiPosition } from '../src/core/astrology/ZiweiEngine';
import { mod12 } from '../src/core/astrology/StarConstants';
import type { SolarDate, ZiweiChart } from '../src/core/types/ZiweiTypes';
import { TWELVE_CHI } from '../src/core/types/ZiweiTypes';

/** Sinh bộ mẫu phủ rộng: 12 tháng × nhiều ngày × 5 giờ × 2 giới tính. */
function sampleSolarDates(): SolarDate[] {
  const out: SolarDate[] = [];
  for (let m = 1; m <= 12; m++) {
    for (let d = 1; d <= 28; d += 3) {
      for (const hour of [0, 5, 10, 16, 22, 23]) {
        out.push({ day: d, month: m, year: 2001, hour });
      }
    }
  }
  return out;
}

const charts: ZiweiChart[] = [];
for (const s of sampleSolarDates()) {
  for (const gender of ['male', 'female'] as const) {
    charts.push(buildZiweiChart(s, gender));
  }
}

// ============================================================
// 1. CHÍNH TINH ĐỦ & KHÔNG TRÙNG
// ============================================================
describe('Bất biến 14 chính tinh', () => {
  it('mọi lá số có đúng 14 chính tinh, không trùng lặp', () => {
    for (const c of charts) {
      const all = c.palaces.flatMap(p => p.mainStars.map(s => s.name));
      expect(all).toHaveLength(14);
      expect(new Set(all).size).toBe(14);
    }
  });

  it('mỗi cung chứa 0–2 chính tinh (không bao giờ >2)', () => {
    for (const c of charts) {
      for (const p of c.palaces) {
        expect(p.mainStars.length).toBeLessThanOrEqual(2);
      }
    }
  });
});

// ============================================================
// 2. 9 CẶP SAO KINH DIỂN (CỔ BẢN 紫微斗數全書)
//    Xác minh 2026-09 bằng công thức đối chứng độc lập.
// ============================================================
const CLASSICAL_PAIRS: Array<[string, string, string[]]> = [
  ['Tử Vi', 'Thiên Phủ', ['Dần', 'Thân']],      // 紫府寅申
  ['Thiên Đồng', 'Thái Âm', ['Tý', 'Ngọ']],      // 同阴子午
  ['Thiên Đồng', 'Cự Môn', ['Sửu', 'Mùi']],      // 同巨丑未
  ['Thiên Đồng', 'Thiên Lương', ['Dần', 'Thân']], // 同梁寅申
  ['Vũ Khúc', 'Tham Lang', ['Sửu', 'Mùi']],      // 武贪丑未
  ['Thiên Cơ', 'Thiên Lương', ['Thìn', 'Tuất']], // 机梁辰戌
  ['Liêm Trinh', 'Thiên Phủ', ['Thìn', 'Tuất']], // 廉府辰戌
  ['Liêm Trinh', 'Thiên Tướng', ['Tý', 'Ngọ']],  // 廉相子午
  ['Thái Dương', 'Thái Âm', ['Sửu', 'Mùi']],     // 日月丑未
];

describe('Bất biến 9 cặp sao kinh điển (cổ bản)', () => {
  for (const [a, b, allowedChi] of CLASSICAL_PAIRS) {
    it(`${a} + ${b} đồng cung chỉ xảy ra tại ${allowedChi.join('/')}`, () => {
      let occurrences = 0;
      for (const c of charts) {
        for (const p of c.palaces) {
          const names = p.mainStars.map(s => s.name);
          if (names.includes(a) && names.includes(b)) {
            occurrences += 1;
            expect(allowedChi).toContain(p.chi);
          }
        }
      }
      // Bộ mẫu đủ rộng thì mọi cặp đều xuất hiện ít nhất 1 lần
      expect(occurrences).toBeGreaterThan(0);
    });
  }
});

// ============================================================
// 3. ĐỐI XỨNG TỬ VI – THIÊN PHỦ
// ============================================================
describe('Bất biến đối xứng Tử Vi – Thiên Phủ', () => {
  it('Thiên Phủ luôn đối xứng Tử Vi qua trục Dần–Thân: P = (4 - Z) mod 12', () => {
    for (const c of charts) {
      const z = c.palaces.find(p => p.mainStars.some(s => s.name === 'Tử Vi'))!.chiIndex;
      const ph = c.palaces.find(p => p.mainStars.some(s => s.name === 'Thiên Phủ'))!.chiIndex;
      expect(mod12(ph)).toBe(mod12(4 - z));
    }
  });
});

// ============================================================
// 4. VỊ TRÍ TỬ VI HỢP LỆ
// ============================================================
describe('Bất biến vị trí Tử Vi', () => {
  it('findZiweiPosition trả [0,11] với mọi ngày 1–30 × 5 cục', () => {
    for (const cuc of [2, 3, 4, 5, 6] as const) {
      for (let day = 1; day <= 30; day++) {
        const pos = findZiweiPosition(day, cuc);
        expect(pos).toBeGreaterThanOrEqual(0);
        expect(pos).toBeLessThan(12);
      }
    }
  });

  it('ngày chia hết Cục: Tử Vi = Dần + Q - 1 (quy ước cổ)', () => {
    // ngày 6 Thủy Nhị: Q=3 → Dần+2 = Thìn
    expect(TWELVE_CHI[findZiweiPosition(6, 2)]).toBe('Thìn');
    // ngày 15 Thổ Ngũ: Q=3 → Dần+2 = Thìn
    expect(TWELVE_CHI[findZiweiPosition(15, 5)]).toBe('Thìn');
    // ngày 12 Kim Tứ: Q=3 → Dần+2 = Thìn
    expect(TWELVE_CHI[findZiweiPosition(12, 4)]).toBe('Thìn');
  });
});

// ============================================================
// 5. CUNG MƯỢN (VCD)
// ============================================================
describe('Bất biến cung Mượn (VCD)', () => {
  it('cung VCD mượn đúng chính tinh từ cung xung chiếu (+6); cung có chính tinh không mượn', () => {
    for (const c of charts) {
      for (const p of c.palaces) {
        if (p.mainStars.length === 0) {
          const opposite = c.palaces[mod12(p.chiIndex + 6)]!;
          expect(p.borrowedStars.map(s => s.name).sort())
            .toEqual(opposite.mainStars.map(s => s.name).sort());
          expect(p.borrowedStars.length).toBeGreaterThan(0);
        } else {
          expect(p.borrowedStars).toHaveLength(0);
        }
      }
    }
  });
});

// ============================================================
// 6. MOD12
// ============================================================
describe('Bất biến mod12', () => {
  it('luôn trả [0,11] và congruent với input', () => {
    for (const v of [-25, -13, -12, -1, 0, 1, 12, 13, 24, 100]) {
      const r = mod12(v);
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThan(12);
      expect(mod12(r - v)).toBe(0); // mod12 tránh -0 của JS (-12 % 12 = -0)
    }
  });
});
