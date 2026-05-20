/**
 * LunarConverter.ts — Chuyển đổi Dương lịch ↔ Âm lịch + Can Chi
 * Sử dụng thư viện @dqcai/vn-lunar (dựa trên thuật toán Hồ Ngọc Đức)
 * API thực tế: getLunarDate(day, month, year) → LunarDate { day, month, year, leap }
 * Xem: .agents/skills/ziwei-algorithm/SKILL.md §1, §2
 */

import { getLunarDate } from '@dqcai/vn-lunar';
import type {
  SolarDate, LunarDate, CanChi, NamCanChi,
  TenCan, TwoelveChi
} from '../types/ZiweiTypes';
import { TEN_CAN, TWELVE_CHI } from '../types/ZiweiTypes';

// ============================================================
// GIỜ SINH → ĐỊA CHI
// ============================================================

/**
 * Chuyển giờ 24h → index Địa Chi giờ (0=Tý, 1=Sửu, ..., 11=Hợi)
 * Tý: 23:00-00:59, Sửu: 01:00-02:59, ...
 */
export function hourToChiIndex(hour: number): number {
  if (hour === 23) return 0; // Giờ Tý bắt đầu từ 23h
  return Math.floor((hour + 1) / 2);
}

// ============================================================
// BẢNG CAN THÁNG THEO CAN NĂM
// ============================================================

/**
 * Can bắt đầu của tháng Dần theo Can năm
 * Giáp/Kỷ → Dần=Bính(2), Ất/Canh → Dần=Mậu(4),
 * Bính/Tân → Dần=Canh(6), Đinh/Nhâm → Dần=Nhâm(8), Mậu/Quý → Dần=Giáp(0)
 */
const MONTH_CAN_START: Record<number, number> = {
  0: 2,  // Giáp → Bính
  1: 4,  // Ất   → Mậu
  2: 6,  // Bính → Canh
  3: 8,  // Đinh → Nhâm
  4: 0,  // Mậu  → Giáp
  5: 2,  // Kỷ   → Bính
  6: 4,  // Canh → Mậu
  7: 6,  // Tân  → Canh
  8: 8,  // Nhâm → Nhâm
  9: 0,  // Quý  → Giáp
};

// ============================================================
// HÀM CHUYỂN ĐỔI CHÍNH
// ============================================================

/**
 * Chuyển ngày Dương lịch sang Âm lịch
 * @param solar - Thông tin ngày giờ sinh theo Dương lịch
 * @returns LunarDate đầy đủ thông tin
 */
export function solarToLunar(solar: SolarDate): LunarDate {
  let adjustedSolar = { ...solar };
  let isEarlyZiAdjusted = false;

  // Giờ Tý sớm bắt đầu từ 23:00 đến 23:59
  // Mặc định earlyZiMode là 'next_day' nếu không được truyền vào
  if (solar.hour === 23 && solar.earlyZiMode !== 'same_day') {
    const jsDate = new Date(solar.year, solar.month - 1, solar.day);
    jsDate.setDate(jsDate.getDate() + 1);
    adjustedSolar.day = jsDate.getDate();
    adjustedSolar.month = jsDate.getMonth() + 1;
    adjustedSolar.year = jsDate.getFullYear();
    isEarlyZiAdjusted = true;
  }

  // API thực tế của @dqcai/vn-lunar
  const lunar = getLunarDate(adjustedSolar.day, adjustedSolar.month, adjustedSolar.year);

  const hourChiIndex = hourToChiIndex(solar.hour);
  const hourChi = TWELVE_CHI[hourChiIndex] as TwoelveChi;

  return {
    day: lunar.day,
    month: lunar.month,
    year: lunar.year,
    isLeap: lunar.leap,
    hourChi,
    hourChiIndex,
    isEarlyZiAdjusted,
  };
}

/**
 * Tính Thiên Can + Địa Chi của năm âm lịch
 * Chu kỳ 60 năm, gốc Giáp Tý = 1924
 */
export function getYearCanChi(lunarYear: number): CanChi {
  const offset = ((lunarYear - 1924) % 60 + 60) % 60;
  const canIndex = offset % 10;
  const chiIndex = offset % 12;

  return {
    can: TEN_CAN[canIndex] as TenCan,
    chi: TWELVE_CHI[chiIndex] as TwoelveChi,
    canIndex,
    chiIndex,
  };
}

/**
 * Tính Thiên Can + Địa Chi cho tháng âm lịch
 */
export function getMonthCanChi(lunarMonth: number, yearCanIndex: number): CanChi {
  // Địa Chi tháng: Dần(2) = Tháng 1, Mão(3) = Tháng 2, ..., Sửu(1) = Tháng 12
  const monthChiIndex = (lunarMonth + 1) % 12;
  const monthCanStart = MONTH_CAN_START[yearCanIndex] ?? 0;
  const monthCanIndex = (monthCanStart + lunarMonth - 1) % 10;

  return {
    can: TEN_CAN[monthCanIndex] as TenCan,
    chi: TWELVE_CHI[monthChiIndex] as TwoelveChi,
    canIndex: monthCanIndex,
    chiIndex: monthChiIndex,
  };
}

/**
 * Xây dựng NamCanChi với displayName tiện dụng
 */
export function getNamCanChi(lunarYear: number): NamCanChi {
  const canChi = getYearCanChi(lunarYear);
  return {
    ...canChi,
    displayName: `${canChi.can} ${canChi.chi}`,
  };
}

/**
 * Tính Thiên Can và index của Cung Mệnh
 * Cung Dần theo Can năm, rồi cộng offset đến vị trí cung Mệnh
 */
export function getCungMenhCan(
  menhChiIndex: number,
  yearCanIndex: number
): { can: TenCan; canIndex: number } {
  const danCanStart = MONTH_CAN_START[yearCanIndex] ?? 0;
  const offset = (menhChiIndex - 2 + 12) % 12;
  const canIndex = (danCanStart + offset) % 10;

  return {
    can: TEN_CAN[canIndex] as TenCan,
    canIndex,
  };
}

/**
 * Tiện ích: Tên đầy đủ của Giờ sinh
 */
export function getHourName(hourChiIndex: number): string {
  const names = [
    'Tý (23-01h)', 'Sửu (01-03h)', 'Dần (03-05h)', 'Mão (05-07h)',
    'Thìn (07-09h)', 'Tỵ (09-11h)', 'Ngọ (11-13h)', 'Mùi (13-15h)',
    'Thân (15-17h)', 'Dậu (17-19h)', 'Tuất (19-21h)', 'Hợi (21-23h)',
  ];
  return names[hourChiIndex] ?? 'Không xác định';
}
