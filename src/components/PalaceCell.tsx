/**
 * PalaceCell.tsx — Ô cung Tử Vi (Giao diện chuẩn Mệnh Bàn truyền thống - Polished)
 * - Màu sắc sao theo Ngũ Hành, Padding thông thoáng
 * - Bảng Bát Quái ẩn (watermark) cho các cung Vô Chính Diệu
 * - Ribbon / Badge Tuần Triệt đính dính lề
 */

import React from 'react';
import type { Palace, Star } from '../core/types/ZiweiTypes';

// Màu sắc Ngũ Hành trên nền Dark Mode
const getColorNguHanh = (nguHanh: string): string => {
  switch (nguHanh) {
    case 'Kim': return 'text-[#c0c0c0]'; // Xám bạc
    case 'Mộc': return 'text-[#2ecc71]'; // Xanh lá
    case 'Thủy': return 'text-[#00d2d3]'; // Xanh ngọc
    case 'Hỏa': return 'text-[#ff6b6b]'; // Đỏ nhạt
    case 'Thổ': return 'text-[#feca57]'; // Vàng cam
    default: return 'text-white/70';
  }
};

const STAR_DESC: Record<string, string> = {
  'Tử Vi': 'Đế tinh, Quyền uy lãnh đạo', 'Thiên Phủ': 'Kho tàng, Tài lộc ổn định',
  'Thái Dương': 'Mặt trời, Sự nghiệp', 'Thái Âm': 'Mặt trăng, Nội tâm',
  'Vũ Khúc': 'Hành động, Ý chí', 'Thiên Cơ': 'Trí tuệ, Biến động',
  'Thiên Đồng': 'Phúc khí, An lạc', 'Liêm Trinh': 'Đam mê, Nghị lực',
  'Tham Lang': 'Ham muốn, Khát vọng', 'Cự Môn': 'Ngôn ngữ, Tranh luận',
  'Thiên Tướng': 'Bảo hộ, Quy tắc', 'Thiên Lương': 'Bác ái, Chính trực',
  'Thất Sát': 'Quyết đoán, Biến cố', 'Phá Quân': 'Phá hủy, Tái tạo',
  'Kình Dương': 'Tranh đấu quyết liệt', 'Đà La': 'Chướng ngại, Ngoan cố',
  'Hỏa Tinh': 'Nổ bùng, Tai biến', 'Linh Tinh': 'Bí ẩn, Xung động',
  'Địa Không': 'Mất mát, Trống rỗng', 'Địa Kiếp': 'Cướp đoạt, Tai họa',
};

interface PalaceCellProps {
  palace: Palace;
  isActive?: boolean;
  onClick?: () => void;
}

export const PalaceCell: React.FC<PalaceCellProps> = ({ palace, isActive, onClick }) => {
  const mainStars = palace.mainStars;
  
  // Tách sao Cát / Sát
  const leftStars = palace.auxStars.filter(s => s.category === 'cat' || s.category === 'support' || s.category === 'fixed');
  const rightStars = palace.auxStars.filter(s => s.category === 'sha');

  const tuanTriet = [];
  if (palace.hasTuanKhong) tuanTriet.push('Tuần');
  if (palace.hasTrinhKhong) tuanTriet.push('Triệt');

  const allStars = [...mainStars, ...palace.auxStars];
  const isVCD = mainStars.length === 0;

  return (
    <div
      onClick={onClick}
      className={`palace-cell relative flex flex-col p-2 overflow-visible ${isActive ? 'bg-black/60 shadow-[inset_0_0_20px_rgba(240,192,64,0.1)] border-white/30' : 'bg-black/40'}`}
      style={{ transition: 'all 0.2s ease', position: 'relative' }}
    >
      {/* 1. Hiệu ứng SVG cho Vô Chính Diệu */}
      {isVCD && (
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none z-0">
           <svg width="80%" height="80%" viewBox="0 0 100 100" className="animate-spin-slow">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2"/>
              <path d="M50 5 a 45 45 0 0 1 0 90 a 22.5 22.5 0 0 0 0 -45 a 22.5 22.5 0 0 1 0 -45" fill="currentColor"/>
              <circle cx="50" cy="27.5" r="5" fill="none" stroke="black" strokeWidth="2"/>
              <circle cx="50" cy="72.5" r="5" fill="currentColor"/>
           </svg>
        </div>
      )}

      {/* 2. Ribbon Tuần/Triệt vắt sát góc viền (Thay vì trôi lội) */}
      {tuanTriet.length > 0 && (
        <div className="absolute -top-[1.5px] inset-x-0 mx-auto w-fit bg-[#1a1a1a] text-white text-[9px] font-bold px-2 py-[2px] border border-white/20 z-10 shadow-sm rounded-b-sm tracking-widest uppercase">
          {tuanTriet.join(' - ')}
        </div>
      )}

      <div className="z-10 flex flex-col h-full w-full">
        {/* 3. HEADER: Can Chi - TÊN CUNG - Đại Hạn */}
        <div className="flex justify-between items-start w-full border-b border-white/10 pb-[3px] mb-[5px]">
          <span className="text-[10px] text-white/50 font-medium tracking-tight">
            {palace.can}.{palace.chi}
          </span>
          <div className="flex flex-col items-center">
            <span className={`text-[11px] font-bold uppercase tracking-wide ${isActive ? 'text-gold' : 'text-white/90'}`}>
              {palace.palaceName}
            </span>
            {palace.isThanPalace && (
              <span className="bg-red-900/60 border border-red-500/40 text-red-100 text-[8px] px-1 rounded-sm -mt-[1px]">
                Thân
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold text-white/40">
            {palace.daiHan ?? ''}
          </span>
        </div>

        {/* 4. CHÍNH TINH (Chính giữa trên cùng) */}
        <div className="flex flex-col items-center mb-1.5 min-h-[46px] justify-start pt-1 z-10">
          {mainStars.map((star, idx) => (
            <div 
              key={idx} 
              title={`${star.name} - Ngũ hành: ${star.nguHanh}\nÝ nghĩa: ${STAR_DESC[star.name] || 'Chưa cập nhật'}`}
              className={`text-center font-bold text-[13px] leading-snug tracking-wide cursor-help hover:scale-110 transition-transform ${getColorNguHanh(star.nguHanh)}`}
            >
              {star.name}
              {star.brightness && <span className="text-[10px] ml-[2px] opacity-70 font-normal">({star.brightness})</span>}
              {star.sihua && <span className="text-coral ml-[2px] font-bold tracking-normal">[{star.sihua}]</span>}
            </div>
          ))}

          {/* HIỂN THỊ SAO MƯỢN CHO CUNG VCD */}
          {isVCD && palace.borrowedStars && palace.borrowedStars.length > 0 && (
            <div className="flex flex-col items-center opacity-40 italic scale-95 origin-top">
              {palace.borrowedStars.map((star, idx) => (
                <div 
                  key={`borrowed-${idx}`} 
                  title={`Sao mượn từ cung xung chiếu: ${star.name}`}
                  className={`text-center font-bold text-[12px] leading-tight ${getColorNguHanh(star.nguHanh)}`}
                >
                  {star.name}
                  {star.brightness && <span className="text-[9px] ml-[1px] font-normal">({star.brightness})</span>}
                  <span className="text-[8px] ml-0.5 font-normal tracking-tighter opacity-80">(Chiếu)</span>
                </div>
              ))}
            </div>
          )}

          {isVCD && (mainStars.length === 0 && (!palace.borrowedStars || palace.borrowedStars.length === 0)) && (
            <div className="text-[11px] text-white/30 italic mt-2 font-serif font-medium tracking-widest">
              Vô chính diệu
            </div>
          )}
        </div>

        {/* 5. PHỤ TINH - 2 cột Trái Cát / Phải Sát rõ ràng */}
        <div className="flex justify-between items-start flex-grow text-[10px] min-h-[4rem] w-full pt-1 z-10">
          {/* Cột Trái Cát Tinh - thụt lề tí xíu khỏi biên trái */}
          <div className="flex flex-col w-[48%] overflow-hidden items-start pl-0.5">
            {leftStars.map((s, i) => (
              <div 
                key={i} 
                title={`${s.name} - Ngũ hành: ${s.nguHanh}\nÝ nghĩa: ${STAR_DESC[s.name] || 'Thuộc tính sao tĩnh'}`}
                className={`truncate w-full leading-tight font-medium cursor-help hover:opacity-80 ${getColorNguHanh(s.nguHanh)}`}
              >
                {s.name}
                {s.sihua && <span className="font-bold ml-0.5 text-coral">[{s.sihua}]</span>}
              </div>
            ))}
          </div>
          {/* Cột Phải Sát Tinh - thụt lề tí xíu khỏi biên phải */}
          <div className="flex flex-col w-[48%] overflow-hidden items-end pr-0.5">
            {rightStars.map((s, i) => (
              <div 
                key={i} 
                title={`${s.name} - Ngũ hành: ${s.nguHanh}\nÝ nghĩa: ${STAR_DESC[s.name] || 'Thuộc tính sao Sát/Bại'}`}
                className={`truncate w-full text-right leading-tight font-semibold cursor-help hover:opacity-80 ${getColorNguHanh(s.nguHanh)}`}
              >
                {s.name}
                {s.sihua && <span className="font-bold ml-0.5 text-coral">[{s.sihua}]</span>}
              </div>
            ))}
          </div>
        </div>

        {/* 6. FOOTER: Cung Địa Chi - Tràng Sinh */}
        <div className="mt-1 pt-1 border-t border-white/10 flex justify-between items-end w-full z-10 relative">
          <span className="text-[11px] font-medium text-white/30">{palace.chi}</span>
          <span className={`text-[10px] uppercase tracking-wide font-semibold text-[#f1c40f]/70`}>
            {palace.trangSinh ?? ''}
          </span>
          <span className="text-[9px] text-white/20"></span>
        </div>
      </div>
    </div>
  );
};
