import { calibrateSolarDate, calculateEquationOfTime, getDayOfYear, calculateTrueSolarTime } from '../src/core/calendar/SolarTimeCalculator';
import { getVietnamHistoricalTimezone } from '../src/core/calendar/AstronomicalData';
import { buildZiweiChart } from '../src/core/astrology/ChartBuilder';

describe('SolarTimeCalculator & Astronomical Calibration', () => {
  describe('getDayOfYear', () => {
    it('tính đúng số thứ tự ngày trong năm thường (1995)', () => {
      // Ngày 3 tháng 11 năm 1995
      expect(getDayOfYear(1995, 11, 3)).toBe(307);
    });

    it('tính đúng số thứ tự ngày trong năm nhuận (1968)', () => {
      // Ngày 14 tháng 4 năm 1968
      expect(getDayOfYear(1968, 4, 14)).toBe(105);
    });
  });

  describe('calculateEquationOfTime (EOT)', () => {
    it('tính gần đúng chỉ số EOT theo công thức Spencer cho ngày 3 tháng 11', () => {
      const dayOfYear = getDayOfYear(1995, 11, 3); // 307
      const eot = calculateEquationOfTime(dayOfYear);
      // EOT vào đầu tháng 11 thường đạt cực đại dương khoảng +16.4 phút
      expect(eot).toBeGreaterThan(15);
      expect(eot).toBeLessThan(17);
    });

    it('tính gần đúng chỉ số EOT cho ngày 14 tháng 4', () => {
      const dayOfYear = getDayOfYear(1968, 4, 14); // 105
      const eot = calculateEquationOfTime(dayOfYear);
      // EOT vào giữa tháng 4 thường dao động quanh 0 phút
      expect(eot).toBeGreaterThan(-2);
      expect(eot).toBeLessThan(2);
    });
  });

  describe('getVietnamHistoricalTimezone', () => {
    it('trả về UTC+7 cho thời kỳ hiện tại (sau 1975)', () => {
      expect(getVietnamHistoricalTimezone(1995, 11, 3, true)).toBe(7);
      expect(getVietnamHistoricalTimezone(1995, 11, 3, false)).toBe(7);
    });

    it('trả về UTC+8 cho miền Nam trước 1975 (e.g. 1968) và UTC+7 cho miền Bắc', () => {
      // Saigon (miền Nam) năm 1968 dùng UTC+8
      expect(getVietnamHistoricalTimezone(1968, 4, 15, true)).toBe(8);
      // Hà Nội (miền Bắc) năm 1968 dùng UTC+7
      expect(getVietnamHistoricalTimezone(1968, 4, 15, false)).toBe(7);
    });
  });

  describe('calculateTrueSolarTime', () => {
    it('tính đúng giờ Mặt Trời thực tế cho Đà Nẵng năm 1995', () => {
      // 10:50 AM ngày 03/11/1995 tại Đà Nẵng (Kinh độ 108.2022)
      // Múi giờ hành chính lúc đó là UTC+7
      const result = calculateTrueSolarTime(1995, 11, 3, 10, 50, 108.2022, 7);

      expect(result.longitudeOffset).toBeCloseTo(12.8088, 1);
      expect(result.eot).toBeGreaterThan(16);
      expect(result.totalOffset).toBeCloseTo(12.8088 + result.eot, 1);
      
      // Giờ thực tế phải là ~11:19 AM
      expect(result.hour).toBe(11);
      expect(result.minute).toBe(19);
      expect(result.dayShift).toBe(0);
    });
  });

  describe('Học thuyết và Ca kiểm thử Thực tế (Case Studies)', () => {
    // Ca kiểm thử 1: Đà Nẵng 03/11/1995 lúc 10:50 AM
    // Chưa hiệu chuẩn: Giờ Tỵ (10:50 AM)
    // Đã hiệu chuẩn: Giờ Ngọ (11:19 AM) do chênh kinh độ + EOT cực đại
    it('Case A: Sinh ngày 03/11/1995 lúc 10:50 AM tại Đà Nẵng làm dịch chuyển Địa Chi Giờ sinh sang Ngọ', () => {
      // 1. Lập lá số không hiệu chỉnh (Mặc định)
      const chartNormal = buildZiweiChart(
        calibrateSolarDate({
          year: 1995,
          month: 11,
          day: 3,
          hourMode: 'exact',
          exactHour: 10,
          exactMinute: 50,
          birthPlace: 'none',
        }),
        'male'
      );
      expect(chartNormal.lunarDate.hourChi).toBe('Tỵ');

      // 2. Lập lá số có hiệu chỉnh (Đà Nẵng)
      const chartCalibrated = buildZiweiChart(
        calibrateSolarDate({
          year: 1995,
          month: 11,
          day: 3,
          hourMode: 'exact',
          exactHour: 10,
          exactMinute: 50,
          birthPlace: 'Đà Nẵng',
        }),
        'male'
      );

      // Địa chi giờ sinh phải dịch sang giờ Ngọ
      expect(chartCalibrated.lunarDate.hourChi).toBe('Ngọ');
      
      // Các thuộc tính metadata thiên văn học phải được ghi nhận chính xác
      expect(chartCalibrated.solarDate.birthPlace).toBe('Đà Nẵng');
      expect(chartCalibrated.solarDate.isTrueSolarTimeApplied).toBe(true);
      expect(chartCalibrated.solarDate.totalOffset).toBeGreaterThan(28); // ~29.2 phút
      expect(chartCalibrated.solarDate.trueSolarHour).toBe(11);
      expect(chartCalibrated.solarDate.trueSolarMinute).toBe(19);
    });

    // Ca kiểm thử 2: Sài Gòn 15/04/1968 lúc 00:30 AM
    // Chưa hiệu chuẩn: Ngày 15/04, giờ Tý (UTC+8 hành chính)
    // Đã hiệu chuẩn: Ngày 14/04 lúc 23:36 (UTC+7 chuẩn quốc gia + TST)
    it('Case B: Sinh ngày 15/04/1968 lúc 00:30 AM tại Sài Gòn làm dịch chuyển ngày sinh sang 14/04/1968', () => {
      // 1. Không hiệu chỉnh
      const chartNormal = buildZiweiChart(
        calibrateSolarDate({
          year: 1968,
          month: 4,
          day: 15,
          hourMode: 'exact',
          exactHour: 0,
          exactMinute: 30,
          birthPlace: 'none',
        }),
        'male'
      );
      expect(chartNormal.solarDate.day).toBe(15);
      expect(chartNormal.solarDate.month).toBe(4);

      // 2. Có hiệu chỉnh địa điểm Sài Gòn (Nam Việt Nam thời điểm 1968 dùng UTC+8)
      // Sử dụng earlyZiMode: 'same_day' để so sánh sự dịch chuyển ngày thiên văn đơn thuần
      const chartCalibrated = buildZiweiChart(
        calibrateSolarDate({
          year: 1968,
          month: 4,
          day: 15,
          hourMode: 'exact',
          exactHour: 0,
          exactMinute: 30,
          birthPlace: 'TP. Hồ Chí Minh',
          earlyZiMode: 'same_day',
        }),
        'male'
      );

      // Ngày sinh dương lịch hiệu chỉnh phải dịch lùi về ngày 14 do hiệu chỉnh múi giờ lịch sử UTC+8 sang UTC+7
      expect(chartCalibrated.solarDate.day).toBe(14);
      expect(chartCalibrated.solarDate.month).toBe(4);
      expect(chartCalibrated.solarDate.year).toBe(1968);
      
      // Múi giờ hành chính được ghi nhận đúng là UTC+8
      expect(chartCalibrated.solarDate.timezoneUsed).toBe(8);
      expect(chartCalibrated.solarDate.isHistoricalTimezoneApplied).toBe(true);
      expect(chartCalibrated.solarDate.trueSolarHour).toBe(23);
      expect(chartCalibrated.solarDate.trueSolarMinute).toBe(36);

      // Đảm bảo Âm lịch của hai lá số khác nhau hoàn toàn do ngày dương lịch dịch chuyển (và không bị dịch ngược lại bởi giờ Tý sớm)
      expect(chartCalibrated.lunarDate.day).not.toBe(chartNormal.lunarDate.day);
      
      // Kiểm tra vị trí của sao Tử Vi bị dịch chuyển cung trên Mệnh bàn do ngày âm lịch thay đổi
      const findTuViPalaceName = (chart: typeof chartNormal) => {
        const palace = chart.palaces.find(p => 
          p.mainStars.some(s => s.name === 'Tử Vi')
        );
        return palace ? palace.palaceName : '';
      };
      expect(findTuViPalaceName(chartCalibrated)).not.toBe(findTuViPalaceName(chartNormal));

      // 3. Kiểm thử thêm: Có hiệu chỉnh địa điểm Sài Gòn, dùng earlyZiMode mặc định (next_day)
      // Giờ Tý sớm (23:36 ngày 14) phải dịch chuyển sang ngày âm lịch tiếp theo (tương đương ngày 15)
      const chartCalibratedNextDay = buildZiweiChart(
        calibrateSolarDate({
          year: 1968,
          month: 4,
          day: 15,
          hourMode: 'exact',
          exactHour: 0,
          exactMinute: 30,
          birthPlace: 'TP. Hồ Chí Minh',
        }),
        'male'
      );
      expect(chartCalibratedNextDay.lunarDate.isEarlyZiAdjusted).toBe(true);
      expect(chartCalibratedNextDay.lunarDate.day).toBe(chartNormal.lunarDate.day);
    });
  });
});
