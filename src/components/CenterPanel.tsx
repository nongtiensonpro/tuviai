/**
 * CenterPanel.tsx
 * Hiển thị Thiên Bàn ở trung tâm với cấu trúc bảng thông tin khoa học
 * Giống hệt thiết kế lá số Tử Vi truyền thống
 */
import React from 'react';
import type { ZiweiChart } from '../core/types/ZiweiTypes';
import { getGlossaryDescription } from '../data/GlossaryDescriptions';
import { getStarDescription } from '../data/StarDescriptions';

interface CenterPanelProps {
  chart: ZiweiChart;
  onGlossaryClick?: (name: string) => void;
  onStarClick?: (name: string) => void;
}

export const CenterPanel: React.FC<CenterPanelProps> = ({ chart, onGlossaryClick, onStarClick }) => {
  const { 
    solarDate, lunarDate, 
    namCanChi, tenCuc, banMenh,
    amDuongNamNu, amDuongLy, menhCucSinhKhac,
    menhChu, thanChu 
  } = chart;

  const metaButtonClass = 'transition-colors hover:text-gold';
  const starButtonClass = 'font-semibold text-white/90 transition-colors hover:text-gold';

  return (
    <div className="palace-center relative flex flex-col items-center justify-start overflow-hidden p-3.5 sm:p-4">
      {/* Watermark Bát Quái / Chữ Hán mờ phía sau */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none select-none">
        <span className="text-[250px] font-serif-sc leading-none" style={{ textShadow: '0 0 30px rgba(240,192,64,0.22)' }}>紫微</span>
      </div>
      
      {/* Mô phỏng con dấu đỏ góc phải dưới */}
      <div className="absolute bottom-4 right-4 opacity-35 pointer-events-none select-none">
         <div className="w-11 h-11 flex items-center justify-center">
            <span className="text-red-500/70 font-serif-sc text-sm leading-tight text-center break-all">東方<br/>理學</span>
         </div>
      </div>

      {/* 1. Header Tiêu đề */}
      <div className="z-10 mt-0.5 mb-3 w-full text-center">
        <p className="text-[10px] text-white/46 uppercase tracking-[0.16em] mb-1">Chương trình luận giải Tử Vi bằng AI</p>
        <h2 className="text-xl sm:text-2xl font-bold text-gold tracking-[0.12em] uppercase inline-block px-4" style={{ fontFamily: 'var(--font-serif)' }}>
          Lá Số Tử Vi
        </h2>
      </div>

      {/* 2. Bảng Thông Tin (Grid Layout) */}
      <div className="z-10 mt-1 flex w-full max-w-[330px] flex-col gap-2.5 text-[13px] sm:text-[14px]">
        
        {/* Năm / Tháng / Ngày / Giờ */}
        <div className="px-1 py-1">
          <div className="grid grid-cols-[60px_1fr_1fr] gap-2.5 items-center text-white/90 sm:grid-cols-[72px_1fr_1fr]">
            <span className="text-white/40 tracking-[0.08em]">Năm sinh</span>
            <span className="font-semibold">{solarDate.year}</span>
            <span className="font-bold text-gold/80 leading-snug">{namCanChi.displayName}</span>
          </div>
        </div>
        
        <div className="px-1 py-1">
          <div className="grid grid-cols-[60px_1fr_1fr] gap-2.5 items-center text-white/90 sm:grid-cols-[72px_1fr_1fr]">
            <span className="text-white/40 tracking-[0.08em]">Tháng</span>
            <span>{solarDate.month} <span className="text-white/40 text-[11px]">({lunarDate.month} âm)</span></span>
            <span className="font-semibold text-emerald-400/80 leading-snug">Tháng {lunarDate.month} Âm</span>
          </div>
        </div>

        <div className="px-1 py-1">
          <div className="grid grid-cols-[60px_1fr_1fr] gap-2.5 items-center text-white/90 sm:grid-cols-[72px_1fr_1fr]">
            <span className="text-white/40 tracking-[0.08em]">Ngày</span>
            <span>{solarDate.day} <span className="text-white/40 text-[11px]">({lunarDate.day} âm)</span></span>
            <span className="font-semibold text-emerald-400/80 leading-snug">Ngày {lunarDate.day} Âm</span>
          </div>
        </div>

        <div className="px-1 py-1">
          <div className="grid grid-cols-[60px_1fr_1fr] gap-2.5 items-center text-white/90 sm:grid-cols-[72px_1fr_1fr]">
            <span className="text-white/40 tracking-[0.08em]">Giờ</span>
            <span>{solarDate.hour}h<span className="text-white/40 text-[11px]">{solarDate.minute ? `${solarDate.minute}m` : ''}</span></span>
            <span className="font-semibold text-emerald-400/80 leading-snug">Giờ {lunarDate.hourChi}</span>
          </div>
        </div>

        <div className="grid gap-1.5 pt-1">
          <div className="px-1 py-1">
            <div className="grid grid-cols-[60px_1fr] gap-2.5 items-start text-white/90 sm:grid-cols-[72px_1fr]">
              <span className="text-white/40 tracking-[0.08em] mt-0.5">Âm dương</span>
              <div className="flex flex-col">
                <button
                  type="button"
                  title={getGlossaryDescription(amDuongNamNu)}
                  onClick={() => onGlossaryClick?.(amDuongNamNu)}
                  className={`w-fit text-left font-bold text-blue-300 leading-snug ${metaButtonClass}`}
                >
                  {amDuongNamNu}
                </button>
                <button
                  type="button"
                  title={getGlossaryDescription(amDuongLy)}
                  onClick={() => onGlossaryClick?.(amDuongLy)}
                  className={`w-fit text-left text-white/50 text-[11px] leading-snug sm:text-xs ${metaButtonClass}`}
                >
                  {amDuongLy}
                </button>
              </div>
            </div>
          </div>

          <div className="px-1 py-1">
            <div className="grid grid-cols-[60px_1fr] gap-2.5 items-center text-white/90 sm:grid-cols-[72px_1fr]">
              <span className="text-white/40 tracking-[0.08em]">Bản Mệnh</span>
              <button
                type="button"
                title={getGlossaryDescription('Bản Mệnh')}
                onClick={() => onGlossaryClick?.('Bản Mệnh')}
                className={`w-fit text-left font-bold text-emerald-400 capitalize leading-snug ${metaButtonClass}`}
              >
                {banMenh}
              </button>
            </div>
          </div>

          <div className="px-1 py-1">
            <div className="grid grid-cols-[60px_1fr] gap-2.5 items-start text-white/90 sm:grid-cols-[72px_1fr]">
              <span className="text-white/40 tracking-[0.08em] mt-0.5">Mệnh Cục</span>
              <div className="flex flex-col">
                <button
                  type="button"
                  title={getGlossaryDescription(tenCuc)}
                  onClick={() => onGlossaryClick?.(tenCuc)}
                  className={`w-fit text-left font-bold text-amber-500 capitalize leading-snug ${metaButtonClass}`}
                >
                  {tenCuc}
                </button>
                <button
                  type="button"
                  title={getGlossaryDescription(menhCucSinhKhac)}
                  onClick={() => onGlossaryClick?.(menhCucSinhKhac)}
                  className={`w-fit text-left text-white/50 text-[11px] leading-snug sm:text-xs ${metaButtonClass}`}
                >
                  {menhCucSinhKhac}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-0.5 px-1 py-1.5">
          <div className="grid grid-cols-[60px_1fr] gap-2.5 items-start text-white/90 sm:grid-cols-[72px_1fr]">
            <span className="pt-0.5 text-white/40 tracking-[0.08em]">Chủ tinh</span>
            <div className="grid gap-1 leading-snug sm:grid-cols-2 sm:gap-x-3">
              <span>
                <button
                  type="button"
                  title={getGlossaryDescription('Mệnh Chủ')}
                  onClick={() => onGlossaryClick?.('Mệnh Chủ')}
                  className={`text-left ${metaButtonClass}`}
                >
                  Mệnh:
                </button>{' '}
                <button
                  type="button"
                  title={getStarDescription(menhChu)}
                  onClick={() => onStarClick?.(menhChu)}
                  className={starButtonClass}
                >
                  {menhChu}
                </button>
              </span>
              <span>
                <button
                  type="button"
                  title={getGlossaryDescription('Thân Chủ')}
                  onClick={() => onGlossaryClick?.('Thân Chủ')}
                  className={`text-left ${metaButtonClass}`}
                >
                  Thân:
                </button>{' '}
                <button
                  type="button"
                  title={getStarDescription(thanChu)}
                  onClick={() => onStarClick?.(thanChu)}
                  className={starButtonClass}
                >
                  {thanChu}
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
