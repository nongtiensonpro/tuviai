/**
 * NguHanhEngine.ts — Engine phân loại Ngũ Hành (Kim, Mộc, Thủy, Hỏa, Thổ) cho 108 vì sao.
 * Dùng để hiển thị màu sắc khoa học trên lá số.
 */
import type { NguHanh } from '../types/ZiweiTypes';

// Từ điển Ngũ Hành của các Chính Tinh
const MAIN_STARS_NGU_HANH: Record<string, NguHanh> = {
  'Tử Vi': 'Thổ',
  'Thiên Phủ': 'Thổ',
  'Thái Dương': 'Hỏa',
  'Thái Âm': 'Thủy',
  'Vũ Khúc': 'Kim',
  'Thiên Cơ': 'Mộc',
  'Thiên Đồng': 'Thủy',
  'Liêm Trinh': 'Hỏa',
  'Tham Lang': 'Mộc', // Tham Lang thuộc Thủy/Mộc, đa số tài liệu lấy Mộc trong hiển thị chính
  'Cự Môn': 'Thủy',
  'Thiên Tướng': 'Thủy',
  'Thiên Lương': 'Thổ',
  'Thất Sát': 'Kim',
  'Phá Quân': 'Thủy',
};

// Từ điển Ngũ Hành của Phụ / Sát / Cát tinh
const AUX_STARS_NGU_HANH: Record<string, NguHanh> = {
  'Văn Xương': 'Kim',
  'Văn Khúc': 'Thủy',
  'Tả Phù': 'Thổ',
  'Hữu Bật': 'Thủy',
  'Thiên Khôi': 'Hỏa',
  'Thiên Việt': 'Hỏa',
  'Lộc Tồn': 'Thổ',
  'Kình Dương': 'Kim', // Kình Dương Kim
  'Đà La': 'Kim',    // Đà La Kim
  'Hỏa Tinh': 'Hỏa',
  'Linh Tinh': 'Hỏa',
  'Địa Không': 'Hỏa',
  'Địa Kiếp': 'Hỏa',
  
  // Các sao nhỏ khác
  'Thiên Mã': 'Hỏa',
  'Thiên Hình': 'Hỏa',
  'Thiên Diêu': 'Thủy',
  'Đào Hoa': 'Mộc',
  'Hồng Loan': 'Thủy',
  'Thiên Hỷ': 'Thủy',
  'Cô Thần': 'Thổ',
  'Quả Tú': 'Thổ',
  'Đại Hao': 'Hỏa',
  'Tiểu Hao': 'Hỏa',
  'Bạch Hổ': 'Kim',
  'Tang Môn': 'Mộc',
  'Điếu Khách': 'Hỏa',
  'Thái Tuế': 'Hỏa',
};

/**
 * Láy Ngũ Hành của một vì sao dựa theo tên
 */
export function getStarNguHanh(starName: string): NguHanh {
  return MAIN_STARS_NGU_HANH[starName] || AUX_STARS_NGU_HANH[starName] || 'Thổ'; // Mặc định Thổ nếu thiếu
}

/**
 * Hàm dịch độ sáng từ ký tự Hán Việt cũ sang format mới (M, V, Đ, B, H)
 */
export function translateBrightness(oldBright: string): any {
  switch (oldBright) {
    case '庙': return 'M';
    case '旺': return 'V';
    case '得': return 'Đ';
    case '利': return 'B';
    case '平': return 'B';
    case '不': return 'H';
    case '陷': return 'H';
    default: return '';
  }
}
