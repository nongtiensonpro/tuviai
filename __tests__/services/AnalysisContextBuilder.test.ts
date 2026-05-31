import { AnalysisContextBuilder } from '@services/AnalysisContextBuilder';
import { createMockChart } from '../fixtures/mockChart';

describe('AnalysisContextBuilder', () => {
  it('builds a focused context with tam hop and xung chieu palaces', () => {
    const context = AnalysisContextBuilder.buildInitialAnalysisContext(
      createMockChart(),
      'Mệnh',
      'Sự nghiệp nên ưu tiên điều gì?',
    );

    expect(context.userIntent).toEqual({
      mode: 'initial_analysis',
      focusArea: 'Mệnh',
      userQuestion: 'Sự nghiệp nên ưu tiên điều gì?',
    });

    expect(context.chartFacts.keyPalaces.map(palace => palace.palaceName)).toEqual(
      expect.arrayContaining(['Mệnh', 'Quan Lộc', 'Tài Bạch']),
    );

    expect(context.chartFacts.basicInfo.thanCuTaiCung).toBe('Quan Lộc');

    expect(context.derivedSignals.focusContext.referencedPalaces).toEqual(
      expect.arrayContaining(['Mệnh', 'Tài Bạch', 'Quan Lộc', 'Thiên Di']),
    );

    expect(context.derivedSignals.focusContext.focusHighlights.join(' ')).toContain('Tam phương');
    expect(context.derivedSignals.focusContext.focusHighlights.join(' ')).toContain('Tứ Hóa');
  });

  it('includes chart-wide highlights for overall analysis', () => {
    const context = AnalysisContextBuilder.buildInitialAnalysisContext(createMockChart());
    const combinedHighlights = context.derivedSignals.chartHighlights.join(' ');

    expect(context.userIntent.focusArea).toBe('overall');
    expect(combinedHighlights).toContain('Mệnh đóng tại Dần');
    expect(combinedHighlights).toContain('Các cung vô chính diệu');
    expect(combinedHighlights).toContain('Các cung có Tứ Hóa nổi bật');
  });

  it('keeps bridge context when analysis continues from another focus', () => {
    const context = AnalysisContextBuilder.buildInitialAnalysisContext(
      createMockChart(),
      'Quan Lộc',
      undefined,
      {
        sourceFocusArea: 'Mệnh',
        targetFocusArea: 'Quan Lộc',
        summary: 'Mạch trước đang xoay quanh năng lực tự chủ của cung Mệnh.',
        referencedPalaces: ['Mệnh', 'Quan Lộc'],
        recentUserQuestions: ['Nếu đổi việc thì nên nghiêng về môi trường nào?'],
        transitionReason: 'Người dùng vừa chuyển từ cung Mệnh sang cung Quan Lộc để đào sâu sự nghiệp.',
      },
    );

    expect(context.bridgeContext?.sourceFocusArea).toBe('Mệnh');
    expect(context.bridgeContext?.targetFocusArea).toBe('Quan Lộc');
    expect(context.bridgeContext?.transitionReason).toContain('chuyển từ cung Mệnh');
  });

  it('enriches Palace snapshots with nguHanh and detailed star element/brightness names', () => {
    const context = AnalysisContextBuilder.buildInitialAnalysisContext(createMockChart(), 'Mệnh');
    const menhPalace = context.chartFacts.keyPalaces.find(p => p.palaceName === 'Mệnh');
    
    expect(menhPalace).toBeDefined();
    expect(menhPalace?.nguHanh).toBe('Mộc'); // Cung Dần hành Mộc
    
    // Check main star formatting: e.g. "Vũ Khúc (Kim - Đắc)" or similar depending on mockChart
    // Let's check mockChart mainStars: createMainStar('Thiên Đồng', 0, 'B', 'Thủy')
    const phucDucPalace = context.chartFacts.all12Palaces.find(p => p.palaceName === 'Phúc Đức');
    expect(phucDucPalace?.mainStars[0]).toContain('Thiên Đồng');
    expect(phucDucPalace?.mainStars[0]).toContain('Thủy'); // Element Thủy
    expect(phucDucPalace?.mainStars[0]).toContain('Bình'); // 'B' maps to 'Bình'
  });

  it('provides all 12 palaces in the context ordered by chiIndex', () => {
    const context = AnalysisContextBuilder.buildInitialAnalysisContext(createMockChart());
    
    expect(context.chartFacts.all12Palaces).toHaveLength(12);
    // Index 0 must be Tý, Index 11 must be Hợi
    expect(context.chartFacts.all12Palaces[0].diaChi).toBe('Tý');
    expect(context.chartFacts.all12Palaces[11].diaChi).toBe('Hợi');
  });
});
