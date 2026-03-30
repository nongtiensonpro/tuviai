/**
 * PalaceCell.tsx — Ô cung Tử Vi (Giao diện chuẩn Mệnh Bàn truyền thống - Polished)
 * - Màu sắc sao theo Ngũ Hành, Padding thông thoáng
 * - Bảng Bát Quái ẩn (watermark) cho các cung Vô Chính Diệu
 * - Ribbon / Badge Tuần Triệt đính dính lề
 */

import React from 'react';
import type { Palace } from '../core/types/ZiweiTypes';
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

  const tuanTriet: string[] = [];
  if (palace.hasTuanKhong) tuanTriet.push('Tuần');
  if (palace.hasTrinhKhong) tuanTriet.push('Triệt');

  return (
    <div
      onClick={onClick}
      className={`palace-cell relative overflow-hidden transition-all duration-200 ${isActive ? 'active' : ''}`}
    >
      {/* Hiệu ứng SVG nền cho VCD */}
      {isVCD && (
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none z-0">
           <svg width="80%" height="80%" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2"/>
              <path d="M50 5 a 45 45 0 0 1 0 90 a 22.5 22.5 0 0 0 0 -45 a 22.5 22.5 0 0 1 0 -45" fill="currentColor"/>
              <circle cx="50" cy="27.5" r="5" fill="none" stroke="black" strokeWidth="2"/>
              <circle cx="50" cy="72.5" r="5" fill="currentColor"/>
           </svg>
        </div>
      )}

      {/* Ruy-băng Tuần/Triệt */}
      {tuanTriet.length > 0 && (
        <div className="absolute top-2 right-2 text-white/48 text-[9px] font-bold z-10 tracking-[0.1em] uppercase">
          {tuanTriet.join(' - ')}
        </div>
      )}

      <div className="relative z-10 flex h-full flex-col gap-2">
        <div className="grid grid-cols-[auto_1fr_auto] items-start gap-2">
          <span className="text-[10.5px] text-white/45 tracking-tight font-medium whitespace-nowrap">
            {palace.can}.{palace.chi}
          </span>

          <div className="flex flex-col items-center leading-tight text-center">
            <span className={`text-[12px] font-bold uppercase tracking-[0.04em] ${isActive ? 'text-gold' : 'text-white/90'}`}>
              {palace.palaceName}
            </span>
            {palace.isThanPalace && (
              <span className="mt-1 text-red-200/80 text-[8px] uppercase tracking-[0.14em]">
                Thân
              </span>
            )}
          </div>

          <span className="text-[10px] font-bold text-white/35 text-right">
            {palace.daiHan ?? ''}
          </span>
        </div>

        <div className="flex min-h-[48px] flex-col items-center justify-start text-center pt-1">
          {mainStars.map((star, idx) => (
            <div
              key={idx}
              onClick={(e) => { e.stopPropagation(); onStarClick?.(star.name, getStarDescription(star.name)); }}
              title={`${star.name} - Ngũ hành: ${star.nguHanh}\nÝ nghĩa: ${getStarDescription(star.name)}`}
              className={`font-bold text-[13.5px] leading-tight cursor-help ${getColorNguHanh(star.nguHanh)}`}
            >
              {star.name}
              {star.brightness && <span className="text-[10px] ml-0.5 font-normal opacity-80">({star.brightness})</span>}
              {star.sihua && <span className="text-coral ml-0.5 font-bold tracking-normal opacity-100">[{star.sihua}]</span>}
            </div>
          ))}

          {isVCD && palace.borrowedStars && palace.borrowedStars.length > 0 && (
            <div className="mt-1 flex flex-col items-center opacity-42 italic">
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
            <div className="text-[11px] text-white/30 italic mt-1 font-medium tracking-[0.16em] uppercase">Vô chính diệu</div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="min-w-0 px-2 py-1.5">
            {leftStars.map((s, i) => (
              <div
                key={i}
                onClick={(e) => { e.stopPropagation(); onStarClick?.(s.name, getStarDescription(s.name)); }}
                title={`${s.name} - O:${getStarDescription(s.name)}`}
                className={`text-[10px] break-words md:text-[10.5px] font-medium tracking-tight cursor-help mb-[1px] ${getColorNguHanh(s.nguHanh)}`}
              >
                {s.name}{s.sihua && <span className="font-bold text-coral ml-0.5">[{s.sihua}]</span>}
              </div>
            ))}
          </div>

          <div className="min-w-0 px-2 py-1.5 text-right">
            {rightStars.map((s, i) => (
              <div
                key={i}
                onClick={(e) => { e.stopPropagation(); onStarClick?.(s.name, getStarDescription(s.name)); }}
                title={`${s.name} - X:${getStarDescription(s.name)}`}
                className={`text-[10px] break-words md:text-[10.5px] font-semibold tracking-tight cursor-help mb-[1px] ${getColorNguHanh(s.nguHanh)}`}
              >
                {s.name}{s.sihua && <span className="font-bold text-coral ml-0.5">[{s.sihua}]</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto flex justify-between items-end pt-1">
          <span className="text-[10.5px] font-medium text-white/28 leading-none">{palace.chi}</span>
          <span className="text-[9px] uppercase tracking-[0.12em] font-semibold text-[#f1c40f]/70 leading-none">
            {palace.trangSinh ?? ''}
          </span>
        </div>
      </div>
    </div>
  );
};
