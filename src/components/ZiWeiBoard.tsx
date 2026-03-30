import React, { useState, useEffect } from 'react';
import type { ZiweiChart, PalaceName } from '../core/types/ZiweiTypes';
import { PalaceCell } from './PalaceCell';
import { CenterPanel } from './CenterPanel';

// Mảng chứa thứ tự index Địa Chi (0..11) map vào Grid CSS.
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
  const [activeStar, setActiveStar] = useState<{ name: string, desc: string } | null>(null);

  // Tự động ẩn Tooltip của sao sau 6 giây
  useEffect(() => {
    if (activeStar) {
      const timer = setTimeout(() => setActiveStar(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [activeStar]);

  if (!chart || !chart.palaces) {
    return <div className="text-white text-center">Đang tải Mệnh Bàn...</div>;
  }

  return (
    <div className="ziwei-board-wrapper">
      {/* Scroll hint — chỉ hiện trên mobile */}
      <p className="ziwei-scroll-hint">← Vuốt để xem toàn bộ Mệnh Bàn →</p>

      <div className="mb-4 flex flex-col gap-2 text-center sm:text-left">
        <p className="text-sm uppercase tracking-[0.18em] text-white/45">Mệnh bàn tổng quan</p>
        <p className="text-sm text-white/65">
          Chạm vào từng cung để xem trọng tâm luận giải.
        </p>
      </div>

      <div className="ziwei-scroll-container pb-6 pt-3">
        <div className="ziwei-grid mx-auto max-w-[800px] w-full text-white relative">
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
                onStarClick={(name: string, desc: string) => setActiveStar({ name, desc })}
              />
            );
          })}
        </div>
      </div>

      {/* Cửa sổ nổi hiển thị mô tả thông tin Sao (Hỗ trợ tốt Touch screen / Mobile) */}
      {activeStar && (
        <div
          className="fixed bottom-[10%] left-1/2 -translate-x-1/2 z-[9999] bg-[#111922]/88 rounded-sm p-3.5 flex max-w-[90vw] md:max-w-md animate-fade-up items-start cursor-pointer"
          onClick={() => setActiveStar(null)}
        >
          <div className="text-[1.3rem] mr-2 mt-0.5 opacity-90">✨</div>
          <div className="flex-1">
            <h4 className="text-gold font-bold text-[15px] mb-1">{activeStar.name}</h4>
            <p className="text-white/80 text-[13px] whitespace-normal leading-relaxed">{activeStar.desc}</p>
          </div>
          <button className="ml-3 text-white/40 hover:text-white pt-0.5 text-xs">✕</button>
        </div>
      )}
    </div>
  );
};
