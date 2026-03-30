import { PALACE_NAMES_ORDER } from '../src/core/types/ZiweiTypes';
import {
  KNOWN_GLOSSARY_TERMS,
  UNKNOWN_GLOSSARY_MARKER,
  getGlossaryDescription,
} from '../src/data/GlossaryDescriptions';
import { getStarDescription } from '../src/data/StarDescriptions';

describe('GlossaryDescriptions coverage', () => {
  it('bao phủ đủ 12 cung, không rơi vào fallback', () => {
    PALACE_NAMES_ORDER.forEach((palaceName) => {
      const description = getGlossaryDescription(palaceName);

      expect(description).toBeTruthy();
      expect(description).not.toContain(UNKNOWN_GLOSSARY_MARKER);
    });
  });

  it('bao phủ các thuật ngữ nền của lá số đang dùng trong UI', () => {
    const requiredTerms = [
      'Cung Thân',
      'Bản Mệnh',
      'Mệnh Cục',
      'Dương Nam',
      'Âm Nữ',
      'Âm dương thuận lý',
      'Âm dương nghịch lý',
      'Cục sinh Bản Mệnh',
      'Cục hòa Bản Mệnh',
      'Bản Mệnh sinh Cục',
      'Bản Mệnh khắc Cục',
      'Cục khắc Bản Mệnh',
      'Đại Hạn',
      'Tiểu Hạn',
      'Tràng Sinh',
      'Tam Phương Tứ Chính',
      'Tam Hợp',
      'Xung Chiếu',
      'Vô Chính Diệu',
      'Mượn Chính Tinh',
      'Mệnh Chủ',
      'Thân Chủ',
      'Thủy Nhị Cục',
      'Mộc Tam Cục',
      'Kim Tứ Cục',
      'Thổ Ngũ Cục',
      'Hỏa Lục Cục',
    ];

    requiredTerms.forEach((term) => {
      expect(getGlossaryDescription(term)).not.toContain(UNKNOWN_GLOSSARY_MARKER);
    });
  });

  it('chuẩn hóa đúng alias và các mục dựa vào StarDescriptions', () => {
    expect(getGlossaryDescription('Thân')).toBe(getGlossaryDescription('Cung Thân'));
    expect(getGlossaryDescription('Cục')).toBe(getGlossaryDescription('Mệnh Cục'));
    expect(getGlossaryDescription('Đại Vận')).toBe(getGlossaryDescription('Đại Hạn'));
    expect(getGlossaryDescription('Tiểu Vận')).toBe(getGlossaryDescription('Tiểu Hạn'));
    expect(getGlossaryDescription('VCD')).toBe(getGlossaryDescription('Vô Chính Diệu'));
    expect(getGlossaryDescription('Mượn Sao')).toBe(getGlossaryDescription('Mượn Chính Tinh'));
    expect(getGlossaryDescription('Trường Sinh')).toBe(getStarDescription('Trường Sinh'));
    expect(getGlossaryDescription('Triệt')).toBe(getStarDescription('Triệt'));
  });

  it('ưu tiên nghĩa cung cho các mục trùng tên với sao', () => {
    expect(getGlossaryDescription('Phúc Đức')).toContain('dòng họ');
    expect(getGlossaryDescription('Phúc Đức')).not.toBe(getStarDescription('Phúc Đức'));
  });

  it('danh sách thuật ngữ đã biết không bị trống', () => {
    const uniqueTerms = new Set(KNOWN_GLOSSARY_TERMS);

    expect(uniqueTerms.size).toBeGreaterThanOrEqual(40);
  });
});
