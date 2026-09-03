/**
 * BirthForm.tsx — Form nhập thông tin sinh với hiệu chỉnh thiên văn học nâng cao
 * - Hỗ trợ nhập giờ chính xác (Giờ/Phút) hoặc giờ Địa Chi truyền thống
 * - Hỗ trợ chọn Tỉnh/Thành phố sinh hoặc tự nhập kinh độ để tính Giờ Mặt Trời Thực
 */
import React, { useState } from 'react';
import { VIETNAM_CITIES } from '../core/calendar/AstronomicalData';

export interface BirthInfo {
  day: number;
  month: number;
  year: number;
  gender: 'male' | 'female';
  hourMode: 'exact' | 'chi';
  hourIndex?: number;
  exactHour?: number;
  exactMinute?: number;
  birthPlace: string;
  customLongitude?: number;
  /** Quy tắc an sao tháng nhuận — mặc định 'first_half' (nửa đầu→tháng trước) */
  leapMonthMode?: 'first_half' | 'prev' | 'next';
}

interface BirthFormProps {
  onSubmit: (info: BirthInfo) => void;
  isLoading?: boolean;
}

// Các mẫu nhanh để người dùng thử khám phá
const QUICK_FILLS = [
  { label: '1/1/1990', day: 1, month: 1, year: 1990, hourMode: 'chi' as const, hourIndex: 6, birthPlace: 'Hà Nội' },
  { label: '15/4/1968 (Sài Gòn)', day: 15, month: 4, year: 1968, hourMode: 'exact' as const, exactHour: 0, exactMinute: 30, birthPlace: 'TP. Hồ Chí Minh' },
  { label: '20/3/2000 (Múi giờ thực)', day: 20, month: 3, year: 2000, hourMode: 'exact' as const, exactHour: 10, exactMinute: 50, birthPlace: 'Đà Nẵng' },
];

const HOUR_OPTIONS = [
  { value: 0, label: 'Tý (23:00–01:00)' },
  { value: 1, label: 'Sửu (01:00–03:00)' },
  { value: 2, label: 'Dần (03:00–05:00)' },
  { value: 3, label: 'Mão (05:00–07:00)' },
  { value: 4, label: 'Thìn (07:00–09:00)' },
  { value: 5, label: 'Tỵ (09:00–11:00)' },
  { value: 6, label: 'Ngọ (11:00–13:00)' },
  { value: 7, label: 'Mùi (13:00–15:00)' },
  { value: 8, label: 'Thân (15:00–17:00)' },
  { value: 9, label: 'Dậu (17:00–19:00)' },
  { value: 10, label: 'Tuất (19:00–21:00)' },
  { value: 11, label: 'Hợi (21:00–23:00)' },
];

export const BirthForm: React.FC<BirthFormProps> = ({ onSubmit, isLoading }) => {
  const [day, setDay] = useState<string>('');
  const [month, setMonth] = useState<string>('');
  const [year, setYear] = useState<string>('');
  
  // Trạng thái cấu hình Giờ sinh
  const [hourMode, setHourMode] = useState<'exact' | 'chi'>('chi');
  const [hourIndex, setHourIndex] = useState<number>(6);
  const [exactHour, setExactHour] = useState<string>('12');
  const [exactMinute, setExactMinute] = useState<string>('0');
  
  // Trạng thái cấu hình Nơi sinh
  const [birthPlace, setBirthPlace] = useState<string>('Hà Nội');
  // Quy tắc an sao tháng nhuận (Giai đoạn 2)
  const [leapMonthMode, setLeapMonthMode] = useState<'first_half' | 'prev' | 'next'>('first_half');
  const [customLongitude, setCustomLongitude] = useState<string>('105.0');
  
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [error, setError] = useState<string>('');

  // Sắp xếp các tỉnh thành theo tên để hiển thị đẹp mắt
  const sortedCities = [...VIETNAM_CITIES].sort((a, b) => a.name.localeCompare(b.name, 'vi'));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const d = parseInt(day);
    const m = parseInt(month);
    const y = parseInt(year);

    if (isNaN(d) || isNaN(m) || isNaN(y)) {
      setError('Vui lòng nhập ngày tháng năm hợp lệ.');
      return;
    }
    if (d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > 2100) {
      setError('Ngày tháng năm sinh ngoài giới hạn (Năm từ 1900–2100).');
      return;
    }

    let h = 12;
    let min = 0;

    if (hourMode === 'exact') {
      h = parseInt(exactHour);
      min = parseInt(exactMinute);
      if (isNaN(h) || isNaN(min) || h < 0 || h > 23 || min < 0 || min > 59) {
        setError('Vui lòng nhập giờ (0–23) và phút (0–59) hợp lệ.');
        return;
      }
    }

    let longitudeVal = 105.0;
    if (birthPlace === 'manual') {
      longitudeVal = parseFloat(customLongitude);
      if (isNaN(longitudeVal) || longitudeVal < -180 || longitudeVal > 180) {
        setError('Vui lòng nhập kinh độ hợp lệ (-180° đến 180°).');
        return;
      }
    }

    onSubmit({
      day: d,
      month: m,
      year: y,
      gender,
      hourMode,
      hourIndex: hourMode === 'chi' ? hourIndex : undefined,
      exactHour: hourMode === 'exact' ? h : undefined,
      exactMinute: hourMode === 'exact' ? min : undefined,
      birthPlace,
      customLongitude: birthPlace === 'manual' ? longitudeVal : undefined,
      leapMonthMode,
    });
  };

  const handleQuickFill = (q: typeof QUICK_FILLS[0]) => {
    setDay(String(q.day));
    setMonth(String(q.month));
    setYear(String(q.year));
    setHourMode(q.hourMode);
    
    if (q.hourMode === 'chi') {
      setHourIndex(q.hourIndex ?? 6);
    } else {
      setExactHour(String(q.exactHour ?? 12));
      setExactMinute(String(q.exactMinute ?? 0));
    }
    
    setBirthPlace(q.birthPlace);
  };

  return (
    <div id="birth-form-container" className="max-w-[1200px] mx-auto w-full px-0">
      <div className="glass-card-gold relative overflow-hidden p-6 sm:p-8 md:p-10">
        <div className="relative z-10">
          <div className="mb-6 sm:mb-8 flex flex-col gap-4">
            <div className="section-kicker w-fit">Sổ Khai Mệnh</div>

            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-[700px]">
                <h3 className="text-2xl sm:text-3xl font-semibold text-gold mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
                  Nhập thông tin bản mệnh
                </h3>
                <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                  Cơ chế tính toán thiên văn chính xác cao: hiệu chỉnh lịch sử múi giờ Việt Nam và Phương trình thời gian của Trái Đất để xác định Giờ Mặt Trời Thực tế.
                </p>
              </div>

              <div className="text-sm text-white/60 xl:max-w-[320px] xl:text-right">
                Toàn bộ tính toán an sao thực hiện ngoại tuyến 100% bảo mật trên thiết bị.
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-white/78">Xem mẫu lá số điển hình</p>
                <p className="text-xs text-white/45 mt-1">Chọn mẫu để thử nghiệm tính năng hiệu chỉnh múi giờ lịch sử hoặc ranh giới giờ sinh.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {QUICK_FILLS.map((q) => (
                  <button
                    key={q.label}
                    type="button"
                    onClick={() => handleQuickFill(q)}
                    className="text-xs px-2.5 py-1.5 rounded bg-white/[0.03] border border-white/5 hover:border-gold/30 hover:bg-white/[0.06] text-white/70 hover:text-gold transition-all"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.95fr] gap-6 md:gap-8">
              {/* CỘT 1: NGÀY SINH DƯƠNG LỊCH & ĐỊA ĐIỂM SINH */}
              <section className="space-y-6 py-1">
                <div>
                  <p className="text-base sm:text-lg font-medium text-white/90">1. Thông tin ngày sinh dương lịch</p>
                  <p className="text-sm text-white/50 mt-1">Nhập đúng ngày tháng năm dương lịch ghi trên giấy tờ.</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="label" htmlFor="input-day">Ngày</label>
                    <input
                      id="input-day"
                      type="number"
                      min="1"
                      max="31"
                      placeholder="DD"
                      className="input min-h-[3rem]"
                      value={day}
                      onChange={e => setDay(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="label" htmlFor="input-month">Tháng</label>
                    <input
                      id="input-month"
                      type="number"
                      min="1"
                      max="12"
                      placeholder="MM"
                      className="input min-h-[3rem]"
                      value={month}
                      onChange={e => setMonth(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="label" htmlFor="input-year">Năm</label>
                    <input
                      id="input-year"
                      type="number"
                      min="1900"
                      max="2100"
                      placeholder="YYYY"
                      className="input min-h-[3rem]"
                      value={year}
                      onChange={e => setYear(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* ĐỊA ĐIỂM SINH (MỚI) */}
                <div className="pt-2">
                  <div className="flex flex-col gap-1 mb-2.5">
                    <label className="label mb-0" htmlFor="input-place">Nơi sinh (Tỉnh/Thành phố)</label>
                    <p className="text-xs text-white/45">Kinh độ nơi sinh trực tiếp quyết định sự chính xác của giờ sinh.</p>
                  </div>
                  <select
                    id="input-place"
                    className="input min-h-[3rem]"
                    value={birthPlace}
                    onChange={e => setBirthPlace(e.target.value)}
                  >
                    <option value="none">Không hiệu chỉnh (Lấy mặc định múi giờ 105°E)</option>
                    <option value="manual">Tự nhập kinh độ thủ công...</option>
                    <optgroup label="Tỉnh/Thành phố tại Việt Nam">
                      {sortedCities.map(c => (
                        <option key={c.name} value={c.name}>{c.name} ({c.longitude.toFixed(2)}°E)</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {birthPlace === 'manual' && (
                  <div className="animate-fade-down">
                    <label className="label animate-fade" htmlFor="input-longitude">Nhập kinh độ Đông (°E)</label>
                    <input
                      id="input-longitude"
                      type="number"
                      step="0.0001"
                      min="-180"
                      max="180"
                      placeholder="Ví dụ: 105.85"
                      className="input min-h-[3rem] w-full"
                      value={customLongitude}
                      onChange={e => setCustomLongitude(e.target.value)}
                      required
                    />
                  </div>
                )}

                {/* Quy tắc an sao tháng nhuận (Giai đoạn 2) */}
                <div className="animate-fade-down">
                  <label className="label animate-fade" htmlFor="select-leap-month-mode">
                    Quy tắc an sao tháng nhuận
                  </label>
                  <select
                    id="select-leap-month-mode"
                    className="input"
                    value={leapMonthMode}
                    onChange={e => setLeapMonthMode(e.target.value as 'first_half' | 'prev' | 'next')}
                  >
                    <option value="first_half">Chuẩn phổ biến: ngày 1–15 nhuận → tháng trước, ngày 16+ → tháng sau</option>
                    <option value="prev">Cả tháng nhuận → tháng trước</option>
                    <option value="next">Cả tháng nhuận → tháng sau</option>
                  </select>
                  <p className="text-xs text-white/40 mt-1">
                    Chỉ áp dụng khi sinh vào tháng nhuận âm lịch. Lá số hiển thị tháng nhuận thật;
                    quy tắc này quyết định tháng dùng để an sao.
                  </p>
                </div>

                {/* Hộp giải thích học thuật */}
                <div className="relative rounded-lg border border-gold/12 bg-gold/[0.03] p-4 pl-5.5 text-xs text-white/60 space-y-2 leading-relaxed overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gold via-gold/50 to-transparent" />
                  <p className="font-semibold text-gold flex items-center gap-1.5">
                    <span>💡</span> Tại Sao Nơi Sinh Lại Quan Trọng?
                  </p>
                  <p>
                    Mỗi múi giờ hành chính có biên độ trải rộng tới 15 độ kinh độ. Tuy nhiên, thuật toán Tử Vi chuẩn cần lấy <strong>Giờ Mặt Trời Thực tế</strong> của nơi bạn cất tiếng khóc chào đời. Sự chênh lệch kinh độ và chuyển động elip của Trái Đất (Equation of Time) có thể làm lệch tới 30 phút, gây đổi giờ Địa Chi nếu sinh sát biên giới cung giờ.
                  </p>
                  <p>
                    Đồng thời, hệ thống tự động quy đổi múi giờ lịch sử (ví dụ: Miền Nam trước 1975 đổi từ UTC+8 về UTC+7), tránh sai số lập mệnh bàn cực kỳ phổ biến.
                  </p>
                </div>
              </section>

              {/* CỘT 2: GIỜ SINH & GIỚI TÍNH */}
              <section className="space-y-6 py-1">
                <div>
                  <p className="text-base sm:text-lg font-medium text-white/90">2. Giờ sinh và âm dương bản mệnh</p>
                  <p className="text-sm text-white/50 mt-1">Phần này ảnh hưởng trực tiếp tới Mệnh, Thân và Tứ Hóa.</p>
                </div>

                <div className="space-y-5">
                  {/* Tabs chọn chế độ nhập giờ */}
                  <div>
                    <label className="label">Chế độ nhập giờ</label>
                    <div className="grid grid-cols-2 gap-2 bg-white/[0.02] p-1 rounded border border-white/5">
                      <button
                        type="button"
                        onClick={() => setHourMode('chi')}
                        className={`py-2 text-xs font-medium rounded transition-all ${
                          hourMode === 'chi' ? 'bg-gold/15 text-gold border border-gold/20' : 'text-white/60 hover:text-white/90 border border-transparent'
                        }`}
                      >
                        Giờ Địa Chi (Tý..Hợi)
                      </button>
                      <button
                        type="button"
                        onClick={() => setHourMode('exact')}
                        className={`py-2 text-xs font-medium rounded transition-all ${
                          hourMode === 'exact' ? 'bg-gold/15 text-gold border border-gold/20' : 'text-white/60 hover:text-white/90 border border-transparent'
                        }`}
                      >
                        Giờ & Phút chính xác
                      </button>
                    </div>
                  </div>

                  {hourMode === 'chi' ? (
                    <div className="animate-fade">
                      <label className="label" htmlFor="input-hour">Giờ Sinh</label>
                      <select
                        id="input-hour"
                        className="input min-h-[3rem]"
                        value={hourIndex}
                        onChange={e => setHourIndex(parseInt(e.target.value))}
                      >
                        {HOUR_OPTIONS.map(h => (
                          <option key={h.value} value={h.value}>{h.label}</option>
                        ))}
                      </select>
                      <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
                        *Nếu chỉ nhớ giờ Địa Chi, hệ thống sẽ sử dụng điểm giữa của giờ Địa Chi đó (ví dụ: giờ Ngọ lấy 12:00) để tiến hành hiệu chỉnh kinh độ và thiên văn học.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 animate-fade">
                      <div>
                        <label className="label" htmlFor="input-exact-hour">Giờ (0 - 23)</label>
                        <input
                          id="input-exact-hour"
                          type="number"
                          min="0"
                          max="23"
                          placeholder="Giờ"
                          className="input min-h-[3rem]"
                          value={exactHour}
                          onChange={e => setExactHour(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="label" htmlFor="input-exact-minute">Phút (0 - 59)</label>
                        <input
                          id="input-exact-minute"
                          type="number"
                          min="0"
                          max="59"
                          placeholder="Phút"
                          className="input min-h-[3rem]"
                          value={exactMinute}
                          onChange={e => setExactMinute(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="label">Giới Tính</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className={`flex items-center gap-3.5 cursor-pointer p-4 rounded-lg border transition-all duration-300 ${
                        gender === 'male' 
                          ? 'bg-gold/8 border-gold/45 text-gold shadow-[0_0_20px_rgba(212,175,55,0.18)]' 
                          : 'bg-white/[0.02] border-white/6 text-white/72 hover:text-white/92 hover:bg-white/[0.04] hover:border-white/12'
                      }`}>
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          className="accent-gold h-4 w-4 shrink-0"
                          checked={gender === 'male'}
                          onChange={() => setGender('male')}
                        />
                        <div>
                          <div className={`font-semibold text-sm ${gender === 'male' ? 'text-gold' : 'text-white/90'}`}>Nam ♂</div>
                          <div className={`text-[11px] mt-0.5 ${gender === 'male' ? 'text-gold/70' : 'text-white/45'}`}>Dương tính bản mệnh</div>
                        </div>
                      </label>

                      <label className={`flex items-center gap-3.5 cursor-pointer p-4 rounded-lg border transition-all duration-300 ${
                        gender === 'female' 
                          ? 'bg-coral/8 border-coral/45 text-coral shadow-[0_0_20px_rgba(185,110,90,0.18)]' 
                          : 'bg-white/[0.02] border-white/6 text-white/72 hover:text-white/92 hover:bg-white/[0.04] hover:border-white/12'
                      }`}>
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          className="accent-coral h-4 w-4 shrink-0"
                          checked={gender === 'female'}
                          onChange={() => setGender('female')}
                        />
                        <div>
                          <div className={`font-semibold text-sm ${gender === 'female' ? 'text-coral' : 'text-white/90'}`}>Nữ ♀</div>
                          <div className={`text-[11px] mt-0.5 ${gender === 'female' ? 'text-coral/70' : 'text-white/45'}`}>Âm tính bản mệnh</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="pt-2 text-sm text-white/68 leading-relaxed">
                    <p className="text-white/86 font-medium mb-1">Quy định giờ Tý</p>
                    <p>
                      Giờ Tý bắt đầu từ <strong>23:00</strong> đêm hôm trước đến <strong>01:00</strong> sáng hôm sau. Nếu sinh sau 23h đêm hành chính, hãy quy đổi ngày dương sang ngày tiếp theo hoặc nhập đúng giờ chính xác (23hXX) để thuật toán tự tính.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {error && (
              <div className="text-sm text-red-300 py-1 bg-red-950/20 px-3 rounded border border-red-900/30">
                ⚠️ {error}
              </div>
            )}

            <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between border-t border-white/5">
              <div className="text-sm text-white/56 leading-relaxed max-w-lg">
                Khi xác nhận, hệ thống sẽ thực hiện chuỗi hiệu chỉnh thiên văn học nâng cao và dựng Mệnh Bàn lập tức.
              </div>

              <button
                type="submit"
                className="btn-primary w-full sm:w-auto min-h-[3.5rem] px-8 text-base relative overflow-hidden"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 rounded-full border-2 border-black/15 border-t-black/60 animate-spin"></span>
                    Đang hiệu chỉnh lập mệnh...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>✨</span>
                    Lập Mệnh Bàn Độ Chính Xác Cao
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
