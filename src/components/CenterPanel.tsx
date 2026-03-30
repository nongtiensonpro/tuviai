/**
 * CenterPanel.tsx
 * Hiển thị Thiên Bàn ở trung tâm với cấu trúc bảng thông tin khoa học
 * Giống hệt thiết kế lá số Tử Vi truyền thống
 */
import React from 'react';
import type { ZiweiChart } from '../core/types/ZiweiTypes';

interface CenterPanelProps {
  chart: ZiweiChart;
}

export const CenterPanel: React.FC<CenterPanelProps> = ({ chart }) => {
  const { 
    solarDate, lunarDate, 
    namCanChi, tenCuc, banMenh,
    amDuongNamNu, amDuongLy, menhCucSinhKhac,
    menhChu, thanChu 
  } = chart;

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
                <span className="font-bold text-blue-300 leading-snug">{amDuongNamNu}</span>
                <span className="text-white/50 text-[11px] leading-snug sm:text-xs">{amDuongLy}</span>
              </div>
            </div>
          </div>

          <div className="px-1 py-1">
            <div className="grid grid-cols-[60px_1fr] gap-2.5 items-center text-white/90 sm:grid-cols-[72px_1fr]">
              <span className="text-white/40 tracking-[0.08em]">Bản Mệnh</span>
              <span className="font-bold text-emerald-400 capitalize leading-snug">{banMenh}</span>
            </div>
          </div>

          <div className="px-1 py-1">
            <div className="grid grid-cols-[60px_1fr] gap-2.5 items-start text-white/90 sm:grid-cols-[72px_1fr]">
              <span className="text-white/40 tracking-[0.08em] mt-0.5">Mệnh Cục</span>
              <div className="flex flex-col">
                <span className="font-bold text-amber-500 capitalize leading-snug">{tenCuc}</span>
                <span className="text-white/50 text-[11px] leading-snug sm:text-xs">{menhCucSinhKhac}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-0.5 px-1 py-1.5">
          <div className="grid grid-cols-[60px_1fr] gap-2.5 items-start text-white/90 sm:grid-cols-[72px_1fr]">
            <span className="pt-0.5 text-white/40 tracking-[0.08em]">Chủ tinh</span>
            <div className="grid gap-1 leading-snug sm:grid-cols-2 sm:gap-x-3">
              <span>Mệnh: <span className="font-semibold text-white/90">{menhChu}</span></span>
              <span>Thân: <span className="font-semibold text-white/90">{thanChu}</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
