import { getNamCanChi, getYearCanChi } from '../src/core/calendar/LunarConverter';
import { buildPalaces } from '../src/core/astrology/PalaceCalculator';
import {
  calcTuanTrietKhong,
  placeLucCatTinh,
  placeLucSatTinh,
} from '../src/core/astrology/AuxStarEngine';
import { placeAllMinorStars } from '../src/core/astrology/MinorStarEngine';
import { buildZiweiChart } from '../src/core/astrology/ChartBuilder';

function createBasePalaces(year: number) {
  const namCanChi = getNamCanChi(year);
  const yearCanChi = getYearCanChi(year);
  const palaces = buildPalaces(2, namCanChi, yearCanChi.canIndex);

  return {
    palaces,
    yearCanChi,
  };
}

describe('AuxStarEngine', () => {
  it('an Lộc Tồn đúng theo Thiên Can năm và giữ ổn định trục Lộc Tồn - Kình Dương - Đà La', () => {
    const expectations = [
      { year: 1984, locTon: 2, kinh: 3, daLa: 2 }, // Giáp
      { year: 1985, locTon: 3, kinh: 4, daLa: 3 }, // Ất
      { year: 1986, locTon: 5, kinh: 6, daLa: 5 }, // Bính
      { year: 1990, locTon: 8, kinh: 9, daLa: 8 }, // Canh
      { year: 1993, locTon: 0, kinh: 1, daLa: 0 }, // Quý
    ];

    expectations.forEach(({ year, locTon, kinh, daLa }) => {
      const { palaces, yearCanChi } = createBasePalaces(year);
      const withCat = placeLucCatTinh(palaces, 1, yearCanChi.canIndex, 0);
      const withSat = placeLucSatTinh(withCat, yearCanChi.canIndex, yearCanChi.chiIndex, 0);

      expect(withCat[locTon]?.auxStars.some(star => star.name === 'Lộc Tồn')).toBe(true);
      expect(withSat[kinh]?.auxStars.some(star => star.name === 'Kình Dương')).toBe(true);
      expect(withSat[daLa]?.auxStars.some(star => star.name === 'Đà La')).toBe(true);
    });
  });

  it('an Tả Phù tại Thìn tháng 1, Hữu Bật tại Tuất và Thiên Việt ở đối cung Thiên Khôi', () => {
    const { palaces, yearCanChi } = createBasePalaces(1985); // Ất
    const result = placeLucCatTinh(palaces, 1, yearCanChi.canIndex, 0);

    expect(result[4]?.auxStars.some(star => star.name === 'Tả Phù')).toBe(true);
    expect(result[10]?.auxStars.some(star => star.name === 'Hữu Bật')).toBe(true);
    expect(result[0]?.auxStars.some(star => star.name === 'Thiên Khôi')).toBe(true);
    expect(result[6]?.auxStars.some(star => star.name === 'Thiên Việt')).toBe(true);
  });

  it('an Hỏa Tinh và Linh Tinh theo bảng khởi giờ của năm Bính Dần', () => {
    const { palaces, yearCanChi } = createBasePalaces(1986); // Bính Dần
    const withCat = placeLucCatTinh(palaces, 1, yearCanChi.canIndex, 2);
    const result = placeLucSatTinh(withCat, yearCanChi.canIndex, yearCanChi.chiIndex, 2);

    expect(result[3]?.auxStars.some(star => star.name === 'Hỏa Tinh')).toBe(true);
    expect(result[5]?.auxStars.some(star => star.name === 'Linh Tinh')).toBe(true);
  });

  it('an Hỏa Tinh/Linh Tinh đúng với ví dụ Nhâm Thìn giờ Mão', () => {
    const { palaces, yearCanChi } = createBasePalaces(2012); // Nhâm Thìn
    const withCat = placeLucCatTinh(palaces, 1, yearCanChi.canIndex, 3);
    const result = placeLucSatTinh(withCat, yearCanChi.canIndex, yearCanChi.chiIndex, 3);

    expect(result[5]?.auxStars.some(star => star.name === 'Hỏa Tinh')).toBe(true);
    expect(result[1]?.auxStars.some(star => star.name === 'Linh Tinh')).toBe(true);
  });

  it('tính Tuần Không và Triệt Không đúng cho năm Canh Ngọ', () => {
    const { palaces, yearCanChi } = createBasePalaces(1990); // Canh Ngọ
    const result = calcTuanTrietKhong(palaces, yearCanChi.canIndex, yearCanChi.chiIndex);

    const tuanKhongPalaces = result.filter(palace => palace.hasTuanKhong).map(palace => palace.chiIndex);
    const trietKhongPalaces = result.filter(palace => palace.hasTrinhKhong).map(palace => palace.chiIndex);

    expect(tuanKhongPalaces).toEqual([10, 11]); // Tuất, Hợi
    expect(trietKhongPalaces).toEqual([6, 7]);  // Ngọ, Mùi
  });
});

describe('MinorStarEngine', () => {
  it('dùng đúng vị trí Lộc Tồn để khởi vòng Bác Sĩ thay vì fallback cố định', () => {
    const { palaces, yearCanChi } = createBasePalaces(1990); // Canh -> Lộc Tồn tại Thân
    const withCat = placeLucCatTinh(palaces, 1, yearCanChi.canIndex, 0);
    const result = placeAllMinorStars(
      withCat,
      yearCanChi.canIndex,
      yearCanChi.chiIndex,
      1,
      10,
      0,
      'Nam',
      4,
    );

    expect(result[8]?.auxStars.some(star => star.name === 'Lộc Tồn')).toBe(true);
    expect(result[8]?.auxStars.some(star => star.name === 'Bác Sĩ')).toBe(true);
  });

  it('an đúng Đường Phù, Giải Thần và giữ Thiên Đức/Nguyệt Đức theo năm', () => {
    const { palaces, yearCanChi } = createBasePalaces(1990); // Canh Ngọ
    const withCat = placeLucCatTinh(palaces, 1, yearCanChi.canIndex, 0);
    const monthOne = placeAllMinorStars(
      withCat,
      yearCanChi.canIndex,
      yearCanChi.chiIndex,
      1,
      10,
      0,
      'Nam',
      4,
    );

    expect(monthOne[4]?.auxStars.some(star => star.name === 'Quốc Ấn')).toBe(true);
    expect(monthOne[1]?.auxStars.some(star => star.name === 'Đường Phù')).toBe(true);
    expect(monthOne[4]?.auxStars.some(star => star.name === 'Giải Thần')).toBe(true);

    const withCatOtherMonth = placeLucCatTinh(createBasePalaces(1990).palaces, 6, yearCanChi.canIndex, 0);
    const monthSix = placeAllMinorStars(
      withCatOtherMonth,
      yearCanChi.canIndex,
      yearCanChi.chiIndex,
      6,
      10,
      0,
      'Nam',
      4,
    );

    const thienDucMonthOne = monthOne.findIndex(palace => palace.auxStars.some(star => star.name === 'Thiên Đức'));
    const nguyetDucMonthOne = monthOne.findIndex(palace => palace.auxStars.some(star => star.name === 'Nguyệt Đức'));
    const thienDucMonthSix = monthSix.findIndex(palace => palace.auxStars.some(star => star.name === 'Thiên Đức'));
    const nguyetDucMonthSix = monthSix.findIndex(palace => palace.auxStars.some(star => star.name === 'Nguyệt Đức'));

    expect(thienDucMonthOne).toBe(thienDucMonthSix);
    expect(nguyetDucMonthOne).toBe(nguyetDucMonthSix);
  });

  it('khóa cụm Thiên Không/Địa Kiếp theo giờ và không nhân đôi Thiên Không ở case 27/09/1998', () => {
    const chart = buildZiweiChart({ day: 27, month: 9, year: 1998, hour: 9 }, 'male');
    const thienKhongPalaces = chart.palaces.filter(palace => palace.auxStars.some(star => star.name === 'Thiên Không'));
    const diaKiepPalaces = chart.palaces.filter(palace => palace.auxStars.some(star => star.name === 'Địa Kiếp'));

    expect(thienKhongPalaces).toHaveLength(1);
    expect(thienKhongPalaces[0]?.chi).toBe('Ngọ');
    expect(diaKiepPalaces).toHaveLength(1);
    expect(diaKiepPalaces[0]?.chi).toBe('Thìn');
  });

  it('khóa Tả Phù, Hữu Bật và Tam Thai của case 27/09/1998', () => {
    const chart = buildZiweiChart({ day: 27, month: 9, year: 1998, hour: 9 }, 'male');

    expect(chart.palaces.find(palace => palace.chi === 'Hợi')?.auxStars.some(star => star.name === 'Tả Phù')).toBe(true);
    expect(chart.palaces.find(palace => palace.chi === 'Mão')?.auxStars.some(star => star.name === 'Hữu Bật')).toBe(true);
    expect(chart.palaces.find(palace => palace.chi === 'Tỵ')?.auxStars.some(star => star.name === 'Tam Thai')).toBe(true);
  });

  it('khóa Bát Tọa, Ân Quang, Thiên Quý, Thiên Quan, Thiên Phúc của case 27/09/1998', () => {
    const chart = buildZiweiChart({ day: 27, month: 9, year: 1998, hour: 9 }, 'male');

    expect(chart.palaces.find(palace => palace.chi === 'Dậu')?.auxStars.some(star => star.name === 'Bát Tọa')).toBe(true);
    expect(chart.palaces.find(palace => palace.chi === 'Tuất')?.auxStars.some(star => star.name === 'Ân Quang')).toBe(true);
    expect(chart.palaces.find(palace => palace.chi === 'Dần')?.auxStars.some(star => star.name === 'Thiên Quý')).toBe(true);
    expect(chart.palaces.find(palace => palace.chi === 'Mão')?.auxStars.some(star => star.name === 'Thiên Quan')).toBe(true);
    expect(chart.palaces.find(palace => palace.chi === 'Mão')?.auxStars.some(star => star.name === 'Thiên Phúc')).toBe(true);
  });

  it('khóa Hỏa Tinh và Linh Tinh của case 27/09/1998', () => {
    const chart = buildZiweiChart({ day: 27, month: 9, year: 1998, hour: 9 }, 'male');

    expect(chart.palaces.find(palace => palace.chi === 'Ngọ')?.auxStars.some(star => star.name === 'Hỏa Tinh')).toBe(true);
    expect(chart.palaces.find(palace => palace.chi === 'Thân')?.auxStars.some(star => star.name === 'Linh Tinh')).toBe(true);
  });

  it('khóa nhóm sao theo năm của case 27/09/1998', () => {
    const chart = buildZiweiChart({ day: 27, month: 9, year: 1998, hour: 9 }, 'male');

    expect(chart.palaces.find(palace => palace.chi === 'Tỵ')?.auxStars.some(star => star.name === 'Cô Thần')).toBe(true);
    expect(chart.palaces.find(palace => palace.chi === 'Sửu')?.auxStars.some(star => star.name === 'Quả Tú')).toBe(true);
    expect(chart.palaces.find(palace => palace.chi === 'Hợi')?.auxStars.some(star => star.name === 'Kiếp Sát')).toBe(true);
    expect(chart.palaces.find(palace => palace.chi === 'Tuất')?.auxStars.some(star => star.name === 'Hoa Cái')).toBe(true);
    expect(chart.palaces.find(palace => palace.chi === 'Dậu')?.auxStars.some(star => star.name === 'Phá Toái')).toBe(true);
    expect(chart.palaces.find(palace => palace.chi === 'Dậu')?.auxStars.some(star => star.name === 'Long Đức')).toBe(true);
    expect(chart.palaces.find(palace => palace.chi === 'Mùi')?.auxStars.some(star => star.name === 'Nguyệt Đức')).toBe(true);
  });

  it('khóa Lưu Hà và Thiên Trù của case 27/09/1998', () => {
    const chart = buildZiweiChart({ day: 27, month: 9, year: 1998, hour: 9 }, 'male');

    expect(chart.palaces.find(palace => palace.chi === 'Tỵ')?.auxStars.some(star => star.name === 'Lưu Hà')).toBe(true);
    expect(chart.palaces.find(palace => palace.chi === 'Ngọ')?.auxStars.some(star => star.name === 'Thiên Trù')).toBe(true);
  });
});

describe('ChartBuilder star integration', () => {
  it('mệnh bàn hoàn chỉnh phải có Lộc Tồn và đủ 2 cung Tuần, 2 cung Triệt', () => {
    const chart = buildZiweiChart({ day: 15, month: 6, year: 1990, hour: 10 }, 'male');

    const locTonCount = chart.palaces.reduce(
      (count, palace) => count + palace.auxStars.filter(star => star.name === 'Lộc Tồn').length,
      0,
    );
    const tuanCount = chart.palaces.filter(palace => palace.hasTuanKhong).length;
    const trietCount = chart.palaces.filter(palace => palace.hasTrinhKhong).length;

    expect(locTonCount).toBe(1);
    expect(tuanCount).toBe(2);
    expect(trietCount).toBe(2);
  });
});
