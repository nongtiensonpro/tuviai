/**
 * CenterPanel.tsx (Chỉnh sửa lại layout HTML)
 * Hiển thị thông tin chính của Mệnh Chủ ở trung tâm Mệnh Bàn.
 */
import React from 'react';
import type { ZiweiChart } from '../core/types/ZiweiTypes';

interface CenterPanelProps {
  chart: ZiweiChart;
}

export const CenterPanel: React.FC<CenterPanelProps> = ({ chart }) => {
  const { solarDate, lunarDate, gender, namCanChi, tenCuc, cungMenhChi, cungThanChi } = chart;
  const isMale = gender === 'male';

  return (
    <div className="palace-center flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-gold/40 shadow-xl shadow-gold/10">
      {/* 1. Header (Lozenge) */}
      <div className="flex items-center gap-2 mb-4 animate-fade-up">
        <span className="text-3xl text-gold/80">☯</span>
        <div>
          <h2 className="text-2xl font-bold text-gold font-serif-sc tracking-widest text-shadow mb-0.5">
            紫微斗數
          </h2>
          <p className="text-xs text-white/50 tracking-widest uppercase text-center block">Tử Vi Đẩu Số</p>
        </div>
      </div>

      <div className="w-full flex-grow flex flex-col lg:flex-row justify-center items-center gap-6 animate-fade-up">
        {/* 2. Left side: Cục & Nam Can Chi & Giới Tính */}
        <div className="flex flex-col gap-2 items-center lg:items-end w-full lg:w-1/2">
          <div className="bg-white/5 px-4 py-1.5 rounded-full border border-white/10 text-sm whitespace-nowrap">
            <span className="text-white/60 mr-2 uppercase text-[10px]">Giới Tính:</span>
            <span className={isMale ? 'text-blue-400 font-bold' : 'text-pink-400 font-bold'}>{isMale ? 'Nam' : 'Nữ'}</span>
          </div>
          <div className="bg-white/5 px-4 py-1.5 rounded-full border border-white/10 text-sm whitespace-nowrap">
            <span className="text-white/60 mr-2 uppercase text-[10px]">Năm Sinh:</span>
            <span className="font-bold text-white/90">{namCanChi.displayName}</span>
          </div>
          <div className="bg-white/5 px-4 py-1.5 rounded-full border border-gold/30 text-sm whitespace-nowrap">
            <span className="text-white/60 mr-2 uppercase text-[10px]">Mệnh Cục:</span>
            <span className="font-bold text-gold">{tenCuc}</span>
          </div>
        </div>

        {/* 3. Divider cho Mobile và Desktop */}
        <div className="w-16 h-px bg-white/20 lg:w-px lg:h-24"></div>

        {/* 4. Right Side: Calendar & Mệnh Thân */}
        <div className="flex flex-col gap-2 w-full lg:w-1/2 items-center lg:items-start text-sm">
          <div className="text-white/80">
            <p className="text-xs uppercase text-white/40 mb-0.5">Dương lịch</p>
            <p className="font-medium text-[15px]">{solarDate.day}/{solarDate.month}/{solarDate.year} ({solarDate.hour}h)</p>
          </div>

          <div className="text-white/80 mt-2">
            <p className="text-xs uppercase text-white/40 mb-0.5">Âm lịch</p>
            <p className="font-medium text-[15px]">
              {lunarDate.day}/{lunarDate.month} / {namCanChi.can} {namCanChi.chi} {lunarDate.isLeap ? '(Nhuận)' : ''}
            </p>
            <p className="text-[13px] text-white/60 mt-0.5">Giờ {lunarDate.hourChi}</p>
          </div>
          <div className="mt-2 text-white/60 whitespace-nowrap text-xs">
             Mệnh: <strong className="text-white">{cungMenhChi}</strong> | Thân: <strong className="text-white">{cungThanChi}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
