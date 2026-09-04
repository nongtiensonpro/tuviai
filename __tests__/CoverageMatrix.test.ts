/**
 * CoverageMatrix.test.ts — Ma trận phủ rộng 60 hoa giáp × 12 giờ (GĐ4)
 * tailieu/KE-HOACH-NANG-CAO-DO-CHINH-XAC-LAP-LA-SO.md
 *
 * Triết lý: KHÔNG chế fixture ngoài. Mỗi bảng kỳ vọng dưới đây là CÔNG THỨC
 * ĐỘC LẬP viết lại từ SKILL.md (nguồn đã verify lasotuvi.com), tách hoàn toàn
 * với cách triển khai trong engine. Test sinh 60 năm × 12 giờ → 720 lá số,
 * kiểm tra mọi nhóm an sao + bất biến cấu trúc từng lá số.
 */

import { buildZiweiChart } from '../src/core/astrology/ChartBuilder';
import { getYearCanChi, solarToLunar } from '../src/core/calendar/LunarConverter';
import { mod12 } from '../src/core/astrology/StarConstants';
import type { SolarDate, ZiweiChart, Star } from '../src/core/types/ZiweiTypes';
import { TEN_CAN, TWELVE_CHI } from '../src/core/types/ZiweiTypes';

// ============================================================
// BẢNG CÔNG THỨC ĐỘC LẬP (viết tay từ SKILL.md — không import engine)
// ============================================================

const LOC_TON = { 'Giáp': 2, 'Ất': 3, 'Bính': 5, 'Đinh': 6, 'Mậu': 5, 'Kỷ': 6, 'Canh': 8, 'Tân': 9, 'Nhâm': 11, 'Quý': 0 } as const;
const KINH_DUONG = { 'Giáp': 3, 'Ất': 4, 'Bính': 6, 'Đinh': 7, 'Mậu': 6, 'Kỷ': 7, 'Canh': 9, 'Tân': 10, 'Nhâm': 0, 'Quý': 1 } as const;
const THIEN_KHOI = { 'Giáp': 1, 'Ất': 0, 'Bính': 11, 'Đinh': 11, 'Mậu': 1, 'Kỷ': 0, 'Canh': 6, 'Tân': 6, 'Nhâm': 3, 'Quý': 3 } as const;
const THIEN_VIET = { 'Giáp': 7, 'Ất': 8, 'Bính': 9, 'Đinh': 9, 'Mậu': 7, 'Kỷ': 8, 'Canh': 2, 'Tân': 2, 'Nhâm': 5, 'Quý': 5 } as const;

// Hỏa/Linh khởi theo nhóm tam hợp chi năm, đếm thuận theo giờ
const HOA_LINH_START: Record<number, { hoa: number; linh: number }> = {
  0: { hoa: 2, linh: 10 }, 4: { hoa: 2, linh: 10 }, 8: { hoa: 2, linh: 10 },
  2: { hoa: 1, linh: 3 }, 6: { hoa: 1, linh: 3 }, 10: { hoa: 1, linh: 3 },
  1: { hoa: 3, linh: 10 }, 5: { hoa: 3, linh: 10 }, 9: { hoa: 3, linh: 10 },
  3: { hoa: 9, linh: 10 }, 7: { hoa: 9, linh: 10 }, 11: { hoa: 9, linh: 10 },
};

const DAO_HOA: Record<number, number> = { 0: 9, 1: 6, 2: 3, 3: 0, 4: 9, 5: 6, 6: 3, 7: 0, 8: 9, 9: 6, 10: 3, 11: 0 };
const HONG_LOAN = (chi: number) => mod12(3 - chi);
const CO_THAN: Record<number, number> = { 0: 2, 1: 2, 2: 5, 3: 5, 4: 5, 5: 8, 6: 8, 7: 8, 8: 11, 9: 11, 10: 11, 11: 2 };
const QUA_TU: Record<number, number> = { 0: 10, 1: 10, 2: 1, 3: 1, 4: 1, 5: 4, 6: 4, 7: 4, 8: 7, 9: 7, 10: 7, 11: 10 };

// Tứ hóa theo can năm [Lộc, Quyền, Khoa, Kỵ]
const TU_HOA: Record<string, [string, string, string, string]> = {
  'Giáp': ['Liêm Trinh', 'Phá Quân', 'Vũ Khúc', 'Thái Dương'],
  'Ất':   ['Thiên Cơ', 'Thiên Lương', 'Tử Vi', 'Thái Âm'],
  'Bính': ['Thiên Đồng', 'Thiên Cơ', 'Văn Xương', 'Liêm Trinh'],
  'Đinh': ['Thái Âm', 'Thiên Đồng', 'Thiên Cơ', 'Cự Môn'],
  'Mậu':  ['Tham Lang', 'Thái Âm', 'Hữu Bật', 'Thiên Cơ'],
  'Kỷ':   ['Vũ Khúc', 'Tham Lang', 'Thiên Lương', 'Văn Khúc'],
  'Canh': ['Thái Dương', 'Vũ Khúc', 'Thái Âm', 'Thiên Đồng'],
  'Tân':  ['Cự Môn', 'Thái Dương', 'Văn Khúc', 'Văn Xương'],
  'Nhâm': ['Thiên Lương', 'Tử Vi', 'Tả Phù', 'Vũ Khúc'],
  'Quý':  ['Phá Quân', 'Cự Môn', 'Thái Âm', 'Tham Lang'],
};

// Tuần Không theo tuần hoa giáp / Triệt Không theo can năm
const TUAN_KHONG = [[10, 11], [8, 9], [6, 7], [4, 5], [2, 3], [0, 1]] as const;
const TRIET_KHONG: Record<string, [number, number]> = {
  'Giáp': [8, 9], 'Kỷ': [8, 9], 'Ất': [6, 7], 'Canh': [6, 7],
  'Bính': [4, 5], 'Tân': [4, 5], 'Đinh': [2, 3], 'Nhâm': [2, 3],
  'Mậu': [0, 1], 'Quý': [0, 1],
};

// Mệnh/Thân
const menhIdx = (month: number, hour: number) => mod12((month + 1) - hour);
const thanIdx  = (month: number, hour: number) => mod12((month + 1) + hour);

// Nạp âm cục theo can chi cung Mệnh (bảng SKILL.md §4)
const NAP_AM_CUC: Record<string, number> = {
  'Giáp-Tý': 4, 'Ất-Sửu': 4, 'Nhâm-Dần': 4, 'Quý-Mão': 4, 'Canh-Thìn': 4, 'Tân-Tỵ': 4, 'Giáp-Ngọ': 4, 'Ất-Mùi': 4, 'Nhâm-Thân': 4, 'Quý-Dậu': 4, 'Canh-Tuất': 4, 'Tân-Hợi': 4,
  'Canh-Tý': 5, 'Tân-Sửu': 5, 'Mậu-Dần': 5, 'Kỷ-Mão': 5, 'Bính-Thìn': 5, 'Đinh-Tỵ': 5, 'Canh-Ngọ': 5, 'Tân-Mùi': 5, 'Mậu-Thân': 5, 'Kỷ-Dậu': 5, 'Bính-Tuất': 5, 'Đinh-Hợi': 5,
  'Mậu-Tý': 6, 'Kỷ-Sửu': 6, 'Bính-Dần': 6, 'Đinh-Mão': 6, 'Giáp-Thìn': 6, 'Ất-Tỵ': 6, 'Mậu-Ngọ': 6, 'Kỷ-Mùi': 6, 'Bính-Thân': 6, 'Đinh-Dậu': 6, 'Giáp-Tuất': 6, 'Ất-Hợi': 6,
  'Nhâm-Tý': 3, 'Quý-Sửu': 3, 'Canh-Dần': 3, 'Tân-Mão': 3, 'Mậu-Thìn': 3, 'Kỷ-Tỵ': 3, 'Nhâm-Ngọ': 3, 'Quý-Mùi': 3, 'Canh-Thân': 3, 'Tân-Dậu': 3, 'Mậu-Tuất': 3, 'Kỷ-Hợi': 3,
  'Bính-Tý': 2, 'Đinh-Sửu': 2, 'Giáp-Dần': 2, 'Ất-Mão': 2, 'Nhâm-Thìn': 2, 'Quý-Tỵ': 2, 'Bính-Ngọ': 2, 'Đinh-Mùi': 2, 'Giáp-Thân': 2, 'Ất-Dậu': 2, 'Nhâm-Tuất': 2, 'Quý-Hợi': 2,
};

// Can cung Mệnh: ngũ hổ遁 — Can Dần theo can năm
const DAN_CAN: Record<string, number> = { 'Giáp': 2, 'Ất': 4, 'Bính': 6, 'Đinh': 8, 'Mậu': 0, 'Kỷ': 2, 'Canh': 4, 'Tân': 6, 'Nhâm': 8, 'Quý': 0 };

// ============================================================
// SINH CORPUS: 60 năm hoa giáp × 12 giờ = 720 lá số
// ============================================================

interface CorpusEntry {
  chart: ZiweiChart;
  can: string; chiIdx: number; hour: number; month: number;
}

function buildCorpus(): CorpusEntry[] {
  const out: CorpusEntry[] = [];
  // mỗi năm 1949-2008 phủ 60 hoa giáp; chọn ngày 15 mỗi tháng 6, đủ giờ
  for (let year = 1949; year <= 2008; year++) {
    for (const hour of [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22]) {
      const solar: SolarDate = { day: 15, month: 6, year, hour };
      const chart = buildZiweiChart(solar, 'male');
      const cc = getYearCanChi(chart.lunarDate.year);
      out.push({ chart, can: cc.can, chiIdx: cc.chiIndex, hour, month: chart.lunarDate.monthForStarring });
    }
  }
  return out;
}

const corpus = buildCorpus();

function starsOf(chart: ZiweiChart, chiIndex: number): Star[] {
  return chart.palaces[chiIndex]!.auxStars;
}
function hasStar(chart: ZiweiChart, chiIndex: number, name: string): boolean {
  return starsOf(chart, chiIndex).some(s => s.name === name);
}

// ============================================================
// TESTS
// ============================================================

describe('Corpus 60 hoa giáp × 12 giờ — bảng an sao độc lập', () => {
  it('corpus phủ đủ 60 hoa giáp và 12 giá trị giờ', () => {
    expect(corpus.length).toBe(720);
    const cans = new Set(corpus.map(c => c.can));
    expect(cans.size).toBe(10);
    const chis = new Set(corpus.map(c => c.chiIdx));
    expect(chis.size).toBe(12);
    const hours = new Set(corpus.map(c => c.hour));
    expect(hours.size).toBe(12);
  });

  it('Lộc Tồn / Kình Dương / Đà La khớp bảng can độc lập (720 lá số)', () => {
    for (const c of corpus) {
      const lt = LOC_TON[c.can as keyof typeof LOC_TON];
      const kd = KINH_DUONG[c.can as keyof typeof KINH_DUONG];
      expect(hasStar(c.chart, lt, 'Lộc Tồn')).toBe(true);
      expect(hasStar(c.chart, kd, 'Kình Dương')).toBe(true);
      expect(hasStar(c.chart, mod12(kd - 1), 'Đà La')).toBe(true);
    }
  });

  it('Thiên Khôi / Thiên Việt khớp bảng can độc lập', () => {
    for (const c of corpus) {
      expect(hasStar(c.chart, THIEN_KHOI[c.can as keyof typeof THIEN_KHOI], 'Thiên Khôi')).toBe(true);
      expect(hasStar(c.chart, THIEN_VIET[c.can as keyof typeof THIEN_VIET], 'Thiên Việt')).toBe(true);
    }
  });

  it('Hỏa Tinh / Linh Tinh khớp công thức nhóm tam hợp × giờ (144 tổ hợp can-chi)', () => {
    const seen = new Set<string>();
    for (const c of corpus) {
      const key = `${c.can}-${c.chiIdx}-${c.hour}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const start = HOA_LINH_START[c.chart.namCanChi.chiIndex]!;
      const hourChiIdx = c.chart.lunarDate.hourChiIndex;
      expect(hasStar(c.chart, mod12(start.hoa + hourChiIdx), 'Hỏa Tinh')).toBe(true);
      expect(hasStar(c.chart, mod12(start.linh + hourChiIdx), 'Linh Tinh')).toBe(true);
    }
    expect(seen.size).toBeGreaterThanOrEqual(60);
  });

  it('Tả Phù / Hữu Bật / Văn Xương / Văn Khúc khớp công thức tháng & giờ', () => {
    for (const c of corpus) {
      const m = c.month, h = c.chart.lunarDate.hourChiIndex;
      expect(hasStar(c.chart, mod12(4 + m - 1), 'Tả Phù')).toBe(true);
      expect(hasStar(c.chart, mod12(10 - m + 1), 'Hữu Bật')).toBe(true);
      expect(hasStar(c.chart, mod12(10 - h), 'Văn Xương')).toBe(true);
      expect(hasStar(c.chart, mod12(4 + h), 'Văn Khúc')).toBe(true);
    }
  });

  it('Đào Hoa / Hồng Loan / Thiên Hỷ / Cô Thần / Quả Tú khớp bảng chi độc lập', () => {
    for (const c of corpus) {
      const chi = c.chart.namCanChi.chiIndex;
      expect(hasStar(c.chart, DAO_HOA[chi], 'Đào Hoa')).toBe(true);
      expect(hasStar(c.chart, HONG_LOAN(chi), 'Hồng Loan')).toBe(true);
      expect(hasStar(c.chart, mod12(HONG_LOAN(chi) + 6), 'Thiên Hỷ')).toBe(true);
      expect(hasStar(c.chart, CO_THAN[chi], 'Cô Thần')).toBe(true);
      expect(hasStar(c.chart, QUA_TU[chi], 'Quả Tú')).toBe(true);
    }
  });

  it('Tứ Hóa gắn đúng sao theo can năm (tìm sao hóa trong toàn bàn)', () => {
    for (const c of corpus) {
      const expected = TU_HOA[c.can];
      const types = ['Lộc', 'Quyền', 'Khoa', 'Kỵ'] as const;
      for (let i = 0; i < 4; i++) {
        const starName = expected[i]!;
        const type = types[i]!;
        // sao đó phải tồn tại (chính tinh hoặc phụ tinh) và mang nhãn sihua đúng
        let found = false;
        for (const p of c.chart.palaces) {
          for (const s of [...p.mainStars, ...p.auxStars]) {
            if (s.name === starName && s.sihua === type) found = true;
          }
        }
        expect(found).toBe(true);
      }
    }
  });

  it('Tuần Không / Triệt Không đúng vị trí theo hoa giáp', () => {
    for (const c of corpus) {
      const cc = c.chart.namCanChi;
      // tuần: sexagenary = vị trí trong 60
      const sex = ((cc.canIndex * 6) % 10 + (cc.chiIndex % 12)) % 60; // can0-chi0=0
      // thực tế tính: duyệt tìm
      let sg = 0;
      for (let i = 0; i < 60; i++) if (i % 10 === cc.canIndex && i % 12 === cc.chiIndex) sg = i;
      const [t1, t2] = TUAN_KHONG[Math.floor(sg / 10)]!;
      expect(c.chart.palaces[t1]!.hasTuanKhong).toBe(true);
      expect(c.chart.palaces[t2]!.hasTuanKhong).toBe(true);
      const [r1, r2] = TRIET_KHONG[cc.can]!;
      expect(c.chart.palaces[r1]!.hasTrietKhong).toBe(true);
      expect(c.chart.palaces[r2]!.hasTrietKhong).toBe(true);
    }
  });

  it('Cung Mệnh / Cung Thân khớp công thức tháng-giờ độc lập', () => {
    for (const c of corpus) {
      expect(c.chart.cungMenhIndex).toBe(menhIdx(c.month, c.chart.lunarDate.hourChiIndex));
      expect(c.chart.cungThanIndex).toBe(thanIdx(c.month, c.chart.lunarDate.hourChiIndex));
    }
  });

  it('Cục (Ngũ Hành Nạp Âm) khớp bảng can-chi cung Mệnh độc lập', () => {
    for (const c of corpus) {
      const cc = c.chart.namCanChi;
      const danCan = DAN_CAN[cc.can]!;
      const menhChi = c.chart.cungMenhIndex;
      // Can Dần theo năm + offset từ Dần → chu kỳ CAN là 10 (không phải 12!)
      const offsetFromDan = (menhChi - 2 + 12) % 12;
      const menhCanIdx = (danCan + offsetFromDan) % 10;
      const menhCan = TEN_CAN[menhCanIdx]!;
      const expectedCuc = NAP_AM_CUC[`${menhCan}-${TWELVE_CHI[menhChi]}`];
      expect(c.chart.nguHanhCuc).toBe(expectedCuc);
    }
  });

  it('Đại Hạn cung Mệnh = số Cục; mỗi cung cách nhau 10 tuổi theo chiều Âm Dương', () => {
    for (const c of corpus) {
      const menh = c.chart.palaces.find(p => p.palaceName === 'Mệnh')!;
      expect(menh.daiHan).toBe(c.chart.nguHanhCuc);
      const cc = c.chart.namCanChi;
      const isThuan = (cc.canIndex % 2 === 0); // male + dương can
      for (const p of c.chart.palaces) {
        const offset = isThuan
          ? mod12(p.chiIndex - c.chart.cungMenhIndex)
          : mod12(c.chart.cungMenhIndex - p.chiIndex);
        expect(p.daiHan).toBe(c.chart.nguHanhCuc + offset * 10);
      }
    }
  });
});
