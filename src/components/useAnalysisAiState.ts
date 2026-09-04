import { useEffect, useRef, useState } from 'react';
import type {
  AiErrorCode,
  AiModelHealthSnapshot,
  AiRetryAttempt,
  AiServiceErrorDetails,
  AnalysisFocusArea,
  AnalysisThread,
  PalaceName,
  ZiweiChart,
} from '../core/types/ZiweiTypes';
import { AiTelemetryService } from '../services/AiTelemetryService';
import type { GeminiChatSession } from '../services/GeminiService';
import type { AgentRouterChatSession } from '../services/AgentRouterService';
import type { StructuredAiResponse } from '../services/PromptBuilder';
import { AnalysisThreadService } from '../services/AnalysisThreadService';

export type AiProvider = 'gemini' | 'agentrouter';

type AnalysisStreamPhase = 'idle' | 'requesting' | 'receiving' | 'retrying';

export interface AnalysisStreamStatus {
  phase: AnalysisStreamPhase;
  focusArea: AnalysisFocusArea | null;
  receivedChars: number;
  receivedChunks: number;
  attemptNumber: number;
  maxAttempts: number;
  retryAfterMs: number;
  retryCode: AiErrorCode | null;
}

export interface UiErrorState {
  message: string;
  suggestion: string;
  retryable: boolean;
  code: AiErrorCode;
}

export interface ModelFallbackState {
  fromModel: string;
  toModel: string;
  reasonCode: AiErrorCode;
}

interface ModelAttemptResult {
  response: StructuredAiResponse;
  modelName: string;
}

interface UseAnalysisAiStateParams {
  chart: ZiweiChart;
  targetPalaceName?: PalaceName;
  onNavigateFocus?: (focusArea: AnalysisFocusArea) => void;
}

interface UseAnalysisAiStateResult {
  apiKey: string;
  selectedModel: string;
  activeModel: string;
  aiProvider: AiProvider;
  isLoading: boolean;
  analysisResult: StructuredAiResponse | null;
  currentThread: AnalysisThread | null;
  currentChatSession: GeminiChatSession | AgentRouterChatSession | null;
  errorState: UiErrorState | null;
  fallbackState: ModelFallbackState | null;
  suggestedRecoveryModel: string | null;
  lastFailureScope: 'analysis' | 'chat' | null;
  isShowingLastGoodResult: boolean;
  activeModelHealth: AiModelHealthSnapshot;
  question: string;
  pendingChatMessage: string | null;
  pendingChatElapsedMs: number;
  streamStatus: AnalysisStreamStatus;
  currentFocus: AnalysisFocusArea;
  hasAnalysisResult: boolean;
  visiblePalaceFocus?: PalaceName;
  loadingFocusArea: AnalysisFocusArea;
  loadingMessage: string;
  loadingHint: string;
  activeModelHealthText: string;
  activeModelLatencyText: string;
  setQuestion: (value: string) => void;
  handleAnalyze: (specificPalace?: PalaceName) => Promise<void>;
  handleSendMessage: (e: React.FormEvent) => Promise<void>;
  handleResetThread: () => void;
  handleNavigateFocus: (focusArea: AnalysisFocusArea) => void;
  retryAnalyze: () => void;
  retryAnalyzeWithSuggestedModel: () => void;
  cancelActiveAnalysis: () => void;
  cancelActiveChatRequest: () => void;
  retryLastMessage: () => Promise<void>;
  retryLastMessageWithSuggestedModel: () => Promise<void>;
  handleKeyReady: (key: string, model: string, provider?: AiProvider) => void;
  handleLockKey: () => void;
}

const IDLE_STREAM_STATUS: AnalysisStreamStatus = {
  phase: 'idle',
  focusArea: null,
  receivedChars: 0,
  receivedChunks: 0,
  attemptNumber: 0,
  maxAttempts: 0,
  retryAfterMs: 0,
  retryCode: null,
};

const STREAM_STATUS_UPDATE_INTERVAL_MS = 500;
const FALLBACK_MODEL_ORDER = [
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-3-flash-preview',
  'gemini-3.1-flash-lite-preview',
  'gemini-pro-latest',
  'gemini-2.5-pro',
  'gemini-3.1-pro-preview',
] as const;

const AGENTROUTER_FALLBACK_MODEL_ORDER = [
  'openai/gpt-4o-mini',
  'deepseek/deepseek-chat',
  'anthropic/claude-3-5-sonnet',
  'openai/gpt-4o',
];

let geminiServiceModulePromise: Promise<typeof import('../services/GeminiService')> | null = null;
let agentRouterServiceModulePromise: Promise<typeof import('../services/AgentRouterService')> | null = null;

function loadGeminiServiceModule(): Promise<typeof import('../services/GeminiService')> {
  if (!geminiServiceModulePromise) {
    geminiServiceModulePromise = import('../services/GeminiService');
  }
  return geminiServiceModulePromise;
}

function loadAgentRouterServiceModule(): Promise<typeof import('../services/AgentRouterService')> {
  if (!agentRouterServiceModulePromise) {
    agentRouterServiceModulePromise = import('../services/AgentRouterService');
  }
  return agentRouterServiceModulePromise;
}

function formatFocusAreaLabel(focusArea: AnalysisFocusArea): string {
  return focusArea === 'overall' ? 'tổng quan mệnh bàn' : `cung ${focusArea}`;
}

function formatStreamSize(receivedChars: number): string {
  if (receivedChars < 1024) {
    return `${receivedChars} ký tự`;
  }

  return `${(receivedChars / 1024).toFixed(1)} KB`;
}

function isThinkingHeavyModel(modelName: string): boolean {
  return modelName.includes('2.5') || modelName.includes('reasoner') || modelName.includes('opus');
}

function isAiServiceErrorDetails(value: unknown): value is AiServiceErrorDetails {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<AiServiceErrorDetails>;
  return typeof candidate.code === 'string'
    && typeof candidate.message === 'string'
    && typeof candidate.retryable === 'boolean'
    && typeof candidate.suggestedAction === 'string';
}

function toUiErrorState(error: unknown, fallbackMessage: string): UiErrorState {
  if (isAiServiceErrorDetails(error)) {
    const friendlyMessageByCode: Partial<Record<AiErrorCode, string>> = {
      model_overloaded: 'AI đang bận xử lý nhiều yêu cầu cùng lúc.',
      request_timeout: 'AI phản hồi chậm hơn bình thường nên lần thử này chưa hoàn tất.',
      network_unavailable: 'Kết nối tới AI đang chập chờn nên câu trả lời chưa về kịp.',
      empty_response: 'AI vừa rồi chưa trả lại nội dung rõ ràng.',
      invalid_json: 'AI đã phản hồi nhưng phần dữ liệu trả về chưa trọn vẹn.',
      rate_limited: 'AI đang tạm giới hạn nhịp gửi yêu cầu trong ít giây.',
      quota_exceeded: 'API Key hiện tại đã chạm hạn mức sử dụng.',
      invalid_api_key: 'API Key hiện tại chưa dùng được cho yêu cầu này.',
      content_blocked: 'Yêu cầu bị chặn do chính sách nội dung hoặc giới hạn tài khoản của AgentRouter.',
    };

    const friendlySuggestionByCode: Partial<Record<AiErrorCode, string>> = {
      model_overloaded: 'Bạn có thể chờ một chút rồi thử lại, hoặc đổi tạm sang model nhẹ hơn nếu muốn tiếp tục nhanh.',
      request_timeout: 'Bạn có thể thử lại ngay, hoặc đổi sang model phản hồi nhanh hơn nếu muốn.',
      network_unavailable: 'Bạn có thể gửi lại sau ít giây. Nếu mạng vẫn chập chờn, hãy thử lại bằng model khác.',
      empty_response: 'Bạn có thể gửi lại nguyên câu hỏi vừa rồi, hoặc thử lại bằng model khác.',
      invalid_json: 'Bạn có thể thử lại ngay để nhận phản hồi trọn vẹn hơn.',
      rate_limited: 'Bạn có thể đợi ít giây rồi thử lại, hoặc tạm đổi model nếu đang cần phản hồi ngay.',
      quota_exceeded: 'Hãy dùng API Key khác hoặc chờ hạn mức được làm mới rồi thử lại.',
      invalid_api_key: 'Hãy kiểm tra lại API Key hoặc mở khóa lại bằng key khác.',
      content_blocked: 'Vui lòng kiểm tra lại số dư/gói tài khoản trên AgentRouter Console, hoặc thử chuyển sang mô hình khác như DeepSeek Chat hay GPT-4o Mini.',
    };

    const baseFriendlyMessage = friendlyMessageByCode[error.code] ?? error.message;
    const isDetailed = error.message && error.message !== friendlyMessageByCode[error.code];
    const finalMessage = isDetailed 
      ? `${baseFriendlyMessage} (Chi tiết: ${error.message})`
      : baseFriendlyMessage;

    return {
      message: finalMessage,
      suggestion: friendlySuggestionByCode[error.code] ?? error.suggestedAction,
      retryable: error.retryable,
      code: error.code,
    };
  }

  if (error instanceof Error && error.message) {
    return {
      message: error.message,
      suggestion: 'Bạn có thể thử lại sau ít giây. Nếu lỗi lặp lại, hãy đổi model hoặc mở khóa lại API Key.',
      retryable: false,
      code: 'unknown',
    };
  }

  return {
    message: fallbackMessage,
    suggestion: 'Bạn có thể thử lại sau ít giây. Nếu lỗi lặp lại, hãy đổi model hoặc mở khóa lại API Key.',
    retryable: false,
    code: 'unknown',
  };
}

function formatRetryDelay(ms: number): string {
  return `${(ms / 1000).toFixed(ms >= 10_000 ? 0 : 1)} giây`;
}

function shouldTryFallbackModel(code: AiErrorCode): boolean {
  return code === 'model_overloaded'
    || code === 'request_timeout'
    || code === 'network_unavailable'
    || code === 'empty_response'
    || code === 'invalid_json'
    || code === 'rate_limited';
}

function getFallbackModels(preferredModel: string, currentModel: string, provider: AiProvider): string[] {
  const order = provider === 'gemini' ? FALLBACK_MODEL_ORDER : AGENTROUTER_FALLBACK_MODEL_ORDER;
  const candidates = [preferredModel, currentModel, ...order]
    .filter((model, index, items): model is string => Boolean(model) && items.indexOf(model) === index)
    .filter(model => model !== currentModel);

  return AiTelemetryService.rankModels(candidates);
}

function formatHealthLabel(snapshot: AiModelHealthSnapshot): string {
  switch (snapshot.healthLabel) {
    case 'excellent':
      return 'Độ ổn định rất tốt';
    case 'good':
      return 'Độ ổn định tốt';
    case 'watch':
      return 'Đang cần theo dõi';
    case 'risky':
      return 'Độ ổn định thấp';
    default:
      return 'Chưa đủ dữ liệu ổn định';
  }
}

export function useAnalysisAiState({
  chart,
  targetPalaceName,
  onNavigateFocus,
}: UseAnalysisAiStateParams): UseAnalysisAiStateResult {
  const [apiKey, setApiKey] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.1-pro-preview');
  const [activeModel, setActiveModel] = useState<string>('gemini-3.1-pro-preview');
  const [aiProvider, setAiProvider] = useState<AiProvider>('gemini');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<StructuredAiResponse | null>(null);
  const [currentThread, setCurrentThread] = useState<AnalysisThread | null>(null);
  const [currentChatSession, setCurrentChatSession] = useState<GeminiChatSession | AgentRouterChatSession | null>(null);
  const [errorState, setErrorState] = useState<UiErrorState | null>(null);
  const [fallbackState, setFallbackState] = useState<ModelFallbackState | null>(null);
  const [suggestedRecoveryModel, setSuggestedRecoveryModel] = useState<string | null>(null);
  const [lastFailureScope, setLastFailureScope] = useState<'analysis' | 'chat' | null>(null);
  const [isShowingLastGoodResult, setIsShowingLastGoodResult] = useState(false);
  const [activeModelHealth, setActiveModelHealth] = useState<AiModelHealthSnapshot>(() => AiTelemetryService.getSnapshot('gemini-3.1-pro-preview'));
  const [question, setQuestion] = useState<string>('');
  const [pendingChatMessage, setPendingChatMessage] = useState<string | null>(null);
  const [pendingChatStartedAt, setPendingChatStartedAt] = useState<number | null>(null);
  const [pendingChatElapsedMs, setPendingChatElapsedMs] = useState(0);
  const lastFailedUserMessageRef = useRef<string | null>(null);
  const [streamStatus, setStreamStatus] = useState<AnalysisStreamStatus>(IDLE_STREAM_STATUS);
  const analyzeRequestIdRef = useRef(0);
  const activeRequestAbortRef = useRef<AbortController | null>(null);
  const activeAttemptRef = useRef<{ attemptNumber: number; maxAttempts: number }>({ attemptNumber: 1, maxAttempts: 3 });
  const pendingStreamStatusRef = useRef<AnalysisStreamStatus | null>(null);
  const streamStatusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastStreamStatusCommitAtRef = useRef(0);

  const currentFocus: AnalysisFocusArea = targetPalaceName ?? 'overall';
  const hasAnalysisResult = !!analysisResult;
  const visiblePalaceFocus = currentThread && currentThread.focusArea !== 'overall'
    ? currentThread.focusArea
    : targetPalaceName;

  const syncThreadState = (thread: AnalysisThread | null) => {
    setCurrentThread(thread);
    setAnalysisResult(thread?.analysis ?? null);
  };

  const cancelActiveAnalysis = () => {
    analyzeRequestIdRef.current += 1;
    activeRequestAbortRef.current?.abort('user_cancelled');
    activeRequestAbortRef.current = null;
    pendingStreamStatusRef.current = null;
    if (streamStatusTimerRef.current) {
      clearTimeout(streamStatusTimerRef.current);
      streamStatusTimerRef.current = null;
    }
    setIsLoading(false);
    setStreamStatus(IDLE_STREAM_STATUS);
  };

  const cancelActiveChatRequest = () => {
    activeRequestAbortRef.current?.abort('user_cancelled');
    activeRequestAbortRef.current = null;
    setIsLoading(false);
    setPendingChatMessage(null);
    setPendingChatStartedAt(null);
  };

  const commitStreamStatus = (status: AnalysisStreamStatus) => {
    pendingStreamStatusRef.current = null;

    if (streamStatusTimerRef.current) {
      clearTimeout(streamStatusTimerRef.current);
      streamStatusTimerRef.current = null;
    }

    lastStreamStatusCommitAtRef.current = Date.now();
    setStreamStatus(status);
  };

  const scheduleStreamStatus = (status: AnalysisStreamStatus) => {
    pendingStreamStatusRef.current = status;

    const now = Date.now();
    const elapsed = now - lastStreamStatusCommitAtRef.current;
    const shouldCommitNow = status.receivedChunks <= 1 || elapsed >= STREAM_STATUS_UPDATE_INTERVAL_MS;

    if (shouldCommitNow) {
      commitStreamStatus(status);
      return;
    }

    if (streamStatusTimerRef.current) {
      return;
    }

    streamStatusTimerRef.current = setTimeout(() => {
      streamStatusTimerRef.current = null;
      if (pendingStreamStatusRef.current) {
        commitStreamStatus(pendingStreamStatusRef.current);
      }
    }, STREAM_STATUS_UPDATE_INTERVAL_MS - elapsed);
  };

  useEffect(() => {
    setActiveModelHealth(AiTelemetryService.getSnapshot(activeModel));
  }, [activeModel]);

  useEffect(() => {
    if (!pendingChatStartedAt) {
      setPendingChatElapsedMs(0);
      return;
    }

    setPendingChatElapsedMs(Math.max(0, Date.now() - pendingChatStartedAt));
    const timer = setInterval(() => {
      setPendingChatElapsedMs(Math.max(0, Date.now() - pendingChatStartedAt));
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [pendingChatStartedAt]);

  useEffect(() => {
    if (!apiKey || !hasAnalysisResult) {
      setCurrentChatSession(null);
      return;
    }

    let cancelled = false;
    setCurrentChatSession(null);

    if (aiProvider === 'gemini') {
      void loadGeminiServiceModule()
        .then(({ GeminiService }) => {
          if (cancelled) {
            return;
          }
          setCurrentChatSession(GeminiService.createChatSession(apiKey, activeModel));
        })
        .catch(() => {
          if (!cancelled) {
            setCurrentChatSession(null);
          }
        });
    } else {
      void loadAgentRouterServiceModule()
        .then(({ AgentRouterService }) => {
          if (cancelled) {
            return;
          }
          setCurrentChatSession(AgentRouterService.createChatSession(apiKey, activeModel));
        })
        .catch(() => {
          if (!cancelled) {
            setCurrentChatSession(null);
          }
        });
    }

    return () => {
      cancelled = true;
    };
  }, [apiKey, activeModel, hasAnalysisResult, aiProvider]);

  useEffect(() => () => {
    analyzeRequestIdRef.current += 1;
    activeRequestAbortRef.current?.abort('user_cancelled');
    activeRequestAbortRef.current = null;
    pendingStreamStatusRef.current = null;
    if (streamStatusTimerRef.current) {
      clearTimeout(streamStatusTimerRef.current);
      streamStatusTimerRef.current = null;
    }
  }, []);

  const handleAnalyze = async (specificPalace?: PalaceName) => {
    await analyzeWithModel(activeModel, specificPalace);
  };

  const analyzeWithModel = async (modelName: string, specificPalace?: PalaceName) => {
    if (!apiKey) {
      setErrorState({
        message: 'Vui lòng mở khóa API key trước.',
        suggestion: 'Sau khi mở khóa, bạn có thể chạy lại phân tích ngay.',
        retryable: false,
        code: 'invalid_api_key',
      });
      return;
    }

    const sourceThread = currentThread;
    const focusArea: AnalysisFocusArea = specificPalace ?? 'overall';
    const bridgeContext = AnalysisThreadService.buildBridgeContext(sourceThread, focusArea);
    const requestId = analyzeRequestIdRef.current + 1;
    const abortController = new AbortController();
    analyzeRequestIdRef.current = requestId;
    activeRequestAbortRef.current?.abort('user_cancelled');
    activeRequestAbortRef.current = abortController;

    setIsLoading(true);
    setErrorState(null);
    setLastFailureScope(null);
    setSuggestedRecoveryModel(null);
    if (modelName === activeModel) {
      setFallbackState(null);
    }
    setIsShowingLastGoodResult(!!analysisResult);
    setStreamStatus({
      phase: 'requesting',
      focusArea,
      receivedChars: 0,
      receivedChunks: 0,
      attemptNumber: 1,
      maxAttempts: 3,
      retryAfterMs: 0,
      retryCode: null,
    });
    activeAttemptRef.current = { attemptNumber: 1, maxAttempts: 3 };

    try {
      let response;
      const startedAt = Date.now();
      
      if (aiProvider === 'gemini') {
        const { GeminiService } = await loadGeminiServiceModule();
        activeAttemptRef.current = { attemptNumber: 1, maxAttempts: 3 };
        response = await GeminiService.analyzeChartJSON(
          apiKey,
          chart,
          specificPalace,
          undefined,
          modelName,
          bridgeContext,
          {
            abortSignal: abortController.signal,
            onStreamEvent: (event) => {
              if (analyzeRequestIdRef.current !== requestId) {
                return;
              }

              scheduleStreamStatus({
                phase: 'receiving',
                focusArea,
                receivedChars: event.receivedChars,
                receivedChunks: event.receivedChunks,
                attemptNumber: activeAttemptRef.current.attemptNumber,
                maxAttempts: activeAttemptRef.current.maxAttempts,
                retryAfterMs: 0,
                retryCode: null,
              });
            },
            onRetryAttempt: (attempt: AiRetryAttempt) => {
              if (analyzeRequestIdRef.current !== requestId) {
                return;
              }

              commitStreamStatus({
                phase: 'retrying',
                focusArea,
                receivedChars: 0,
                receivedChunks: 0,
                attemptNumber: attempt.attemptNumber,
                maxAttempts: attempt.maxAttempts,
                retryAfterMs: attempt.retryAfterMs,
                retryCode: attempt.code,
              });
              activeAttemptRef.current = {
                attemptNumber: attempt.attemptNumber,
                maxAttempts: attempt.maxAttempts,
              };
            },
          },
        );
      } else {
        const { AgentRouterService } = await loadAgentRouterServiceModule();
        activeAttemptRef.current = { attemptNumber: 1, maxAttempts: 3 };
        response = await AgentRouterService.analyzeChartJSON(
          apiKey,
          chart,
          specificPalace,
          undefined,
          modelName,
          bridgeContext,
          {
            abortSignal: abortController.signal,
            onStreamEvent: (event) => {
              if (analyzeRequestIdRef.current !== requestId) {
                return;
              }

              scheduleStreamStatus({
                phase: 'receiving',
                focusArea,
                receivedChars: event.receivedChars,
                receivedChunks: event.receivedChunks,
                attemptNumber: activeAttemptRef.current.attemptNumber,
                maxAttempts: activeAttemptRef.current.maxAttempts,
                retryAfterMs: 0,
                retryCode: null,
              });
            },
            onRetryAttempt: (attempt: AiRetryAttempt) => {
              if (analyzeRequestIdRef.current !== requestId) {
                return;
              }

              commitStreamStatus({
                phase: 'retrying',
                focusArea,
                receivedChars: 0,
                receivedChunks: 0,
                attemptNumber: attempt.attemptNumber,
                maxAttempts: attempt.maxAttempts,
                retryAfterMs: attempt.retryAfterMs,
                retryCode: attempt.code,
              });
              activeAttemptRef.current = {
                attemptNumber: attempt.attemptNumber,
                maxAttempts: attempt.maxAttempts,
              };
            },
          },
        );
      }

      AiTelemetryService.recordSuccess(modelName, Date.now() - startedAt);
      const result: ModelAttemptResult = {
        response,
        modelName,
      };
      if (analyzeRequestIdRef.current !== requestId) {
        return;
      }

      const thread = AnalysisThreadService.createThread(chart, focusArea, result.response, bridgeContext);
      AnalysisThreadService.saveThread(thread);
      syncThreadState(thread);
      if (modelName !== activeModel) {
        setFallbackState({
          fromModel: activeModel,
          toModel: modelName,
          reasonCode: errorState?.code ?? 'unknown',
        });
      }
      setActiveModel(modelName);
      setActiveModelHealth(AiTelemetryService.getSnapshot(result.modelName));
      setIsShowingLastGoodResult(false);
      setLastFailureScope(null);
      setSuggestedRecoveryModel(null);
    } catch (err: unknown) {
      if (analyzeRequestIdRef.current !== requestId) {
        return;
      }

      const nextError = toUiErrorState(err, 'Lỗi khi gọi AI.');
      const backupModel = shouldTryFallbackModel(nextError.code)
        ? getFallbackModels(selectedModel, modelName, aiProvider)[0] ?? null
        : null;
      setSuggestedRecoveryModel(backupModel);
      setLastFailureScope('analysis');
      setActiveModelHealth(AiTelemetryService.recordFailure(modelName, nextError.code));
      if (nextError.code !== 'user_cancelled') {
        setErrorState(nextError);
        setIsShowingLastGoodResult(!!analysisResult);
      }
    } finally {
      if (analyzeRequestIdRef.current === requestId) {
        activeRequestAbortRef.current = null;
        pendingStreamStatusRef.current = null;
        if (streamStatusTimerRef.current) {
          clearTimeout(streamStatusTimerRef.current);
          streamStatusTimerRef.current = null;
        }
        setIsLoading(false);
        setStreamStatus(IDLE_STREAM_STATUS);
        activeAttemptRef.current = { attemptNumber: 1, maxAttempts: 3 };
      }
    }
  };

  useEffect(() => {
    if (!apiKey) {
      return;
    }

    const savedThread = AnalysisThreadService.loadThread(chart, currentFocus);
    if (savedThread) {
      syncThreadState(savedThread);
      setErrorState(null);
      return;
    }

    if (targetPalaceName) {
      void handleAnalyze(targetPalaceName);
    }
  }, [targetPalaceName, apiKey, chart]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !currentChatSession || !currentThread) {
      return;
    }

    await sendMessageWithModel(question.trim(), activeModel);
  };

  const sendMessageWithModel = async (userMessage: string, modelName: string) => {
    if (!currentThread) {
      return;
    }

    setErrorState(null);
    setLastFailureScope(null);
    setSuggestedRecoveryModel(null);
    if (modelName === activeModel) {
      setFallbackState(null);
    }

    try {
      const abortController = new AbortController();
      activeRequestAbortRef.current?.abort('user_cancelled');
      activeRequestAbortRef.current = abortController;
      setIsLoading(true);
      setPendingChatMessage(userMessage);
      setPendingChatStartedAt(Date.now());
      setStreamStatus({
        phase: 'requesting',
        focusArea: currentThread.focusArea,
        receivedChars: 0,
        receivedChunks: 0,
        attemptNumber: 1,
        maxAttempts: 3,
        retryAfterMs: 0,
        retryCode: null,
      });

      let session;
      if (aiProvider === 'gemini') {
        const { GeminiService } = await loadGeminiServiceModule();
        session = modelName === activeModel && currentChatSession
          ? currentChatSession
          : GeminiService.createChatSession(apiKey, modelName);
      } else {
        const { AgentRouterService } = await loadAgentRouterServiceModule();
        session = modelName === activeModel && currentChatSession
          ? currentChatSession
          : AgentRouterService.createChatSession(apiKey, modelName);
      }
      
      const startedAt = Date.now();
      const aiResponse = await session.sendMessage(currentThread, userMessage, {
        abortSignal: abortController.signal,
      });
      AiTelemetryService.recordSuccess(modelName, Date.now() - startedAt);

      const threadWithUserTurn = AnalysisThreadService.appendTurn(currentThread, 'user', userMessage);
      const threadWithReply = AnalysisThreadService.appendTurn(threadWithUserTurn, 'ai', aiResponse);
      syncThreadState(threadWithReply);
      AnalysisThreadService.saveThread(threadWithReply);
      setQuestion('');
      lastFailedUserMessageRef.current = null;
      setPendingChatMessage(null);
    } catch (err: unknown) {
      const nextError = toUiErrorState(err, 'Lỗi khi gửi tin nhắn.');
      const backupModel = shouldTryFallbackModel(nextError.code)
        ? getFallbackModels(selectedModel, modelName, aiProvider)[0] ?? null
        : null;
      setSuggestedRecoveryModel(backupModel);
      setLastFailureScope('chat');
      lastFailedUserMessageRef.current = userMessage;
      setActiveModelHealth(AiTelemetryService.recordFailure(modelName, nextError.code));
      if (nextError.code !== 'user_cancelled') {
        setErrorState(nextError);
      }
      setPendingChatMessage(null);
    } finally {
      activeRequestAbortRef.current = null;
      setIsLoading(false);
      setPendingChatStartedAt(null);
      setStreamStatus(IDLE_STREAM_STATUS);
    }
  };

  const handleResetThread = () => {
    if (!currentThread) return;
    if (confirm('Bạn có chắc muốn xóa lịch sử đàm thoại của cung vị này không?')) {
      const reset = AnalysisThreadService.resetConversation(currentThread);
      syncThreadState(reset);
      setErrorState(null);
      setLastFailureScope(null);
      setSuggestedRecoveryModel(null);
      setQuestion('');
    }
  };

  const handleNavigateFocus = (focusArea: AnalysisFocusArea) => {
    cancelActiveAnalysis();
    if (onNavigateFocus) {
      onNavigateFocus(focusArea);
    }
  };

  const loadingFocusArea = isLoading
    ? (streamStatus.focusArea ?? currentFocus)
    : currentFocus;

  const palaceLabel = formatFocusAreaLabel(loadingFocusArea);

  const getLoadingMessage = () => {
    if (streamStatus.phase === 'requesting') {
      return `Mở cổng linh thức tới tinh cầu AI, đang kết nối để luận giải ${palaceLabel}...`;
    }
    if (streamStatus.phase === 'receiving') {
      return `Tinh tú đang soi rọi... Đã nhận ${formatStreamSize(streamStatus.receivedChars)} dữ liệu luận cung...`;
    }
    if (streamStatus.phase === 'retrying') {
      return `Mạng vũ trụ chập chờn (${streamStatus.retryCode ?? 'error'}). Đang chuẩn bị thử lại lần ${streamStatus.attemptNumber}/${streamStatus.maxAttempts} sau ${formatRetryDelay(streamStatus.retryAfterMs)}...`;
    }
    return '';
  };

  const getLoadingHint = () => {
    if (isThinkingHeavyModel(activeModel)) {
      return 'Các mô hình có tư duy chuyên sâu (Pro/Reasoner/Opus) cần khoảng 10-30 giây để phân tích các tổ hợp sao phức tạp.';
    }
    return 'Các mô hình Flash phản hồi rất nhanh, thường dưới 10 giây.';
  };

  const loadingMessage = getLoadingMessage();
  const loadingHint = getLoadingHint();

  const activeModelHealthText = formatHealthLabel(activeModelHealth);
  const activeModelLatencyText = activeModelHealth.averageLatencyMs
    ? `Độ trễ gần đây khoảng ${(activeModelHealth.averageLatencyMs / 1000).toFixed(1)} giây.`
    : 'Hệ thống đang tích lũy dữ liệu ổn định cho model này.';

  return {
    apiKey,
    selectedModel,
    activeModel,
    aiProvider,
    isLoading,
    analysisResult,
    currentThread,
    currentChatSession,
    errorState,
    fallbackState,
    isShowingLastGoodResult,
    activeModelHealth,
    question,
    pendingChatMessage,
    pendingChatElapsedMs,
    streamStatus,
    currentFocus,
    hasAnalysisResult,
    visiblePalaceFocus,
    loadingFocusArea,
    loadingMessage,
    loadingHint,
    activeModelHealthText,
    activeModelLatencyText,
    setQuestion,
    handleAnalyze,
    handleSendMessage,
    handleResetThread,
    handleNavigateFocus,
    suggestedRecoveryModel,
    lastFailureScope,
    retryAnalyze: () => {
      void handleAnalyze(currentFocus === 'overall' ? undefined : currentFocus);
    },
    retryAnalyzeWithSuggestedModel: () => {
      if (suggestedRecoveryModel) {
        void analyzeWithModel(suggestedRecoveryModel, currentFocus === 'overall' ? undefined : currentFocus);
      }
    },
    cancelActiveAnalysis,
    cancelActiveChatRequest,
    retryLastMessage: async () => {
      if (lastFailedUserMessageRef.current) {
        await sendMessageWithModel(lastFailedUserMessageRef.current, activeModel);
      }
    },
    retryLastMessageWithSuggestedModel: async () => {
      if (lastFailedUserMessageRef.current && suggestedRecoveryModel) {
        await sendMessageWithModel(lastFailedUserMessageRef.current, suggestedRecoveryModel);
      }
    },
    handleKeyReady: (key: string, model: string, provider: AiProvider = 'gemini') => {
      setApiKey(key);
      setSelectedModel(model);
      setActiveModel(model);
      setAiProvider(provider);
      setFallbackState(null);
      setIsShowingLastGoodResult(false);
      setLastFailureScope(null);
      setSuggestedRecoveryModel(null);
      setPendingChatMessage(null);
      setPendingChatStartedAt(null);
    },
    handleLockKey: () => {
      cancelActiveAnalysis();
      setApiKey('');
      setActiveModel(selectedModel);
      syncThreadState(null);
      setCurrentChatSession(null);
      setQuestion('');
      setPendingChatMessage(null);
      setPendingChatStartedAt(null);
    },
  };
}
