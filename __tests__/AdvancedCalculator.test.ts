import {
  calcMenhCucSinhKhac,
  calcMenhChu,
  calcTrangSinh,
  calcThanChu,
  getNapAmInfo,
} from '../src/core/astrology/AdvancedCalculator';
import { buildZiweiChart } from '../src/core/astrology/ChartBuilder';
import { getYearCanChi } from '../src/core/calendar/LunarConverter';

describe('AdvancedCalculator', () => {
  describe('getNapAmInfo', () => {
    it('trả đúng nạp âm cho các năm mẫu', () => {
      expect(getNapAmInfo('Canh', 'Ngọ')).toEqual({
        name: 'Lộ Bàng Thổ',
        nguHanh: 'Thổ',
      });

      expect(getNapAmInfo('Giáp', 'Tuất')).toEqual({
        name: 'Sơn Đầu Hỏa',
        nguHanh: 'Hỏa',
      });
    });

    it('phủ kín chu kỳ 60 hoa giáp mà không rơi vào giá trị mặc định', () => {
      const napAmNames = new Set<string>();

      for (let year = 1924; year < 1984; year += 1) {
        const canChi = getYearCanChi(year);
        const napAm = getNapAmInfo(canChi.can, canChi.chi);

        expect(napAm.name).not.toBe('Không rõ');
        napAmNames.add(napAm.name);
      }

      expect(napAmNames.size).toBe(30);
    });
  });

  describe('calcMenhCucSinhKhac', () => {
    it('phân loại đúng đủ 5 quan hệ sinh khắc giữa Bản Mệnh và Cục', () => {
      expect(calcMenhCucSinhKhac('Thổ', 6)).toBe('Cục sinh Bản Mệnh');
      expect(calcMenhCucSinhKhac('Thổ', 5)).toBe('Cục hòa Bản Mệnh');
      expect(calcMenhCucSinhKhac('Thổ', 4)).toBe('Bản Mệnh sinh Cục');
      expect(calcMenhCucSinhKhac('Thổ', 2)).toBe('Bản Mệnh khắc Cục');
      expect(calcMenhCucSinhKhac('Thổ', 3)).toBe('Cục khắc Bản Mệnh');
    });
  });

  describe('calcMenhChu / calcThanChu', () => {
    it('trả đúng sao chủ theo chi Mệnh và chi năm', () => {
      expect(calcMenhChu(2)).toBe('Lộc Tồn');
      expect(calcMenhChu(6)).toBe('Phá Quân');
      expect(calcThanChu(0)).toBe('Linh Tinh');
      expect(calcThanChu(10)).toBe('Văn Xương');
    });
  });

  describe('calcTrangSinh', () => {
    it('dùng đúng nhãn Trường Sinh và chiều thuận/nghịch', () => {
      expect(calcTrangSinh(4, true, 5)).toBe('Trường Sinh');
      expect(calcTrangSinh(4, false, 4)).toBe('Mộc Dục');
    });
  });

  describe('buildZiweiChart integration', () => {
    it('đưa nạp âm thật và quan hệ Mệnh-Cục thật vào lá số', () => {
      const chart = buildZiweiChart({ day: 15, month: 6, year: 1990, hour: 10 }, 'male');
      const expectedNapAm = getNapAmInfo(chart.namCanChi.can, chart.namCanChi.chi);

      expect(chart.banMenh).toBe(expectedNapAm.name);
      expect(chart.menhCucSinhKhac).toBe(
        calcMenhCucSinhKhac(expectedNapAm.nguHanh, chart.nguHanhCuc),
      );
    });
  });
});
