/**
 * AstronomicalData.ts — Dữ liệu kinh độ các tỉnh thành & Lịch sử múi giờ Việt Nam
 * Hỗ trợ tính toán Giờ Mặt Trời Thực (True Solar Time) và hiệu chỉnh múi giờ lịch sử.
 */

export interface CityData {
  name: string;
  longitude: number; // Kinh độ chuẩn (độ Đông) để tính hiệu hiệu chỉnh giờ
  latitude: number;  // Vĩ độ
  isSouth: boolean;  // Thuộc miền Nam (từ vĩ tuyến 17 trở vào Nam) trong thời kỳ 1954-1975
}

/**
 * Danh sách kinh vĩ độ của 63 tỉnh thành Việt Nam
 * Múi giờ chuẩn UTC+7 tương ứng kinh độ 105°E.
 */
export const VIETNAM_CITIES: CityData[] = [
  { name: 'Hà Nội', longitude: 105.8544, latitude: 21.0285, isSouth: false },
  { name: 'TP. Hồ Chí Minh', longitude: 106.6602, latitude: 10.7769, isSouth: true },
  { name: 'Đà Nẵng', longitude: 108.2022, latitude: 16.0544, isSouth: true },
  { name: 'Hải Phòng', longitude: 106.6881, latitude: 20.8449, isSouth: false },
  { name: 'Cần Thơ', longitude: 105.7838, latitude: 10.0452, isSouth: true },
  { name: 'An Giang', longitude: 105.1259, latitude: 10.5392, isSouth: true },
  { name: 'Bà Rịa - Vũng Tàu', longitude: 107.2426, latitude: 10.5108, isSouth: true },
  { name: 'Bắc Giang', longitude: 106.1946, latitude: 21.2731, isSouth: false },
  { name: 'Bắc Kạn', longitude: 105.8242, latitude: 22.1481, isSouth: false },
  { name: 'Bạc Liêu', longitude: 105.7244, latitude: 9.2941, isSouth: true },
  { name: 'Bắc Ninh', longitude: 106.0754, latitude: 21.1861, isSouth: false },
  { name: 'Bến Tre', longitude: 106.3758, latitude: 10.2401, isSouth: true },
  { name: 'Bình Định', longitude: 109.2195, latitude: 13.7830, isSouth: true },
  { name: 'Bình Dương', longitude: 106.6631, latitude: 11.2338, isSouth: true },
  { name: 'Bình Phước', longitude: 106.8839, latitude: 11.7508, isSouth: true },
  { name: 'Bình Thuận', longitude: 108.1042, latitude: 10.9333, isSouth: true },
  { name: 'Cà Mau', longitude: 105.1501, latitude: 9.1768, isSouth: true },
  { name: 'Cao Bằng', longitude: 106.2631, latitude: 22.6685, isSouth: false },
  { name: 'Đắk Lắk', longitude: 108.0383, latitude: 12.6663, isSouth: true },
  { name: 'Đắk Nông', longitude: 107.6903, latitude: 12.0033, isSouth: true },
  { name: 'Điện Biên', longitude: 103.0211, latitude: 21.3853, isSouth: false },
  { name: 'Đồng Nai', longitude: 106.8400, latitude: 10.9575, isSouth: true },
  { name: 'Đồng Tháp', longitude: 105.6989, latitude: 10.4578, isSouth: true },
  { name: 'Gia Lai', longitude: 108.0075, latitude: 13.9823, isSouth: true },
  { name: 'Hà Giang', longitude: 104.9836, latitude: 22.8233, isSouth: false },
  { name: 'Hà Nam', longitude: 105.9242, latitude: 20.5461, isSouth: false },
  { name: 'Hà Tĩnh', longitude: 105.9019, latitude: 18.3431, isSouth: false },
  { name: 'Hải Dương', longitude: 106.3146, latitude: 20.9389, isSouth: false },
  { name: 'Hậu Giang', longitude: 105.6378, latitude: 9.7844, isSouth: true },
  { name: 'Hòa Bình', longitude: 105.3375, latitude: 20.8175, isSouth: false },
  { name: 'Hưng Yên', longitude: 106.0514, latitude: 20.6464, isSouth: false },
  { name: 'Khánh Hòa', longitude: 109.1967, latitude: 12.2472, isSouth: true },
  { name: 'Kiên Giang', longitude: 105.0809, latitude: 9.9614, isSouth: true },
  { name: 'Kon Tum', longitude: 108.0001, latitude: 14.3501, isSouth: true },
  { name: 'Lai Châu', longitude: 103.4601, latitude: 22.3881, isSouth: false },
  { name: 'Lâm Đồng (Đà Lạt)', longitude: 108.4419, latitude: 11.9404, isSouth: true },
  { name: 'Lạng Sơn', longitude: 106.7614, latitude: 21.8525, isSouth: false },
  { name: 'Lào Cai', longitude: 103.9714, latitude: 22.4856, isSouth: false },
  { name: 'Long An', longitude: 106.4061, latitude: 10.5338, isSouth: true },
  { name: 'Nam Định', longitude: 106.1631, latitude: 20.4286, isSouth: false },
  { name: 'Nghệ An', longitude: 105.6813, latitude: 18.6734, isSouth: false },
  { name: 'Ninh Bình', longitude: 105.9750, latitude: 20.2528, isSouth: false },
  { name: 'Ninh Thuận', longitude: 108.9881, latitude: 11.5683, isSouth: true },
  { name: 'Phú Thọ', longitude: 105.2201, latitude: 21.3236, isSouth: false },
  { name: 'Phú Yên', longitude: 109.3001, latitude: 13.0883, isSouth: true },
  { name: 'Quảng Bình', longitude: 106.6214, latitude: 17.4739, isSouth: false },
  { name: 'Quảng Nam', longitude: 108.3381, latitude: 15.5428, isSouth: true },
  { name: 'Quảng Ngãi', longitude: 108.8001, latitude: 15.1201, isSouth: true },
  { name: 'Quảng Ninh', longitude: 107.0801, latitude: 20.9501, isSouth: false },
  { name: 'Quảng Trị', longitude: 107.1001, latitude: 16.7401, isSouth: false }, // Vĩ tuyến 17 chia cắt
  { name: 'Sóc Trăng', longitude: 105.9701, latitude: 9.6001, isSouth: true },
  { name: 'Sơn La', longitude: 103.9201, latitude: 21.3301, isSouth: false },
  { name: 'Tây Ninh', longitude: 106.1001, latitude: 11.3101, isSouth: true },
  { name: 'Thái Bình', longitude: 106.3301, latitude: 20.4501, isSouth: false },
  { name: 'Thái Nguyên', longitude: 105.8481, latitude: 21.5939, isSouth: false },
  { name: 'Thanh Hóa', longitude: 105.7701, latitude: 19.8001, isSouth: false },
  { name: 'Thừa Thiên Huế', longitude: 107.5908, latitude: 16.4637, isSouth: true }, // Huế thuộc miền Nam thời kỳ 54-75
  { name: 'Tiền Giang', longitude: 106.3639, latitude: 10.3608, isSouth: true },
  { name: 'Trà Vinh', longitude: 106.3401, latitude: 9.9301, isSouth: true },
  { name: 'Tuyên Quang', longitude: 105.2101, latitude: 21.8201, isSouth: false },
  { name: 'Vĩnh Long', longitude: 105.9739, latitude: 10.2508, isSouth: true },
  { name: 'Vĩnh Phúc', longitude: 105.6067, latitude: 21.3089, isSouth: false },
  { name: 'Yên Bái', longitude: 104.8739, latitude: 21.7008, isSouth: false },
];

/**
 * Tra cứu múi giờ lịch sử chính thức tại Việt Nam
 * 
 * Lịch sử múi giờ Việt Nam:
 * 1. Trước 01/07/1906: Saigon LMT (Lấy xấp xỉ UTC+7)
 * 2. 01/07/1906 - 31/12/1911: UTC +7:06:40 (Lấy UTC+7)
 * 3. 01/01/1912 - 31/12/1942: UTC+7
 * 4. 01/01/1943 - 14/03/1945: UTC+8 (Giờ thuộc chính quyền Vichy / Nhật)
 * 5. 15/03/1945 - 31/08/1945: UTC+9 (Giờ Nhật Bản)
 * 6. 01/09/1945 - 31/05/1947: UTC+7
 * 7. 01/06/1947 - 31/12/1954:
 *    - Miền Bắc tự do (DRV): UTC+7
 *    - Vùng Pháp chiếm đóng (Hà Nội, Sài Gòn...): UTC+8. Để đơn giản & an toàn, ta lấy UTC+8 cho miền Nam và UTC+7 cho miền Bắc.
 * 8. 01/01/1955 - 31/12/1959: UTC+7 cả nước (Hiệp định Giơ-nevơ)
 * 9. 01/01/1960 - 30/04/1975:
 *    - Miền Bắc (DRV): UTC+7
 *    - Miền Nam (RVN): UTC+8 (Bắt đầu từ 01/07/1959 hoặc 01/01/1960 tùy nguồn, chuẩn IANA là từ 01/07/1959)
 * 10. Từ 01/05/1975: UTC+7 cả nước thống nhất.
 */
export function getVietnamHistoricalTimezone(
  year: number,
  month: number,
  day: number,
  isSouth: boolean
): number {
  const dateValue = year * 10000 + month * 100 + day;

  // 10. Sau ngày Giải phóng miền Nam 30/04/1975 -> UTC+7 cả nước
  if (dateValue > 19750430) {
    return 7;
  }

  // 9. Thời kỳ chia cắt 1960 (hoặc giữa 1959) - 1975
  if (dateValue >= 19590701 && dateValue <= 19750430) {
    return isSouth ? 8 : 7;
  }

  // 8. Sau Hiệp định Giơ-nevơ 1954 - 1959
  if (dateValue >= 19540721 && dateValue < 19590701) {
    return 7;
  }

  // 7. Giai đoạn 1947 - 1954
  if (dateValue >= 19470601 && dateValue < 19540721) {
    // Sài Gòn/Miền Nam Pháp đóng quân dùng UTC+8, vùng kháng chiến dùng UTC+7
    return isSouth ? 8 : 7;
  }

  // 6. Sau Cách mạng tháng Tám
  if (dateValue >= 19450902 && dateValue < 19470601) {
    return 7;
  }

  // 5. Nhật đảo chính Pháp (Giờ Nhật Bản)
  if (dateValue >= 19450314 && dateValue < 19450902) {
    return 9;
  }

  // 4. Thời kỳ thế chiến 2
  if (dateValue >= 19430101 && dateValue < 19450314) {
    return 8;
  }

  // Mặc định cho giai đoạn trước đó
  return 7;
}
