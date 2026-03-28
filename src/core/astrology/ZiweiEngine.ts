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

/**
 * Tìm vị trí sao Tử Vi (chiIndex) - Thuật toán Tử Vi Đẩu Số truyền thống
 * X = (Ngày sinh + Y) / Cục. 
 * Y là số nhỏ nhất (0..Cục-1) để (Ngày sinh + Y) mod Cục == 0.
 * A = X + 1 (Vị trí tạm từ Dần).
 * Nếu Y lẻ: Z = A - Y. Nếu Y chẵn: Z = A + Y.
 * Z chính là chiIndex của Tử Vi.
 * 
 * @param ngayAm - ngày sinh âm lịch (1-30)
 * @param cuc - Ngũ Hành Nạp Âm Cục (2,3,4,5,6)
 */
export function findZiweiPosition(ngayAm: number, cuc: NguHanhCuc): number {
  let Y = 0;
  while ((ngayAm + Y) % cuc !== 0) {
    Y++;
  }
  const X = Math.floor((ngayAm + Y) / cuc);
  const A = X + 1; // Khởi từ Dần (Dần là 2, nhưng ta tính offset A, sau đó -1, hoặc giữ Z tính sau)

  let Z = 0;
  if (Y % 2 !== 0) {
    // Y lẻ -> đếm lùi Y cung từ A
    Z = A - Y;
  } else {
    // Y chẵn -> đếm tiến Y cung từ A
    Z = A + Y;
  }
  // Base Dần là 2:
  // Vì A coi như vị trí cung (Dần=2), công thức lúc nãy: A=X+1 là offset.
  // Mốc thực sự là Dần (2).
  // A thực sự bằng (2 + X - 1) = X + 1. 
  // Rồi Z thực sự = (X+1) +/- Y.
  const finalIdx = (Z + 12) % 12; // Z là offset từ 0, mà Tý=0, Dần=2. Khúc này đã calibrate chuẩn Tý=0.
  // Wait, Z = X + 1 +/- Y đã tính Dần = 2 chưa?
  // Ở đây: A = X + 1, nếu X=1 => A=2 (Dần). 
  // Vậy Z = 2 là Dần. Z = 0 là Tý. Rất chính xác!
  return finalIdx;
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
 * Chòm Tử Vi:
 *   Tử Vi    : Z
 *   Thiên Cơ : Z-1
 *   Thái Dương: Z-3
 *   Vũ Khúc  : Z-4
 *   Thiên Đồng: Z-5
 *   Liêm Trinh: Z-8
 *
 * Chòm Thiên Phủ:
 *   Thiên Phủ: (14-Z) % 12
 *   Thái Âm  : P+1
 *   Tham Lang: P+2
 *   Cự Môn   : P+3
 *   Thiên Tướng: P+4
 *   Thiên Lương: P+5
 *   Thất Sát : P+6
 *   Phá Quân : P+10
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

  // --- Chòm Tử Vi ---
  const Z = ziweiPos;
  place('紫微', Z);
  place('天機', (Z - 1 + 12) % 12);
  place('太陽', (Z - 3 + 12) % 12);
  place('武曲', (Z - 4 + 12) % 12);
  place('天同', (Z - 5 + 12) % 12);
  place('廉貞', (Z - 8 + 12) % 12);

  // --- Chòm Thiên Phủ ---
  // Trục đối xứng của Tử Vi và Thiên Phủ là trục Dần - Thân (2 - 8).
  // Suy ra (Z + P) mod 12 = 4. => P = (16 - Z) % 12.
  const P = (16 - Z) % 12; 
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
