import { placeLucCatTinh, placeLucSatTinh } from '../src/core/astrology/AuxStarEngine';
import { buildPalaces } from '../src/core/astrology/PalaceCalculator';
import { getNamCanChi } from '../src/core/calendar/LunarConverter';
import type { Palace, TenCan } from '../src/core/types/ZiweiTypes';

function createCleanPalaces(): Palace[] {
  const namCanChi = getNamCanChi(1984); // Giáp Tý (just for structure)
  return buildPalaces(2, namCanChi, 0);
}

describe('Exhaustive Auxiliary Stars Verification', () => {
  const CAN_NAMES: TenCan[] = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];

  it('khớp 100% Thiên Khôi & Thiên Việt cho 10 Thiên Can', () => {
    // Expected positions: [Khoi, Viet]
    const EXPECTED_KHOI_VIET: Record<TenCan, [number, number]> = {
      'Giáp': [1, 7],  // Sửu, Mùi
      'Mậu': [1, 7],  // Sửu, Mùi
      'Ất': [0, 8],   // Tý, Thân
      'Kỷ': [0, 8],   // Tý, Thân
      'Bính': [11, 9], // Hợi, Dậu
      'Đinh': [11, 9], // Hợi, Dậu
      'Canh': [6, 2],  // Ngọ, Dần
      'Tân': [6, 2],  // Ngọ, Dần
      'Nhâm': [3, 5],  // Mão, Tỵ
      'Quý': [3, 5],  // Mão, Tỵ
    };

    CAN_NAMES.forEach((can, canIdx) => {
      const palaces = createCleanPalaces();
      // Month = 1, Hour = 0 (Tý)
      const result = placeLucCatTinh(palaces, 1, canIdx, 0);

      const [expectedKhoi, expectedViet] = EXPECTED_KHOI_VIET[can];
      
      const hasKhoi = result[expectedKhoi]?.auxStars.some(s => s.name === 'Thiên Khôi');
      const hasViet = result[expectedViet]?.auxStars.some(s => s.name === 'Thiên Việt');

      expect(hasKhoi).toBe(true);
      expect(hasViet).toBe(true);
    });
  });

  it('khớp 100% Kình Dương & Đà La cho 10 Thiên Can', () => {
    // Expected positions: [Kinh, DaLa]
    const EXPECTED_KINH_DALA: Record<TenCan, [number, number]> = {
      'Giáp': [3, 2],  // Mão, Dần
      'Ất': [4, 3],   // Thìn, Mão
      'Bính': [6, 5],  // Ngọ, Tỵ
      'Mậu': [6, 5],  // Ngọ, Tỵ
      'Đinh': [7, 6],  // Mùi, Ngọ
      'Kỷ': [7, 6],   // Mùi, Ngọ
      'Canh': [9, 8],  // Dậu, Thân
      'Tân': [10, 9], // Tuất, Dậu
      'Nhâm': [0, 11], // Tý, Hợi
      'Quý': [1, 0],   // Sửu, Tý
    };

    CAN_NAMES.forEach((can, canIdx) => {
      const palaces = createCleanPalaces();
      const withSat = placeLucSatTinh(palaces, canIdx, 0, 0);

      const [expectedKinh, expectedDala] = EXPECTED_KINH_DALA[can];

      const hasKinh = withSat[expectedKinh]?.auxStars.some(s => s.name === 'Kình Dương');
      const hasDala = withSat[expectedDala]?.auxStars.some(s => s.name === 'Đà La');

      expect(hasKinh).toBe(true);
      expect(hasDala).toBe(true);
    });
  });

  it('khớp 100% Hỏa Tinh & Linh Tinh cho 12 Địa Chi năm × 12 giờ sinh (144 cases)', () => {
    // Start indexes based on Earthly Branch groups
    // 0=Tý, 1=Sửu, 2=Dần, 3=Mão, 4=Thìn, 5=Tỵ, 6=Ngọ, 7=Mùi, 8=Thân, 9=Dậu, 10=Tuất, 11=Hợi
    //
    // ⚠️ Mâu thuẫn trường phái về nhóm Hợi Mão Mùi:
    // - lasotuvi.com: Ất Hợi + giờ Tỵ(5) → Hỏa=Thìn(4) ⇒ khởi Hợi(11)
    // - xemtuvi.vn:  Đinh Hợi + giờ Tỵ(5) → Hỏa=Dần(2) ⇒ khởi Dậu(9) [2 lá số verify]
    // Đang dùng khởi Dậu(9) vì xemtuvi.vn có 2 lá số xác nhận. Cần verify thêm.
    const getStartPos = (chiYear: number) => {
      if ([0, 4, 8].includes(chiYear)) return { hoa: 2, linh: 10 };  // Thân Tý Thìn → Dần, Tuất
      if ([2, 6, 10].includes(chiYear)) return { hoa: 1, linh: 3 };  // Dần Ngọ Tuất → Sửu, Mão
      if ([1, 5, 9].includes(chiYear)) return { hoa: 3, linh: 10 };  // Tỵ Dậu Sửu → Mão, Tuất
      return { hoa: 9, linh: 10 };                                  // Hợi Mão Mùi → Dậu, Tuất [mâu thuẫn: lasotuvi.com dùng khởi Hợi(11)]
    };

    for (let chiYear = 0; chiYear < 12; chiYear++) {
      for (let hour = 0; hour < 12; hour++) {
        const start = getStartPos(chiYear);
        const expectedHoa = (start.hoa + hour) % 12;
        const expectedLinh = (start.linh + hour) % 12;

        const palaces = createCleanPalaces();
        // Can Giáp = 0
        const result = placeLucSatTinh(palaces, 0, chiYear, hour);

        const hasHoa = result[expectedHoa]?.auxStars.some(s => s.name === 'Hỏa Tinh');
        const hasLinh = result[expectedLinh]?.auxStars.some(s => s.name === 'Linh Tinh');

        if (!hasHoa || !hasLinh) {
          console.error(`Thất bại tại Chi năm: ${chiYear}, Giờ: ${hour}. expectedHoa: ${expectedHoa}, expectedLinh: ${expectedLinh}`);
        }

        expect(hasHoa).toBe(true);
        expect(hasLinh).toBe(true);
      }
    }
  });
});
