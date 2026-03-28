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
    <div className="palace-center relative flex flex-col items-center justify-start p-6 bg-gradient-to-br from-[#111] to-black border-4 border-double border-gold/40 shadow-[inset_0_0_40px_rgba(240,192,64,0.05)] overflow-hidden font-serif">
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
      <div className="z-10 w-full max-w-[320px] flex flex-col gap-2 text-[15px] mt-2">
        
        {/* Năm / Tháng / Ngày / Giờ */}
        <div className="grid grid-cols-[80px_1fr_1fr] gap-3 items-center text-white/90">
          <span className="text-white/40 tracking-wider">Năm sinh</span>
          <span className="font-semibold">{solarDate.year}</span>
          <span className="font-bold text-gold/80">{namCanChi.displayName}</span>
        </div>
        
        <div className="grid grid-cols-[80px_1fr_1fr] gap-3 items-center text-white/90">
          <span className="text-white/40 tracking-wider">Tháng</span>
          <span>{solarDate.month} <span className="text-white/40 text-[11px]">({lunarDate.month} âm)</span></span>
          <span className="font-semibold text-emerald-400/80">Tháng {lunarDate.month} Âm</span>
        </div>

        <div className="grid grid-cols-[80px_1fr_1fr] gap-3 items-center text-white/90">
          <span className="text-white/40 tracking-wider">Ngày</span>
          <span>{solarDate.day} <span className="text-white/40 text-[11px]">({lunarDate.day} âm)</span></span>
          <span className="font-semibold text-emerald-400/80">Ngày {lunarDate.day} Âm</span>
        </div>

        <div className="grid grid-cols-[80px_1fr_1fr] gap-3 items-center text-white/90">
          <span className="text-white/40 tracking-wider">Giờ</span>
          <span>{solarDate.hour}h<span className="text-white/40 text-[11px]">{solarDate.minute ? `${solarDate.minute}m` : ''}</span></span>
          <span className="font-semibold text-emerald-400/80">Giờ {lunarDate.hourChi}</span>
        </div>

        {/* Khung chia line */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent my-3"></div>

        {/* Thông tin Lý Số Âm Dương Mệnh Cục */}
        <div className="grid grid-cols-[80px_1fr] gap-3 items-start text-white/90">
          <span className="text-white/40 tracking-wider mt-0.5">Âm dương</span>
          <div className="flex flex-col">
            <span className="font-bold text-blue-300">{amDuongNamNu} <span className="text-white/50 font-normal ml-2">({amDuongLy})</span></span>
          </div>
        </div>

        <div className="grid grid-cols-[80px_1fr] gap-3 items-center text-white/90 mt-1">
          <span className="text-white/40 tracking-wider">Bản Mệnh</span>
          <span className="font-bold text-emerald-400 capitalize">{banMenh}</span>
        </div>

        <div className="grid grid-cols-[80px_1fr] gap-3 items-start text-white/90 mt-1">
          <span className="text-white/40 tracking-wider mt-0.5">Mệnh Cục</span>
          <div className="flex flex-col">
            <span className="font-bold text-amber-500 capitalize">{tenCuc} <span className="text-white/50 font-normal ml-2 text-sm">({menhCucSinhKhac})</span></span>
          </div>
        </div>

        <div className="grid grid-cols-[80px_1fr_1fr] gap-3 items-center text-white/90 mt-3 pt-3 border-t border-dashed border-white/10">
          <span className="text-white/40 tracking-wider">Chủ tinh</span>
          <span>Mệnh: <span className="font-semibold text-white/90">{menhChu}</span></span>
          <span>Thân: <span className="font-semibold text-white/90">{thanChu}</span></span>
        </div>

      </div>
    </div>
  );
};
