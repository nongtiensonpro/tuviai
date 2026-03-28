/**
 * ZiWeiBoard.tsx
 * Thành phần cha quản lý Grid 4x4 hiển thị Tử Vi Đẩu Số.
 * Sắp xếp các PalaceCell theo đúng bảng Chi (Tý -> Hợi).
 */
import React from 'react';
import type { ZiweiChart, PalaceName } from '../core/types/ZiweiTypes';
import { PalaceCell } from './PalaceCell';
import { CenterPanel } from './CenterPanel';

// Mảng chứa thứ tự index Địa Chi (0..11) map vào Grid CSS.
// Tý (0), Sửu (1), ..., Hợi (11).
// Grid 4x4 sẽ được sắp xếp như sau:
// [ Tỵ(5) ] [ Ngọ(6)  ] [ Mùi(7)  ] [ Thân(8) ]
// [ Thìn(4)] [ CENTER ] [ CENTER ] [ Dậu(9)  ]
// [ Mão(3) ] [ CENTER ] [ CENTER ] [ Tuất(10)]
// [ Dần(2) ] [ Sửu(1)  ] [ Tý(0)   ] [ Hợi(11) ]

// => Sắp xếp index vào mảng grid để render từ trên xuống dưới, trái qua phải.
// Cột-1 (trên xuống): Tỵ(5), Thìn(4), Mão(3), Dần(2)
// Hàng trên cùng: Ngọ(6), Mùi(7), Thân(8)
// Cột phải: Dậu(9), Tuất(10), Hợi(11)
// Hàng dưới cùng: Sửu(1), Tý(0)
const GRID_CELLS_ORDER = [
  /* R1 */ 5, 6, 7, 8,
  /* R2 */ 4, 'CENTER', 'CENTER', 9,
  /* R3 */ 3, 'CENTER', 'CENTER', 10,
  /* R4 */ 2, 1, 0, 11
];

interface ZiWeiBoardProps {
  chart: ZiweiChart;
  onPalaceClick?: (palaceName: PalaceName) => void;
  activePalace?: PalaceName;
}

export const ZiWeiBoard: React.FC<ZiWeiBoardProps> = ({ chart, onPalaceClick, activePalace }) => {
  if (!chart || !chart.palaces) {
    return <div className="text-white text-center">Đang tải Mệnh Bàn...</div>;
  }

  return (
    <div className="ziwei-board-wrapper">
      {/* Scroll hint — chỉ hiện trên mobile */}
      <p className="ziwei-scroll-hint">← Vuốt để xem toàn bộ Mệnh Bàn →</p>

      <div className="ziwei-scroll-container">
        <div className="ziwei-grid mx-auto max-w-[800px] w-full text-white">
          {GRID_CELLS_ORDER.map((item, index) => {
            // Render Center Panel
            if (item === 'CENTER') {
              if (index === 5) {
                return <CenterPanel key="center" chart={chart} />;
              }
              return null;
            }

            // Render Palace Cell
            const chiIndex = item as number;
            const palace = chart.palaces[chiIndex];
            if (!palace) return null;

            const isActive = activePalace === palace.palaceName;

            return (
              <PalaceCell
                key={`palace-${chiIndex}`}
                palace={palace}
                isActive={isActive}
                onClick={() => onPalaceClick?.(palace.palaceName)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
