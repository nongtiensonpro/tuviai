/**
 * SolarTimeCalculator.ts — Bộ tính toán Giờ Mặt Trời Thực (True Solar Time)
 * Công thức kết hợp hiệu chỉnh Kinh độ và Equation of Time (Phương trình thời gian).
 */

import { VIETNAM_CITIES, getVietnamHistoricalTimezone } from './AstronomicalData';
import type { SolarDate } from '../types/ZiweiTypes';

/**
 * Tính số thứ tự ngày trong năm (1 - 366)
 */
export function getDayOfYear(year: number, month: number, day: number): number {
  const date = new Date(year, month - 1, day);
  const start = new Date(year, 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * Tính toán Equation of Time (EOT) bằng phút
 * Công thức xấp xỉ Spencer chất lượng cao
 * @param dayOfYear Ngày thứ bao nhiêu trong năm (1-366)
 */
export function calculateEquationOfTime(dayOfYear: number): number {
  // B ở đơn vị radian
  const B = (360 / 365.24) * (dayOfYear - 81) * (Math.PI / 180);
  
  // EOT = 9.87 * sin(2B) - 7.53 * cos(B) - 1.5 * sin(B) (tính bằng phút)
  const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  
  return eot;
}

export interface TrueSolarTimeResult {
  hour: number;          // Giờ mặt trời thực (0-23)
  minute: number;        // Phút mặt trời thực (0-59)
  dayShift: number;      // Độ dịch chuyển ngày (-1, 0, +1) nếu giờ thực vượt qua ranh giới ngày
  eot: number;           // Chỉ số EOT đã tính (phút)
  longitudeOffset: number; // Chỉ số lệch kinh độ (phút)
  totalOffset: number;   // Tổng hiệu chỉnh (phút)
}

/**
 * Tính Giờ Mặt Trời Thực (True Solar Time) từ Giờ Hành Chính
 * @param year Năm sinh dương lịch
 * @param month Tháng sinh dương lịch (1-12)
 * @param day Ngày sinh dương lịch (1-31)
 * @param hour Giờ sinh hành chính (0-23)
 * @param minute Phút sinh hành chính (0-59)
 * @param longitude Kinh độ nơi sinh (độ Đông)
 * @param timezone Múi giờ hành chính của nơi sinh lúc đó (e.g. +7 hoặc +8)
 */
export function calculateTrueSolarTime(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  longitude: number,
  timezone: number
): TrueSolarTimeResult {
  // 1. Tính toán Equation of Time
  const dayOfYear = getDayOfYear(year, month, day);
  const eot = calculateEquationOfTime(dayOfYear);

  // 2. Tính toán lệch kinh độ (Longitude Offset)
  // Múi giờ chuẩn để đối chiếu kinh độ là timezone hành chính lúc sinh
  const standardMeridian = timezone * 15;
  // Lệch kinh độ: (kinh độ thực tế - kinh độ múi giờ tiêu chuẩn) * 4 phút
  const longitudeOffset = (longitude - standardMeridian) * 4;

  // 3. Tổng chênh lệch phút: Lệch kinh độ + Phương trình thời gian
  const totalOffset = longitudeOffset + eot;

  // 4. Cộng chênh lệch vào giờ hành chính để tìm giờ thực
  const totalMinutes = hour * 60 + minute + totalOffset;

  // Xử lý tràn phút qua các ngày khác
  let finalMinutes = totalMinutes;
  let dayShift = 0;

  if (finalMinutes < 0) {
    dayShift = -1;
    finalMinutes += 24 * 60;
  } else if (finalMinutes >= 24 * 60) {
    dayShift = 1;
    finalMinutes -= 24 * 60;
  }

  // Khóa giá trị trong tầm an toàn
  finalMinutes = (finalMinutes + 24 * 60) % (24 * 60);

  const finalHour = Math.floor(finalMinutes / 60);
  const finalMinute = Math.floor(finalMinutes % 60);

  return {
    hour: finalHour,
    minute: finalMinute,
    dayShift,
    eot,
    longitudeOffset,
    totalOffset,
  };
}

/**
 * Ánh xạ index Địa Chi giờ (0-11) sang giờ trung bình tương ứng (midpoint)
 */
export function getHourFromChiIndex(hourIndex: number): { hour: number; minute: number } {
  const midpoints = [
    { hour: 0, minute: 0 },   // Tý (23:00 - 01:00) -> lấy 00:00
    { hour: 2, minute: 0 },   // Sửu (01:00 - 03:00) -> lấy 02:00
    { hour: 4, minute: 0 },   // Dần (03:00 - 05:00) -> lấy 04:00
    { hour: 6, minute: 0 },   // Mão (05:00 - 07:00) -> lấy 06:00
    { hour: 8, minute: 0 },   // Thìn (07:00 - 09:00) -> lấy 08:00
    { hour: 10, minute: 0 },  // Tỵ (09:00 - 11:00) -> lấy 10:00
    { hour: 12, minute: 0 },  // Ngọ (11:00 - 13:00) -> lấy 12:00
    { hour: 14, minute: 0 },  // Mùi (13:00 - 15:00) -> lấy 14:00
    { hour: 16, minute: 0 },  // Thân (15:00 - 17:00) -> lấy 16:00
    { hour: 18, minute: 0 },  // Dậu (17:00 - 19:00) -> lấy 18:00
    { hour: 20, minute: 0 },  // Tuất (19:00 - 21:00) -> lấy 20:00
    { hour: 22, minute: 0 },  // Hợi (21:00 - 22:59) -> lấy 22:00
  ];
  return midpoints[hourIndex] ?? { hour: 12, minute: 0 };
}

/**
 * Thực hiện toàn bộ chuỗi hiệu chuẩn:
 * 1. Xác định kinh độ và múi giờ hành chính lịch sử.
 * 2. Quy đổi giờ hành chính tại địa phương sang giờ tiêu chuẩn Việt Nam UTC+7.
 * 3. Tính toán Equation of Time và hiệu chỉnh giờ Mặt Trời Thực tế (True Solar Time).
 * 
 * @returns Đối tượng SolarDate chứa toàn bộ thông tin hiệu chuẩn thiên văn
 */
export function calibrateSolarDate(params: {
  year: number;
  month: number;
  day: number;
  hourMode: 'exact' | 'chi';
  hourIndex?: number;
  exactHour?: number;
  exactMinute?: number;
  birthPlace: string; // Tên tỉnh thành hoặc "manual" hoặc "none"
  customLongitude?: number;
}): SolarDate {
  const { year, month, day, hourMode, hourIndex, exactHour, exactMinute, birthPlace, customLongitude } = params;

  // 1. Xác định giờ/phút hành chính ban đầu
  let adminHour = 12;
  let adminMinute = 0;

  if (hourMode === 'exact') {
    adminHour = exactHour ?? 12;
    adminMinute = exactMinute ?? 0;
  } else {
    const time = getHourFromChiIndex(hourIndex ?? 6);
    adminHour = time.hour;
    adminMinute = time.minute;
  }

  // 2. Tra cứu Kinh độ nơi sinh
  let longitude = 105.0; // Mặc định kinh độ múi giờ UTC+7
  let isSouth = false;
  let displayName = 'Không hiệu chỉnh (Mặc định 105°E)';

  if (birthPlace === 'manual') {
    longitude = customLongitude ?? 105.0;
    // Kinh độ từ vĩ tuyến 17 (Huế trở vào Nam) dùng để định danh vùng hành chính
    isSouth = longitude >= 106.0; // Ước lượng thô cho miền Nam nếu tự nhập kinh độ
    displayName = `Tự nhập (${longitude.toFixed(4)}°E)`;
  } else if (birthPlace !== 'none') {
    const city = VIETNAM_CITIES.find(c => c.name === birthPlace);
    if (city) {
      longitude = city.longitude;
      isSouth = city.isSouth;
      displayName = city.name;
    }
  }

  // Nếu không hiệu chỉnh
  if (birthPlace === 'none') {
    return {
      day,
      month,
      year,
      hour: adminHour,
      minute: adminMinute,
      birthPlace: 'Mặc định (Không hiệu chỉnh)',
      longitude: 105.0,
      timezoneUsed: 7,
      eot: 0,
      longitudeOffset: 0,
      totalOffset: 0,
      trueSolarHour: adminHour,
      trueSolarMinute: adminMinute,
      isHistoricalTimezoneApplied: false,
      isTrueSolarTimeApplied: false
    };
  }

  // 3. Tra cứu múi giờ lịch sử tại thời điểm sinh và nơi sinh đó
  const historicalTimezone = getVietnamHistoricalTimezone(year, month, day, isSouth);

  // 4. Quy đổi về giờ UTC chuẩn: UTC = Admin Time - Timezone
  // Dùng Date UTC để tránh các vấn đề múi giờ của máy chạy code
  const dateObj = new Date(Date.UTC(year, month - 1, day, adminHour, adminMinute));
  const utcTimeMs = dateObj.getTime() - (historicalTimezone * 60 * 60 * 1000);
  
  // Quy đổi về giờ tiêu chuẩn Việt Nam UTC+7: VN_Std = UTC + 7
  const vnStdTimeMs = utcTimeMs + (7 * 60 * 60 * 1000);
  const vnStdDate = new Date(vnStdTimeMs);

  const vnStdYear = vnStdDate.getUTCFullYear();
  const vnStdMonth = vnStdDate.getUTCMonth() + 1;
  const vnStdDay = vnStdDate.getUTCDate();
  const vnStdHour = vnStdDate.getUTCHours();
  const vnStdMinute = vnStdDate.getUTCMinutes();

  // Có áp dụng hiệu chỉnh múi giờ lịch sử nếu múi giờ sinh khác +7
  const isHistoricalTimezoneApplied = historicalTimezone !== 7;

  // 5. Tính toán Equation of Time & Kinh độ lệch trong khung giờ chuẩn UTC+7 (kinh tuyến chuẩn 105°E)
  const trueSolarResult = calculateTrueSolarTime(
    vnStdYear,
    vnStdMonth,
    vnStdDay,
    vnStdHour,
    vnStdMinute,
    longitude,
    7 // Múi giờ tham chiếu bây giờ đã là UTC+7
  );

  // 6. Tính toán ngày dương lịch thực tế sau hiệu chỉnh Giờ Mặt Trời Thực
  // Vì trueSolarResult có thể bị dayShift (-1, 0, 1) so với vnStdDate
  let finalYear = vnStdYear;
  let finalMonth = vnStdMonth;
  let finalDay = vnStdDay;

  if (trueSolarResult.dayShift !== 0) {
    const finalDate = new Date(vnStdTimeMs + trueSolarResult.dayShift * 24 * 60 * 60 * 1000);
    finalYear = finalDate.getUTCFullYear();
    finalMonth = finalDate.getUTCMonth() + 1;
    finalDay = finalDate.getUTCDate();
  }

  return {
    day: finalDay,
    month: finalMonth,
    year: finalYear,
    hour: trueSolarResult.hour,
    minute: trueSolarResult.minute,
    
    // Metadata hiệu chỉnh để hiển thị trên UI và truyền cho AI
    birthPlace: displayName,
    longitude,
    timezoneUsed: historicalTimezone,
    eot: trueSolarResult.eot,
    longitudeOffset: trueSolarResult.longitudeOffset,
    totalOffset: trueSolarResult.totalOffset,
    trueSolarHour: trueSolarResult.hour,
    trueSolarMinute: trueSolarResult.minute,
    isHistoricalTimezoneApplied,
    isTrueSolarTimeApplied: true
  };
}
