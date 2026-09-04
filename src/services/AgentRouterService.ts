/**
 * AgentRouterService.ts — Tương tác trực tiếp với AgentRouter AI Gateway (OpenAI SDK)
 * Hỗ trợ Structured Output (JSON) và Lịch sử Chat (Session) dạng Client-side Stream.
 */
import OpenAI from 'openai';
import { PromptBuilder, type StructuredAiResponse } from './PromptBuilder';
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

export interface AgentRouterChatSession {
  sendMessage: (thread: AnalysisThread, msg: string, options?: AgentRouterChatOptions) => Promise<string>;
}

export interface AgentRouterAnalysisStreamEvent {
  chunkText: string;
  fullText: string;
  receivedChars: number;
  receivedChunks: number;
}

export interface AgentRouterAnalyzeOptions {
  onStreamEvent?: (event: AgentRouterAnalysisStreamEvent) => void;
  onRetryAttempt?: (attempt: AiRetryAttempt) => void;
  abortSignal?: AbortSignal;
  timeoutMs?: number;
}

export interface AgentRouterChatOptions {
  onRetryAttempt?: (attempt: AiRetryAttempt) => void;
  abortSignal?: AbortSignal;
  timeoutMs?: number;
}

const DEFAULT_ANALYZE_TIMEOUT_MS = 60_000;
const DEFAULT_CHAT_TIMEOUT_MS = 35_000;
const MAX_RETRY_ATTEMPTS = 3;
const BASE_RETRY_DELAY_MS = 1_500;

export class AgentRouterServiceError extends Error implements AiServiceErrorDetails {
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
    this.name = 'AgentRouterServiceError';
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

function calculateRetryDelayMs(attemptNumber: number): number {
  const jitter = Math.floor(Math.random() * 400);
  return BASE_RETRY_DELAY_MS * Math.pow(2, attemptNumber - 1) + jitter;
}

function createAgentRouterServiceError(
  code: AiErrorCode,
  modelName: string,
  overrides?: Partial<AiServiceErrorDetails>,
): AgentRouterServiceError {
  const defaults: Record<AiErrorCode, Omit<AiServiceErrorDetails, 'code' | 'modelName'>> = {
    invalid_api_key: {
      message: 'API Key AgentRouter không hợp lệ hoặc hết hạn.',
      retryable: false,
      suggestedAction: 'Hãy kiểm tra lại API Key từ AgentRouter Console (đăng nhập qua GitHub).',
    },
    quota_exceeded: {
      message: 'Tài khoản AgentRouter đã hết số dư hoặc cạn kiệt tài nguyên.',
      retryable: false,
      suggestedAction: 'Vui lòng kiểm tra số dư khả dụng trên console của AgentRouter.',
    },
    rate_limited: {
      message: 'AgentRouter đang giới hạn tốc độ gọi của bạn.',
      retryable: true,
      suggestedAction: 'Hệ thống sẽ tự động thử lại sau ít giây. Vui lòng không gửi yêu cầu dồn dập.',
    },
    model_overloaded: {
      message: 'Mô hình đích trên AgentRouter đang quá tải hoặc lỗi định tuyến.',
      retryable: true,
      suggestedAction: 'Hãy chờ hệ thống thử lại hoặc chuyển đổi sang mô hình khác ổn định hơn như gpt-4o-mini.',
    },
    network_unavailable: {
      message: 'Không thể kết nối mạng tới máy chủ AgentRouter.',
      retryable: true,
      suggestedAction: 'Kiểm tra lại kết nối Internet của bạn hoặc cấu hình VPN/Proxy.',
    },
    request_timeout: {
      message: 'AgentRouter phản hồi quá lâu nên yêu cầu đã hết thời gian chờ.',
      retryable: true,
      suggestedAction: 'Hãy thử lại sau, hoặc đổi sang mô hình có tốc độ phản hồi nhanh hơn.',
    },
    empty_response: {
      message: 'AgentRouter trả về phản hồi rỗng.',
      retryable: true,
      suggestedAction: 'Hãy thử chạy lại phân tích hoặc thay đổi mô hình khác.',
    },
    invalid_json: {
      message: 'Đầu ra từ AgentRouter bị thiếu hoặc không đúng định dạng JSON yêu cầu.',
      retryable: true,
      suggestedAction: 'Bạn có thể thử lại. Nếu vẫn lỗi, hãy chọn các mô hình lớn hơn để có cấu trúc đầu ra chuẩn xác.',
    },
    user_cancelled: {
      message: 'Yêu cầu AI đã bị hủy bỏ bởi người dùng.',
      retryable: false,
      suggestedAction: 'Bạn có thể chạy lại phân tích khi sẵn sàng.',
    },
    content_blocked: {
      message: 'Yêu cầu bị chặn do chính sách nội dung hoặc giới hạn tài khoản của AgentRouter.',
      retryable: false,
      suggestedAction: 'Vui lòng kiểm tra lại gói tài khoản/số dư trên AgentRouter Console, hoặc thử chuyển sang mô hình khác (ví dụ: deepseek/deepseek-chat hoặc openai/gpt-4o-mini).',
    },
    unknown: {
      message: 'Đã xảy ra lỗi không xác định từ AgentRouter.',
      retryable: false,
      suggestedAction: 'Hãy thử lại hoặc kiểm tra thông tin log lỗi trong Console F12.',
    },
  };

  return new AgentRouterServiceError({
    code,
    modelName,
    ...defaults[code],
    ...overrides,
  });
}

function normalizeAgentRouterError(
  error: unknown,
  modelName: string,
  attemptNumber: number,
  maxAttempts: number,
  timeoutTriggered: boolean,
): AgentRouterServiceError {
  if (error instanceof AgentRouterServiceError) {
    return new AgentRouterServiceError({
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
    return createAgentRouterServiceError('request_timeout', modelName, {
      attemptNumber,
      maxAttempts,
    });
  }

  if (isAbortError(error)) {
    return createAgentRouterServiceError('user_cancelled', modelName, {
      attemptNumber,
      maxAttempts,
    });
  }

  const status = inferStatusCode(error);
  const message = error instanceof Error ? error.message : String(error ?? '');
  const lower = message.toLowerCase();

  if (/content-blocked|content_blocked/i.test(message)) {
    return createAgentRouterServiceError('content_blocked', modelName, { status, attemptNumber, maxAttempts, message });
  }

  if (status === 401 || status === 403 || /api key|permission|credential|unauthori|forbidden|auth/i.test(message)) {
    return createAgentRouterServiceError('invalid_api_key', modelName, { status, attemptNumber, maxAttempts, message });
  }

  if (/quota|resource has been exhausted|insufficient balance|billing|insufficient_funds/i.test(message)) {
    return createAgentRouterServiceError('quota_exceeded', modelName, { status, attemptNumber, maxAttempts, message });
  }

  if (status === 429 || /rate limit|too many requests/i.test(message)) {
    return createAgentRouterServiceError('rate_limited', modelName, { status, attemptNumber, maxAttempts, message });
  }

  if (status === 503 || status === 502 || /overloaded|overload|temporarily unavailable|unavailable|try again later|gateway/i.test(message)) {
    return createAgentRouterServiceError('model_overloaded', modelName, { status, attemptNumber, maxAttempts, message });
  }

  if (
    status === 408
    || status === 504
    || /timed out|timeout|deadline/i.test(message)
  ) {
    return createAgentRouterServiceError('request_timeout', modelName, { status, attemptNumber, maxAttempts, message });
  }

  if (
    /failed to fetch|network|load failed|fetch failed|econnreset|enetunreach|dns/i.test(lower)
  ) {
    return createAgentRouterServiceError('network_unavailable', modelName, { status, attemptNumber, maxAttempts, message });
  }

  return createAgentRouterServiceError('unknown', modelName, {
    status,
    attemptNumber,
    maxAttempts,
    message: message || 'AgentRouter gặp lỗi chưa xác định khi xử lý yêu cầu.',
  });
}

function shouldRetry(error: AgentRouterServiceError, attemptNumber: number, maxAttempts: number): boolean {
  if (!error.retryable) {
    return false;
  }

  return attemptNumber < maxAttempts;
}

export class AgentRouterService {
  /**
   * Gọi AgentRouter để phân tích Mệnh Bàn trả về Structured JSON Output bằng SSE stream (Sử dụng OpenAI SDK)
   */
  static async analyzeChartJSON(
    apiKey: string,
    chart: ZiweiChart,
    targetPalaceName?: PalaceName,
    userQuestion?: string,
    modelName: string = 'deepseek/deepseek-chat',
    bridgeContext?: AnalysisBridgeContext,
    options?: AgentRouterAnalyzeOptions,
  ): Promise<StructuredAiResponse> {
    if (!apiKey) throw new Error("API Key không hợp lệ.");

    const systemInstruction = PromptBuilder.buildSystemInstruction();
    const prompt = PromptBuilder.buildAnalysisPrompt(chart, targetPalaceName, userQuestion, bridgeContext);
    const maxAttempts = MAX_RETRY_ATTEMPTS;

    const client = new OpenAI({
      apiKey,
      baseURL: 'https://agentrouter.org/v1',
      dangerouslyAllowBrowser: true, // Cho phép chạy trực tiếp từ browser
    });

    for (let attemptNumber = 1; attemptNumber <= maxAttempts; attemptNumber += 1) {
      const timeoutMs = options?.timeoutMs ?? DEFAULT_ANALYZE_TIMEOUT_MS;
      
      try {
        const stream = await client.chat.completions.create({
          model: modelName,
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          stream: true,
          // Sử dụng json_object để đảm bảo tương thích tốt nhất với mọi model hỗ trợ JSON Mode
          response_format: {
            type: "json_object"
          }
        }, {
          signal: options?.abortSignal,
          timeout: timeoutMs,
        });

        let responseText = '';
        let receivedChunks = 0;

        for await (const chunk of stream) {
          const chunkText = chunk.choices[0]?.delta?.content ?? '';
          if (chunkText) {
            responseText += chunkText;
            receivedChunks += 1;
            options?.onStreamEvent?.({
              chunkText,
              fullText: responseText,
              receivedChars: responseText.length,
              receivedChunks,
            });
          }
        }

        if (!responseText.trim()) {
          throw createAgentRouterServiceError('empty_response', modelName, {
            attemptNumber,
            maxAttempts,
          });
        }

        try {
          return normalizeAnalysisResponse(JSON.parse(extractJsonPayload(responseText)));
        } catch {
          throw createAgentRouterServiceError('invalid_json', modelName, {
            attemptNumber,
            maxAttempts,
          });
        }
      } catch (error: unknown) {
        // Kiểm tra xem lỗi có phải do timeout của signal không
        const isTimeout = error instanceof Error && (error.name === 'TimeoutError' || error.message.includes('timeout'));
        const normalizedError = normalizeAgentRouterError(error, modelName, attemptNumber, maxAttempts, isTimeout);
        console.error("AgentRouter API Error:", normalizedError, error);

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
      }
    }

    throw createAgentRouterServiceError('unknown', modelName);
  }

  /**
   * Tính năng Chat đàm thoại follow-up sử dụng AgentRouter (Sử dụng OpenAI SDK).
   */
  static createChatSession(
    apiKey: string,
    modelName: string = 'deepseek/deepseek-chat',
  ): AgentRouterChatSession {
    if (!apiKey) throw new Error("API Key không hợp lệ.");

    const client = new OpenAI({
      apiKey,
      baseURL: 'https://agentrouter.org/v1',
      dangerouslyAllowBrowser: true,
    });

    return {
      sendMessage: async (thread: AnalysisThread, msg: string, options?: AgentRouterChatOptions) => {
        const maxAttempts = MAX_RETRY_ATTEMPTS;

        for (let attemptNumber = 1; attemptNumber <= maxAttempts; attemptNumber += 1) {
          try {
            const response = await client.chat.completions.create({
              model: modelName,
              messages: [
                { role: "system", content: PromptBuilder.buildFollowUpSystemInstruction() },
                { role: "user", content: PromptBuilder.buildFollowUpPrompt(thread, msg) }
              ],
              temperature: 0.7,
              stream: false,
            }, {
              signal: options?.abortSignal,
              timeout: options?.timeoutMs ?? DEFAULT_CHAT_TIMEOUT_MS,
            });

            const text = response.choices[0]?.message?.content?.trim();

            if (!text) {
              throw createAgentRouterServiceError('empty_response', modelName, {
                attemptNumber,
                maxAttempts,
              });
            }

            return text;
          } catch (error: unknown) {
            const isTimeout = error instanceof Error && (error.name === 'TimeoutError' || error.message.includes('timeout'));
            const normalizedError = normalizeAgentRouterError(error, modelName, attemptNumber, maxAttempts, isTimeout);
            console.error("AgentRouter Chat Error:", normalizedError, error);

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
          }
        }

        throw createAgentRouterServiceError('unknown', modelName);
      },
    };
  }
}
