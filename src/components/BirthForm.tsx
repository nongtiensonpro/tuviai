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
    <div id="birth-form-container" className="max-w-3xl mx-auto w-full px-4 sm:px-0">
      <div className="card p-6 md:p-8">
        {/* Title */}
        <h3 className="text-xl font-bold text-gold mb-2 font-serif-sc flex items-center gap-2">
          <span>📅</span> Nhập Thông Tin Bản Mệnh
        </h3>
        <p className="text-white/50 text-sm mb-6">Điền thông tin ngày sinh để hệ thống an sao lập mệnh bàn chính xác.</p>

        {/* Quick Fill */}
        <div className="flex flex-wrap gap-2 mb-5">
          <span className="text-xs text-white/40 self-center mr-1">Thử nhanh:</span>
          {QUICK_FILLS.map((q) => (
            <button
              key={q.label}
              type="button"
              onClick={() => handleQuickFill(q)}
              className="text-xs px-3 py-1 rounded-full border border-white/15 text-white/60 hover:border-gold/40 hover:text-gold transition-colors"
            >
              {q.label}
            </button>
          ))}
        </div>

        {/* Form layout 2 cột trên md+ */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cột trái: Ngày tháng năm */}
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label" htmlFor="input-day">Ngày</label>
                  <input
                    id="input-day" type="number" min="1" max="31" placeholder="DD"
                    className="input" value={day} onChange={e => setDay(e.target.value)} required
                  />
                </div>
                <div>
                  <label className="label" htmlFor="input-month">Tháng</label>
                  <input
                    id="input-month" type="number" min="1" max="12" placeholder="MM"
                    className="input" value={month} onChange={e => setMonth(e.target.value)} required
                  />
                </div>
                <div>
                  <label className="label" htmlFor="input-year">Năm</label>
                  <input
                    id="input-year" type="number" min="1900" max="2100" placeholder="YYYY"
                    className="input" value={year} onChange={e => setYear(e.target.value)} required
                  />
                </div>
              </div>

              <div>
                <label className="label" htmlFor="input-hour">Giờ Sinh</label>
                <select
                  id="input-hour" className="input"
                  value={hourIndex} onChange={e => setHourIndex(parseInt(e.target.value))}
                >
                  {HOUR_OPTIONS.map(h => (
                    <option key={h.value} value={h.value}>{h.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cột phải: Giới tính + Gợi ý */}
            <div className="space-y-4">
              <div>
                <label className="label">Giới Tính</label>
                <div className="flex gap-3">
                  <label className={`flex-1 flex items-center gap-3 cursor-pointer p-4 rounded-lg border transition-all ${gender === 'male' ? 'border-gold/60 bg-gold/5 shadow-[0_0_12px_rgba(240,192,64,0.1)]' : 'border-white/10 hover:border-white/25'}`}>
                    <input type="radio" name="gender" value="male" className="accent-gold h-4 w-4"
                      checked={gender === 'male'} onChange={() => setGender('male')} />
                    <div>
                      <div className="font-semibold text-sm">Nam ♂</div>
                      <div className="text-xs text-white/40">Dương</div>
                    </div>
                  </label>
                  <label className={`flex-1 flex items-center gap-3 cursor-pointer p-4 rounded-lg border transition-all ${gender === 'female' ? 'border-coral/60 bg-coral/5 shadow-[0_0_12px_rgba(255,107,107,0.1)]' : 'border-white/10 hover:border-white/25'}`}>
                    <input type="radio" name="gender" value="female" className="h-4 w-4"
                      checked={gender === 'female'} onChange={() => setGender('female')} />
                    <div>
                      <div className="font-semibold text-sm">Nữ ♀</div>
                      <div className="text-xs text-white/40">Âm</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Tip box */}
              <div className="bg-white/3 border border-white/8 rounded-lg p-4 text-xs text-white/50 leading-relaxed">
                <p className="text-white/70 font-semibold mb-1">💡 Lưu ý giờ sinh</p>
                <p>Giờ Tý bắt đầu lúc 23:00 đêm hôm trước. Nếu sinh lúc 23h thì chọn giờ <strong className="text-white/80">Tý</strong>, không phải giờ ngày hôm đó.</p>
              </div>
            </div>
          </div>

          {error && <div className="text-red-400 text-sm mt-4 bg-red-900/20 px-4 py-2 rounded">{error}</div>}

          <button
            type="submit"
            className="btn-primary w-full mt-6 h-13 text-base relative overflow-hidden"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin"></span>
                Đang an sao tính toán...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>✨</span> An Sao Lập Mệnh Bàn
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
