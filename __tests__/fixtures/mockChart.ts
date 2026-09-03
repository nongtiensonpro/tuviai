import {
  TWELVE_CHI,
  type Palace,
  type PalaceName,
  type SihuaType,
  type Star,
  type StarBrightness,
  type StarCategory,
  type ZiweiChart,
} from '@core/types/ZiweiTypes';

function createMainStar(
  name: string,
  palaceIndex: number,
  brightness: StarBrightness,
  nguHanh: Star['nguHanh'],
  sihua?: SihuaType,
): Star {
  return {
    name,
    category: 'main',
    nguHanh,
    brightness,
    sihua,
    palaceIndex,
  };
}

function createAuxStar(
  name: string,
  palaceIndex: number,
  category: Exclude<StarCategory, 'main'>,
  nguHanh: Star['nguHanh'],
  sihua?: SihuaType,
): Star {
  return {
    name,
    category,
    nguHanh,
    brightness: '',
    sihua,
    palaceIndex,
  };
}

interface PalaceFixtureConfig {
  palaceName: PalaceName;
  mainStars: Star[];
  auxStars: Star[];
  borrowedStars?: Star[];
  sihua?: Palace['sihua'];
  isThanPalace?: boolean;
  hasTuanKhong?: boolean;
  hasTrietKhong?: boolean;
}

const PALACE_FIXTURES: Record<number, PalaceFixtureConfig> = {
  0: {
    palaceName: 'Phúc Đức',
    mainStars: [createMainStar('Thiên Đồng', 0, 'B', 'Thủy')],
    auxStars: [createAuxStar('Thiên Khôi', 0, 'cat', 'Hỏa')],
  },
  1: {
    palaceName: 'Phụ Mẫu',
    mainStars: [createMainStar('Thiên Cơ', 1, 'Đ', 'Mộc')],
    auxStars: [createAuxStar('Thiên Việt', 1, 'cat', 'Hỏa')],
  },
  2: {
    palaceName: 'Mệnh',
    mainStars: [
      createMainStar('Tử Vi', 2, 'V', 'Thổ', 'Khoa'),
      createMainStar('Thiên Phủ', 2, 'Đ', 'Thổ'),
    ],
    auxStars: [
      createAuxStar('Văn Xương', 2, 'cat', 'Kim'),
      createAuxStar('Tả Phù', 2, 'support', 'Thổ'),
    ],
    sihua: [
      { starName: 'Tử Vi', type: 'Khoa', fromYear: true },
    ],
  },
  3: {
    palaceName: 'Huynh Đệ',
    mainStars: [createMainStar('Cự Môn', 3, 'B', 'Thủy')],
    auxStars: [createAuxStar('Địa Không', 3, 'sha', 'Hỏa')],
  },
  4: {
    palaceName: 'Phu Thê',
    mainStars: [createMainStar('Thái Dương', 4, 'H', 'Hỏa')],
    auxStars: [createAuxStar('Đào Hoa', 4, 'other', 'Mộc')],
    hasTrietKhong: true,
  },
  5: {
    palaceName: 'Tử Tức',
    mainStars: [],
    auxStars: [createAuxStar('Địa Không', 5, 'sha', 'Hỏa')],
    borrowedStars: [createMainStar('Thái Âm', 5, 'B', 'Thủy')],
  },
  6: {
    palaceName: 'Tài Bạch',
    mainStars: [
      createMainStar('Vũ Khúc', 6, 'Đ', 'Kim', 'Lộc'),
      createMainStar('Tham Lang', 6, 'V', 'Mộc'),
    ],
    auxStars: [createAuxStar('Lộc Tồn', 6, 'cat', 'Thổ')],
    sihua: [
      { starName: 'Vũ Khúc', type: 'Lộc', fromYear: true },
    ],
  },
  7: {
    palaceName: 'Tật Ách',
    mainStars: [createMainStar('Thiên Lương', 7, 'Đ', 'Thổ')],
    auxStars: [createAuxStar('Bệnh Phù', 7, 'other', 'Thổ')],
  },
  8: {
    palaceName: 'Thiên Di',
    mainStars: [
      createMainStar('Thất Sát', 8, 'H', 'Kim'),
      createMainStar('Phá Quân', 8, 'B', 'Thủy'),
    ],
    auxStars: [createAuxStar('Kình Dương', 8, 'sha', 'Kim')],
    hasTuanKhong: true,
  },
  9: {
    palaceName: 'Nô Bộc',
    mainStars: [createMainStar('Thiên Tướng', 9, 'B', 'Thủy')],
    auxStars: [createAuxStar('Thiên Thương', 9, 'fixed', 'Hỏa')],
  },
  10: {
    palaceName: 'Quan Lộc',
    mainStars: [
      createMainStar('Liêm Trinh', 10, 'B', 'Hỏa', 'Quyền'),
      createMainStar('Thiên Tướng', 10, 'Đ', 'Thủy'),
    ],
    auxStars: [
      createAuxStar('Hữu Bật', 10, 'support', 'Thủy'),
      createAuxStar('Văn Khúc', 10, 'cat', 'Thủy'),
    ],
    sihua: [
      { starName: 'Liêm Trinh', type: 'Quyền', fromYear: true },
    ],
    isThanPalace: true,
  },
  11: {
    palaceName: 'Điền Trạch',
    mainStars: [createMainStar('Thái Âm', 11, 'V', 'Thủy')],
    auxStars: [createAuxStar('Long Trì', 11, 'other', 'Thủy')],
  },
};

const TRANG_SINH_CYCLE = [
  'Trường Sinh',
  'Mộc Dục',
  'Quan Đới',
  'Lâm Quan',
  'Đế Vượng',
  'Suy',
  'Bệnh',
  'Tử',
  'Mộ',
  'Tuyệt',
  'Thai',
  'Dưỡng',
];

function createPalaces(): Palace[] {
  return TWELVE_CHI.map((chi, chiIndex) => {
    const fixture = PALACE_FIXTURES[chiIndex];

    return {
      chiIndex,
      chi,
      can: 'Giáp',
      canIndex: 0,
      palaceName: fixture.palaceName,
      trangSinh: TRANG_SINH_CYCLE[chiIndex] ?? 'Trường Sinh',
      daiHan: 5 + (chiIndex * 10),
      isThanPalace: fixture.isThanPalace ?? false,
      mainStars: fixture.mainStars,
      auxStars: fixture.auxStars,
      sihua: fixture.sihua ?? [],
      borrowedStars: fixture.borrowedStars ?? [],
      hasTuanKhong: fixture.hasTuanKhong ?? false,
      hasTrietKhong: fixture.hasTrietKhong ?? false,
    };
  });
}

export function createMockChart(): ZiweiChart {
  return {
    solarDate: {
      day: 14,
      month: 8,
      year: 1994,
      hour: 11,
    },
    lunarDate: {
      day: 8,
      month: 7,
      year: 1994,
      isLeap: false,
      hourChi: 'Ngọ',
      hourChiIndex: 6,
      monthForStarring: 7, // tháng thường → starring = month
    },
    gender: 'male',
    namCanChi: {
      can: 'Giáp',
      chi: 'Tuất',
      canIndex: 0,
      chiIndex: 10,
      displayName: 'Giáp Tuất',
    },
    banMenh: 'Sơn Đầu Hỏa',
    nguHanhCuc: 4,
    tenCuc: 'Kim Tứ Cục',
    amDuongLy: 'Âm dương thuận lý',
    amDuongNamNu: 'Dương Nam',
    menhCucSinhKhac: 'Bản Mệnh khắc Cục',
    menhChu: 'Lộc Tồn',
    thanChu: 'Văn Xương',
    cungMenhIndex: 2,
    cungMenhChi: 'Dần',
    cungThanIndex: 10,
    cungThanChi: 'Tuất',
    palaces: createPalaces(),
    calculatedAt: 1711708800000,
  };
}
