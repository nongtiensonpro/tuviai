import { buildPalaces } from '../src/core/astrology/PalaceCalculator';
import { placeLucCatTinh } from '../src/core/astrology/AuxStarEngine';
import { placeAllMinorStars } from '../src/core/astrology/MinorStarEngine';
import { getNamCanChi } from '../src/core/calendar/LunarConverter';
import type { Palace } from '../src/core/types/ZiweiTypes';

function buildTestPalaces(
  yearCanIdx: number,
  yearChiIdx: number,
  month: number,
  day: number,
  hourChiIdx: number,
  gender: 'Nam' | 'Nữ',
  cuc: number = 4
): Palace[] {
  // Sinh ra đối tượng NamCanChi chuẩn từ năm 1984 (Giáp Tý)
  const namCanChi = getNamCanChi(1984);
  const basePalaces = buildPalaces(2, namCanChi, yearCanIdx);
  const withCat = placeLucCatTinh(basePalaces, month, yearCanIdx, hourChiIdx);
  return placeAllMinorStars(withCat, yearCanIdx, yearChiIdx, month, day, hourChiIdx, gender, cuc);
}

describe('MinorStarGroups - Milestone 4 Refactoring Verification', () => {
  
  describe('1. Nhóm Sao An Theo Thiên Can Năm Sinh (placeStarByCan)', () => {
    it('an chính xác cho Can Giáp (index 0)', () => {
      // Giáp -> Quan: Mùi(7), Phúc: Dậu(9), Lưu Hà: Dậu(9), Trù: Tỵ(5), Văn Tinh: Tỵ(5), Thiên Khố: Tỵ(5)
      const palaces = buildTestPalaces(0, 0, 1, 1, 0, 'Nam');
      expect(palaces[7]?.auxStars.some(s => s.name === 'Thiên Quan')).toBe(true);
      expect(palaces[9]?.auxStars.some(s => s.name === 'Thiên Phúc')).toBe(true);
      expect(palaces[9]?.auxStars.some(s => s.name === 'Lưu Hà')).toBe(true);
      expect(palaces[5]?.auxStars.some(s => s.name === 'Thiên Trù')).toBe(true);
      expect(palaces[5]?.auxStars.some(s => s.name === 'Lưu Niên Văn Tinh')).toBe(true);
      expect(palaces[5]?.auxStars.some(s => s.name === 'Thiên Khố')).toBe(true);
    });

    it('an chính xác cho Can Ất (index 1)', () => {
      // Ất -> Quan: Thìn(4), Phúc: Thân(8), Lưu Hà: Tuất(10), Trù: Ngọ(6), Văn Tinh: Ngọ(6), Thiên Khố: Ngọ(6)
      const palaces = buildTestPalaces(1, 0, 1, 1, 0, 'Nam');
      expect(palaces[4]?.auxStars.some(s => s.name === 'Thiên Quan')).toBe(true);
      expect(palaces[8]?.auxStars.some(s => s.name === 'Thiên Phúc')).toBe(true);
      expect(palaces[10]?.auxStars.some(s => s.name === 'Lưu Hà')).toBe(true);
      expect(palaces[6]?.auxStars.some(s => s.name === 'Thiên Trù')).toBe(true);
      expect(palaces[6]?.auxStars.some(s => s.name === 'Lưu Niên Văn Tinh')).toBe(true);
      expect(palaces[6]?.auxStars.some(s => s.name === 'Thiên Khố')).toBe(true);
    });

    it('an chính xác cho Can Bính (index 2)', () => {
      // Bính -> Quan: Tỵ(5), Phúc: Tý(0), Lưu Hà: Mùi(7), Trù: Tý(0), Văn Tinh: Thân(8), Thiên Khố: Mùi(7)
      const palaces = buildTestPalaces(2, 0, 1, 1, 0, 'Nam');
      expect(palaces[5]?.auxStars.some(s => s.name === 'Thiên Quan')).toBe(true);
      expect(palaces[0]?.auxStars.some(s => s.name === 'Thiên Phúc')).toBe(true);
      expect(palaces[7]?.auxStars.some(s => s.name === 'Lưu Hà')).toBe(true);
      expect(palaces[0]?.auxStars.some(s => s.name === 'Thiên Trù')).toBe(true);
      expect(palaces[8]?.auxStars.some(s => s.name === 'Lưu Niên Văn Tinh')).toBe(true);
      expect(palaces[7]?.auxStars.some(s => s.name === 'Thiên Khố')).toBe(true);
    });
  });

  describe('2. Nhóm Sao An Theo Địa Chi Năm Sinh (placeStarByChi)', () => {
    it('an chính xác cho tuổi Tý (index 0)', () => {
      // Tý -> Cô Thần: Dần(2), Quả Tú: Tuất(10), Kiếp Sát: Tỵ(5), Hoa Cái: Thìn(4), Phá Toái: Tỵ(5), Thiên Mã: Dần(2)
      const palaces = buildTestPalaces(0, 0, 1, 1, 0, 'Nam');
      expect(palaces[2]?.auxStars.some(s => s.name === 'Cô Thần')).toBe(true);
      expect(palaces[10]?.auxStars.some(s => s.name === 'Quả Tú')).toBe(true);
      expect(palaces[5]?.auxStars.some(s => s.name === 'Kiếp Sát')).toBe(true);
      expect(palaces[4]?.auxStars.some(s => s.name === 'Hoa Cái')).toBe(true);
      expect(palaces[5]?.auxStars.some(s => s.name === 'Phá Toái')).toBe(true);
      expect(palaces[2]?.auxStars.some(s => s.name === 'Thiên Mã')).toBe(true);
    });

    it('an chính xác cho tuổi Dần (index 2)', () => {
      // Dần -> Cô Thần: Tỵ(5), Quả Tú: Sửu(1), Kiếp Sát: Hợi(11), Hoa Cái: Tuất(10), Phá Toái: Dậu(9), Thiên Mã: Hợi(11)
      const palaces = buildTestPalaces(0, 2, 1, 1, 0, 'Nam');
      expect(palaces[5]?.auxStars.some(s => s.name === 'Cô Thần')).toBe(true);
      expect(palaces[1]?.auxStars.some(s => s.name === 'Quả Tú')).toBe(true);
      expect(palaces[11]?.auxStars.some(s => s.name === 'Kiếp Sát')).toBe(true);
      expect(palaces[10]?.auxStars.some(s => s.name === 'Hoa Cái')).toBe(true);
      expect(palaces[9]?.auxStars.some(s => s.name === 'Phá Toái')).toBe(true);
      expect(palaces[8]?.auxStars.some(s => s.name === 'Thiên Mã')).toBe(true);
    });
  });

  describe('3. Nhóm Sao An Theo Tháng Sinh (placeStarByMonth)', () => {
    it('an chính xác cho tháng 1', () => {
      // T1 -> Hình: Dậu(9), Diêu/Y: Sửu(1), Giải: Thân(8), Địa Giải: Mùi(7), Nguyệt Giải: Thân(8), Âm Sát: Dần(2), Thiên Nguyệt: Tuất(10), Nguyệt Yếm: Tuất(10), Nguyệt Hình: Tỵ(5)
      const palaces = buildTestPalaces(0, 0, 1, 1, 0, 'Nam');
      expect(palaces[9]?.auxStars.some(s => s.name === 'Thiên Hình')).toBe(true);
      expect(palaces[1]?.auxStars.some(s => s.name === 'Thiên Diêu')).toBe(true);
      expect(palaces[1]?.auxStars.some(s => s.name === 'Thiên Y')).toBe(true);
      expect(palaces[8]?.auxStars.some(s => s.name === 'Thiên Giải')).toBe(true);
      expect(palaces[7]?.auxStars.some(s => s.name === 'Địa Giải')).toBe(true);
      expect(palaces[8]?.auxStars.some(s => s.name === 'Nguyệt Giải')).toBe(true);
      expect(palaces[2]?.auxStars.some(s => s.name === 'Âm Sát')).toBe(true);
      expect(palaces[10]?.auxStars.some(s => s.name === 'Thiên Nguyệt')).toBe(true);
      expect(palaces[10]?.auxStars.some(s => s.name === 'Nguyệt Yếm')).toBe(true);
      expect(palaces[5]?.auxStars.some(s => s.name === 'Nguyệt Hình')).toBe(true);
    });

    it('an chính xác cho tháng 5', () => {
      // T5 -> Hình: Sửu(1), Diêu/Y: Tỵ(5), Giải: Tý(0), Địa Giải: Hợi(11), Nguyệt Giải: Tuất(10), Âm Sát: Ngọ(6), Thiên Nguyệt: Mùi(7), Nguyệt Yếm: Ngọ(6), Nguyệt Hình: Tỵ(5)
      const palaces = buildTestPalaces(0, 0, 5, 1, 0, 'Nam');
      expect(palaces[1]?.auxStars.some(s => s.name === 'Thiên Hình')).toBe(true);
      expect(palaces[5]?.auxStars.some(s => s.name === 'Thiên Diêu')).toBe(true);
      expect(palaces[5]?.auxStars.some(s => s.name === 'Thiên Y')).toBe(true);
      expect(palaces[0]?.auxStars.some(s => s.name === 'Thiên Giải')).toBe(true);
      expect(palaces[11]?.auxStars.some(s => s.name === 'Địa Giải')).toBe(true);
      expect(palaces[10]?.auxStars.some(s => s.name === 'Nguyệt Giải')).toBe(true);
      expect(palaces[6]?.auxStars.some(s => s.name === 'Âm Sát')).toBe(true);
      expect(palaces[7]?.auxStars.some(s => s.name === 'Thiên Nguyệt')).toBe(true);
      expect(palaces[6]?.auxStars.some(s => s.name === 'Nguyệt Yếm')).toBe(true);
      expect(palaces[5]?.auxStars.some(s => s.name === 'Nguyệt Hình')).toBe(true);
    });
  });

  describe('4. Chiều Đi Vòng Sao và Đóng Gói (placeVongStars)', () => {
    it('verify vòng Thái Tuế luôn thuận cho mọi đối tượng', () => {
      // Tuổi Tý (0) -> Thái Tuế ở Tý(0), Thiếu Dương ở Sửu(1), Tang Môn ở Dần(2)...
      const palaces = buildTestPalaces(0, 0, 1, 1, 0, 'Nam');
      expect(palaces[0]?.auxStars.some(s => s.name === 'Thái Tuế')).toBe(true);
      expect(palaces[1]?.auxStars.some(s => s.name === 'Thiếu Dương')).toBe(true);
      expect(palaces[2]?.auxStars.some(s => s.name === 'Tang Môn')).toBe(true);
      expect(palaces[11]?.auxStars.some(s => s.name === 'Trực Phù')).toBe(true);
    });

    it('verify vòng Bác Sĩ đi thuận cho Dương Nam', () => {
      // Can Giáp (0) -> Lộc Tồn ở Dần (2). Giáp Tý nam là Dương Nam -> Bác Sĩ đi Thuận
      // Bác Sĩ ở Dần(2), Lực Sĩ ở Mão(3), Thanh Long ở Thìn(4)...
      const palaces = buildTestPalaces(0, 0, 1, 1, 0, 'Nam');
      expect(palaces[2]?.auxStars.some(s => s.name === 'Bác Sĩ')).toBe(true);
      expect(palaces[3]?.auxStars.some(s => s.name === 'Lực Sĩ')).toBe(true);
      expect(palaces[4]?.auxStars.some(s => s.name === 'Thanh Long')).toBe(true);
      expect(palaces[1]?.auxStars.some(s => s.name === 'Quan Phủ')).toBe(true);
    });

    it('verify vòng Bác Sĩ đi nghịch cho Âm Nam', () => {
      // Can Ất (1) -> Lộc Tồn ở Mão (3). Ất Tý nam là Âm Nam -> Bác Sĩ đi Nghịch
      // Bác Sĩ ở Mão(3), Lực Sĩ ở Dần(2), Thanh Long ở Sửu(1)...
      const palaces = buildTestPalaces(1, 0, 1, 1, 0, 'Nam');
      expect(palaces[3]?.auxStars.some(s => s.name === 'Bác Sĩ')).toBe(true);
      expect(palaces[2]?.auxStars.some(s => s.name === 'Lực Sĩ')).toBe(true);
      expect(palaces[1]?.auxStars.some(s => s.name === 'Thanh Long')).toBe(true);
      expect(palaces[4]?.auxStars.some(s => s.name === 'Quan Phủ')).toBe(true);
    });
  });

  describe('5. Kiểm tra Tính Bất Biến (Immutability - No Input Mutation)', () => {
    it('đảm bảo placeAllMinorStars không mutate palaces truyền vào', () => {
      const namCanChi = getNamCanChi(1984);
      const basePalaces = buildPalaces(2, namCanChi, 0);
      const withCat = placeLucCatTinh(basePalaces, 1, 0, 0);
      
      // Chụp ảnh độ dài auxStars ban đầu của tất cả các cung
      const originalAuxLengths = withCat.map(p => p.auxStars.length);
      
      // Gọi hàm an sao phụ
      const result = placeAllMinorStars(withCat, 0, 0, 1, 1, 0, 'Nam', 4);
      
      // Đảm bảo palaces trả về (result) có dữ liệu đầy đủ
      expect(result.some(p => p.auxStars.length > 0)).toBe(true);
      
      // Kiểm tra palaces truyền vào (withCat) có độ dài auxStars giữ nguyên như ban đầu
      const afterAuxLengths = withCat.map(p => p.auxStars.length);
      expect(afterAuxLengths).toEqual(originalAuxLengths);
    });
  });

});
