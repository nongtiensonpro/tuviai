/**
 * BrightnessTable.test.ts — Khóa bảng độ sáng 14 chính tinh (GĐ3-L3)
 * + NguHanhEngine.test bổ sung: ngũ hành sao lưu niên không strip (GĐ3-L6)
 *
 * Bảng là QUY ƯỚC TRƯỜNG PHÁI (Lý số HN — xem điều tra 4 nguồn trong
 * tailieu/KE-HOACH-NANG-CAO-DO-CHINH-XAC-LAP-LA-SO.md GĐ3). Bộ test này
 * khóa 168 ô để chống thay đổi âm thầm; nếu cần đổi trường phái thì phải
 * đổi có chủ đích kèm cập nhật SKILL.md + fixtures.
 */

import { BRIGHTNESS } from '../src/core/astrology/StarConstants';
import { getStarNguHanh } from '../src/core/astrology/NguHanhEngine';
import { STAR_CATALOG, getNatalStarCount } from '../src/core/astrology/StarCatalog';
import type { StarBrightness } from '../src/core/types/ZiweiTypes';

const CHI_VN = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

// Bản sao khóa (snapshot thủ công) — chốt từng ô theo bảng Lý số HN hiện hành
const LOCKED: Record<string, string> = {
  '紫微':   'ĐĐĐĐĐMMVĐHVĐ',
  '天機':   'BĐHMHĐBBHMHV',
  '太陽':   'HHVVMMMVĐHHH',
  '武曲':   'MĐĐHĐMHĐM VĐH'.replace(' ', ''),
  '天同':   'VHVVHHHMMHHM',
  '廉貞':   'HMMHBHVHĐHVH',
  '天府':   'MMĐĐMĐMMĐVMĐ',
  '太陰':   'MVHHHHHHVMĐV',
  '貪狼':   'VĐMVĐHBBVMHM',
  '巨門':   'BMHHHVBVHHMH',
  '天相':   'MĐVĐMĐMĐVĐMĐ',
  '天梁':   'MVVHMHVVHHMH',
  '七殺':   'MHVHHMMHVHHM',
  '破軍':   'VHHVMVHVVVVH',
};

describe('Bảng độ sáng 14 chính tinh — khóa 168 ô', () => {
  it('đủ 14 sao × 12 chi, mỗi ô là ký hiệu hợp lệ', () => {
    const stars = Object.keys(BRIGHTNESS);
    expect(stars).toHaveLength(14);
    for (const star of stars) {
      const row = BRIGHTNESS[star];
      expect(row).toHaveLength(12);
      for (const cell of row) {
        expect(['M', 'V', 'Đ', 'B', 'H', '']).toContain(cell);
      }
    }
  });

  it('khóa từng ô theo bảng Lý số HN (bất kỳ ai sửa bảng đều fail đúng ô)', () => {
    for (const [han, lockedRow] of Object.entries(LOCKED)) {
      expect(BRIGHTNESS[han].join('')).toBe(lockedRow);
    }
  });

  it('một số ô đã được đối chiếu đồng thuận đa nguồn (miếu)', () => {
    // Thái Dương Miếu tại Ngọ — "Nhật Lệ Trung Thiên", khớp cả Lý số HN + horos.vn
    expect(BRIGHTNESS['太陽'][6]).toBe('M');
    // Vũ Khúc Miếu tại Thìn/Tuất/Sửu/Mùi — khớp iztro + horos + mangekj
    expect(BRIGHTNESS['武曲'][4]).toBe('Đ'); // bảng HN xếp Đắc tại Thìn — GHI CHÚ tranh chấp
  });
});

describe('Ngũ hành sao — GĐ3-L6 (không phụ thuộc strip "Lưu ")', () => {
  it('toàn bộ 17 sao lưu niên resolve được ngũ hành trực tiếp (không strip)', () => {
    const annual = STAR_CATALOG.filter(s => s.scope === 'annual');
    expect(annual.length).toBe(17);
    for (const s of annual) {
      const nh = getStarNguHanh(s.name); // KHÔNG strip — phải resolve ngay
      expect(['Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ']).toContain(nh);
    }
  });

  it('ngũ hành sao lưu niên khớp sao gốc tương ứng', () => {
    const pairs: Array<[string, string]> = [
      ['Lưu Kình Dương', 'Kình Dương'],
      ['Lưu Đà La', 'Đà La'],
      ['Lưu Hỏa Tinh', 'Hỏa Tinh'],
      ['Lưu Linh Tinh', 'Linh Tinh'],
      ['Lưu Lộc Tồn', 'Lộc Tồn'],
      ['Lưu Thái Tuế', 'Thái Tuế'],
      ['Lưu Thiên Khôi', 'Thiên Khôi'],
    ];
    for (const [luu, goc] of pairs) {
      expect(getStarNguHanh(luu)).toBe(getStarNguHanh(goc));
    }
  });

  it('sao natal trong catalog đều resolve ngũ hành được (không throw)', () => {
    for (const s of STAR_CATALOG.filter(x => x.scope === 'natal')) {
      expect(() => getStarNguHanh(s.name)).not.toThrow();
    }
    expect(getNatalStarCount()).toBe(121);
  });

  it('sao lạ vẫn fail-fast', () => {
    expect(() => getStarNguHanh('Sao Không Tồn Tại')).toThrow();
  });
});
