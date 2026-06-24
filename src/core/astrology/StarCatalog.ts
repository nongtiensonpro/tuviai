import type { StarCategory, StarDefinition, StarGroup, StarScope } from '../types/ZiweiTypes';

function defineStars(
  names: string[],
  group: StarGroup,
  category: StarCategory,
  scope: StarScope = 'natal',
  source = '.agents/skills/ziwei-algorithm/SKILL.md',
): StarDefinition[] {
  return names.map(name => ({
    name,
    category,
    group,
    scope,
    verificationStatus: 'verified',
    source,
  }));
}

const MAIN_STARS = defineStars([
  'Tử Vi', 'Thiên Cơ', 'Thái Dương', 'Vũ Khúc', 'Thiên Đồng', 'Liêm Trinh',
  'Thiên Phủ', 'Thái Âm', 'Tham Lang', 'Cự Môn', 'Thiên Tướng',
  'Thiên Lương', 'Thất Sát', 'Phá Quân',
], 'main', 'main');

const LUC_CAT_STARS = defineStars([
  'Lộc Tồn', 'Tả Phù', 'Hữu Bật', 'Thiên Khôi', 'Thiên Việt',
  'Văn Xương', 'Văn Khúc',
], 'luc-cat', 'cat');

const LUC_SAT_STARS = defineStars([
  'Kình Dương', 'Đà La', 'Hỏa Tinh', 'Linh Tinh', 'Địa Không', 'Địa Kiếp',
], 'luc-sat', 'sha');

const FIXED_STARS = defineStars([
  'Thiên La', 'Địa Võng', 'Thiên Thương', 'Thiên Sứ',
], 'fixed', 'fixed');

const THAI_TUE_CYCLE_STARS = defineStars([
  'Thái Tuế', 'Thiếu Dương', 'Tang Môn', 'Thiếu Âm',
  'Quan Phù', 'Tử Phù', 'Tuế Phá', 'Long Đức', 'Bạch Hổ',
  'Phúc Đức', 'Điếu Khách', 'Trực Phù',
], 'thai-tue-cycle', 'fixed');

const THAI_TUE_SHA_STARS = defineStars([
  'Thiên Không',
], 'thai-tue-cycle', 'sha');

const LOC_TON_CYCLE_STARS = defineStars([
  'Bác Sĩ', 'Lực Sĩ', 'Thanh Long', 'Tiểu Hao', 'Tướng Quân', 'Tấu Thư',
  'Phi Liêm', 'Hỷ Thần', 'Bệnh Phù', 'Đại Hao', 'Phục Binh', 'Quan Phủ',
], 'loc-ton-cycle', 'fixed');

const TRANG_SINH_CYCLE_STARS = defineStars([
  'Trường Sinh', 'Mộc Dục', 'Quan Đới', 'Lâm Quan', 'Đế Vượng', 'Suy',
  'Bệnh', 'Tử', 'Mộ', 'Tuyệt', 'Thai', 'Dưỡng',
], 'trang-sinh-cycle', 'fixed');

const MONTH_DAY_HOUR_STARS = defineStars([
  'Thiên Hình', 'Thiên Diêu', 'Thiên Y', 'Thiên Giải', 'Địa Giải',
  'Tam Thai', 'Bát Tọa', 'Ân Quang', 'Thiên Quý', 'Thai Phụ', 'Phong Cáo',
], 'month-day-hour', 'cat');

const YEAR_BRANCH_STARS = defineStars([
  'Đào Hoa', 'Hồng Loan', 'Thiên Hỷ', 'Cô Thần', 'Quả Tú', 'Kiếp Sát',
  'Hoa Cái', 'Phá Toái', 'Thiên Khốc', 'Thiên Hư', 'Long Trì',
  'Phượng Các', 'Giải Thần', 'Thiên Quan', 'Thiên Phúc', 'Lưu Hà',
  'Thiên Trù', 'Thiên Mã', 'Thiên Đức', 'Nguyệt Đức', 'Quốc Ấn',
  'Đường Phù', 'Đẩu Quân', 'Thiên Vu', 'Thiên Riêu', 'Thiên Tài',
  'Thiên Thọ',
], 'year-branch', 'cat');

const NEW_YEAR_BRANCH_CAT_STARS = defineStars([
  'Tướng Tinh', 'Phan An', 'Lưu Niên Văn Tinh', 'Thiên Khố',
], 'year-branch', 'cat');

const NEW_YEAR_BRANCH_SHA_STARS = defineStars([
  'Tức Thần', 'Tai Sát', 'Thiên Sát', 'Chỉ Bối', 'Nguyệt Sát', 'Vong Thần',
], 'year-branch', 'sha');

const NEW_MONTH_CAT_STARS = defineStars([
  'Nguyệt Giải',
], 'month-day-hour', 'cat');

const NEW_MONTH_SHA_STARS = defineStars([
  'Âm Sát', 'Thiên Nguyệt', 'Nguyệt Yếm', 'Nguyệt Hình',
], 'month-day-hour', 'sha');

const ANNUAL_STARS = defineStars([
  'Lưu Thái Tuế', 'Lưu Lộc Tồn', 'Lưu Kình Dương', 'Lưu Đà La',
  'Lưu Thiên Mã', 'Lưu Thiên Khốc', 'Lưu Thiên Hư', 'Lưu Hồng Loan',
  'Lưu Thiên Hỷ', 'Lưu Tang Môn', 'Lưu Bạch Hổ', 'Lưu Quan Phù',
  'Lưu Đào Hoa', 'Lưu Thiên Khôi', 'Lưu Thiên Việt', 'Lưu Hỏa Tinh',
  'Lưu Linh Tinh',
], 'annual', 'other', 'annual', '.agents/skills/ziwei-algorithm/SKILL.md#23');

const MARKER_STARS = defineStars([
  'Tuần Không', 'Triệt Không', 'Tuần', 'Triệt',
], 'marker', 'fixed', 'marker');

export const STAR_CATALOG: readonly StarDefinition[] = [
  ...MAIN_STARS,
  ...LUC_CAT_STARS,
  ...LUC_SAT_STARS,
  ...FIXED_STARS,
  ...THAI_TUE_CYCLE_STARS,
  ...THAI_TUE_SHA_STARS,
  ...LOC_TON_CYCLE_STARS,
  ...TRANG_SINH_CYCLE_STARS,
  ...MONTH_DAY_HOUR_STARS,
  ...NEW_MONTH_CAT_STARS,
  ...NEW_MONTH_SHA_STARS,
  ...YEAR_BRANCH_STARS,
  ...NEW_YEAR_BRANCH_CAT_STARS,
  ...NEW_YEAR_BRANCH_SHA_STARS,
  ...ANNUAL_STARS,
  ...MARKER_STARS,
];

export const NATAL_STAR_TARGET = 121;

export function normalizeStarNameForCatalog(starName: string): string {
  return starName.trim();
}

export function getStarDefinition(starName: string): StarDefinition | undefined {
  const normalized = normalizeStarNameForCatalog(starName);
  return STAR_CATALOG.find(
    star => star.name === normalized || star.aliases?.includes(normalized),
  );
}

export function isKnownStarName(starName: string): boolean {
  return getStarDefinition(starName) !== undefined;
}

export function getNatalStarDefinitions(): StarDefinition[] {
  return STAR_CATALOG.filter(star => star.scope === 'natal');
}

export function getNatalStarCount(): number {
  return getNatalStarDefinitions().length;
}
