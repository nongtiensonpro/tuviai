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
    <div className="palace-center relative flex flex-col items-center justify-start p-4 bg-black/40 border border-gold/30 shadow-2xl overflow-hidden font-serif">
      {/* Watermark Bát Quái / Chữ Hán mờ phía sau */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
        <span className="text-[250px] font-serif-sc leading-none" style={{ textShadow: '0 0 50px rgba(240,192,64,0.5)' }}>紫微</span>
      </div>
      
      {/* Mô phỏng con dấu đỏ góc phải dưới */}
      <div className="absolute bottom-6 right-6 opacity-60 pointer-events-none select-none">
         <div className="border border-red-600/50 p-1 w-12 h-12 flex items-center justify-center">
            <span className="text-red-500 font-serif-sc text-sm leading-tight text-center break-all">東方<br/>理學</span>
         </div>
      </div>

      {/* 1. Header Tiêu đề */}
      <div className="text-center z-10 w-full mb-4 mt-2">
        <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] mb-1">Chương trình luận giải Tử Vi bằng AI</p>
        <h2 className="text-2xl font-bold text-gold tracking-widest uppercase border-b border-gold/20 pb-2 inline-block px-8">
          Lá Số Tử Vi
        </h2>
      </div>

      {/* 2. Bảng Thông Tin (Grid Layout) */}
      <div className="z-10 w-full max-w-sm flex flex-col gap-1.5 text-sm">
        
        {/* Năm / Tháng / Ngày / Giờ */}
        <div className="grid grid-cols-[80px_1fr_1fr] gap-2 items-center text-white/90">
          <span className="text-white/40">Năm sinh</span>
          <span className="font-semibold">{solarDate.year}</span>
          <span className="font-bold text-gold/80">{namCanChi.displayName}</span>
        </div>
        
        <div className="grid grid-cols-[80px_1fr_1fr] gap-2 items-center text-white/90">
          <span className="text-white/40">Tháng</span>
          <span>{solarDate.month} <span className="text-white/40 text-xs">({lunarDate.month} âm)</span></span>
          <span className="font-semibold text-white/70">Tháng {lunarDate.month} Âm</span>
        </div>

        <div className="grid grid-cols-[80px_1fr_1fr] gap-2 items-center text-white/90">
          <span className="text-white/40">Ngày</span>
          <span>{solarDate.day} <span className="text-white/40 text-xs">({lunarDate.day} âm)</span></span>
          <span className="font-semibold text-white/70">Ngày {lunarDate.day} Âm</span>
        </div>

        <div className="grid grid-cols-[80px_1fr_1fr] gap-2 items-center text-white/90">
          <span className="text-white/40">Giờ</span>
          <span>{solarDate.hour}h <span className="text-white/40 text-xs">{solarDate.minute ? `${solarDate.minute}m` : ''}</span></span>
          <span className="font-semibold text-white/70">Giờ {lunarDate.hourChi}</span>
        </div>

        {/* Khung chia line */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-2"></div>

        {/* Thông tin Lý Số Âm Dương Mệnh Cục */}
        <div className="grid grid-cols-[80px_1fr] gap-2 items-start text-white/90 mt-1">
          <span className="text-white/40 mt-0.5">Âm Dương</span>
          <div className="flex flex-col">
            <span className="font-bold text-blue-300">{amDuongNamNu}</span>
            <span className="text-xs text-white/60">{amDuongLy}</span>
          </div>
        </div>

        <div className="grid grid-cols-[80px_1fr] gap-2 items-start text-white/90 mt-1">
          <span className="text-white/40 mt-0.5">Mệnh</span>
          <span className="font-bold text-emerald-400 capitalize">{banMenh}</span>
        </div>

        <div className="grid grid-cols-[80px_1fr] gap-2 items-start text-white/90 mt-1">
          <span className="text-white/40 mt-0.5">Cục</span>
          <div className="flex flex-col">
            <span className="font-bold text-amber-500 capitalize">{tenCuc}</span>
            <span className="text-xs text-white/60">{menhCucSinhKhac}</span>
          </div>
        </div>

        <div className="grid grid-cols-[80px_1fr] gap-2 items-center text-white/90 mt-2">
          <span className="text-white/40">Mệnh chủ</span>
          <span className="font-semibold text-white/80">{menhChu}</span>
        </div>

        <div className="grid grid-cols-[80px_1fr] gap-2 items-center text-white/90 mt-1">
          <span className="text-white/40">Thân chủ</span>
          <span className="font-semibold text-white/80">{thanChu}</span>
        </div>

      </div>
    </div>
  );
};
