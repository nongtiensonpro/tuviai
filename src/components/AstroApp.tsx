/**
 * AstroApp.tsx
 * Thành phần chính gắn kết (Mount) toàn bộ phần Logic với giao diện ở index.astro
 */
import React, { Suspense, lazy, startTransition, useEffect, useState } from 'react';
import { BirthForm, type BirthInfo } from './BirthForm';
import type { ZiweiChart, PalaceName } from '../core/types/ZiweiTypes';
import { ChartWorkerService } from '../services/ChartWorkerService';

const ZiWeiBoard = lazy(async () => {
  const module = await import('./ZiWeiBoard');
  return { default: module.ZiWeiBoard };
});

const AnalysisPanel = lazy(async () => {
  const module = await import('./AnalysisPanel');
  return { default: module.AnalysisPanel };
});

const SECTION_SCROLL_OPTIONS: ScrollIntoViewOptions = {
  behavior: 'smooth',
  block: 'start',
};

export const AstroApp: React.FC = () => {
  const [chart, setChart] = useState<ZiweiChart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [activePalace, setActivePalace] = useState<PalaceName | undefined>();
  const [shouldLoadAnalysisPanel, setShouldLoadAnalysisPanel] = useState(false);

  const handleGenerateChart = (info: BirthInfo) => {
    void (async () => {
      setIsLoading(true);
      setError('');

      try {
        const newChart = await ChartWorkerService.buildChart({
          day: info.day,
          month: info.month,
          year: info.year,
          hourIndex: info.hourIndex,
          gender: info.gender,
        });

        startTransition(() => {
          setActivePalace(undefined);
          setShouldLoadAnalysisPanel(false);
          setChart(newChart);
        });

      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tính toán mệnh bàn';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    })();
  };

  const handleResetChart = () => {
    startTransition(() => {
      setActivePalace(undefined);
      setShouldLoadAnalysisPanel(false);
      setChart(null);
    });
  };

  const boardLoadingFallback = (
    <div className="py-10 text-center text-white/55 text-sm">
      Đang tải giao diện mệnh bàn...
    </div>
  );

  const analysisLoadingFallback = (
    <div className="py-8 text-center text-white/45 text-sm">
      Đang chuẩn bị khung luận giải...
    </div>
  );

  const handleLoadAnalysisPanel = () => {
    setShouldLoadAnalysisPanel(true);
  };

  const handlePalaceClick = (palaceName: PalaceName) => {
    setShouldLoadAnalysisPanel(true);
    setActivePalace(palaceName === activePalace ? undefined : palaceName);
  };

  useEffect(() => {
    if (!chart) {
      return;
    }

    requestAnimationFrame(() => {
      document.getElementById('section-board')?.scrollIntoView(SECTION_SCROLL_OPTIONS);
    });
  }, [chart]);

  return (
    <div className="w-full flex flex-col items-center gap-14 px-0">
      {!chart && (
        <section className="flex justify-center w-full px-0">
          <BirthForm onSubmit={handleGenerateChart} isLoading={isLoading} />
        </section>
      )}

      {/* Hiển thị Mệnh Bàn */}
      {chart && (
        <section id="section-board" className="animate-fade-up flex flex-col items-center w-full">
          {/* Constrain width to match Grid for perfect alignment */}
          <div className="max-w-[800px] w-full flex justify-between items-end mb-4 px-2">
            <h3 className="text-3xl font-serif-sc text-gold">Mệnh Bàn Tử Vi</h3>
            <button
              onClick={handleResetChart}
              className="text-white/55 hover:text-gold text-xs px-3 py-1.5 rounded-sm transition-colors border border-white/10 hover:border-gold/30"
            >
              ← Về trang nhập
            </button>
          </div>
          <Suspense fallback={boardLoadingFallback}>
            <ZiWeiBoard
              chart={chart}
              activePalace={activePalace}
              onPalaceClick={handlePalaceClick}
            />
          </Suspense>

          <div className="mt-8 w-full">
            {shouldLoadAnalysisPanel ? (
              <Suspense fallback={analysisLoadingFallback}>
                <AnalysisPanel
                  chart={chart}
                  targetPalaceName={activePalace}
                  onNavigateFocus={(focusArea) => {
                    setActivePalace(focusArea === 'overall' ? undefined : focusArea);
                  }}
                />
              </Suspense>
            ) : (
              <div className="max-w-[1200px] mx-auto py-8">
                <div className="flex flex-col gap-4 rounded-sm border border-white/8 bg-white/[0.02] px-5 py-6 sm:px-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-white/35">Trợ lý AI</p>
                    <h4 className="mt-2 text-lg text-gold font-serif-sc">Luận giải được tải khi bạn thực sự cần</h4>
                  </div>
                  <p className="max-w-3xl text-sm text-white/62 leading-relaxed">
                    Mệnh bàn đã sẵn sàng hoàn toàn ở phía client. Khối AI được trì hoãn để giảm tải JavaScript ban đầu và chỉ nạp khi bạn bấm mở hoặc chọn một cung để đào sâu.
                  </p>
                  <div>
                    <button
                      type="button"
                      onClick={handleLoadAnalysisPanel}
                      className="btn-secondary"
                    >
                      Mở Trợ Lý AI
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <p className="text-center text-white/40 mt-10 text-xs">
            Mệnh bàn tính toán chính xác 100% offline. Phần luận giải do AI thực hiện.
          </p>
        </section>
      )}
    </div>
  );
};
