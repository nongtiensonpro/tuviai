import { AgentRouterService } from '../../src/services/AgentRouterService';
import { createMockChart } from '../fixtures/mockChart';
import OpenAI from 'openai';

// Mock module openai
jest.mock('openai');

describe('AgentRouterService', () => {
  let mockCreate: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockCreate = jest.fn();
    (OpenAI as unknown as jest.Mock).mockImplementation(() => {
      return {
        chat: {
          completions: {
            create: mockCreate
          }
        }
      };
    });
  });

  it('should request and parse chat completions successfully via stream', async () => {
    const mockChart = createMockChart();

    const mockResponseText = JSON.stringify({
      summary: "Tóm tắt lá số",
      palace_analysis: "Phân tích cung vị",
      key_points: ["Ý 1", "Ý 2"],
      karmic_interactions: ["Tương tác 1"],
      referenced_palaces: ["Mệnh"],
      sihua_triggers: "Kích hoạt Tứ Hóa",
      modern_advice: "Lời khuyên",
      follow_up_suggestions: ["Hỏi 1"]
    });

    // Giả lập async iterator stream của OpenAI SDK
    const mockStream = {
      [Symbol.asyncIterator]: async function* () {
        yield { choices: [{ delta: { content: mockResponseText } }] };
      }
    };

    mockCreate.mockResolvedValue(mockStream);

    const onStreamEvent = jest.fn();

    const result = await AgentRouterService.analyzeChartJSON(
      'mock-api-key',
      mockChart,
      'Mệnh',
      undefined,
      'deepseek/deepseek-chat',
      undefined,
      { onStreamEvent }
    );

    expect(result.summary).toBe("Tóm tắt lá số");
    expect(result.referenced_palaces).toContain("Mệnh");
    expect(onStreamEvent).toHaveBeenCalled();
  });

  it('should map content-blocked error from API response', async () => {
    const mockChart = createMockChart();

    // Giả lập APIError từ OpenAI SDK
    const mockError = new Error('content-blocked error');
    (mockError as any).status = 400;
    (mockError as any).message = 'content-blocked due to safety filters';

    mockCreate.mockRejectedValue(mockError);

    await expect(
      AgentRouterService.analyzeChartJSON(
        'mock-api-key',
        mockChart,
        'Mệnh',
        undefined,
        'deepseek/deepseek-chat'
      )
    ).rejects.toThrow(expect.objectContaining({
      code: 'content_blocked'
    }));
  });
});
