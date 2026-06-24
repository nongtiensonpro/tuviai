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

export type StarScope = 'natal' | 'annual' | 'monthly' | 'marker';

export type StarGroup =
  | 'main'
  | 'luc-cat'
  | 'luc-sat'
  | 'fixed'
  | 'thai-tue-cycle'
  | 'loc-ton-cycle'
  | 'trang-sinh-cycle'
  | 'month-day-hour'
  | 'year-branch'
  | 'annual'
  | 'marker'
  | 'other';

export type StarVerificationStatus = 'verified' | 'candidate' | 'legacy';

export interface StarDefinition {
  name: string;
  aliases?: string[];
  category: StarCategory;
  group: StarGroup;
  scope: StarScope;
  nguHanh?: NguHanh;
  verificationStatus: StarVerificationStatus;
  source: string;
}

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

  // Trường bổ sung phục vụ độ chính xác thiên văn học
  birthPlace?: string;
  longitude?: number;
  timezoneUsed?: number;
  eot?: number;                 // Equation of Time (phút)
  longitudeOffset?: number;     // Lệch kinh độ so với múi giờ hành chính (phút)
  totalOffset?: number;         // Tổng hiệu chỉnh (phút)
  trueSolarHour?: number;       // Giờ Mặt Trời Thực sau hiệu chỉnh
  trueSolarMinute?: number;     // Phút Mặt Trời Thực sau hiệu chỉnh
  isHistoricalTimezoneApplied?: boolean;
  isTrueSolarTimeApplied?: boolean;
  
  // Option xử lý giờ Tý sớm (23:00 - 23:59)
  earlyZiMode?: 'next_day' | 'same_day';
}

/** Ngày sinh đã chuyển sang Âm lịch */
export interface LunarDate {
  day: number;         // 1-30
  month: number;       // 1-12
  year: number;
  isLeap: boolean;     // Tháng nhuận
  hourChi: TwoelveChi; // Địa Chi giờ sinh
  hourChiIndex: number; // 0-11
  
  // Flag đánh dấu đã tự động điều chỉnh tăng 1 ngày do sinh giờ Tý sớm
  isEarlyZiAdjusted?: boolean;
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
  hasTrietKhong: boolean;
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
  nguHanh: NguHanh; // Hành của cung (Kim, Mộc, Thủy, Hỏa, Thổ)
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
    focusPalaces?: AiPalaceSnapshot[];
    all12Palaces: AiPalaceSnapshot[]; // Toàn bộ 12 cung được an theo thứ tự Địa Chi (0 = Tý, ..., 11 = Hợi)
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

export type InsightKind = 'star' | 'palace' | 'glossary' | 'state-marker';

export interface InsightTag {
  label: string;
}

export interface InsightSection {
  title: string;
  body: string;
}

export interface InsightProfile {
  description?: string;
  keywords: string[];
  sections: InsightSection[];
}

export interface InsightRelatedItem {
  kind: InsightKind;
  name: string;
  label: string;
  hint?: string;
}

export type InsightExploreCategory =
  | 'family'
  | 'counterpart'
  | 'palace-impact'
  | 'theme'
  | 'related';

export interface InsightExploreGroup {
  id: string;
  title: string;
  description: string;
  category: InsightExploreCategory;
  items: InsightRelatedItem[];
}

export interface InsightContext {
  palaceName?: PalaceName;
  chi?: TwoelveChi;
  isMainStar?: boolean;
  isBorrowed?: boolean;
  isThanPalace?: boolean;
  nguHanh?: NguHanh;
  brightness?: StarBrightness;
  sihua?: SihuaType;
  trangSinh?: string;
  daiHan?: number;
}

export interface InsightPayload {
  kind: InsightKind;
  title: string;
  subtitle: string;
  description: string;
  keywords: string[];
  sections: InsightSection[];
  tags: InsightTag[];
  context: InsightContext;
  relatedItems: InsightRelatedItem[];
  exploreGroups: InsightExploreGroup[];
}

export interface InsightStarSelection {
  name: string;
  palaceName?: PalaceName;
  chi?: TwoelveChi;
  isMainStar?: boolean;
  isBorrowed?: boolean;
}

export interface InsightTermSelection {
  name: string;
  palaceName?: PalaceName;
  chi?: TwoelveChi;
}

/** Nhóm lỗi AI chuẩn hóa để UI có thể xử lý nhất quán */
export type AiErrorCode =
  | 'invalid_api_key'
  | 'quota_exceeded'
  | 'rate_limited'
  | 'model_overloaded'
  | 'network_unavailable'
  | 'request_timeout'
  | 'empty_response'
  | 'invalid_json'
  | 'user_cancelled'
  | 'unknown';

/** Payload lỗi AI đã chuẩn hóa để service và UI giao tiếp cùng một ngôn ngữ */
export interface AiServiceErrorDetails {
  code: AiErrorCode;
  message: string;
  retryable: boolean;
  suggestedAction: string;
  status?: number;
  modelName?: string;
  attemptNumber?: number;
  maxAttempts?: number;
  retryAfterMs?: number;
}

/** Thông tin một lần retry để UI mô tả tiến trình tự phục hồi */
export interface AiRetryAttempt {
  attemptNumber: number;
  maxAttempts: number;
  retryAfterMs: number;
  code: AiErrorCode;
  modelName: string;
}

/** Thống kê cục bộ về độ ổn định của một model AI */
export interface AiModelTelemetryRecord {
  modelName: string;
  successCount: number;
  failureCount: number;
  lastLatencyMs: number;
  averageLatencyMs: number;
  lastUsedAt: number;
  lastSuccessAt?: number;
  lastFailureAt?: number;
  lastErrorCode?: AiErrorCode;
}

/** Snapshot health đã rút gọn để UI dễ hiển thị */
export interface AiModelHealthSnapshot {
  modelName: string;
  score: number;
  healthLabel: 'excellent' | 'good' | 'watch' | 'risky' | 'unknown';
  successRate: number | null;
  averageLatencyMs: number | null;
  lastErrorCode?: AiErrorCode;
}

/** Payload tối thiểu để yêu cầu worker lập mệnh bàn */
export interface ChartWorkerInput {
  day: number;
  month: number;
  year: number;
  gender: Gender;

  // Các thông số giờ sinh nâng cao
  hourMode: 'exact' | 'chi'; // Nhập giờ chính xác hay chỉ nhập giờ Địa Chi
  hourIndex?: number;        // 0-11 nếu nhập theo giờ Địa Chi
  exactHour?: number;        // 0-23 nếu nhập giờ chính xác
  exactMinute?: number;      // 0-59 nếu nhập giờ chính xác
  
  // Thông tin địa lý sinh
  birthPlace: string;        // Tên tỉnh thành hoặc "manual" hoặc "none"
  customLongitude?: number;  // Kinh độ tự nhập nếu chọn "manual"
}

/** Message gửi vào worker lập mệnh bàn */
export interface ChartWorkerRequest {
  requestId: string;
  input: ChartWorkerInput;
}

/** Worker trả về chart thành công */
export interface ChartWorkerSuccessResponse {
  requestId: string;
  ok: true;
  chart: ZiweiChart;
}

/** Worker trả về lỗi tính toán */
export interface ChartWorkerErrorResponse {
  requestId: string;
  ok: false;
  error: string;
}

/** Kết quả trả về từ worker lập mệnh bàn */
export type ChartWorkerResponse =
  | ChartWorkerSuccessResponse
  | ChartWorkerErrorResponse;

/** Checkpoint tối thiểu để đối chiếu regression với lá số tham chiếu */
export interface ReferencePalaceCheckpoint {
  palaceName: PalaceName;
  chi?: TwoelveChi;
  daiHan: number;
  trangSinh?: string;
  isThanPalace?: boolean;
  hasTuanKhong?: boolean;
  hasTrietKhong?: boolean;
  mainStars?: string[];
  borrowedMainStars?: string[];
  auxStarsIncludes?: string[];
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
    menhChu?: string;
    thanChu?: string;
    cungMenhChi: TwoelveChi;
    cungThanChi?: TwoelveChi;
    thanCuTaiCung?: PalaceName;
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

// ============================================================
// 7. TIỂU VẬN & LƯU NIÊN
// ============================================================

export interface AnnualPalace {
  chiIndex: number;
  chi: TwoelveChi;
  palaceName: PalaceName;
  daiHan: number;
  tieuVanAge?: number;
  isTieuVan: boolean;
  isLuuThaiTue: boolean;
  annualStars: Star[];
  mainStars: Star[];
  auxStars: Star[];
  annualSihua?: SihuaTrigger[];
}

export interface AnnualChart {
  targetYear: number;
  targetAge: number;
  tieuVanPalaceIndex: number;
  luuThaiTuePalaceIndex: number;
  palaces: AnnualPalace[];
}

export interface MonthlyPalace {
  chiIndex: number;
  chi: TwoelveChi;
  palaceName: PalaceName;
  daiHan: number;
  tieuVanAge?: number;
  isTieuVan: boolean;
  isLuuThaiTue: boolean;
  isMonthlyPalace: boolean;
  annualStars: Star[];
  monthlyStars: Star[];
  mainStars: Star[];
  auxStars: Star[];
  annualSihua?: SihuaTrigger[];
}

export interface MonthlyChart {
  targetYear: number;
  targetMonth: number;
  monthlyPalaceIndex: number;
  palaces: MonthlyPalace[];
}

