/**
 * AdvancedCalculator.ts — Tính toán các thống số chuyên sâu (Học thuật cổ điển)
 * Tham chiếu: Đại Hạn, Vòng Tràng Sinh, Mệnh Chủ, Thân Chủ, Âm Dương Thuận/Nghịch lý.
 */

import type { AmDuongLy, Gender, NguHanhCuc } from '../types/ZiweiTypes';

/**
 * Tính Âm Dương Nam Nữ dựa vào Thiên Can năm sinh và Giới tính
 * Giáp, Bính, Mậu, Canh, Nhâm: Dương (+1)
 * Ất, Đinh, Kỷ, Tân, Quý: Âm (-1)
 * => Nam (+1), Nữ (-1)
 */
export function calcAmDuongNamNu(yearCanIndex: number, gender: Gender): { 
  amDuong: string; 
  isThuanHanh: boolean; // Chiều chạy Đại hạn và Tràng sinh
} {
  const isDuongCan = yearCanIndex % 2 === 0;
  const isNam = gender === 'male';
  
  const amDuongText = `${isDuongCan ? 'Dương' : 'Âm'} ${isNam ? 'Nam' : 'Nữ'}`;
  
  // Dương Nam, Âm Nữ đi thuận (isThuanHanh = true)
  // Âm Nam, Dương Nữ đi nghịch (isThuanHanh = false)
  const isThuanHanh = (isDuongCan && isNam) || (!isDuongCan && !isNam);
  
  return { amDuong: amDuongText, isThuanHanh };
}

/**
 * Tính Âm Dương Thuận/Nghịch lý 
 * Dựa vào Cung Mệnh đóng ở cung Âm hay Dương so sánh với Âm Dương Nam Nữ
 * Cung Dương: Tý, Dần, Thìn, Ngọ, Thân, Tuất (index chẵn)
 * Cung Âm: Sửu, Mão, Tỵ, Mùi, Dậu, Hợi (index lẻ)
 */
export function calcAmDuongLy(menhChiIndex: number, yearCanIndex: number): AmDuongLy {
  const isDuongCung = menhChiIndex % 2 === 0;
  const isDuongCan = yearCanIndex % 2 === 0;

  // Thuận lý: Người Dương (Nam/Nữ) đóng cung Dương, Người Âm đóng cung Âm
  if (isDuongCan === isDuongCung) {
    return 'Âm dương thuận lý';
  } else {
    return 'Âm dương nghịch lý';
  }
}

/**
 * Suy đoán Mệnh Tương Sinh Tương Khắc với Cục
 * Bỏ qua vì cần thuật toán Ngũ Hành phức tạp, gán tạm "Mệnh Cục Bình Hòa" hoặc tính base:
 */
export function calcMenhCucSinhKhac(): string {
  // Todo: Implement fully based on Menh vs Cuc Ngu Hanh
  return 'Cục hòa Bản Mệnh'; // Default giản lược cho UI mẫu
}

/**
 * Tính Mệnh Chủ dựa vào Địa Chi cung Mệnh
 */
export function calcMenhChu(menhChiIndex: number): string {
  const MENH_CHU: Record<number, string> = {
    0: 'Tham Lang', 1: 'Cự Môn', 2: 'Lộc Tồn', 3: 'Văn Khúc',
    4: 'Liêm Trinh', 5: 'Vũ Khúc', 6: 'Phá Quân', 7: 'Vũ Khúc',
    8: 'Liêm Trinh', 9: 'Văn Khúc', 10: 'Lộc Tồn', 11: 'Cự Môn'
  };
  return MENH_CHU[menhChiIndex] || 'Không rõ';
}

/**
 * Tính Thân Chủ dựa vào Địa Chi năm sinh
 */
export function calcThanChu(yearChiIndex: number): string {
  const THAN_CHU: Record<number, string> = {
    0: 'Linh Tinh', 1: 'Thiên Tướng', 2: 'Thiên Lương', 3: 'Thiên Đồng',
    4: 'Văn Xương', 5: 'Thiên Cơ', 6: 'Hỏa Tinh', 7: 'Thiên Tướng',
    8: 'Thiên Lương', 9: 'Thiên Đồng', 10: 'Văn Xương', 11: 'Thiên Cơ'
  };
  return THAN_CHU[yearChiIndex] || 'Không rõ';
}

/**
 * Tính vòng Tràng Sinh (12 sao)
 */
export function calcTrangSinh(
  cuc: NguHanhCuc, 
  isThuanHanh: boolean,
  targetChiIndex: number
): string {
  const TRANG_SINH_TABLE = [
    'Tràng Sinh', 'Mộc Dục', 'Quan Đới', 'Lâm Quan', 'Đế Vượng', 'Suy',
    'Bệnh', 'Tử', 'Mộ', 'Tuyệt', 'Thai', 'Dưỡng'
  ];

  let startChiIndex = 0;
  if (cuc === 2 || cuc === 5) startChiIndex = 8; // Thủy Thổ khởi Thân
  else if (cuc === 3) startChiIndex = 11; // Mộc khởi Hợi
  else if (cuc === 4) startChiIndex = 5;  // Kim khởi Tỵ
  else if (cuc === 6) startChiIndex = 2;  // Hỏa khởi Dần

  // Tính khoảng cách từ startChiIndex tới targetChiIndex
  let offset = targetChiIndex - startChiIndex;
  
  if (!isThuanHanh) {
    offset = startChiIndex - targetChiIndex;
  }
  
  offset = (offset % 12 + 12) % 12; // Chống số âm
  
  return TRANG_SINH_TABLE[offset] || '';
}

/**
 * Tính Đại Hạn bắt đầu từ cung Mệnh
 */
export function calcDaiHan(
  cuc: NguHanhCuc,
  isThuanHanh: boolean,
  menhChiIndex: number,
  targetChiIndex: number
): number {
  let offset = targetChiIndex - menhChiIndex;
  
  if (!isThuanHanh) {
    offset = menhChiIndex - targetChiIndex;
  }
  
  offset = (offset % 12 + 12) % 12;

  // Đại hạn bắt đầu bằng Cục số, cộng thêm (offset * 10)
  return cuc + (offset * 10);
}
