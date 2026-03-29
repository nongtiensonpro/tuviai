import type { ReferenceChartFixture } from '../../src/core/types/ZiweiTypes';

export const REFERENCE_CHART_FIXTURES: ReferenceChartFixture[] = [
  {
    label: 'Lasotuvi sample - Canh Thìn 12/06/2000 giờ Mão',
    sourceUrl: 'https://lasotuvi.com/',
    sourceNote: 'Thông tin đối chiếu lấy từ trang mẫu công khai của lasotuvi.com cho ngày 12/6/2000, giờ Mão.',
    input: {
      solarDate: {
        day: 12,
        month: 6,
        year: 2000,
        hour: 5,
      },
      gender: 'female',
    },
    expected: {
      lunarDate: {
        day: 11,
        month: 5,
        year: 2000,
        hourChi: 'Mão',
      },
      namCanChi: 'Canh Thìn',
      amDuongNamNu: 'Dương Nữ',
      amDuongLy: 'Âm dương nghịch lý',
      tenCuc: 'Thổ Ngũ Cục',
      banMenh: 'Bạch Lạp Kim',
      cungMenhChi: 'Mão',
      cungThanChi: 'Dậu',
      thanCuTaiCung: 'Thiên Di',
      checkpoints: [
        { palaceName: 'Mệnh', chi: 'Mão', daiHan: 5, trangSinh: 'Suy' },
        { palaceName: 'Điền Trạch', chi: 'Ngọ', daiHan: 95, trangSinh: 'Quan Đới', hasTrietKhong: true },
        { palaceName: 'Quan Lộc', chi: 'Mùi', daiHan: 85, hasTrietKhong: true },
        { palaceName: 'Nô Bộc', chi: 'Thân', daiHan: 75, trangSinh: 'Trường Sinh', hasTuanKhong: true },
        { palaceName: 'Thiên Di', chi: 'Dậu', daiHan: 65, trangSinh: 'Dưỡng', isThanPalace: true, hasTuanKhong: true },
      ],
    },
  },
  {
    label: 'Lasotuvi sample PDF - Giáp Tuất 10/12/1994 giờ Tuất',
    sourceUrl: 'https://lasotuvi.com/lasotuvi.com-sample.pdf',
    sourceNote: 'Thông tin đối chiếu lấy từ snippet public của file sample PDF được index công khai.',
    input: {
      solarDate: {
        day: 10,
        month: 12,
        year: 1994,
        hour: 19,
      },
      gender: 'female',
    },
    expected: {
      lunarDate: {
        day: 8,
        month: 11,
        year: 1994,
        hourChi: 'Tuất',
      },
      namCanChi: 'Giáp Tuất',
      amDuongNamNu: 'Dương Nữ',
      amDuongLy: 'Âm dương thuận lý',
      tenCuc: 'Hỏa Lục Cục',
      banMenh: 'Sơn Đầu Hỏa',
      cungMenhChi: 'Dần',
      thanCuTaiCung: 'Tài Bạch',
      checkpoints: [
        { palaceName: 'Phu Thê', chi: 'Tý', daiHan: 26, trangSinh: 'Quan Đới' },
        { palaceName: 'Tài Bạch', daiHan: 46, trangSinh: 'Đế Vượng', isThanPalace: true },
        { palaceName: 'Tật Ách', daiHan: 56, trangSinh: 'Suy', hasTuanKhong: true, hasTrietKhong: true },
        { palaceName: 'Thiên Di', daiHan: 66, trangSinh: 'Bệnh', hasTuanKhong: true, hasTrietKhong: true },
        { palaceName: 'Nô Bộc', daiHan: 76, trangSinh: 'Tử' },
        { palaceName: 'Quan Lộc', daiHan: 86, trangSinh: 'Mộ' },
      ],
    },
  },
];
