/**
 * ZiweiEngine.ts — An định 14 chính tinh lên 12 cung mệnh bàn
 * Source: .agents/skills/ziwei-algorithm/SKILL.md §6, §7
 *
 * QUAN TRỌNG: Chỉ dùng công thức từ SKILL.md, không tự suy diễn
 */

import type { Palace, Star, NguHanhCuc, StarBrightness } from '../types/ZiweiTypes';
import { getStarNguHanh } from './NguHanhEngine';

// ============================================================
// AN SAO TỬ VI (BƯỚC 1)
// ============================================================

const DAN_CHI_INDEX = 2;

/**
 * Thuật toán tìm vị trí sao Tử Vi theo ngày âm × Cục.
 *
 * Bản "chu kỳ đầu" (ZIWEI_CYCLE_ONE) đã được verify 100% với lasotuvi.com và
 * khớp 150/150 với thuật toán cổ điển "Chẵn Tiến Lẻ Lùi" trong
 * __tests__/ZiweiPositionExhaustive.test.ts — GIỮ NGUYÊN, không đổi.
 */
const ZIWEI_CYCLE_ONE: Record<NguHanhCuc, number[]> = {
  2: [1, 2],
  3: [4, 1, 2],
  4: [11, 4, 1, 2],
  5: [6, 11, 4, 1, 2],
  6: [9, 6, 11, 4, 1, 2],
};

/**
 * Tìm vị trí sao Tử Vi (chiIndex) theo bảng canonical trong SKILL.md
 */
export function findZiweiPosition(ngayAm: number, cuc: NguHanhCuc): number {
  const quotient = Math.floor(ngayAm / cuc);
  const remainder = ngayAm % cuc;

  if (remainder === 0) {
    return (DAN_CHI_INDEX + Math.max(quotient - 1, 0)) % 12;
  }

  const cycleOne = ZIWEI_CYCLE_ONE[cuc];
  const basePos = cycleOne?.[remainder - 1];
  if (basePos === undefined) {
    return DAN_CHI_INDEX;
  }

  return (basePos + quotient) % 12;
}

// ============================================================
// BẢNG ĐỘ SÁNG (MIẾU/VƯỢNG/.../HÃM)
// ============================================================

/**
 * Bảng độ sáng của 14 chính tinh theo từng Địa Chi cung
 * chiIndex: 0=Tý, 1=Sửu, 2=Dần, 3=Mão, 4=Thìn, 5=Tỵ
 *           6=Ngọ, 7=Mùi, 8=Thân, 9=Dậu, 10=Tuất, 11=Hợi
 */
const BRIGHTNESS: Record<string, StarBrightness[]> = {
  // [Tý, Sửu, Dần, Mão, Thìn, Tỵ, Ngọ, Mùi, Thân, Dậu, Tuất, Hợi]
  '紫微': ['Đ', 'Đ', 'Đ', 'Đ', 'Đ', 'M', 'M', 'V', 'Đ', 'H', 'V', 'Đ'],
  '天機': ['B', 'Đ', 'H', 'M', 'H', 'Đ', 'B', 'B', 'H', 'M', 'H', 'V'],
  '太陽': ['H', 'H', 'V', 'V', 'M', 'M', 'M', 'V', 'Đ', 'H', 'H', 'H'],
  '武曲': ['M', 'Đ', 'Đ', 'H', 'Đ', 'M', 'H', 'Đ', 'M', 'V', 'Đ', 'H'],
  '天同': ['V', 'H', 'V', 'V', 'H', 'H', 'H', 'M', 'M', 'H', 'H', 'M'],
  '廉貞': ['H', 'M', 'M', 'H', 'B', 'H', 'V', 'H', 'Đ', 'H', 'V', 'H'],
  '天府': ['M', 'M', 'Đ', 'Đ', 'M', 'Đ', 'M', 'M', 'Đ', 'V', 'M', 'Đ'],
  '太陰': ['M', 'V', 'H', 'H', 'H', 'H', 'H', 'H', 'V', 'M', 'Đ', 'V'],
  '貪狼': ['V', 'Đ', 'M', 'V', 'Đ', 'H', 'B', 'B', 'V', 'M', 'H', 'M'],
  '巨門': ['B', 'M', 'H', 'H', 'H', 'V', 'B', 'V', 'H', 'H', 'M', 'H'],
  '天相': ['M', 'Đ', 'V', 'Đ', 'M', 'Đ', 'M', 'Đ', 'V', 'Đ', 'M', 'Đ'],
  '天梁': ['M', 'V', 'V', 'H', 'M', 'H', 'V', 'V', 'H', 'H', 'M', 'H'],
  '七殺': ['M', 'H', 'V', 'H', 'H', 'M', 'M', 'H', 'V', 'H', 'H', 'M'],
  '破軍': ['V', 'H', 'H', 'V', 'M', 'V', 'H', 'V', 'V', 'V', 'V', 'H'],
};

/** Map tên Hán sang tên Việt cho 14 chính tinh */
const STAR_HAN_TO_VIET: Record<string, string> = {
  '紫微': 'Tử Vi',
  '天機': 'Thiên Cơ',
  '太陽': 'Thái Dương',
  '武曲': 'Vũ Khúc',
  '天同': 'Thiên Đồng',
  '廉貞': 'Liêm Trinh',
  '天府': 'Thiên Phủ',
  '太陰': 'Thái Âm',
  '貪狼': 'Tham Lang',
  '巨門': 'Cự Môn',
  '天相': 'Thiên Tướng',
  '天梁': 'Thiên Lương',
  '七殺': 'Thất Sát',
  '破軍': 'Phá Quân',
};

function getBrightness(starHan: string, chiIndex: number): StarBrightness {
  return BRIGHTNESS[starHan]?.[chiIndex] ?? '';
}

function createMainStar(hanName: string, chiIndex: number): Star {
  const vnName = STAR_HAN_TO_VIET[hanName] ?? hanName;
  return {
    name: vnName,
    category: 'main',
    nguHanh: getStarNguHanh(vnName),
    brightness: getBrightness(hanName, chiIndex),
    palaceIndex: chiIndex,
  };
}

// ============================================================
// AN 14 CHÍNH TINH
// ============================================================

/**
 * An 14 chính tinh vào mảng 12 cung
 * Source: SKILL.md §7
 *
 * Chòm Tử Vi: Z
 * Chòm Thiên Phủ: P = (4 - Z) mod 12
 * Đây là vị trí đối xứng đúng với bố cục 14 chính tinh thực tế.
 */
export function placeMainStars(palaces: Palace[], ziweiPos: number): Palace[] {
  // Clone palaces để không mutate original
  const result = palaces.map(p => ({ ...p, mainStars: [...p.mainStars] }));

  // Helper: đặt sao vào cung
  function place(hanName: string, chiIndex: number): void {
    const idx = ((chiIndex % 12) + 12) % 12;
    const star = createMainStar(hanName, idx);
    result[idx]!.mainStars.push(star);
  }

  // --- Chòm Tử Vi (NGƯỢC chiều kim đồng hồ từ Tử Vi, có cung trống) ---
  // Quyết cổ bản (紫微斗數全書 安主星): Thiên Cơ nghịch 1 cung; CÁCH 1 cung trống
  // an Thái Dương; Vũ Khúc, Thiên Đồng mỗi sao nghịch tiếp 1 cung; CÁCH 2 cung
  // trống an Liêm Trinh → offset cố định -1, -3, -4, -5, -8.
  // Đối chứng 9 cặp sao kinh điển (xem __tests__/EngineInvariants.test.ts):
  // 紫府=寅申, 同阴=子午, 同巨=丑未, 同梁=寅申, 武贪=丑未, 机梁=辰戌, 廉府=辰戌, 廉相=子午, 日月=丑未.
  const Z = ziweiPos;
  place('紫微', Z);
  place('天機', (Z - 1 + 12) % 12);
  place('太陽', (Z - 3 + 12) % 12);
  place('武曲', (Z - 4 + 12) % 12);
  place('天同', (Z - 5 + 12) % 12);
  place('廉貞', (Z - 8 + 12) % 12);

  // --- Chòm Thiên Phủ (THUẬN chiều kim đồng hồ từ Thiên Phủ) ---
  const P = (4 - Z + 12) % 12;
  place('天府', P);
  place('太陰', (P + 1) % 12);
  place('貪狼', (P + 2) % 12);
  place('巨門', (P + 3) % 12);
  place('天相', (P + 4) % 12);
  place('天梁', (P + 5) % 12);
  place('七殺', (P + 6) % 12);
  place('破軍', (P + 10) % 12); 

  return result;
}

/**
 * Utility: Lấy tên Việt từ tên Hán
 */
export function getStarVietnameseName(hanName: string): string {
  return STAR_HAN_TO_VIET[hanName] ?? hanName;
}

/**
 * Utility: Tìm sao Tử Vi trong mệnh bàn
 */
export function findZiweiStar(palaces: Palace[]): { chiIndex: number; star: Star } | null {
  for (const palace of palaces) {
    const star = palace.mainStars.find(s => s.name === 'Tử Vi');
    if (star) return { chiIndex: palace.chiIndex, star };
  }
  return null;
}
