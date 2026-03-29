/**
 * PalaceCell.tsx — Ô cung Tử Vi (Giao diện chuẩn Mệnh Bàn truyền thống - Polished)
 * - Màu sắc sao theo Ngũ Hành, Padding thông thoáng
 * - Bảng Bát Quái ẩn (watermark) cho các cung Vô Chính Diệu
 * - Ribbon / Badge Tuần Triệt đính dính lề
 */

import React from 'react';
import type { Palace, Star } from '../core/types/ZiweiTypes';
import { getStarDescription } from '../data/StarDescriptions';

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

const BAD_STARS = [
  'Kình Dương', 'Đà La', 'Hỏa Tinh', 'Linh Tinh', 'Địa Không', 'Địa Kiếp',
  'Thiên Khốc', 'Thiên Hư', 'Tang Môn', 'Bạch Hổ', 'Điếu Khách', 'Tuế Phá',
  'Thiên Hình', 'Thiên Diêu', 'Phá Toái', 'Cô Thần', 'Quả Tú', 'Đẩu Quân',
  'Âm Sát', 'Kiếp Sát', 'Đại Hao', 'Tiểu Hao', 'Tử Phù', 'Quan Phù', 'Quan Phủ',
  'Trực Phù', 'Tai Sát', 'Thiên Sát', 'Đại Sát', 'Lưu Hà', 'Phi Liêm', 'Bệnh Phù',
  'Hóa Kỵ', 'Mộc Dục', 'Suy', 'Bệnh', 'Tử', 'Mộ', 'Tuyệt', 'Thai', // Thêm Vòng Tràng Sinh xấu (Tuỳ chọn)
];

interface PalaceCellProps {
  palace: Palace;
  isActive?: boolean;
  onClick?: () => void;
  onStarClick?: (name: string, desc: string) => void;
}

export const PalaceCell: React.FC<PalaceCellProps> = ({ palace, isActive, onClick, onStarClick }) => {
  const mainStars = palace.mainStars;
  const isVCD = mainStars.length === 0;

  // Tách sao Có Ý Nghĩa: Tốt qua Trái, Xấu qua Phải
  const filteredAux = palace.auxStars.filter(s => s.name !== 'Tuần Không' && s.name !== 'Triệt Không');
  
  const leftStars = filteredAux.filter(s => !BAD_STARS.includes(s.name) && s.category !== 'sha');
  const rightStars = filteredAux.filter(s => BAD_STARS.includes(s.name) || s.category === 'sha');

  const tuanTriet = [];
  if (palace.hasTuanKhong) tuanTriet.push('Tuần');
  if (palace.hasTrinhKhong) tuanTriet.push('Triệt');

  return (
    <div
      onClick={onClick}
      className={`palace-cell relative overflow-hidden transition-all duration-200 ${
        isActive ? 'bg-black/60 shadow-[inset_0_0_20px_rgba(240,192,64,0.1)] border-white/30' : 'bg-black/40'
      }`}
    >
      {/* Hiệu ứng SVG nền cho VCD */}
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

      {/* Ruy-băng Tuần/Triệt */}
      {tuanTriet.length > 0 && (
        <div className="absolute -top-[1.5px] inset-x-0 mx-auto w-fit bg-[#1a1a1a] text-white text-[9px] font-bold px-2 py-[2px] border border-white/20 z-10 shadow-sm rounded-b-sm tracking-widest uppercase">
          {tuanTriet.join(' - ')}
        </div>
      )}

      {/* Cấu trúc Table tự động tính toán Size, chống đè chữ */}
      <table className="w-full h-full table-auto border-collapse text-left z-10 relative">
        <tbody>
          {/* DÒNG 1: HEADER (Can Chi, Tên Cung, Đại Hạn) */}
          <tr className="border-b border-white/10">
            <td className="align-top py-0.5 whitespace-nowrap">
              <span className="text-[10.5px] text-white/50 tracking-tight font-medium">
                {palace.can}.{palace.chi}
              </span>
            </td>
            <td className="align-top text-center py-0.5">
              <div className="flex flex-col items-center leading-tight">
                <span className={`text-[12px] font-bold uppercase ${isActive ? 'text-gold' : 'text-white/90'}`}>
                  {palace.palaceName}
                </span>
                {palace.isThanPalace && (
                  <span className="bg-red-900/60 border border-red-500/40 text-red-100 text-[8px] px-1 rounded-sm -mt-px w-fit uppercase scale-90">
                    Thân
                  </span>
                )}
              </div>
            </td>
            <td className="align-top text-right py-0.5">
              <span className="text-[10px] font-bold text-white/40">
                {palace.daiHan ?? ''}
              </span>
            </td>
          </tr>

          {/* DÒNG 2: CHÍNH TINH (Chiếm trọn 3 khối) */}
          <tr>
            <td colSpan={3} className="text-center pt-1.5 pb-1 align-top">
              <div className="flex flex-col items-center justify-start min-h-[44px]">
                {mainStars.map((star, idx) => (
                  <div 
                    key={idx} 
                    onClick={(e) => { e.stopPropagation(); onStarClick?.(star.name, getStarDescription(star.name)); }}
                    title={`${star.name} - Ngũ hành: ${star.nguHanh}\nÝ nghĩa: ${getStarDescription(star.name)}`}
                    className={`font-bold text-[13.5px] leading-tight cursor-help transition-transform hover:scale-110 ${getColorNguHanh(star.nguHanh)}`}
                  >
                    {star.name}
                    {star.brightness && <span className="text-[10px] ml-0.5 font-normal opacity-80">({star.brightness})</span>}
                    {star.sihua && <span className="text-coral ml-0.5 font-bold tracking-normal opacity-100">[{star.sihua}]</span>}
                  </div>
                ))}

                {isVCD && palace.borrowedStars && palace.borrowedStars.length > 0 && (
                  <div className="flex flex-col items-center opacity-40 italic scale-95 origin-top mt-0.5">
                    {palace.borrowedStars.map((star, idx) => (
                      <div key={`borrowed-${idx}`} title={`Mượn: ${star.name}`} className={`font-bold text-[12px] leading-tight ${getColorNguHanh(star.nguHanh)}`}>
                        {star.name}
                        {star.brightness && <span className="text-[9px] ml-0.5 font-normal">({star.brightness})</span>}
                        <span className="text-[8px] ml-0.5 font-normal opacity-80">(Chiếu)</span>
                      </div>
                    ))}
                  </div>
                )}
                {isVCD && (mainStars.length === 0 && (!palace.borrowedStars || palace.borrowedStars.length === 0)) && (
                  <div className="text-[11px] text-white/30 italic mt-1 font-serif font-medium tracking-widest">Vô chính diệu</div>
                )}
              </div>
            </td>
          </tr>

          {/* DÒNG 3: PHỤ TINH TRÁI (Cát/Xương) & PHỤ TINH PHẢI (Sát/Ác) */}
          <tr>
            <td colSpan={3} className="align-top h-full">
               <table className="w-full h-full table-fixed">
                 <tbody>
                    <tr>
                       {/* Cột Tốt */}
                       <td className="w-1/2 align-top text-left pr-1 leading-[1.15] border-r border-white/5 pb-1">
                         {leftStars.map((s, i) => (
                          <div 
                            key={i} 
                            onClick={(e) => { e.stopPropagation(); onStarClick?.(s.name, getStarDescription(s.name)); }}
                            title={`${s.name} - O:${getStarDescription(s.name)}`} 
                            className={`text-[10px] break-words md:text-[10.5px] font-medium tracking-tight cursor-help hover:brightness-125 mb-[1px] ${getColorNguHanh(s.nguHanh)}`}
                          >
                            {s.name}{s.sihua && <span className="font-bold text-coral ml-0.5">[{s.sihua}]</span>}
                          </div>
                         ))}
                       </td>
                       {/* Cột Xấu */}
                       <td className="w-1/2 align-top text-right pl-1 leading-[1.15] pb-1">
                         {rightStars.map((s, i) => (
                          <div 
                            key={i} 
                            onClick={(e) => { e.stopPropagation(); onStarClick?.(s.name, getStarDescription(s.name)); }}
                            title={`${s.name} - X:${getStarDescription(s.name)}`} 
                            className={`text-[10px] break-words md:text-[10.5px] font-semibold tracking-tight cursor-help hover:brightness-125 mb-[1px] ${getColorNguHanh(s.nguHanh)}`}
                          >
                            {s.name}{s.sihua && <span className="font-bold text-coral ml-0.5">[{s.sihua}]</span>}
                          </div>
                         ))}
                       </td>
                    </tr>
                 </tbody>
               </table>
            </td>
          </tr>

          {/* DÒNG 4: FOOTER (Địa Chi, Tràng Sinh) */}
          <tr>
            <td colSpan={3} className="align-bottom pt-1 border-t border-white/10 relative">
               <div className="flex justify-between items-end w-full">
                  <span className="text-[10.5px] font-medium text-white/30 leading-none">{palace.chi}</span>
                  <span className="text-[9px] uppercase tracking-wide font-semibold text-[#f1c40f]/70 leading-none">
                    {palace.trangSinh ?? ''}
                  </span>
               </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
