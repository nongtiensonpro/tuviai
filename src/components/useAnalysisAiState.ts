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
import type { StructuredAiResponse } from '../services/PromptBuilder';
import { AnalysisThreadService } from '../services/AnalysisThreadService';

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
  isLoading: boolean;
  analysisResult: StructuredAiResponse | null;
  currentThread: AnalysisThread | null;
  currentChatSession: GeminiChatSession | null;
  errorState: UiErrorState | null;
  fallbackState: ModelFallbackState | null;
  isShowingLastGoodResult: boolean;
  activeModelHealth: AiModelHealthSnapshot;
  question: string;
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
  cancelActiveAnalysis: () => void;
  handleKeyReady: (key: string, model: string) => void;
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

let geminiServiceModulePromise: Promise<typeof import('../services/GeminiService')> | null = null;

function loadGeminiServiceModule(): Promise<typeof import('../services/GeminiService')> {
  if (!geminiServiceModulePromise) {
    geminiServiceModulePromise = import('../services/GeminiService');
  }

  return geminiServiceModulePromise;
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
  return modelName.includes('2.5');
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
    return {
      message: error.message,
      suggestion: error.suggestedAction,
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

function getFallbackModels(preferredModel: string, currentModel: string): string[] {
  const candidates = [preferredModel, currentModel, ...FALLBACK_MODEL_ORDER]
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
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<StructuredAiResponse | null>(null);
  const [currentThread, setCurrentThread] = useState<AnalysisThread | null>(null);
  const [currentChatSession, setCurrentChatSession] = useState<GeminiChatSession | null>(null);
  const [errorState, setErrorState] = useState<UiErrorState | null>(null);
  const [fallbackState, setFallbackState] = useState<ModelFallbackState | null>(null);
  const [isShowingLastGoodResult, setIsShowingLastGoodResult] = useState(false);
  const [activeModelHealth, setActiveModelHealth] = useState<AiModelHealthSnapshot>(() => AiTelemetryService.getSnapshot('gemini-3.1-pro-preview'));
  const [question, setQuestion] = useState<string>('');
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
    if (!apiKey || !hasAnalysisResult) {
      setCurrentChatSession(null);
      return;
    }

    let cancelled = false;
    setCurrentChatSession(null);

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

    return () => {
      cancelled = true;
    };
  }, [apiKey, activeModel, hasAnalysisResult]);

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
    setFallbackState(null);
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
      const { GeminiService } = await loadGeminiServiceModule();
      let resolvedModel = activeModel;
      const candidateModels = [activeModel, ...getFallbackModels(selectedModel, activeModel)];
      let result: ModelAttemptResult | null = null;
      let finalError: unknown = null;

      for (let index = 0; index < candidateModels.length; index += 1) {
        const candidateModel = candidateModels[index];
        activeAttemptRef.current = { attemptNumber: 1, maxAttempts: 3 };
        const startedAt = Date.now();

        try {
          const response = await GeminiService.analyzeChartJSON(
            apiKey,
            chart,
            specificPalace,
            undefined,
            candidateModel,
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
          AiTelemetryService.recordSuccess(candidateModel, Date.now() - startedAt);
          result = {
            response,
            modelName: candidateModel,
          };
          resolvedModel = candidateModel;
          if (candidateModel !== activeModel) {
            setFallbackState({
              fromModel: activeModel,
              toModel: candidateModel,
              reasonCode: index > 0 && isAiServiceErrorDetails(finalError) ? finalError.code : 'model_overloaded',
            });
          } else {
            setFallbackState(null);
          }
          break;
        } catch (error: unknown) {
          finalError = error;
          const errorCode = isAiServiceErrorDetails(error) ? error.code : 'unknown';
          setActiveModelHealth(AiTelemetryService.recordFailure(candidateModel, errorCode));
          if (!isAiServiceErrorDetails(error) || !shouldTryFallbackModel(error.code) || index === candidateModels.length - 1) {
            throw error;
          }

          const nextModel = candidateModels[index + 1];
          setFallbackState({
            fromModel: candidateModel,
            toModel: nextModel,
            reasonCode: error.code,
          });
          commitStreamStatus({
            phase: 'retrying',
            focusArea,
            receivedChars: 0,
            receivedChunks: 0,
            attemptNumber: 1,
            maxAttempts: 3,
            retryAfterMs: 0,
            retryCode: error.code,
          });
        }
      }

      if (!result) {
        throw finalError instanceof Error ? finalError : new Error('Không nhận được kết quả từ Gemini.');
      }
      if (analyzeRequestIdRef.current !== requestId) {
        return;
      }

      const thread = AnalysisThreadService.createThread(chart, focusArea, result.response, bridgeContext);
      AnalysisThreadService.saveThread(thread);
      syncThreadState(thread);
      setActiveModel(resolvedModel);
      setActiveModelHealth(AiTelemetryService.getSnapshot(result.modelName));
      setIsShowingLastGoodResult(false);
    } catch (err: unknown) {
      if (analyzeRequestIdRef.current !== requestId) {
        return;
      }

      const nextError = toUiErrorState(err, 'Lỗi khi gọi AI.');
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

    const userMessage = question.trim();
    setErrorState(null);
    setFallbackState(null);

    try {
      const { GeminiService } = await loadGeminiServiceModule();
      const abortController = new AbortController();
      activeRequestAbortRef.current?.abort('user_cancelled');
      activeRequestAbortRef.current = abortController;
      setIsLoading(true);
      let aiResponse = '';
      let resolvedModel = activeModel;
      const candidateModels = [activeModel, ...getFallbackModels(selectedModel, activeModel)];
      let finalError: unknown = null;

      for (let index = 0; index < candidateModels.length; index += 1) {
        const candidateModel = candidateModels[index];
        const session = candidateModel === activeModel && currentChatSession
          ? currentChatSession
          : GeminiService.createChatSession(apiKey, candidateModel);
        const startedAt = Date.now();

        try {
          aiResponse = await session.sendMessage(currentThread, userMessage, {
            abortSignal: abortController.signal,
          });
          AiTelemetryService.recordSuccess(candidateModel, Date.now() - startedAt);
          resolvedModel = candidateModel;
          if (candidateModel !== activeModel) {
            setFallbackState({
              fromModel: activeModel,
              toModel: candidateModel,
              reasonCode: index > 0 && isAiServiceErrorDetails(finalError) ? finalError.code : 'model_overloaded',
            });
          } else {
            setFallbackState(null);
          }
          break;
        } catch (error: unknown) {
          finalError = error;
          const errorCode = isAiServiceErrorDetails(error) ? error.code : 'unknown';
          setActiveModelHealth(AiTelemetryService.recordFailure(candidateModel, errorCode));
          if (!isAiServiceErrorDetails(error) || !shouldTryFallbackModel(error.code) || index === candidateModels.length - 1) {
            throw error;
          }

          const nextModel = candidateModels[index + 1];
          setFallbackState({
            fromModel: candidateModel,
            toModel: nextModel,
            reasonCode: error.code,
          });
        }
      }

      if (!aiResponse) {
        throw finalError instanceof Error ? finalError : new Error('AI không thể trả lời câu hỏi lúc này.');
      }

      const threadWithUserTurn = AnalysisThreadService.appendTurn(currentThread, 'user', userMessage);
      const threadWithReply = AnalysisThreadService.appendTurn(threadWithUserTurn, 'ai', aiResponse);
      syncThreadState(threadWithReply);
      AnalysisThreadService.saveThread(threadWithReply);
      setQuestion('');
      setActiveModel(resolvedModel);
      setActiveModelHealth(AiTelemetryService.getSnapshot(resolvedModel));
    } catch (err: unknown) {
      const nextError = toUiErrorState(err, 'AI không thể trả lời câu hỏi lúc này.');
      if (nextError.code !== 'user_cancelled') {
        setErrorState(nextError);
      }
    } finally {
      activeRequestAbortRef.current = null;
      setIsLoading(false);
    }
  };

  const handleResetThread = () => {
    if (!currentThread) {
      return;
    }

    const resetThread = AnalysisThreadService.resetConversation(currentThread);
    AnalysisThreadService.saveThread(resetThread);
    syncThreadState(resetThread);
    setErrorState(null);
  };

  const handleNavigateFocus = (focusArea: AnalysisFocusArea) => {
    if (focusArea === currentFocus && currentThread?.focusArea === focusArea) {
      return;
    }

    onNavigateFocus?.(focusArea);

    if (focusArea === 'overall') {
      const savedOverallThread = AnalysisThreadService.loadThread(chart, 'overall');
      if (savedOverallThread) {
        syncThreadState(savedOverallThread);
        setErrorState(null);
        return;
      }

      void handleAnalyze(undefined);
    }
  };

  const loadingFocusArea = streamStatus.focusArea ?? currentFocus;
  const loadingMessage = streamStatus.phase === 'receiving'
    ? `Gemini đã bắt đầu trả dữ liệu cho ${formatFocusAreaLabel(loadingFocusArea)}. Đã nhận ${streamStatus.receivedChunks} đợt, khoảng ${formatStreamSize(streamStatus.receivedChars)}.`
    : streamStatus.phase === 'retrying'
      ? `Gemini vừa gặp sự cố tạm thời (${streamStatus.retryCode ?? 'unknown'}) nên hệ thống đang chuẩn bị thử lại lần ${streamStatus.attemptNumber}/${streamStatus.maxAttempts}.`
      : `Đang gửi dữ kiện ${formatFocusAreaLabel(loadingFocusArea)} tới Gemini để tạo luận giải.`;
  const loadingHint = streamStatus.phase === 'retrying'
    ? `Hệ thống sẽ thử lại sau khoảng ${formatRetryDelay(streamStatus.retryAfterMs)}. Bạn chưa cần thao tác lại.`
    : streamStatus.phase === 'requesting' && isThinkingHeavyModel(selectedModel)
      ? 'Model hiện tại đang suy luận sâu để tăng độ chính xác, nên có thể mất vài giây trước khi phản hồi đầu tiên xuất hiện.'
      : 'Khi có chunk đầu tiên, trạng thái này sẽ tự chuyển sang chế độ streaming.';
  const activeModelHealthText = formatHealthLabel(activeModelHealth);
  const activeModelLatencyText = activeModelHealth.averageLatencyMs
    ? `Độ trễ gần đây khoảng ${(activeModelHealth.averageLatencyMs / 1000).toFixed(1)} giây.`
    : 'Hệ thống đang tích lũy dữ liệu ổn định cho model này.';

  return {
    apiKey,
    selectedModel,
    activeModel,
    isLoading,
    analysisResult,
    currentThread,
    currentChatSession,
    errorState,
    fallbackState,
    isShowingLastGoodResult,
    activeModelHealth,
    question,
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
    retryAnalyze: () => {
      void handleAnalyze(currentFocus === 'overall' ? undefined : currentFocus);
    },
    cancelActiveAnalysis,
    handleKeyReady: (key: string, model: string) => {
      setApiKey(key);
      setSelectedModel(model);
      setActiveModel(model);
      setFallbackState(null);
      setIsShowingLastGoodResult(false);
    },
    handleLockKey: () => {
      cancelActiveAnalysis();
      setApiKey('');
      setActiveModel(selectedModel);
      syncThreadState(null);
      setCurrentChatSession(null);
      setQuestion('');
    },
  };
}
