/**
 * AdvancedCalculator.ts — Tính toán các thống số chuyên sâu (Học thuật cổ điển)
 * Tham chiếu: Đại Hạn, Vòng Tràng Sinh, Mệnh Chủ, Thân Chủ, Âm Dương Thuận/Nghịch lý.
 */

import type {
  AmDuongLy,
  Gender,
  MenhCucRelation,
  NapAmInfo,
  NguHanh,
  NguHanhCuc,
  TenCan,
  TwoelveChi,
} from '../types/ZiweiTypes';

const NAP_AM_BY_YEAR: Record<string, NapAmInfo> = {
  'Giáp-Tý': { name: 'Hải Trung Kim', nguHanh: 'Kim' },
  'Ất-Sửu': { name: 'Hải Trung Kim', nguHanh: 'Kim' },
  'Bính-Dần': { name: 'Lư Trung Hỏa', nguHanh: 'Hỏa' },
  'Đinh-Mão': { name: 'Lư Trung Hỏa', nguHanh: 'Hỏa' },
  'Mậu-Thìn': { name: 'Đại Lâm Mộc', nguHanh: 'Mộc' },
  'Kỷ-Tỵ': { name: 'Đại Lâm Mộc', nguHanh: 'Mộc' },
  'Canh-Ngọ': { name: 'Lộ Bàng Thổ', nguHanh: 'Thổ' },
  'Tân-Mùi': { name: 'Lộ Bàng Thổ', nguHanh: 'Thổ' },
  'Nhâm-Thân': { name: 'Kiếm Phong Kim', nguHanh: 'Kim' },
  'Quý-Dậu': { name: 'Kiếm Phong Kim', nguHanh: 'Kim' },
  'Giáp-Tuất': { name: 'Sơn Đầu Hỏa', nguHanh: 'Hỏa' },
  'Ất-Hợi': { name: 'Sơn Đầu Hỏa', nguHanh: 'Hỏa' },
  'Bính-Tý': { name: 'Giản Hạ Thủy', nguHanh: 'Thủy' },
  'Đinh-Sửu': { name: 'Giản Hạ Thủy', nguHanh: 'Thủy' },
  'Mậu-Dần': { name: 'Thành Đầu Thổ', nguHanh: 'Thổ' },
  'Kỷ-Mão': { name: 'Thành Đầu Thổ', nguHanh: 'Thổ' },
  'Canh-Thìn': { name: 'Bạch Lạp Kim', nguHanh: 'Kim' },
  'Tân-Tỵ': { name: 'Bạch Lạp Kim', nguHanh: 'Kim' },
  'Nhâm-Ngọ': { name: 'Dương Liễu Mộc', nguHanh: 'Mộc' },
  'Quý-Mùi': { name: 'Dương Liễu Mộc', nguHanh: 'Mộc' },
  'Giáp-Thân': { name: 'Tuyền Trung Thủy', nguHanh: 'Thủy' },
  'Ất-Dậu': { name: 'Tuyền Trung Thủy', nguHanh: 'Thủy' },
  'Bính-Tuất': { name: 'Ốc Thượng Thổ', nguHanh: 'Thổ' },
  'Đinh-Hợi': { name: 'Ốc Thượng Thổ', nguHanh: 'Thổ' },
  'Mậu-Tý': { name: 'Tích Lịch Hỏa', nguHanh: 'Hỏa' },
  'Kỷ-Sửu': { name: 'Tích Lịch Hỏa', nguHanh: 'Hỏa' },
  'Canh-Dần': { name: 'Tùng Bách Mộc', nguHanh: 'Mộc' },
  'Tân-Mão': { name: 'Tùng Bách Mộc', nguHanh: 'Mộc' },
  'Nhâm-Thìn': { name: 'Trường Lưu Thủy', nguHanh: 'Thủy' },
  'Quý-Tỵ': { name: 'Trường Lưu Thủy', nguHanh: 'Thủy' },
  'Giáp-Ngọ': { name: 'Sa Trung Kim', nguHanh: 'Kim' },
  'Ất-Mùi': { name: 'Sa Trung Kim', nguHanh: 'Kim' },
  'Bính-Thân': { name: 'Sơn Hạ Hỏa', nguHanh: 'Hỏa' },
  'Đinh-Dậu': { name: 'Sơn Hạ Hỏa', nguHanh: 'Hỏa' },
  'Mậu-Tuất': { name: 'Bình Địa Mộc', nguHanh: 'Mộc' },
  'Kỷ-Hợi': { name: 'Bình Địa Mộc', nguHanh: 'Mộc' },
  'Canh-Tý': { name: 'Bích Thượng Thổ', nguHanh: 'Thổ' },
  'Tân-Sửu': { name: 'Bích Thượng Thổ', nguHanh: 'Thổ' },
  'Nhâm-Dần': { name: 'Kim Bạch Kim', nguHanh: 'Kim' },
  'Quý-Mão': { name: 'Kim Bạch Kim', nguHanh: 'Kim' },
  'Giáp-Thìn': { name: 'Phú Đăng Hỏa', nguHanh: 'Hỏa' },
  'Ất-Tỵ': { name: 'Phú Đăng Hỏa', nguHanh: 'Hỏa' },
  'Bính-Ngọ': { name: 'Thiên Hà Thủy', nguHanh: 'Thủy' },
  'Đinh-Mùi': { name: 'Thiên Hà Thủy', nguHanh: 'Thủy' },
  'Mậu-Thân': { name: 'Đại Dịch Thổ', nguHanh: 'Thổ' },
  'Kỷ-Dậu': { name: 'Đại Dịch Thổ', nguHanh: 'Thổ' },
  'Canh-Tuất': { name: 'Thoa Xuyến Kim', nguHanh: 'Kim' },
  'Tân-Hợi': { name: 'Thoa Xuyến Kim', nguHanh: 'Kim' },
  'Nhâm-Tý': { name: 'Tang Đố Mộc', nguHanh: 'Mộc' },
  'Quý-Sửu': { name: 'Tang Đố Mộc', nguHanh: 'Mộc' },
  'Giáp-Dần': { name: 'Đại Khê Thủy', nguHanh: 'Thủy' },
  'Ất-Mão': { name: 'Đại Khê Thủy', nguHanh: 'Thủy' },
  'Bính-Thìn': { name: 'Sa Trung Thổ', nguHanh: 'Thổ' },
  'Đinh-Tỵ': { name: 'Sa Trung Thổ', nguHanh: 'Thổ' },
  'Mậu-Ngọ': { name: 'Thiên Thượng Hỏa', nguHanh: 'Hỏa' },
  'Kỷ-Mùi': { name: 'Thiên Thượng Hỏa', nguHanh: 'Hỏa' },
  'Canh-Thân': { name: 'Thạch Lựu Mộc', nguHanh: 'Mộc' },
  'Tân-Dậu': { name: 'Thạch Lựu Mộc', nguHanh: 'Mộc' },
  'Nhâm-Tuất': { name: 'Đại Hải Thủy', nguHanh: 'Thủy' },
  'Quý-Hợi': { name: 'Đại Hải Thủy', nguHanh: 'Thủy' },
};

const CUC_NGU_HANH: Record<NguHanhCuc, NguHanh> = {
  2: 'Thủy',
  3: 'Mộc',
  4: 'Kim',
  5: 'Thổ',
  6: 'Hỏa',
};

const NGU_HANH_TUONG_SINH: Record<NguHanh, NguHanh> = {
  'Kim': 'Thủy',
  'Thủy': 'Mộc',
  'Mộc': 'Hỏa',
  'Hỏa': 'Thổ',
  'Thổ': 'Kim',
};

const NGU_HANH_TUONG_KHAC: Record<NguHanh, NguHanh> = {
  'Kim': 'Mộc',
  'Mộc': 'Thổ',
  'Thổ': 'Thủy',
  'Thủy': 'Hỏa',
  'Hỏa': 'Kim',
};

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
 * Lấy Nạp Âm Bản Mệnh từ Can Chi năm sinh
 */
export function getNapAmInfo(yearCan: TenCan, yearChi: TwoelveChi): NapAmInfo {
  return NAP_AM_BY_YEAR[`${yearCan}-${yearChi}`] ?? {
    name: 'Không rõ',
    nguHanh: 'Thổ',
  };
}

/**
 * Tính tương quan giữa Ngũ Hành bản mệnh và hành của Cục
 */
export function calcMenhCucSinhKhac(
  banMenhNguHanh: NguHanh,
  cuc: NguHanhCuc,
): MenhCucRelation {
  const cucNguHanh = CUC_NGU_HANH[cuc];

  if (cucNguHanh === banMenhNguHanh) {
    return 'Cục hòa Bản Mệnh';
  }

  if (NGU_HANH_TUONG_SINH[cucNguHanh] === banMenhNguHanh) {
    return 'Cục sinh Bản Mệnh';
  }

  if (NGU_HANH_TUONG_SINH[banMenhNguHanh] === cucNguHanh) {
    return 'Bản Mệnh sinh Cục';
  }

  if (NGU_HANH_TUONG_KHAC[banMenhNguHanh] === cucNguHanh) {
    return 'Bản Mệnh khắc Cục';
  }

  return 'Cục khắc Bản Mệnh';
}

/**
 * Tính Mệnh Chủ dựa vào Địa Chi cung Mệnh
 */
export function calcMenhChu(menhChiIndex: number): string {
  return MENH_CHU_BY_MENH_CHI[menhChiIndex] ?? MENH_CHU_BY_MENH_CHI[0];
}

/**
 * Tính Thân Chủ dựa vào Địa Chi năm sinh
 */
export function calcThanChu(yearChiIndex: number): string {
  return THAN_CHU_BY_YEAR_CHI[yearChiIndex] ?? THAN_CHU_BY_YEAR_CHI[0];
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
    'Trường Sinh', 'Mộc Dục', 'Quan Đới', 'Lâm Quan', 'Đế Vượng', 'Suy',
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
const MENH_CHU_BY_MENH_CHI = [
  'Tham Lang', 'Cự Môn', 'Lộc Tồn', 'Văn Khúc',
  'Liêm Trinh', 'Vũ Khúc', 'Phá Quân', 'Vũ Khúc',
  'Liêm Trinh', 'Văn Khúc', 'Lộc Tồn', 'Cự Môn',
] as const;

// Theo các bảng công khai được dùng phổ biến (ví dụ Quản Xuân Thịnh / Học viện Lý số),
// Thân chủ theo chi năm là:
// Tý=Linh Tinh, Sửu=Mùi=Thiên Tướng, Dần=Thân=Thiên Lương,
// Mão=Dậu=Thiên Đồng, Thìn=Tuất=Văn Xương, Tỵ=Hợi=Thiên Cơ, Ngọ=Hỏa Tinh.
const THAN_CHU_BY_YEAR_CHI = [
  'Linh Tinh', 'Thiên Tướng', 'Thiên Lương', 'Thiên Đồng',
  'Văn Xương', 'Thiên Cơ', 'Hỏa Tinh', 'Thiên Tướng',
  'Thiên Lương', 'Thiên Đồng', 'Văn Xương', 'Thiên Cơ',
] as const;
