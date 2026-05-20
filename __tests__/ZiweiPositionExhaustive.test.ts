import { findZiweiPosition } from '../src/core/astrology/ZiweiEngine';
import type { NguHanhCuc } from '../src/core/types/ZiweiTypes';

/**
 * Classical Zi Wei positioning algorithm (Chẵn tiến Lẻ lùi)
 * Used as the absolute reference for cross-verification.
 */
function getExpectedZiweiPosition(day: number, cuc: number): number {
  // 1. Find the smallest non-negative integer X such that (day + X) is divisible by cuc
  let X = 0;
  while ((day + X) % cuc !== 0) {
    X++;
  }

  // 2. Calculate the base quotient (mốc cung khởi)
  const quotient = (day + X) / cuc;
  
  // 3. The starting palace is Dần (index 2) + quotient - 1
  const basePalace = 2; // Dần
  const startPalace = (basePalace + quotient - 1 + 12) % 12;

  // 4. Apply Chẵn tiến Lẻ lùi:
  // If X is even, move forward by X palaces.
  // If X is odd, move backward by X palaces.
  if (X % 2 === 0) {
    return (startPalace + X) % 12;
  } else {
    return (startPalace - X + 12) % 12;
  }
}

describe('Exhaustive Zi Wei Position Verification', () => {
  const CUCS: NguHanhCuc[] = [2, 3, 4, 5, 6];

  it('khớp 100% vị trí Tử Vi giữa công thức tối ưu và thuật toán cổ điển trên 150 tổ hợp', () => {
    let passedCount = 0;
    const failures: string[] = [];

    for (const cuc of CUCS) {
      for (let day = 1; day <= 30; day++) {
        const expected = getExpectedZiweiPosition(day, cuc);
        const actual = findZiweiPosition(day, cuc);

        if (actual === expected) {
          passedCount++;
        } else {
          failures.push(
            `Cục: ${cuc}, Ngày: ${day} -> Mong đợi: ${expected} (${getPalaceName(expected)}), Thực tế: ${actual} (${getPalaceName(actual)})`
          );
        }
      }
    }

    if (failures.length > 0) {
      console.error('Phát hiện sai lệch vị trí Tử Vi:\n' + failures.join('\n'));
    }

    expect(passedCount).toBe(150);
    expect(failures).toHaveLength(0);
  });
});

function getPalaceName(index: number): string {
  const names = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
  return names[index] ?? String(index);
}
