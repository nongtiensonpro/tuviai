/**
 * BirthForm.tsx — Form nhập thông tin sinh với layout cải tiến
 * - Desktop: 2 cột (Form bên trái, hướng dẫn bên phải)
 * - Nút Quick Fill để xem thử với năm mẫu
 */
import React, { useState } from 'react';

export interface BirthInfo {
  day: number;
  month: number;
  year: number;
  hourIndex: number; // 0..11 tương ứng Tý..Hợi
  gender: 'male' | 'female';
}

interface BirthFormProps {
  onSubmit: (info: BirthInfo) => void;
  isLoading?: boolean;
}

// Các mẫu nhanh để người dùng thử khám phá
const QUICK_FILLS = [
  { label: '1/1/1990', day: 1, month: 1, year: 1990, hourIndex: 6 },
  { label: '15/7/1995', day: 15, month: 7, year: 1995, hourIndex: 4 },
  { label: '20/3/2000', day: 20, month: 3, year: 2000, hourIndex: 2 },
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
  const [hourIndex, setHourIndex] = useState<number>(6);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [error, setError] = useState<string>('');

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

    onSubmit({ day: d, month: m, year: y, hourIndex, gender });
  };

  const handleQuickFill = (q: typeof QUICK_FILLS[0]) => {
    setDay(String(q.day));
    setMonth(String(q.month));
    setYear(String(q.year));
    setHourIndex(q.hourIndex);
  };

  return (
    <div id="birth-form-container" className="max-w-[1200px] mx-auto w-full px-0">
      <div className="relative overflow-hidden p-3 sm:p-4 md:p-5">
        <div className="relative z-10">
          <div className="mb-6 sm:mb-8 flex flex-col gap-4">
            <div className="section-kicker w-fit">Sổ Khai Mệnh</div>

            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-[700px]">
                <h3 className="text-2xl sm:text-3xl font-semibold text-gold mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
                  Nhập thông tin bản mệnh
                </h3>
                <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                  Bắt đầu bằng ngày sinh dương lịch, giờ sinh và giới tính để hệ thống an sao lập mệnh bàn chính xác trên chính thiết bị của bạn.
                </p>
              </div>

              <div className="text-sm text-white/60 xl:max-w-[320px] xl:text-right">
                Dữ liệu dùng cục bộ để lập lá số, không gửi lên máy chủ riêng.
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-white/78">Điền thử bằng mẫu có sẵn</p>
                <p className="text-xs text-white/45 mt-1">Phù hợp khi bạn muốn khám phá nhanh giao diện trước khi nhập dữ liệu thật.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_FILLS.map((q) => (
                  <button
                    key={q.label}
                    type="button"
                    onClick={() => handleQuickFill(q)}
                    className="text-xs px-0 py-1 text-white/55 hover:text-gold transition-colors"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.95fr] gap-5 md:gap-6">
              <section className="py-1">
                <div className="mb-5">
                  <p className="text-base sm:text-lg font-medium text-white/90">Ngày sinh dương lịch</p>
                  <p className="text-sm text-white/50 mt-1">Nhập đúng ngày tháng năm trên giấy tờ hoặc theo lịch dương bạn đang dùng.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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

                  <div className="col-span-2 sm:col-span-1">
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

                <div className="mt-4 text-xs sm:text-sm text-white/46 leading-relaxed">
                  Năm sinh hiện được hỗ trợ trong khoảng <strong className="text-white/80">1900-2100</strong>. Nếu bạn cần thử nghiệm giao diện, có thể dùng các mẫu nhanh phía trên.
                </div>
              </section>

              <section className="py-1">
                <div className="mb-5">
                  <p className="text-base sm:text-lg font-medium text-white/90">Giờ sinh và âm dương</p>
                  <p className="text-sm text-white/50 mt-1">Phần này ảnh hưởng trực tiếp tới vị trí sao và cách luận giải trọng tâm.</p>
                </div>

                <div className="space-y-5">
                  <div>
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
                  </div>

                  <div>
                    <label className="label">Giới Tính</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className={`flex items-center gap-3 cursor-pointer py-3 transition-colors ${gender === 'male' ? 'text-gold' : 'text-white/72 hover:text-white/92'}`}>
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          className="accent-gold h-4 w-4"
                          checked={gender === 'male'}
                          onChange={() => setGender('male')}
                        />
                        <div>
                          <div className={`font-semibold text-sm ${gender === 'male' ? 'text-gold' : 'text-white/90'}`}>Nam ♂</div>
                          <div className={`text-xs ${gender === 'male' ? 'text-gold/70' : 'text-white/45'}`}>Thiên hướng dương</div>
                        </div>
                      </label>

                      <label className={`flex items-center gap-3 cursor-pointer py-3 transition-colors ${gender === 'female' ? 'text-coral' : 'text-white/72 hover:text-white/92'}`}>
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          className="h-4 w-4"
                          checked={gender === 'female'}
                          onChange={() => setGender('female')}
                        />
                        <div>
                          <div className={`font-semibold text-sm ${gender === 'female' ? 'text-coral' : 'text-white/90'}`}>Nữ ♀</div>
                          <div className={`text-xs ${gender === 'female' ? 'text-coral/70' : 'text-white/45'}`}>Thiên hướng âm</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="pt-2 text-sm text-white/68 leading-relaxed">
                    <p className="text-white/86 font-medium mb-1">Lưu ý về giờ Tý</p>
                    <p>
                      Giờ Tý bắt đầu từ <strong className="text-gold">23:00</strong> đêm hôm trước. Nếu sinh lúc 23h, hãy chọn giờ <strong className="text-white/90">Tý</strong> thay vì tính sang ngày mới.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {error && (
              <div className="text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-white/56 leading-relaxed">
                Khi sẵn sàng, hệ thống sẽ lập mệnh bàn ngay và cuộn xuống khu vực kết quả.
              </div>

              <button
                type="submit"
                className="btn-primary w-full sm:w-auto min-h-[3.5rem] px-6 text-base relative overflow-hidden"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 rounded-full border-2 border-black/15 border-t-black/60 animate-spin"></span>
                    Đang an sao tính toán...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>✨</span>
                    An Sao Lập Mệnh Bàn
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
