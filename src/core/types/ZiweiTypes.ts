/**
 * ZiweiTypes.ts — Tập trung mọi TypeScript Interface/Type cho hệ thống Tử Vi Đẩu Số
 * Rule: Mọi đối tượng Tử Vi phải được định nghĩa ở đây (xem .agents/rules/rule-typescript-types.md)
 */

// ============================================================
// 1. CÁC KIỂU CƠ BẢN
// ============================================================

/** 10 Thiên Can */
export type TenCan =
  | 'Giáp' | 'Ất' | 'Bính' | 'Đinh' | 'Mậu'
  | 'Kỷ'   | 'Canh' | 'Tân'  | 'Nhâm' | 'Quý';

/** 12 Địa Chi */
export type TwoelveChi =
  | 'Tý' | 'Sửu' | 'Dần' | 'Mão' | 'Thìn' | 'Tỵ'
  | 'Ngọ' | 'Mùi' | 'Thân' | 'Dậu' | 'Tuất' | 'Hợi';

/** Ngũ Hành Nạp Âm Cục: Thủy(2), Mộc(3), Kim(4), Thổ(5), Hỏa(6) */
export type NguHanhCuc = 2 | 3 | 4 | 5 | 6;

/** Tên Cục đầy đủ */
export type TenCuc = 'Thủy Nhị Cục' | 'Mộc Tam Cục' | 'Kim Tứ Cục' | 'Thổ Ngũ Cục' | 'Hỏa Lục Cục';

/** Giới tính */
export type Gender = 'male' | 'female';

/** Độ sáng của sao trên mệnh bàn */
export type StarBrightness =
  | '庙'  // Miếu — sáng nhất
  | '旺'  // Vượng
  | '得'  // Đắc
  | '利'  // Lợi
  | '平'  // Bình
  | '不'  // Không tốt
  | '陷'  // Hãm — tối nhất
  | '';   // Không xác định (trống cung)

/** Trạng thái Tứ Hóa */
export type SihuaType = 'Lộc' | 'Quyền' | 'Khoa' | 'Kỵ';

/** Loại sao */
export type StarCategory =
  | 'main'    // 14 chính tinh
  | 'cat'     // Lục cát tinh
  | 'sha'     // Lục sát tinh
  | 'fixed'   // Sao cố định
  | 'support' // Tả Phù, Hữu Bật
  | 'other';  // Các loại khác

// ============================================================
// 2. NGÀY THÁNG VÀ GIỜ SINH
// ============================================================

/** Ngày sinh theo Dương lịch */
export interface SolarDate {
  day: number;
  month: number;       // 1-12
  year: number;
  hour: number;        // 0-23 (giờ hệ 24h)
  minute?: number;
}

/** Ngày sinh đã chuyển sang Âm lịch */
export interface LunarDate {
  day: number;         // 1-30
  month: number;       // 1-12
  year: number;
  isLeap: boolean;     // Tháng nhuận
  hourChi: TwoelveChi; // Địa Chi giờ sinh
  hourChiIndex: number; // 0-11
}

/** Thiên Can + Địa Chi của một mốc thời gian */
export interface CanChi {
  can: TenCan;
  chi: TwoelveChi;
  canIndex: number;   // 0-9
  chiIndex: number;   // 0-11
}

/** Bộ 4 Can Chi (Tứ Trụ - chỉ dùng năm sinh) */
export interface NamCanChi extends CanChi {
  displayName: string; // e.g. "Canh Tuất"
}

// ============================================================
// 3. VÌ SAO
// ============================================================

/** Một vì sao trên mệnh bàn */
export interface Star {
  name: string;             // Tên sao (tiếng Việt)
  category: StarCategory;
  brightness: StarBrightness;
  sihua?: SihuaType;        // Tứ Hóa nếu có
  palaceIndex: number;      // Cung tọa lạc (0-11, index Địa Chi)
}

/** Kích hoạt Tứ Hóa tại một cung */
export interface SihuaTrigger {
  starName: string;
  type: SihuaType;
  fromYear: boolean;        // Tứ Hóa bản mệnh (từ năm sinh)
}

// ============================================================
// 4. CUNG (PALACE)
// ============================================================

/** Tên 12 cung chức năng */
export type PalaceName =
  | 'Mệnh'    | 'Phụ Mẫu'  | 'Phúc Đức'  | 'Điền Trạch'
  | 'Quan Lộc' | 'Nô Bộc'  | 'Thiên Di'  | 'Tật Ách'
  | 'Tài Bạch' | 'Tử Tức'  | 'Phu Thê'   | 'Huynh Đệ';

/** Một trong 12 cung của mệnh bàn */
export interface Palace {
  /** Index vị trí theo Địa Chi (0=Tý, 1=Sửu, ... 11=Hợi) */
  chiIndex: number;
  chi: TwoelveChi;

  /** Thiên Can của cung (từ Can Chi mệnh bàn) */
  can: TenCan;
  canIndex: number;

  /** Tên cung chức năng */
  palaceName: PalaceName;

  /** Danh sách chính tinh */
  mainStars: Star[];

  /** Danh sách phụ tinh */
  auxStars: Star[];

  /** Tứ Hóa tại cung này */
  sihua: SihuaTrigger[];

  /** Cung có Tuần Không */
  hasTuanKhong: boolean;

  /** Cung có Triệt Không */
  hasTrinhKhong: boolean;
}

// ============================================================
// 5. MỆNH BÀN (CHART)
// ============================================================

/** Toàn bộ mệnh bàn Tử Vi Đẩu Số */
export interface ZiweiChart {
  /** Thông tin ngày sinh */
  solarDate: SolarDate;
  lunarDate: LunarDate;
  gender: Gender;

  /** Thiên Can + Địa Chi năm sinh */
  namCanChi: NamCanChi;

  /** Ngũ Hành Nạp Âm Cục */
  nguHanhCuc: NguHanhCuc;
  tenCuc: TenCuc;

  /** Index cung Mệnh (0-11, tương ứng Địa Chi) */
  cungMenhIndex: number;
  cungMenhChi: TwoelveChi;

  /** Index cung Thân (0-11) */
  cungThanIndex: number;
  cungThanChi: TwoelveChi;

  /** 12 cung — index trong mảng = chiIndex (0=Tý, ..., 11=Hợi) */
  palaces: Palace[];

  /** Thời gian tính toán */
  calculatedAt: number; // timestamp
}

/** Kết quả phân tích từ Gemini AI — định nghĩa ở đây để dùng toàn app */
export interface PalaceAnalysis {
  palace_analysis: string;
  karmic_interactions: string[];
  sihua_triggers: string;
  modern_advice: string;
}

export interface FullChartAnalysis {
  overview: string;
  strengths: string[];
  challenges: string[];
  life_phases: string;
  modern_advice: string;
}

// ============================================================
// 6. HẰNG SỐ THAM CHIẾU
// ============================================================

/** Mảng 10 Thiên Can theo thứ tự */
export const TEN_CAN: TenCan[] = [
  'Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu',
  'Kỷ',   'Canh', 'Tân',  'Nhâm', 'Quý'
];

/** Mảng 12 Địa Chi theo thứ tự (index 0=Tý, 1=Sửu, ..., 11=Hợi) */
export const TWELVE_CHI: TwoelveChi[] = [
  'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ',
  'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'
];

/** Map tên cục từ số */
export const CUC_NAME: Record<NguHanhCuc, TenCuc> = {
  2: 'Thủy Nhị Cục',
  3: 'Mộc Tam Cục',
  4: 'Kim Tứ Cục',
  5: 'Thổ Ngũ Cục',
  6: 'Hỏa Lục Cục',
};

/** 12 cung theo thứ tự từ Mệnh (đếm ngược kim đồng hồ) */
export const PALACE_NAMES_ORDER: PalaceName[] = [
  'Mệnh',    'Phụ Mẫu',  'Phúc Đức',  'Điền Trạch',
  'Quan Lộc', 'Nô Bộc',  'Thiên Di',  'Tật Ách',
  'Tài Bạch', 'Tử Tức',  'Phu Thê',   'Huynh Đệ',
];
