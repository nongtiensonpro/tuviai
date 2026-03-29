import { AnalysisThreadService } from '@services/AnalysisThreadService';
import { createMockChart } from '../fixtures/mockChart';
import type { PalaceAnalysis } from '@core/types/ZiweiTypes';

function createSessionStorageMock() {
  const store = new Map<string, string>();

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  };
}

describe('AnalysisThreadService', () => {
  const menhAnalysis: PalaceAnalysis = {
    summary: 'Mệnh có nội lực vững và khả năng điều phối tốt.',
    palace_analysis: 'Chi tiết phân tích cung Mệnh.',
    key_points: ['Nội lực mạnh', 'Dễ gánh vai trò dẫn dắt'],
    karmic_interactions: ['Quan Lộc và Tài Bạch hỗ trợ rõ cho cung Mệnh.'],
    referenced_palaces: ['Mệnh', 'Quan Lộc', 'Tài Bạch'],
    sihua_triggers: 'Tử Vi Hóa Khoa tạo độ sáng cho cung Mệnh.',
    modern_advice: 'Nên ưu tiên vai trò có quyền tự chủ cao.',
    follow_up_suggestions: ['Nếu xét sự nghiệp thì nên ưu tiên điều gì?'],
  };

  beforeEach(() => {
    (globalThis as { sessionStorage?: ReturnType<typeof createSessionStorageMock> }).sessionStorage = createSessionStorageMock();
  });

  it('creates a thread with memory derived from the initial analysis context', () => {
    const chart = createMockChart();
    const thread = AnalysisThreadService.createThread(chart, 'Mệnh', menhAnalysis);

    expect(thread.focusArea).toBe('Mệnh');
    expect(thread.memory.analysisSummary).toContain('nội lực');
    expect(thread.memory.focusHighlights.join(' ')).toContain('Tam phương');
    expect(thread.memory.referencedPalaces).toEqual(['Mệnh', 'Quan Lộc', 'Tài Bạch']);
    expect(thread.memory.relatedPalaces).toEqual(['Quan Lộc', 'Tài Bạch']);
    expect(thread.memory.suggestedQuestions).toContain('Nếu xét sự nghiệp thì nên ưu tiên điều gì?');
    expect(thread.memory.conversationRecap).toBe('');
  });

  it('persists, restores and trims recent turns correctly', () => {
    const chart = createMockChart();
    let thread = AnalysisThreadService.createThread(chart, 'overall', {
      summary: 'Tổng quan lá số cân bằng nhưng thiên về sự nghiệp.',
      palace_analysis: 'Chi tiết tổng quan.',
      key_points: ['Quan Lộc sáng', 'Tài Bạch có lực'],
      karmic_interactions: ['Trục Mệnh - Quan - Tài vận hành đồng bộ.'],
      referenced_palaces: ['Mệnh', 'Quan Lộc', 'Tài Bạch'],
      sihua_triggers: 'Liêm Trinh Hóa Quyền và Vũ Khúc Hóa Lộc cùng kích hoạt.',
      modern_advice: 'Nên đi đường dài, tránh quyết định nóng.',
      follow_up_suggestions: ['Nên đào sâu cung nào tiếp theo?'],
    });

    for (let index = 0; index < 8; index += 1) {
      thread = AnalysisThreadService.appendTurn(thread, index % 2 === 0 ? 'user' : 'ai', `turn-${index}`, index + 1);
    }

    AnalysisThreadService.saveThread(thread);
    const restored = AnalysisThreadService.loadThread(chart, 'overall');

    expect(restored).not.toBeNull();
    expect(restored?.turns).toHaveLength(8);
    expect(restored?.memory.conversationRecap).toContain('Trọng tâm hiện tại: tổng quan mệnh bàn.');
    expect(AnalysisThreadService.getRecentTurns(restored!)).toEqual([
      { role: 'user', msg: 'turn-2' },
      { role: 'ai', msg: 'turn-3' },
      { role: 'user', msg: 'turn-4' },
      { role: 'ai', msg: 'turn-5' },
      { role: 'user', msg: 'turn-6' },
      { role: 'ai', msg: 'turn-7' },
    ]);
  });

  it('builds bridge context and digests older conversation turns', () => {
    const chart = createMockChart();
    let sourceThread = AnalysisThreadService.createThread(chart, 'Mệnh', menhAnalysis);

    sourceThread = AnalysisThreadService.appendTurn(sourceThread, 'user', 'Nếu đổi việc thì nên nghiêng về môi trường nào?', 1);
    sourceThread = AnalysisThreadService.appendTurn(sourceThread, 'ai', 'Nên chọn nơi có biên độ tự chủ cao và ít vi mô quản lý.', 2);
    sourceThread = AnalysisThreadService.appendTurn(sourceThread, 'user', 'Còn nếu xét tài chính thì sao?', 3);
    sourceThread = AnalysisThreadService.appendTurn(sourceThread, 'ai', 'Tài chính nên đi theo hướng tích lũy bền vững hơn là lướt sóng.', 4);
    sourceThread = AnalysisThreadService.appendTurn(sourceThread, 'user', 'Quan Lộc có đang nâng đỡ không?', 5);
    sourceThread = AnalysisThreadService.appendTurn(sourceThread, 'ai', 'Quan Lộc đang hỗ trợ khá rõ cho đà phát triển cá nhân.', 6);
    sourceThread = AnalysisThreadService.appendTurn(sourceThread, 'user', 'Có cần lưu ý gì thêm không?', 7);
    sourceThread = AnalysisThreadService.appendTurn(sourceThread, 'ai', 'Nên tránh ôm quá nhiều trách nhiệm cùng lúc.', 8);

    const bridge = AnalysisThreadService.buildBridgeContext(sourceThread, 'Quan Lộc');
    expect(bridge?.sourceFocusArea).toBe('Mệnh');
    expect(bridge?.targetFocusArea).toBe('Quan Lộc');
    expect(bridge?.recentUserQuestions).toEqual([
      'Quan Lộc có đang nâng đỡ không?',
      'Có cần lưu ý gì thêm không?',
    ]);

    const digest = AnalysisThreadService.getConversationDigest(sourceThread);
    expect(digest).toHaveLength(1);
    expect(digest[0]).toContain('Nếu đổi việc thì nên nghiêng về môi trường nào?');
    expect(digest[0]).toContain('biên độ tự chủ cao');
    expect(sourceThread.memory.relatedPalaces).toEqual(['Quan Lộc', 'Tài Bạch']);
  });
});
