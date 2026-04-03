/**
 * GeminiService.ts — Tương tác trực tiếp với Google Gemini AI (Backend-less)
 * Hỗ trợ Structured Output (JSON) và Lịch sử Chat (Session)
 */
import { GoogleGenAI } from '@google/genai';
import { PromptBuilder, type StructuredAiResponse, analyzeSchema } from './PromptBuilder';
import type {
  AiErrorCode,
  AiRetryAttempt,
  AiServiceErrorDetails,
  AnalysisBridgeContext,
  AnalysisThread,
  PalaceAnalysis,
  PalaceName,
  ZiweiChart,
} from '../core/types/ZiweiTypes';

export interface GeminiChatSession {
  sendMessage: (thread: AnalysisThread, msg: string, options?: GeminiChatOptions) => Promise<string>;
}

export interface GeminiAnalysisStreamEvent {
  chunkText: string;
  fullText: string;
  receivedChars: number;
  receivedChunks: number;
}

export interface GeminiAnalyzeOptions {
  onStreamEvent?: (event: GeminiAnalysisStreamEvent) => void;
  onRetryAttempt?: (attempt: AiRetryAttempt) => void;
  abortSignal?: AbortSignal;
  timeoutMs?: number;
}

export interface GeminiChatOptions {
  onRetryAttempt?: (attempt: AiRetryAttempt) => void;
  abortSignal?: AbortSignal;
  timeoutMs?: number;
}

const DEFAULT_ANALYZE_TIMEOUT_MS = 45_000;
const DEFAULT_CHAT_TIMEOUT_MS = 25_000;
const MAX_RETRY_ATTEMPTS = 3;
const BASE_RETRY_DELAY_MS = 1_200;

export class GeminiServiceError extends Error implements AiServiceErrorDetails {
  code: AiErrorCode;
  retryable: boolean;
  suggestedAction: string;
  status?: number;
  modelName?: string;
  attemptNumber?: number;
  maxAttempts?: number;
  retryAfterMs?: number;

  constructor(details: AiServiceErrorDetails) {
    super(details.message);
    this.name = 'GeminiServiceError';
    this.code = details.code;
    this.retryable = details.retryable;
    this.suggestedAction = details.suggestedAction;
    this.status = details.status;
    this.modelName = details.modelName;
    this.attemptNumber = details.attemptNumber;
    this.maxAttempts = details.maxAttempts;
    this.retryAfterMs = details.retryAfterMs;
  }
}

const PALACE_NAMES = new Set<PalaceName>([
  'Mệnh',
  'Phụ Mẫu',
  'Phúc Đức',
  'Điền Trạch',
  'Quan Lộc',
  'Nô Bộc',
  'Thiên Di',
  'Tật Ách',
  'Tài Bạch',
  'Tử Tức',
  'Phu Thê',
  'Huynh Đệ',
]);

function parseString(value: unknown, fallback: string = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

function parseStringArray(value: unknown, minItems: number = 0): string[] {
  const items = Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string').map(item => item.trim()).filter(Boolean)
    : [];

  if (items.length >= minItems) {
    return items;
  }

  return items;
}

function parseReferencedPalaces(value: unknown): PalaceName[] {
  return parseStringArray(value).filter((item): item is PalaceName => PALACE_NAMES.has(item as PalaceName));
}

function normalizeAnalysisResponse(payload: unknown): PalaceAnalysis {
  const raw = (payload && typeof payload === 'object') ? payload as Record<string, unknown> : {};

  return {
    summary: parseString(raw.summary, 'Chưa thể tạo tóm tắt rõ ràng từ phản hồi AI.'),
    palace_analysis: parseString(raw.palace_analysis, 'AI chưa trả về phần luận giải chi tiết.'),
    key_points: parseStringArray(raw.key_points),
    karmic_interactions: parseStringArray(raw.karmic_interactions),
    referenced_palaces: parseReferencedPalaces(raw.referenced_palaces),
    sihua_triggers: parseString(raw.sihua_triggers, 'Chưa có phân tích Tứ Hóa rõ ràng.'),
    modern_advice: parseString(raw.modern_advice, 'Chưa có lời khuyên thực hành rõ ràng.'),
    follow_up_suggestions: parseStringArray(raw.follow_up_suggestions),
  };
}

function extractJsonPayload(responseText: string): string {
  const trimmed = responseText.trim();
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

function inferStatusCode(error: unknown): number | undefined {
  if (error && typeof error === 'object') {
    const maybeStatus = (error as { status?: unknown }).status;
    if (typeof maybeStatus === 'number' && Number.isFinite(maybeStatus)) {
      return maybeStatus;
    }
  }

  const message = error instanceof Error ? error.message : String(error ?? '');
  const match = message.match(/\b(400|401|403|408|429|500|502|503|504)\b/);
  return match ? Number(match[1]) : undefined;
}

function isAbortError(error: unknown): boolean {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return true;
  }

  if (error && typeof error === 'object') {
    const maybeName = (error as { name?: unknown }).name;
    if (maybeName === 'AbortError') {
      return true;
    }
  }

  return false;
}

function combineAbortSignals(externalSignal: AbortSignal | undefined, timeoutMs: number): {
  signal: AbortSignal;
  cleanup: () => void;
  wasTimeoutAbort: () => boolean;
} {
  const controller = new AbortController();
  let timeoutTriggered = false;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const abortFromExternal = () => {
    controller.abort(externalSignal?.reason ?? 'user_cancelled');
  };

  if (externalSignal?.aborted) {
    abortFromExternal();
  } else if (externalSignal) {
    externalSignal.addEventListener('abort', abortFromExternal, { once: true });
  }

  timeoutId = setTimeout(() => {
    timeoutTriggered = true;
    controller.abort('timeout');
  }, timeoutMs);

  return {
    signal: controller.signal,
    cleanup: () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      if (externalSignal) {
        externalSignal.removeEventListener('abort', abortFromExternal);
      }
    },
    wasTimeoutAbort: () => timeoutTriggered,
  };
}

function createGeminiServiceError(
  code: AiErrorCode,
  modelName: string,
  overrides?: Partial<AiServiceErrorDetails>,
): GeminiServiceError {
  const defaults: Record<AiErrorCode, Omit<AiServiceErrorDetails, 'code' | 'modelName'>> = {
    invalid_api_key: {
      message: 'API Key Gemini không hợp lệ hoặc không có quyền dùng model này.',
      retryable: false,
      suggestedAction: 'Hãy kiểm tra lại API Key, quyền truy cập model, hoặc mở khóa bằng một key khác.',
    },
    quota_exceeded: {
      message: 'API Key đã chạm hạn mức sử dụng của Gemini.',
      retryable: false,
      suggestedAction: 'Hãy chờ hạn mức được làm mới hoặc chuyển sang API Key/model khác có quota còn trống.',
    },
    rate_limited: {
      message: 'Gemini đang giới hạn tốc độ gọi nên yêu cầu tạm thời bị chặn.',
      retryable: true,
      suggestedAction: 'Hệ thống có thể thử lại sau vài giây. Nếu vẫn lặp lại, hãy giảm tần suất thao tác hoặc đổi sang model nhẹ hơn.',
    },
    model_overloaded: {
      message: 'Model Gemini đang quá tải nên chưa thể phản hồi ổn định.',
      retryable: true,
      suggestedAction: 'Hãy chờ hệ thống thử lại. Nếu vẫn thất bại, chuyển sang model ổn định hơn như Gemini 2.5 Flash.',
    },
    network_unavailable: {
      message: 'Kết nối mạng tới Gemini đang không ổn định hoặc tạm thời gián đoạn.',
      retryable: true,
      suggestedAction: 'Kiểm tra lại mạng của bạn rồi thử lại. Hệ thống cũng sẽ tự thử lại nếu lỗi chỉ là tạm thời.',
    },
    request_timeout: {
      message: 'Gemini phản hồi quá chậm nên yêu cầu đã hết thời gian chờ.',
      retryable: true,
      suggestedAction: 'Hãy thử lại sau ít giây hoặc chuyển sang model nhanh hơn nếu bạn cần phản hồi sớm.',
    },
    empty_response: {
      message: 'Gemini không trả về nội dung hợp lệ cho yêu cầu này.',
      retryable: true,
      suggestedAction: 'Hệ thống có thể thử lại. Nếu lỗi lặp lại, hãy đổi model hoặc chạy lại phân tích.',
    },
    invalid_json: {
      message: 'Gemini đã phản hồi nhưng dữ liệu có cấu trúc chưa hoàn chỉnh.',
      retryable: true,
      suggestedAction: 'Hãy thử lại để nhận JSON hoàn chỉnh hơn. Nếu còn lỗi, hãy đổi sang model ổn định hơn.',
    },
    user_cancelled: {
      message: 'Yêu cầu AI đã được hủy.',
      retryable: false,
      suggestedAction: 'Bạn có thể chạy lại khi sẵn sàng.',
    },
    unknown: {
      message: 'Gemini gặp lỗi chưa xác định khi xử lý yêu cầu.',
      retryable: false,
      suggestedAction: 'Hãy thử lại. Nếu lỗi lặp lại, hãy đổi model hoặc kiểm tra lại API Key.',
    },
  };

  return new GeminiServiceError({
    code,
    modelName,
    ...defaults[code],
    ...overrides,
  });
}

function normalizeGeminiError(
  error: unknown,
  modelName: string,
  attemptNumber: number,
  maxAttempts: number,
  timeoutTriggered: boolean,
): GeminiServiceError {
  if (error instanceof GeminiServiceError) {
    return new GeminiServiceError({
      ...error,
      code: error.code,
      message: error.message,
      retryable: error.retryable,
      suggestedAction: error.suggestedAction,
      status: error.status,
      modelName: error.modelName ?? modelName,
      attemptNumber,
      maxAttempts,
      retryAfterMs: error.retryAfterMs,
    });
  }

  if (timeoutTriggered) {
    return createGeminiServiceError('request_timeout', modelName, {
      attemptNumber,
      maxAttempts,
    });
  }

  if (isAbortError(error)) {
    return createGeminiServiceError('user_cancelled', modelName, {
      attemptNumber,
      maxAttempts,
    });
  }

  const status = inferStatusCode(error);
  const message = error instanceof Error ? error.message : String(error ?? '');
  const lower = message.toLowerCase();

  if (status === 401 || status === 403 || /api key|permission|credential|unauthori|forbidden|auth/i.test(message)) {
    return createGeminiServiceError('invalid_api_key', modelName, { status, attemptNumber, maxAttempts });
  }

  if (/quota|resource has been exhausted|insufficient balance|billing/i.test(message)) {
    return createGeminiServiceError('quota_exceeded', modelName, { status, attemptNumber, maxAttempts });
  }

  if (status === 429 || /rate limit|too many requests/i.test(message)) {
    return createGeminiServiceError('rate_limited', modelName, { status, attemptNumber, maxAttempts });
  }

  if (status === 503 || status === 502 || /overloaded|overload|temporarily unavailable|unavailable|try again later/i.test(message)) {
    return createGeminiServiceError('model_overloaded', modelName, { status, attemptNumber, maxAttempts });
  }

  if (
    status === 408
    || status === 504
    || /timed out|timeout|deadline/i.test(message)
  ) {
    return createGeminiServiceError('request_timeout', modelName, { status, attemptNumber, maxAttempts });
  }

  if (
    /failed to fetch|network|load failed|fetch failed|econnreset|enetunreach|dns/i.test(lower)
  ) {
    return createGeminiServiceError('network_unavailable', modelName, { status, attemptNumber, maxAttempts });
  }

  return createGeminiServiceError('unknown', modelName, {
    status,
    attemptNumber,
    maxAttempts,
    message: message || 'Gemini gặp lỗi chưa xác định khi xử lý yêu cầu.',
  });
}

function shouldRetry(error: GeminiServiceError, attemptNumber: number, maxAttempts: number): boolean {
  if (!error.retryable) {
    return false;
  }

  return attemptNumber < maxAttempts;
}

function calculateRetryDelayMs(attemptNumber: number): number {
  const jitter = Math.floor(Math.random() * 350);
  return BASE_RETRY_DELAY_MS * Math.pow(2, attemptNumber - 1) + jitter;
}

export class GeminiService {
  /**
   * Gọi AI phân tích Mệnh Bàn trả về Structured JSON Output
   * @param apiKey API Key thật (đã giải mã)
   * @param chart Dữ liệu Mệnh bàn
   * @param targetPalaceName Tùy chọn, tập trung vào 1 cung
   * @param userQuestion (Tùy chọn) Câu hỏi cụ thể
   */
  static async analyzeChartJSON(
    apiKey: string,
    chart: ZiweiChart,
    targetPalaceName?: PalaceName,
    userQuestion?: string,
    modelName: string = 'gemini-3.1-pro-preview',
    bridgeContext?: AnalysisBridgeContext,
    options?: GeminiAnalyzeOptions,
  ): Promise<StructuredAiResponse> {
    if (!apiKey) throw new Error("API Key không hợp lệ.");

    const ai = new GoogleGenAI({ apiKey });
    const systemInstruction = PromptBuilder.buildSystemInstruction();
    const prompt = PromptBuilder.buildAnalysisPrompt(chart, targetPalaceName, userQuestion, bridgeContext);
    const maxAttempts = options?.onRetryAttempt ? MAX_RETRY_ATTEMPTS : MAX_RETRY_ATTEMPTS;

    for (let attemptNumber = 1; attemptNumber <= maxAttempts; attemptNumber += 1) {
      const timeoutMs = options?.timeoutMs ?? DEFAULT_ANALYZE_TIMEOUT_MS;
      const { signal, cleanup, wasTimeoutAbort } = combineAbortSignals(options?.abortSignal, timeoutMs);

      try {
        const response = await ai.models.generateContentStream({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.7,
            responseMimeType: "application/json",
            responseSchema: analyzeSchema,
            abortSignal: signal,
          }
        });

        let responseText = '';
        let receivedChunks = 0;

        for await (const chunk of response) {
          const chunkText = chunk.text ?? '';
          if (!chunkText) {
            continue;
          }

          responseText += chunkText;
          receivedChunks += 1;
          options?.onStreamEvent?.({
            chunkText,
            fullText: responseText,
            receivedChars: responseText.length,
            receivedChunks,
          });
        }

        if (!responseText.trim()) {
          throw createGeminiServiceError('empty_response', modelName, {
            attemptNumber,
            maxAttempts,
          });
        }

        try {
          return normalizeAnalysisResponse(JSON.parse(extractJsonPayload(responseText)));
        } catch {
          throw createGeminiServiceError('invalid_json', modelName, {
            attemptNumber,
            maxAttempts,
          });
        }
      } catch (error: unknown) {
        const normalizedError = normalizeGeminiError(error, modelName, attemptNumber, maxAttempts, wasTimeoutAbort());
        console.error("Gemini API Error:", normalizedError, error);

        if (!shouldRetry(normalizedError, attemptNumber, maxAttempts)) {
          throw normalizedError;
        }

        const retryAfterMs = calculateRetryDelayMs(attemptNumber);
        options?.onRetryAttempt?.({
          attemptNumber: attemptNumber + 1,
          maxAttempts,
          retryAfterMs,
          code: normalizedError.code,
          modelName,
        });
        await delay(retryAfterMs);
      } finally {
        cleanup();
      }
    }

    throw createGeminiServiceError('unknown', modelName);
  }

  /**
   * Tính năng Chat đàm thoại. Tạo phiên follow-up dùng thread memory cục bộ.
   */
  static createChatSession(
    apiKey: string,
    modelName: string = 'gemini-3.1-pro-preview',
  ): GeminiChatSession {
    if (!apiKey) throw new Error("API Key không hợp lệ.");
    const ai = new GoogleGenAI({ apiKey });

    return {
      sendMessage: async (thread: AnalysisThread, msg: string, options?: GeminiChatOptions) => {
        const maxAttempts = MAX_RETRY_ATTEMPTS;

        for (let attemptNumber = 1; attemptNumber <= maxAttempts; attemptNumber += 1) {
          const timeoutMs = options?.timeoutMs ?? DEFAULT_CHAT_TIMEOUT_MS;
          const { signal, cleanup, wasTimeoutAbort } = combineAbortSignals(options?.abortSignal, timeoutMs);

          try {
            const response = await ai.models.generateContent({
              model: modelName,
              contents: PromptBuilder.buildFollowUpPrompt(thread, msg),
              config: {
                systemInstruction: PromptBuilder.buildFollowUpSystemInstruction(),
                temperature: 0.7,
                abortSignal: signal,
              },
            });

            const text = response.text?.trim();
            if (!text) {
              throw createGeminiServiceError('empty_response', modelName, {
                attemptNumber,
                maxAttempts,
              });
            }

            return text;
          } catch (error: unknown) {
            const normalizedError = normalizeGeminiError(error, modelName, attemptNumber, maxAttempts, wasTimeoutAbort());
            console.error("Gemini Chat Error:", normalizedError, error);

            if (!shouldRetry(normalizedError, attemptNumber, maxAttempts)) {
              throw normalizedError;
            }

            const retryAfterMs = calculateRetryDelayMs(attemptNumber);
            options?.onRetryAttempt?.({
              attemptNumber: attemptNumber + 1,
              maxAttempts,
              retryAfterMs,
              code: normalizedError.code,
              modelName,
            });
            await delay(retryAfterMs);
          } finally {
            cleanup();
          }
        }

        throw createGeminiServiceError('unknown', modelName);
      },
    };
  }
}
