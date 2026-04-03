/** @jest-environment jsdom */
import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { createMockChart } from '../fixtures/mockChart';
import { AiTelemetryService } from '@services/AiTelemetryService';
import { AnalysisThreadService } from '@services/AnalysisThreadService';
import { useAnalysisAiState } from '@components/useAnalysisAiState';

const mockAnalyzeChartJSON = jest.fn();
const mockCreateChatSession = jest.fn();

jest.mock('../../src/services/GeminiService', () => ({
  GeminiService: {
    analyzeChartJSON: (...args: unknown[]) => mockAnalyzeChartJSON(...args),
    createChatSession: (...args: unknown[]) => mockCreateChatSession(...args),
  },
}));

type HookResult = ReturnType<typeof useAnalysisAiState>;

function flushPromises(): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, 0);
  });
}

async function flushReact(): Promise<void> {
  await act(async () => {
    await flushPromises();
  });
}

async function waitFor(check: () => void, attempts: number = 10): Promise<void> {
  let lastError: unknown;

  for (let index = 0; index < attempts; index += 1) {
    try {
      check();
      return;
    } catch (error) {
      lastError = error;
      await flushReact();
    }
  }

  throw lastError instanceof Error ? lastError : new Error('waitFor failed');
}

describe('useAnalysisAiState', () => {
  let container: HTMLDivElement;
  let root: Root;
  let latestResult: HookResult | null = null;

  const chart = createMockChart();

  function Harness() {
    latestResult = useAnalysisAiState({ chart });
    return null;
  }

  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    document.body.innerHTML = '';
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    latestResult = null;
    localStorage.clear();
    sessionStorage.clear();
    mockAnalyzeChartJSON.mockReset();
    mockCreateChatSession.mockReset();
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
      await flushPromises();
    });
  });

  async function renderHarness(): Promise<HookResult> {
    await act(async () => {
      root.render(React.createElement(Harness));
      await flushPromises();
    });

    if (!latestResult) {
      throw new Error('Hook did not render');
    }

    return latestResult;
  }

  it('falls back to a backup model and records telemetry when the primary model overloads', async () => {
    mockAnalyzeChartJSON.mockImplementation(async (_apiKey, _chart, _target, _question, modelName) => {
      if (modelName === 'gemini-3.1-pro-preview') {
        throw {
          code: 'model_overloaded',
          message: 'Model overloaded',
          retryable: true,
          suggestedAction: 'retry',
        };
      }

      return {
        summary: `resolved by ${modelName}`,
        palace_analysis: 'ok',
        key_points: ['a'],
        karmic_interactions: ['b'],
        referenced_palaces: ['Mệnh'],
        sihua_triggers: 'c',
        modern_advice: 'd',
        follow_up_suggestions: ['e'],
      };
    });

    await renderHarness();

    await act(async () => {
      latestResult?.handleKeyReady('AIza-fake', 'gemini-3.1-pro-preview');
      await flushPromises();
    });

    await act(async () => {
      await latestResult?.handleAnalyze();
      await flushPromises();
    });

    await waitFor(() => {
      expect(latestResult?.analysisResult?.summary).toBe('resolved by gemini-2.5-flash');
      expect(latestResult?.activeModel).toBe('gemini-2.5-flash');
      expect(latestResult?.fallbackState).toEqual({
        fromModel: 'gemini-3.1-pro-preview',
        toModel: 'gemini-2.5-flash',
        reasonCode: 'model_overloaded',
      });
    });

    const primarySnapshot = AiTelemetryService.getSnapshot('gemini-3.1-pro-preview');
    const backupSnapshot = AiTelemetryService.getSnapshot('gemini-2.5-flash');

    expect(primarySnapshot.lastErrorCode).toBe('model_overloaded');
    expect(backupSnapshot.healthLabel).not.toBe('unknown');
    expect(mockAnalyzeChartJSON).toHaveBeenCalledTimes(2);
  });

  it('keeps the chat draft when follow-up sending fails', async () => {
    mockAnalyzeChartJSON.mockResolvedValue({
      summary: 'summary',
      palace_analysis: 'analysis',
      key_points: ['a'],
      karmic_interactions: ['b'],
      referenced_palaces: ['Mệnh'],
      sihua_triggers: 'c',
      modern_advice: 'd',
      follow_up_suggestions: ['e'],
    });

    const sendMessage = jest.fn<Promise<string>, [unknown, string]>().mockRejectedValue({
      code: 'network_unavailable',
      message: 'network down',
      retryable: true,
      suggestedAction: 'retry',
    });

    mockCreateChatSession.mockReturnValue({
      sendMessage,
    });

    await renderHarness();

    await act(async () => {
      latestResult?.handleKeyReady('AIza-fake', 'gemini-3.1-pro-preview');
      await flushPromises();
    });

    await act(async () => {
      await latestResult?.handleAnalyze();
      await flushPromises();
    });

    await waitFor(() => {
      expect(latestResult?.currentChatSession).not.toBeNull();
      expect(latestResult?.currentThread).not.toBeNull();
    });

    await act(async () => {
      latestResult?.setQuestion('Câu hỏi giữ lại khi lỗi');
      await flushPromises();
    });

    await act(async () => {
      await latestResult?.handleSendMessage({ preventDefault() {} } as React.FormEvent);
      await flushPromises();
    });

    expect(latestResult?.question).toBe('Câu hỏi giữ lại khi lỗi');
    expect(latestResult?.errorState?.code).toBe('network_unavailable');
    expect(latestResult?.currentThread?.turns).toHaveLength(0);
    expect(sendMessage).toHaveBeenCalled();
  });

  it('updates health text from telemetry after a successful analysis', async () => {
    mockAnalyzeChartJSON.mockResolvedValue({
      summary: 'summary',
      palace_analysis: 'analysis',
      key_points: ['a'],
      karmic_interactions: ['b'],
      referenced_palaces: ['Mệnh'],
      sihua_triggers: 'c',
      modern_advice: 'd',
      follow_up_suggestions: ['e'],
    });

    await renderHarness();

    await act(async () => {
      latestResult?.handleKeyReady('AIza-fake', 'gemini-3.1-pro-preview');
      await flushPromises();
    });

    await act(async () => {
      await latestResult?.handleAnalyze();
      await flushPromises();
    });

    await waitFor(() => {
      expect(latestResult?.analysisResult?.summary).toBe('summary');
      expect(latestResult?.activeModelHealth.healthLabel).not.toBe('unknown');
      expect(latestResult?.activeModelHealthText).not.toContain('Chưa đủ dữ liệu');
    });

    const savedThread = AnalysisThreadService.loadThread(chart, 'overall');
    expect(savedThread?.analysis.summary).toBe('summary');
  });
});
