import { getNamCanChi, getYearCanChi } from '../src/core/calendar/LunarConverter';
import { buildPalaces } from '../src/core/astrology/PalaceCalculator';
import { placeLucCatTinh } from '../src/core/astrology/AuxStarEngine';
import { placeAllMinorStars } from '../src/core/astrology/MinorStarEngine';

function buildCompletedPalaces(year: number, month: number, day: number, hourChiIdx: number, gender: 'Nam' | 'Nữ', cuc: number = 4) {
  const namCanChi = getNamCanChi(year);
  const yearCanChi = getYearCanChi(year);
  const basePalaces = buildPalaces(2, namCanChi, yearCanChi.canIndex);
  const withCat = placeLucCatTinh(basePalaces, month, yearCanChi.canIndex, hourChiIdx);
  const completedPalaces = placeAllMinorStars(
    withCat,
    yearCanChi.canIndex,
    yearCanChi.chiIndex,
    month,
    day,
    hourChiIdx,
    gender,
    cuc
  );
  return { completedPalaces, yearCanChi };
}

describe('MinorStarVerification - Phase 1', () => {
  it('an Đẩu Quân đúng theo công thức: (yearChiIdx - month + 1 + hourChiIdx + 24) % 12', () => {
    // Năm Ất Hợi 1995 (chi index = 11), sinh tháng 4, giờ Tỵ (5)
    // dauQuan = (11 - 4 + 1 + 5 + 24) % 12 = 13 % 12 = 1 (Sửu)
    const { completedPalaces } = buildCompletedPalaces(1995, 4, 15, 5, 'Nam');
    expect(completedPalaces[1]?.auxStars.some(s => s.name === 'Đẩu Quân')).toBe(true);

    // Năm Kỷ Mão 1999 (chi index = 3), sinh tháng 8, giờ Mão (3)
    // dauQuan = (3 - 8 + 1 + 3 + 24) % 12 = 23 % 12 = 11 (Hợi)
    const { completedPalaces: p1999 } = buildCompletedPalaces(1999, 8, 15, 3, 'Nam');
    expect(p1999[11]?.auxStars.some(s => s.name === 'Đẩu Quân')).toBe(true);
  });

  it('an Thiên Vu đúng theo công thức: (8 + yearChiIdx) % 12', () => {
    // Năm Ất Hợi 1995 (chi index = 11) -> (8 + 11) % 12 = 19 % 12 = 7 (Mùi)
    const { completedPalaces } = buildCompletedPalaces(1995, 4, 15, 5, 'Nam');
    expect(completedPalaces[7]?.auxStars.some(s => s.name === 'Thiên Vu')).toBe(true);

    // Năm Kỷ Mão 1999 (chi index = 3) -> (8 + 3) % 12 = 11 (Hợi)
    const { completedPalaces: p1999 } = buildCompletedPalaces(1999, 8, 15, 3, 'Nam');
    expect(p1999[11]?.auxStars.some(s => s.name === 'Thiên Vu')).toBe(true);
  });

  it('an Thiên Riêu đúng theo công thức: (1 + month - 1) % 12', () => {
    // Tháng 4 -> 4 - 1 + 1 = 4 (Thìn)
    const { completedPalaces } = buildCompletedPalaces(1995, 4, 15, 5, 'Nam');
    expect(completedPalaces[4]?.auxStars.some(s => s.name === 'Thiên Riêu')).toBe(true);

    // Tháng 8 -> 8 - 1 + 1 = 8 (Thân)
    const { completedPalaces: p1999 } = buildCompletedPalaces(1999, 8, 15, 3, 'Nam');
    expect(p1999[8]?.auxStars.some(s => s.name === 'Thiên Riêu')).toBe(true);
  });

  it('verify Thiên Quan/Phúc ở Can Ất', () => {
    // Năm Ất Hợi 1995 (can index = 1)
    // Thiên Quan = Thìn (4), Thiên Phúc = Thân (8)
    const { completedPalaces } = buildCompletedPalaces(1995, 4, 15, 5, 'Nam');
    expect(completedPalaces[4]?.auxStars.some(s => s.name === 'Thiên Quan')).toBe(true);
    expect(completedPalaces[8]?.auxStars.some(s => s.name === 'Thiên Phúc')).toBe(true);
  });

  it('verify Lưu Hà ở Can Đinh/Canh theo phái Thái Thứ Lang', () => {
    // Can Đinh 1987 (can index = 3) -> Lưu Hà = Thìn (4)
    const { completedPalaces: pĐinh } = buildCompletedPalaces(1987, 4, 15, 5, 'Nam');
    expect(pĐinh[4]?.auxStars.some(s => s.name === 'Lưu Hà')).toBe(true);

    // Can Canh 1990 (can index = 6) -> Lưu Hà = Thân (8)
    const { completedPalaces: pCanh } = buildCompletedPalaces(1990, 4, 15, 5, 'Nam');
    expect(pCanh[8]?.auxStars.some(s => s.name === 'Lưu Hà')).toBe(true);
  });

  describe('Milestone 3 - New Natal Stars (15 stars)', () => {
    it('verify Vòng Tướng Tinh cho tuổi Ất Hợi 1995 (khởi tại Mão)', () => {
      // Ất Hợi 1995: Chi Hợi (11) -> tam hợp Hợi Mão Mùi -> Tướng Tinh khởi tại Mão (3)
      const { completedPalaces } = buildCompletedPalaces(1995, 4, 15, 5, 'Nam');
      
      expect(completedPalaces[3]?.auxStars.some(s => s.name === 'Tướng Tinh')).toBe(true);
      expect(completedPalaces[4]?.auxStars.some(s => s.name === 'Phan An')).toBe(true);
      expect(completedPalaces[6]?.auxStars.some(s => s.name === 'Tức Thần')).toBe(true);
      expect(completedPalaces[9]?.auxStars.some(s => s.name === 'Tai Sát')).toBe(true);
      expect(completedPalaces[10]?.auxStars.some(s => s.name === 'Thiên Sát')).toBe(true);
      expect(completedPalaces[11]?.auxStars.some(s => s.name === 'Chỉ Bối')).toBe(true);
      expect(completedPalaces[1]?.auxStars.some(s => s.name === 'Nguyệt Sát')).toBe(true);
      expect(completedPalaces[2]?.auxStars.some(s => s.name === 'Vong Thần')).toBe(true);
    });

    it('verify Lưu Niên Văn Tinh và Thiên Khố theo Can năm', () => {
      // Can Ất (1) -> Văn Tinh ở Ngọ (6), Thiên Khố ở Ngọ (6)
      const { completedPalaces: p1995 } = buildCompletedPalaces(1995, 4, 15, 5, 'Nam');
      expect(p1995[6]?.auxStars.some(s => s.name === 'Lưu Niên Văn Tinh')).toBe(true);
      expect(p1995[6]?.auxStars.some(s => s.name === 'Thiên Khố')).toBe(true);

      // Can Kỷ (5) -> Văn Tinh ở Dậu (9), Thiên Khố ở Ngọ (6)
      const { completedPalaces: p1999 } = buildCompletedPalaces(1999, 8, 15, 3, 'Nam');
      expect(p1999[9]?.auxStars.some(s => s.name === 'Lưu Niên Văn Tinh')).toBe(true);
      expect(p1999[6]?.auxStars.some(s => s.name === 'Thiên Khố')).toBe(true);
    });

    it('verify các sao an theo Tháng sinh âm lịch', () => {
      // Tháng 4 âm lịch (tuổi Ất Hợi)
      // Nguyệt Giải ở Dậu (9)
      // Âm Sát ở Thân (8)
      // Thiên Nguyệt ở Dần (2)
      // Nguyệt Yếm ở Mùi (7)
      // Nguyệt Hình ở Hợi (11)
      const { completedPalaces: p1995 } = buildCompletedPalaces(1995, 4, 15, 5, 'Nam');
      expect(p1995[9]?.auxStars.some(s => s.name === 'Nguyệt Giải')).toBe(true);
      expect(p1995[8]?.auxStars.some(s => s.name === 'Âm Sát')).toBe(true);
      expect(p1995[2]?.auxStars.some(s => s.name === 'Thiên Nguyệt')).toBe(true);
      expect(p1995[7]?.auxStars.some(s => s.name === 'Nguyệt Yếm')).toBe(true);
      expect(p1995[11]?.auxStars.some(s => s.name === 'Nguyệt Hình')).toBe(true);

      // Tháng 8 âm lịch (tuổi Kỷ Mão)
      // Nguyệt Giải ở Hợi (11)
      // Âm Sát ở Tý (0)
      // Thiên Nguyệt ở Mùi (7)
      // Nguyệt Yếm ở Mão (3)
      // Nguyệt Hình ở Hợi (11)
      const { completedPalaces: p1999 } = buildCompletedPalaces(1999, 8, 15, 3, 'Nam');
      expect(p1999[11]?.auxStars.some(s => s.name === 'Nguyệt Giải')).toBe(true);
      expect(p1999[0]?.auxStars.some(s => s.name === 'Âm Sát')).toBe(true);
      expect(p1999[7]?.auxStars.some(s => s.name === 'Thiên Nguyệt')).toBe(true);
      expect(p1999[3]?.auxStars.some(s => s.name === 'Nguyệt Yếm')).toBe(true);
      expect(p1999[11]?.auxStars.some(s => s.name === 'Nguyệt Hình')).toBe(true);
    });
  });
});
