import { PromptBuilder, analyzeSchema } from '@services/PromptBuilder';
import { AnalysisThreadService } from '@services/AnalysisThreadService';
import { createMockChart } from '../fixtures/mockChart';

describe('PromptBuilder', () => {
  it('builds an initial analysis prompt with structured context and user question', () => {
    const prompt = PromptBuilder.buildAnalysisPrompt(
      createMockChart(),
      'Mệnh',
      'Sự nghiệp năm nay nên ưu tiên điều gì?',
    );

    expect(prompt).toContain('NHIỆM VỤ: initial_analysis');
    expect(prompt).toContain('TRỌNG TÂM: Mệnh');
    expect(prompt).toContain('CÂU HỎI RIÊNG CỦA ĐƯƠNG SỐ: "Sự nghiệp năm nay nên ưu tiên điều gì?"');
    expect(prompt).toContain('"mode": "initial_analysis"');
    expect(prompt).toContain('"focusArea": "Mệnh"');
    expect(prompt).toContain('"follow_up_suggestions"');
    expect(prompt).toContain('"referencedPalaces"');
  });

  it('adds bridge instructions when analysis continues from another focus', () => {
    const prompt = PromptBuilder.buildAnalysisPrompt(
      createMockChart(),
      'Quan Lộc',
      undefined,
      {
        sourceFocusArea: 'Mệnh',
        targetFocusArea: 'Quan Lộc',
        summary: 'Mạch trước đang xoay quanh cung Mệnh.',
        referencedPalaces: ['Mệnh', 'Quan Lộc'],
        recentUserQuestions: ['Nếu đổi việc thì nên nghiêng về môi trường nào?'],
        transitionReason: 'Người dùng vừa chuyển từ cung Mệnh sang cung Quan Lộc để đào sâu sự nghiệp.',
      },
    );

    expect(prompt).toContain('NỐI MẠCH TỪ TRAO ĐỔI TRƯỚC');
    expect(prompt).toContain('Người dùng vừa đi từ cung Mệnh sang Quan Lộc');
    expect(prompt).toContain('"bridgeContext"');
  });

  it('requires the expanded structured response fields', () => {
    expect(analyzeSchema.required).toEqual(expect.arrayContaining([
      'summary',
      'palace_analysis',
      'key_points',
      'karmic_interactions',
      'referenced_palaces',
      'sihua_triggers',
      'modern_advice',
      'follow_up_suggestions',
    ]));
  });

  it('defines the stricter analysis system instruction', () => {
    const instruction = PromptBuilder.buildSystemInstruction();

    expect(instruction).toContain('Chỉ sử dụng dữ kiện có trong context JSON');
    expect(instruction).toContain('Trong "referenced_palaces"');
    expect(instruction).toContain('Đầu ra phải là JSON hợp lệ');
  });

  it('builds a follow-up prompt from thread memory and recent turns', () => {
    let thread = AnalysisThreadService.createThread(createMockChart(), 'Mệnh', {
      summary: 'Cung Mệnh mạnh về tổ chức và định hướng.',
      palace_analysis: 'Chi tiết cung Mệnh.',
      key_points: ['Có năng lực điều phối', 'Dễ hút trách nhiệm'],
      karmic_interactions: ['Quan Lộc nâng đỡ cho Mệnh.'],
      referenced_palaces: ['Mệnh', 'Quan Lộc'],
      sihua_triggers: 'Tử Vi Hóa Khoa làm nổi bật danh vị.',
      modern_advice: 'Nên chủ động nhận vai trò dẫn dắt.',
      follow_up_suggestions: ['Nếu xét công việc thì nên ưu tiên điều gì?'],
    });

    thread = AnalysisThreadService.appendTurn(thread, 'user', 'Vậy còn khi đổi việc thì sao?', 1);
    thread = AnalysisThreadService.appendTurn(thread, 'ai', 'Nên chọn môi trường có biên độ tự chủ cao.', 2);

    const prompt = PromptBuilder.buildFollowUpPrompt(thread, 'Nếu xét tài chính thì cần lưu ý gì?');

    expect(prompt).toContain('NHIỆM VỤ: follow_up');
    expect(prompt).toContain('"analysisSummary": "Cung Mệnh mạnh về tổ chức và định hướng."');
    expect(prompt).toContain('"conversationRecap"');
    expect(prompt).toContain('"conversationDigest"');
    expect(prompt).toContain('"recentTurns"');
    expect(prompt).toContain('Nếu xét tài chính thì cần lưu ý gì?');
  });

  it('defines a dedicated follow-up instruction', () => {
    const instruction = PromptBuilder.buildFollowUpSystemInstruction();

    expect(instruction).toContain('không cần JSON');
    expect(instruction).toContain('"threadMemory"');
    expect(instruction).toContain('tính liên tục hội thoại');
  });
});
