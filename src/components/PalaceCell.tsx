/**
 * PalaceCell.tsx — Giao diện một ô trong 12 ô của mệnh bàn Tử Vi
 * Nhận Props là thông tin Palace từ core engine để hiển thị chính/phụ tinh
 */

import React from 'react';
import type { Palace, Star } from '../core/types/ZiweiTypes';

interface PalaceCellProps {
  palace: Palace;
  isActive?: boolean;
  onClick?: () => void;
}

export const PalaceCell: React.FC<PalaceCellProps> = ({ palace, isActive, onClick }) => {
  // Lọc lấy Chính Tinh và Phụ Tinh Cát / Phụ Tinh Sát
  const mainStars = palace.mainStars;
  const catStars = palace.auxStars.filter(s => s.category === 'cat' || s.category === 'support');
  const shaStars = palace.auxStars.filter(s => s.category === 'sha');
  const fixStars = palace.auxStars.filter(s => s.category === 'fixed');

  // Tuần - Triệt
  const tuanTriet = [];
  if (palace.hasTuanKhong) tuanTriet.push('Tuần');
  if (palace.hasTrinhKhong) tuanTriet.push('Triệt');

  return (
    <div
      onClick={onClick}
      className={`palace-cell flex flex-col justify-between ${isActive ? 'active' : ''}`}
    >
      {/* 1. Header: Tuần Triệt, Chính Tinh */}
      <div className="flex flex-col">
        {tuanTriet.length > 0 && (
          <div className="text-center text-[10px] font-bold text-gray-400 mb-1 border border-gray-600 rounded">
            {tuanTriet.join(' - ')}
          </div>
        )}
        <div className="flex flex-wrap gap-1 justify-center">
          {mainStars.map((star, idx) => (
            <div key={idx} className="text-center font-bold text-gold text-sm sm:text-base leading-tight">
              <span>{star.name}</span>
              {star.brightness && <span className="text-[10px] ml-1 opacity-80">({star.brightness})</span>}
              {star.sihua && <span className="text-coral ml-1 font-bold">[{star.sihua}]</span>}
            </div>
          ))}
        </div>
      </div>

      {/* 2. Middle: Phụ Tinh */}
      <div className="flex justify-between items-start mt-2 px-1 gap-2 flex-grow text-xs">
        {/* Phân cột trái (Lục Sát / Xấu) và cột phải (Lục Cát / Tốt) */}
        <div className="flex flex-col gap-0.5 text-coral text-left w-1/2 overflow-hidden">
          {shaStars.map((s, i) => (
            <div key={i} className="truncate">
              {s.name} {s.sihua && <span className="font-bold">[{s.sihua}]</span>}
            </div>
          ))}
          {/* Cố định (Thương, Sứ, La, Võng...) */}
          {fixStars.map((s, i) => (
            <div key={`f-${i}`} className="truncate text-gray-400">
              {s.name}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-0.5 text-cyan text-right w-1/2 overflow-hidden">
          {catStars.map((s, i) => (
            <div key={i} className="truncate">
              {s.name} {s.sihua && <span className="font-bold">[{s.sihua}]</span>}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Footer: Tên Cung, Thiên Can - Địa Chi */}
      <div className="mt-2 pt-1 border-t border-white/10 flex justify-between items-end">
        <div className="text-[10px] text-white/50">{palace.can} {palace.chi}</div>
        <div className="text-sm font-bold uppercase text-white/90 bg-white/10 px-1 rounded">
          {palace.palaceName}
        </div>
      </div>
    </div>
  );
};
