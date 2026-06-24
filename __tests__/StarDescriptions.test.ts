import { buildZiweiChart } from '../src/core/astrology/ChartBuilder';
import { getStarDescription } from '../src/data/StarDescriptions';

const UNKNOWN_DESCRIPTION_MARKER = 'Tạm thời chưa có hồ sơ';

function collectKnownStarNames(): string[] {
  const samples = [
    buildZiweiChart({ day: 15, month: 6, year: 1990, hour: 10 }, 'male'),
    buildZiweiChart({ day: 9, month: 11, year: 2001, hour: 21 }, 'female'),
  ];

  const names = new Set<string>([
    'Tuần',
    'Triệt',
    'Tuần Không',
    'Triệt Không',
    'Hóa Lộc',
    'Hóa Quyền',
    'Hóa Khoa',
    'Hóa Kỵ',
    'Thai Phụ',
    'Đài Phụ',
    'Tai Sát',
    'Thiên Sát',
    'Đại Sát',
  ]);

  for (const chart of samples) {
    for (const palace of chart.palaces) {
      palace.mainStars.forEach(star => names.add(star.name));
      palace.auxStars.forEach(star => names.add(star.name));
      palace.borrowedStars.forEach(star => names.add(star.name));
    }
  }

  return [...names].sort((a, b) => a.localeCompare(b, 'vi'));
}

describe('StarDescriptions coverage', () => {
  it('mọi sao và alias đã biết đều có mô tả riêng, không rơi vào fallback', () => {
    const knownNames = collectKnownStarNames();

    knownNames.forEach(name => {
      const description = getStarDescription(name);

      expect(description).toBeTruthy();
      expect(description).not.toContain(UNKNOWN_DESCRIPTION_MARKER);
    });
  });

  it('chuẩn hóa đúng các alias đặc biệt', () => {
    expect(getStarDescription('Triệt')).toBe(getStarDescription('Triệt Không'));
    expect(getStarDescription('Tuần')).toBe(getStarDescription('Tuần Không'));
    expect(getStarDescription('Đài Phụ')).toBe(getStarDescription('Thai Phụ'));
    expect(getStarDescription('Hóa Lộc')).toContain('Tứ Hóa');
    expect(getStarDescription('Hóa Quyền')).toContain('Tứ Hóa');
    expect(getStarDescription('Hóa Khoa')).toContain('Tứ Hóa');
    expect(getStarDescription('Hóa Kỵ')).toContain('Tứ Hóa');
  });

  it('bỏ được hậu tố trong tên sao trước khi tra mô tả', () => {
    expect(getStarDescription('Thái Dương (M)')).toBe(getStarDescription('Thái Dương'));
    expect(getStarDescription('Vũ Khúc [Hóa Quyền]')).toBe(getStarDescription('Vũ Khúc'));
    expect(getStarDescription('Liêm Trinh [Hóa Lộc]')).toBe(getStarDescription('Liêm Trinh'));
  });
});
