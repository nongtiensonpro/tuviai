/**
 * PalaceCell.tsx — Ô cung Tử Vi (Giao diện chuẩn Mệnh Bàn truyền thống)
 * - Màu sắc sao theo Ngũ Hành
 * - Bố cục: Can Chi góc trái, Tên Cung giữa, Đại Hạn góc phải.
 * - Tràng Sinh ở đáy, Địa Chi ở đáy trái.
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

  return (
    <div
      onClick={onClick}
      className={`palace-cell relative flex flex-col ${isActive ? 'active z-10' : ''}`}
      style={{ transition: 'all 0.2s ease', position: 'relative' }}
    >
      {/* 1. Tuyển viền Tuần/Triệt nổi bằng Absolute Badge */}
      {tuanTriet.length > 0 && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-bold px-1.5 py-0.5 border border-white/20 z-10 whitespace-nowrap shadow-md">
          {tuanTriet.join(' - ')}
        </div>
      )}

      {/* 2. HEADER: Can Chi - TÊN CUNG - Đại Hạn */}
      <div className="flex justify-between items-start w-full border-b border-white/5 pb-1 mb-1">
        <span className="text-[10px] text-coral/80 font-medium">
          {palace.can}.{palace.chi}
        </span>
        <div className="flex flex-col items-center">
          <span className={`text-[11px] font-bold uppercase ${isActive ? 'text-gold' : 'text-white/90'}`}>
            {palace.palaceName}
          </span>
          {palace.isThanPalace && (
            <span className="bg-red-900/40 border border-red-500/30 text-red-200 text-[8px] px-1 rounded-sm -mt-0.5 mt-0.5">
              Thân
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold text-white/50">
          {palace.daiHan ?? ''}
        </span>
      </div>

      {/* 3. CHÍNH TINH (To ở giữa) */}
      <div className="flex flex-col items-center mb-1.5 min-h-[3rem] justify-start">
        {mainStars.map((star, idx) => (
          <div key={idx} className={`text-center font-bold text-[13px] leading-tight ${getColorNguHanh(star.nguHanh)}`}>
            <span>{star.name}</span>
            {star.brightness && <span className="text-[10px] ml-0.5 opacity-80 font-normal">({star.brightness})</span>}
            {star.sihua && <span className="text-coral ml-0.5 font-bold">[{star.sihua}]</span>}
          </div>
        ))}
        {mainStars.length === 0 && (
          <div className="text-[10px] text-white/20 italic mt-1">Vô chính diệu</div>
        )}
      </div>

      {/* 4. PHỤ TINH - Phân 2 cột Trái/Phải với màu Ngũ Hành */}
      <div className="flex justify-between items-start gap-1 flex-grow text-[10px] min-h-[4rem]">
        {/* Cột Trái Cát Tinh */}
        <div className="flex flex-col w-1/2 overflow-hidden items-start">
          {leftStars.map((s, i) => (
            <div key={i} className={`truncate w-full leading-tight font-medium ${getColorNguHanh(s.nguHanh)}`}>
              {s.name}
              {s.sihua && <span className="font-bold ml-0.5 text-coral">[{s.sihua}]</span>}
            </div>
          ))}
        </div>
        {/* Cột Phải Sát Tinh */}
        <div className="flex flex-col w-1/2 overflow-hidden items-end">
          {rightStars.map((s, i) => (
            <div key={i} className={`truncate w-full text-right leading-tight font-semibold ${getColorNguHanh(s.nguHanh)}`}>
              {s.name}
              {s.sihua && <span className="font-bold ml-0.5 text-coral">[{s.sihua}]</span>}
            </div>
          ))}
        </div>
      </div>

      {/* 5. FOOTER: Cung Địa Chi - Tràng Sinh */}
      <div className="mt-1 pt-1 border-t border-white/10 flex justify-between items-end w-full">
        <span className="text-[11px] text-white/40">{palace.chi}</span>
        <span className="text-[10px] text-amber-500/80 font-medium">{palace.trangSinh ?? ''}</span>
        {/* Chỗ này dành cho Tiểu Hạn hoặc tháng lưu niên (sau này) */}
        <span className="text-[9px] text-white/20"></span>
      </div>

      {/* 6. EXPANDED DETAIL (Hiện khi tooltip) */}
      {isActive && (
        <div className="absolute top-[100%] left-0 w-[180%] bg-gray-900/95 border border-gold/40 rounded shadow-2xl z-50 p-2 mt-2 -ml-[40%]" 
             style={{ animation: 'fadeUp 0.15s ease forwards' }}
             onClick={e => e.stopPropagation()}>
          <p className="text-[10px] font-bold text-gold/70 border-b border-gold/20 pb-1 mb-1">KIẾN THỨC CÁC SAO</p>
          <div className="space-y-1">
            {allStars.map((star, i) => {
              const desc = STAR_DESC[star.name] || `${star.nguHanh} tinh`;
              return (
                <div key={i} className="flex gap-2 items-start leading-tight">
                  <span className={`text-[10px] font-bold flex-shrink-0 ${getColorNguHanh(star.nguHanh)} w-16`}>
                    {star.name}
                  </span>
                  <span className="text-[9px] text-white/50">{desc}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
