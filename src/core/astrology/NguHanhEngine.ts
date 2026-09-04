/**
 * NguHanhEngine.ts — Engine phân loại Ngũ Hành (Kim, Mộc, Thủy, Hỏa, Thổ) cho 108 vì sao.
 * Dùng để hiển thị màu sắc khoa học trên lá số.
 */
import type { NguHanh, StarBrightness } from '../types/ZiweiTypes';
import { getStarDefinition, isKnownStarName } from './StarCatalog';

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

// Từ điển Ngũ Hành của Phụ / Sát / Cát tinh / Tạp Diệu (Đầy đủ 108 sao)
const AUX_STARS_NGU_HANH: Record<string, NguHanh> = {
  // --- Lục Cát, Lục Sát ---
  'Văn Xương': 'Kim', 'Văn Khúc': 'Thủy', 'Tả Phù': 'Thổ', 'Hữu Bật': 'Thủy',
  'Thiên Khôi': 'Hỏa', 'Thiên Việt': 'Hỏa', 'Lộc Tồn': 'Thổ', 'Kình Dương': 'Kim',
  'Đà La': 'Kim', 'Hỏa Tinh': 'Hỏa', 'Linh Tinh': 'Hỏa', 'Địa Không': 'Hỏa', 'Địa Kiếp': 'Hỏa',
  
  // --- Vòng Thái Tuế (12 sao) ---
  'Thái Tuế': 'Hỏa', 'Thiếu Dương': 'Hỏa', 'Thiên Không': 'Hỏa', 'Tang Môn': 'Mộc', 'Thiếu Âm': 'Thủy',
  'Quan Phù': 'Hỏa', 'Tử Phù': 'Kim', 'Tuế Phá': 'Hỏa', 'Long Đức': 'Thủy',
  'Bạch Hổ': 'Kim', 'Phúc Đức': 'Thổ', 'Điếu Khách': 'Hỏa', 'Trực Phù': 'Kim',

  // --- Vòng Lộc Tồn / Bác Sĩ (Hiểu Lộc Tồn ở trên) ---
  'Bác Sĩ': 'Thủy', 'Lực Sĩ': 'Hỏa', 'Thanh Long': 'Thủy', 'Tiểu Hao': 'Hỏa',
  'Tướng Quân': 'Mộc', 'Tấu Thư': 'Kim', 'Phi Liêm': 'Hỏa', 'Hỷ Thần': 'Hỏa',
  'Bệnh Phù': 'Thổ', 'Đại Hao': 'Hỏa', 'Phục Binh': 'Hỏa', 'Quan Phủ': 'Hỏa',
  
  // --- Vòng Trường Sinh ---
  'Trường Sinh': 'Thủy', 'Mộc Dục': 'Thủy', 'Quan Đới': 'Kim', 'Lâm Quan': 'Kim',
  'Đế Vượng': 'Kim', 'Suy': 'Thủy', 'Bệnh': 'Hỏa', 'Tử': 'Hỏa',
  'Mộ': 'Thổ', 'Tuyệt': 'Hỏa', 'Thai': 'Thổ', 'Dưỡng': 'Mộc',

  // --- Tạp Diệu (Tháng, Ngày, Giờ, Năm) ---
  'Thiên Hình': 'Hỏa', 'Thiên Diêu': 'Thủy', 'Thiên Y': 'Thủy', 'Thiên Giải': 'Mộc',
  'Địa Giải': 'Mộc', 'Giải Thần': 'Mộc', 'Tam Thai': 'Thủy', 'Bát Tọa': 'Mộc',
  'Ân Quang': 'Mộc', 'Thiên Quý': 'Thổ', 'Thai Phụ': 'Kim', 'Phong Cáo': 'Thổ',
  'Đào Hoa': 'Mộc', 'Hồng Loan': 'Thủy', 'Thiên Hỷ': 'Thủy',
  'Cô Thần': 'Thổ', 'Quả Tú': 'Thổ', 'Kiếp Sát': 'Hỏa', 'Hoa Cái': 'Kim',
  'Phá Toái': 'Hỏa', 'Long Trì': 'Thủy', 'Phượng Các': 'Mộc', 'Thiên Tài': 'Mộc',
  'Thiên Thọ': 'Thổ', 'Thiên Khốc': 'Thủy', 'Thiên Hư': 'Thủy', 'Thiên Mã': 'Hỏa',
  'Thiên Quan': 'Hỏa', 'Thiên Phúc': 'Thổ', 'Lưu Hà': 'Thủy', 'Thiên Trù': 'Thổ',
  'Đẩu Quân': 'Hỏa', 'Thiên Vu': 'Thủy', 'Thiên Riêu': 'Thủy',
  'Thiên La': 'Thổ', 'Địa Võng': 'Thổ', 'Thiên Thương': 'Thủy', 'Thiên Sứ': 'Thủy',
  'Thiên Đức': 'Hỏa', 'Nguyệt Đức': 'Hỏa', 'Quốc Ấn': 'Thổ', 'Đường Phù': 'Mộc',

  // --- 15 Sao Mới (Milestone 3) ---
  'Tướng Tinh': 'Mộc', 'Phan An': 'Mộc', 'Tức Thần': 'Thổ', 'Tai Sát': 'Hỏa',
  'Thiên Sát': 'Hỏa', 'Chỉ Bối': 'Thủy', 'Nguyệt Sát': 'Hỏa', 'Vong Thần': 'Thủy',
  'Lưu Niên Văn Tinh': 'Hỏa', 'Thiên Khố': 'Thổ',
  'Nguyệt Giải': 'Hỏa', 'Âm Sát': 'Thủy', 'Thiên Nguyệt': 'Thủy', 'Nguyệt Yếm': 'Hỏa',
  'Nguyệt Hình': 'Hỏa',

  // --- Tuần Triệt ---
  'Tuần Không': 'Hỏa', 'Triệt Không': 'Kim', 'Triệt': 'Kim', 'Tuần': 'Hỏa',
};

export function getStarNguHanh(starName: string): NguHanh {
  // 1) Ưu tiên ngũ hành tường minh từ StarCatalog (sao lưu niên đã gán explicit)
  const definition = getStarDefinition(starName);
  if (definition?.nguHanh) {
    return definition.nguHanh;
  }

  // 2) Tra bảng nội bộ với TÊN GỐC trước — quan trọng vì có sao natal
  //    tên "Lưu Hà" (Sông Chảy) sẽ bị strip oan thành "Hà" nếu strip sớm.
  const direct = MAIN_STARS_NGU_HANH[starName] || AUX_STARS_NGU_HANH[starName];
  if (direct) {
    return direct;
  }

  // 3) Chỉ strip tiền tố "Lưu " khi tên gốc không khớp (sao lưu niên chưa có catalog)
  const stripped = starName.replace(/^Lưu\s+/, '');
  const fallback = MAIN_STARS_NGU_HANH[stripped] || AUX_STARS_NGU_HANH[stripped];
  if (!fallback || (!isKnownStarName(starName) && !isKnownStarName(stripped))) {
    throw new Error(`Unknown star ngu hanh: ${starName}`);
  }

  return fallback;
}

/**
 * Hàm dịch độ sáng từ ký tự Hán Việt cũ sang format mới (M, V, Đ, B, H)
 */
export function translateBrightness(oldBright: string): StarBrightness {
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
