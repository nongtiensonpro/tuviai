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

/** Giao thoa Âm Dương */
export type AmDuongLy = 'Âm dương thuận lý' | 'Âm dương nghịch lý';

/** Quan hệ giữa Bản Mệnh và Cục */
export type MenhCucRelation =
  | 'Cục sinh Bản Mệnh'
  | 'Cục hòa Bản Mệnh'
  | 'Bản Mệnh sinh Cục'
  | 'Bản Mệnh khắc Cục'
  | 'Cục khắc Bản Mệnh';

/** Độ sáng của sao trên mệnh bàn */
export type StarBrightness =
  | 'M'  // Miếu (庙) — sáng nhất
  | 'V'  // Vượng (旺)
  | 'Đ'  // Đắc  (得)
  | 'B'  // Bình (平 / 利)
  | 'H'  // Hãm  (陷) — tối nhất
  | '';  // Không xác định (trống cung)

/** Trạng thái Tứ Hóa */
export type SihuaType = 'Lộc' | 'Quyền' | 'Khoa' | 'Kỵ';

/** Ngũ Hành của một ngôi sao / bản mệnh */
export type NguHanh = 'Kim' | 'Mộc' | 'Thủy' | 'Hỏa' | 'Thổ';

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

/** Thông tin Nạp Âm cho năm sinh */
export interface NapAmInfo {
  name: string;
  nguHanh: NguHanh;
}

// ============================================================
// 3. VÌ SAO
// ============================================================

/** Một vì sao trên mệnh bàn */
export interface Star {
  name: string;             // Tên sao (tiếng Việt)
  category: StarCategory;
  nguHanh: NguHanh;         // Kim, Mộc, Thủy, Hỏa, Thổ (Cần cho UI hiển thị màu)
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

  /** Vòng Tràng Sinh (Thai, Dưỡng, Trường Sinh...) */
  trangSinh: string;

  /** Đại Hạn (tuổi bắt đầu, ví dụ: 15) */
  daiHan: number;

  /** Tiểu Hạn (Năm xem hiện tại rơi vào cung nào - optional) */
  tieuHan?: string;

  /** Có phải là Cung Thân không? (Để gắn badge 'Thân') */
  isThanPalace: boolean;

  /** Danh sách chính tinh */
  mainStars: Star[];

  /** Danh sách phụ tinh */
  auxStars: Star[];

  /** Tứ Hóa tại cung này */
  sihua: SihuaTrigger[];

  /** Danh sách chính tinh mượn (cho cung Vô chính diệu) */
  borrowedStars: Star[];

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

  /** Nạp Âm Bản Mệnh (e.g. Thành Đầu Thổ) */
  banMenh: string;

  /** Ngũ Hành Nạp Âm Cục */
  nguHanhCuc: NguHanhCuc;
  tenCuc: TenCuc;

  /** Thuộc tính Âm Dương Lý */
  amDuongLy: AmDuongLy;
  amDuongNamNu: string; // "Dương Nam", "Âm Nữ"...
  menhCucSinhKhac: MenhCucRelation;

  /** Chủ Tinh */
  menhChu: string;
  thanChu: string;

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

/** Chế độ phân tích AI */
export type AnalysisIntentMode =
  | 'initial_analysis'
  | 'palace_deep_dive'
  | 'follow_up'
  | 'compare_palaces'
  | 'action_plan';

/** Vùng trọng tâm đang được AI theo dõi */
export type AnalysisFocusArea = PalaceName | 'overall';

/** Tầng ý định người dùng để AI biết đang phải giải quyết việc gì */
export interface AnalysisUserIntent {
  mode: AnalysisIntentMode;
  focusArea: AnalysisFocusArea;
  userQuestion?: string;
}

/** Snapshot rút gọn của một cung để đưa vào prompt */
export interface AiPalaceSnapshot {
  palaceName: PalaceName;
  diaChi: TwoelveChi;
  mainStars: string[];
  auxStars: string[];
  borrowedMainStars: string[];
  sihua: string[];
  trangSinh: string;
  daiHan: number;
  isThanPalace: boolean;
  hasTuanKhong: boolean;
  hasTrietKhong: boolean;
}

/** Trọng tâm phân tích cho một cung đích */
export interface AnalysisFocusContext {
  targetPalaceName?: PalaceName;
  targetPalace?: AiPalaceSnapshot;
  tamHopPalaces: AiPalaceSnapshot[];
  oppositePalace?: AiPalaceSnapshot;
  focusHighlights: string[];
  referencedPalaces: PalaceName[];
}

/** Payload context hoàn chỉnh để gửi cho AI */
export interface AnalysisPromptContext {
  userIntent: AnalysisUserIntent;
  chartFacts: {
    basicInfo: {
      ngaySinhDuongLich: string;
      ngaySinhAmLich: string;
      gioDia: TwoelveChi;
      namCanChi: string;
      gioiTinh: 'Nam' | 'Nữ';
      banMenh: string;
      nguHanhCuc: TenCuc;
      amDuongLy: AmDuongLy;
      amDuongNamNu: string;
      menhCucSinhKhac: MenhCucRelation;
      menhChu: string;
      thanChu: string;
      cungMenh: TwoelveChi;
      cungThan: TwoelveChi;
      thanCuTaiCung: PalaceName;
    };
    keyPalaces: AiPalaceSnapshot[];
    allPalaces: AiPalaceSnapshot[];
  };
  derivedSignals: {
    chartHighlights: string[];
    focusContext: AnalysisFocusContext;
  };
  bridgeContext?: AnalysisBridgeContext;
}

/** Vai trò trong hội thoại */
export type ChatRole = 'user' | 'ai';

/** Một lượt trao đổi trong thread hỏi đáp */
export interface ChatTurn {
  id: string;
  role: ChatRole;
  msg: string;
  createdAt: number;
}

/** Bộ nhớ ngắn hạn dùng cho follow-up */
export interface FollowUpMemory {
  focusArea: AnalysisFocusArea;
  analysisSummary: string;
  keyPoints: string[];
  referencedPalaces: PalaceName[];
  relatedPalaces: PalaceName[];
  focusHighlights: string[];
  chartHighlights: string[];
  suggestedQuestions: string[];
  conversationRecap: string;
  bridgeContext?: AnalysisBridgeContext;
}

/** Ngữ cảnh nối mạch khi người dùng chuyển từ một trọng tâm sang trọng tâm khác */
export interface AnalysisBridgeContext {
  sourceFocusArea: AnalysisFocusArea;
  targetFocusArea: AnalysisFocusArea;
  summary: string;
  referencedPalaces: PalaceName[];
  recentUserQuestions: string[];
  transitionReason: string;
}

/** Thread hội thoại gắn với một lá số và một vùng trọng tâm */
export interface AnalysisThread {
  id: string;
  chartFingerprint: string;
  focusArea: AnalysisFocusArea;
  analysis: PalaceAnalysis;
  memory: FollowUpMemory;
  turns: ChatTurn[];
  createdAt: number;
  updatedAt: number;
}

/** Payload gọn nhẹ cho lượt follow-up */
export interface FollowUpPromptContext {
  userIntent: AnalysisUserIntent;
  threadMemory: FollowUpMemory;
  conversationRecap: string;
  conversationDigest: string[];
  recentTurns: Array<Pick<ChatTurn, 'role' | 'msg'>>;
  totalTurns: number;
  question: string;
}

/** Kết quả phân tích từ Gemini AI — định nghĩa ở đây để dùng toàn app */
export interface PalaceAnalysis {
  summary: string;
  palace_analysis: string;
  key_points: string[];
  karmic_interactions: string[];
  referenced_palaces: PalaceName[];
  sihua_triggers: string;
  modern_advice: string;
  follow_up_suggestions: string[];
}

export interface FullChartAnalysis {
  overview: string;
  strengths: string[];
  challenges: string[];
  life_phases: string;
  modern_advice: string;
}

/** Checkpoint tối thiểu để đối chiếu regression với lá số tham chiếu */
export interface ReferencePalaceCheckpoint {
  palaceName: PalaceName;
  chi?: TwoelveChi;
  daiHan: number;
  trangSinh?: string;
  isThanPalace?: boolean;
  hasTuanKhong?: boolean;
  hasTrietKhong?: boolean;
}

/** Fixture regression lấy từ lá số tham chiếu công khai */
export interface ReferenceChartFixture {
  label: string;
  sourceUrl: string;
  sourceNote: string;
  input: {
    solarDate: SolarDate;
    gender: Gender;
  };
  expected: {
    lunarDate: Pick<LunarDate, 'day' | 'month' | 'year' | 'hourChi'>;
    namCanChi: string;
    amDuongNamNu: string;
    amDuongLy: AmDuongLy;
    tenCuc: TenCuc;
    banMenh: string;
    cungMenhChi: TwoelveChi;
    cungThanChi?: TwoelveChi;
    thanCuTaiCung: PalaceName;
    checkpoints: ReferencePalaceCheckpoint[];
  };
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
