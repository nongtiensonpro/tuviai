/**
 * BirthForm.tsx
 * Lấy UI từ src/pages/index.astro và đưa vào Component React.
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

export const BirthForm: React.FC<BirthFormProps> = ({ onSubmit, isLoading }) => {
  const [day, setDay] = useState<string>('');
  const [month, setMonth] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [hourIndex, setHourIndex] = useState<number>(6); // Ngọ default
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
      setError('Ngày tháng năm sinh ngoài giới hạn (Năm từ 1900-2100).');
      return;
    }

    onSubmit({ day: d, month: m, year: y, hourIndex, gender });
  };

  return (
    <div id="birth-form-container" className="max-w-lg mx-auto w-full">
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gold mb-6">Nhập Thông Tin Sinh</h3>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {error && <div className="text-red-400 text-sm mb-2">{error}</div>}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label" htmlFor="input-day">Ngày</label>
              <input
                id="input-day" type="number" min="1" max="31" placeholder="DD"
                className="input" value={day} onChange={e => setDay(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="input-month">Tháng</label>
              <input
                id="input-month" type="number" min="1" max="12" placeholder="MM"
                className="input" value={month} onChange={e => setMonth(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="input-year">Năm</label>
              <input
                id="input-year" type="number" min="1900" max="2100" placeholder="YYYY"
                className="input" value={year} onChange={e => setYear(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="input-hour">Giờ Sinh</label>
            <select
              id="input-hour" className="input"
              value={hourIndex} onChange={e => setHourIndex(parseInt(e.target.value))}
            >
              <option value="0">Tý (23:00 - 01:00)</option>
              <option value="1">Sửu (01:00 - 03:00)</option>
              <option value="2">Dần (03:00 - 05:00)</option>
              <option value="3">Mão (05:00 - 07:00)</option>
              <option value="4">Thìn (07:00 - 09:00)</option>
              <option value="5">Tỵ (09:00 - 11:00)</option>
              <option value="6">Ngọ (11:00 - 13:00)</option>
              <option value="7">Mùi (13:00 - 15:00)</option>
              <option value="8">Thân (15:00 - 17:00)</option>
              <option value="9">Dậu (17:00 - 19:00)</option>
              <option value="10">Tuất (19:00 - 21:00)</option>
              <option value="11">Hợi (21:00 - 23:00)</option>
            </select>
          </div>

          <div>
            <label className="label">Giới Tính</label>
            <div className="flex gap-3">
              <label className={`flex-1 flex items-center gap-2 cursor-pointer p-3 rounded-lg border transition-colors ${gender === 'male' ? 'border-gold/50 bg-white/5' : 'border-white/10 hover:border-white/30'}`}>
                <input
                  type="radio" name="gender" value="male" className="accent-gold h-4 w-4"
                  checked={gender === 'male'} onChange={() => setGender('male')}
                />
                <span>Nam</span>
              </label>
              <label className={`flex-1 flex items-center gap-2 cursor-pointer p-3 rounded-lg border transition-colors ${gender === 'female' ? 'border-gold/50 bg-white/5' : 'border-white/10 hover:border-white/30'}`}>
                <input
                  type="radio" name="gender" value="female" className="accent-gold h-4 w-4"
                  checked={gender === 'female'} onChange={() => setGender('female')}
                />
                <span>Nữ</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full mt-4 h-12 relative overflow-hidden group"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                 <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></span>
                 Đang xử lý...
              </span>
            ) : '✨ An Sao Lập Mệnh Bàn'}
          </button>
        </form>
      </div>
    </div>
  );
};
