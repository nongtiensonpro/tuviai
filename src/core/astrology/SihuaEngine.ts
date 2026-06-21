/**
 * SihuaEngine.ts — Tứ Hóa Phi Tinh (Hóa Lộc, Hóa Quyền, Hóa Khoa, Hóa Kỵ)
 * Source: .agents/skills/ziwei-algorithm/SKILL.md §8
 */

import type { Palace, SihuaType, TenCan } from '../types/ZiweiTypes';

import { TU_HOA_TABLE } from './StarConstants';

const SIHUA_TYPES: SihuaType[] = ['Lộc', 'Quyền', 'Khoa', 'Kỵ'];

// ============================================================
// HÀM AN TỨ HÓA
// ============================================================

/**
 * An Tứ Hóa vào mệnh bàn dựa trên Thiên Can năm sinh
 *
 * Với mỗi sao được Hóa:
 * 1. Tìm sao đó trong mainStars và auxStars của tất cả các cung
 * 2. Ghi nhãn sihua vào sao đó
 * 3. Thêm SihuaTrigger vào Palace chứa sao
 */
export function applySihua(
  palaces: Palace[],
  yearCan: TenCan,
): Palace[] {
  const result = palaces.map(p => ({
    ...p,
    mainStars: p.mainStars.map(s => ({ ...s })),
    auxStars: p.auxStars.map(s => ({ ...s })),
    sihua: [...p.sihua],
  }));

  const sihuaStars = TU_HOA_TABLE[yearCan];
  if (!sihuaStars) return result;

  for (let i = 0; i < 4; i++) {
    const starName = sihuaStars[i]!;
    const sihuaType = SIHUA_TYPES[i]!;

    // Tìm sao trong tất cả 12 cung
    for (const palace of result) {
      // Tìm trong chính tinh
      for (const star of palace.mainStars) {
        if (star.name === starName) {
          star.sihua = sihuaType;
          palace.sihua.push({
            starName,
            type: sihuaType,
            fromYear: true,
          });
        }
      }
      // Tìm trong phụ tinh
      for (const star of palace.auxStars) {
        if (star.name === starName) {
          star.sihua = sihuaType;
          if (!palace.sihua.find(s => s.starName === starName)) {
            palace.sihua.push({
              starName,
              type: sihuaType,
              fromYear: true,
            });
          }
        }
      }
    }
  }

  return result;
}

/**
 * Utility: Lấy thông tin Tứ Hóa theo Can năm
 */
export function getTuHoaInfo(yearCan: TenCan): {
  loc: string;
  quyen: string;
  khoa: string;
  ky: string;
} {
  const [loc, quyen, khoa, ky] = TU_HOA_TABLE[yearCan] ?? ['', '', '', ''];
  return { loc, quyen, khoa, ky };
}

/**
 * Utility: Lấy màu CSS cho loại Tứ Hóa
 */
export function getSihuaColor(type: SihuaType): string {
  const colors: Record<SihuaType, string> = {
    'Lộc': '#22c55e',   // green
    'Quyền': '#f0c040', // gold
    'Khoa': '#60a5fa',  // blue
    'Kỵ': '#ef4444',    // red
  };
  return colors[type];
}
