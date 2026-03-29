/**
 * AstroApp.tsx
 * Thành phần chính gắn kết (Mount) toàn bộ phần Logic với giao diện ở index.astro
 */
import React, { useState } from 'react';
import { BirthForm, type BirthInfo } from './BirthForm';
import { ZiWeiBoard } from './ZiWeiBoard';
import { AnalysisPanel } from './AnalysisPanel';
import { buildZiweiChart } from '../core/astrology/ChartBuilder';
import type { ZiweiChart, PalaceName } from '../core/types/ZiweiTypes';

export const AstroApp: React.FC = () => {
  const [chart, setChart] = useState<ZiweiChart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [activePalace, setActivePalace] = useState<PalaceName | undefined>();

  const handleGenerateChart = (info: BirthInfo) => {
    setIsLoading(true);
    setError('');

    // Simulate slight delay for UX (có thể sau này dùng cho load AI)
    setTimeout(() => {
      try {
        const solarDate = {
          day: info.day,
          month: info.month,
          year: info.year,
          hour: info.hourIndex * 2, // approximation for solar hour
        };

        // Cần truyền giờ 24h vào solar, converter đang lấy hourIndex tự động 
        // dựa trên hour. Để bảo đảm chính xác hourChiIndex truyền đúng:
        // Đã sửa bên Converter tự động mapping hour. Ta cần pass hour 24h tương ứng:
        // Tý (0)=23, Sửu (1)=1, Dần (2)=3 ...
        const computedHour = info.hourIndex === 0 ? 23 : (info.hourIndex * 2) - 1;
        solarDate.hour = computedHour;

        const newChart = buildZiweiChart(solarDate, info.gender);
        setChart(newChart);

        // Scroll mượt xuống dưới biểu đồ
        setTimeout(() => {
          document.getElementById('section-board')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } catch (err: any) {
        setError(err.message || 'Có lỗi xảy ra khi tính toán mệnh bàn');
      } finally {
        setIsLoading(false);
      }
    }, 400);
  };

  const handlePalaceClick = (palaceName: PalaceName) => {
    setActivePalace(palaceName === activePalace ? undefined : palaceName);
  };

  return (
    <div className="w-full flex flex-col items-center gap-16 px-6 md:px-10">
      {!chart && (
        <section className="flex justify-center w-full px-4">
          <BirthForm onSubmit={handleGenerateChart} isLoading={isLoading} />
        </section>
      )}

      {/* Hiển thị Mệnh Bàn */}
      {chart && (
        <section id="section-board" className="animate-fade-up flex flex-col items-center w-full">
          {/* Constrain width to match Grid for perfect alignment */}
          <div className="max-w-[800px] w-full flex justify-between items-end mb-4 border-b border-gold/20 pb-2 px-2">
            <h3 className="text-3xl font-serif-sc text-gold drop-shadow-[0_0_15px_rgba(240,192,64,0.5)]">Mệnh Bàn Tử Vi</h3>
            <button
              onClick={() => setChart(null)}
              className="text-white/50 hover:text-white hover:bg-white/10 text-xs px-3 py-1.5 rounded transition-all border border-white/10"
            >
              ← Về trang nhập
            </button>
          </div>
          <ZiWeiBoard
            chart={chart}
            activePalace={activePalace}
            onPalaceClick={handlePalaceClick}
          />

          <div className="mt-8 w-full">
            <AnalysisPanel
              chart={chart}
              targetPalaceName={activePalace}
              onNavigateFocus={(focusArea) => {
                setActivePalace(focusArea === 'overall' ? undefined : focusArea);
              }}
            />
          </div>

          <p className="text-center text-white/40 mt-10 text-xs">
            Mệnh bàn tính toán chính xác 100% offline. Phần luận giải do AI thực hiện.
          </p>
        </section>
      )}
    </div>
  );
};
