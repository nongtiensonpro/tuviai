/**
 * AnalysisPanel.tsx
 * Hiển thị khung luận giải Tử Vi bằng AI (Structured UI Cards) và thread hỏi đáp có memory ngắn hạn
 */
import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import type { AnalysisFocusArea, AnalysisThread, PalaceName, ZiweiChart } from '../core/types/ZiweiTypes';
import type { GeminiChatSession } from '../services/GeminiService';
import type { StructuredAiResponse } from '../services/PromptBuilder';
import { AnalysisThreadService } from '../services/AnalysisThreadService';

export interface AnalysisPanelProps {
  chart: ZiweiChart;
  targetPalaceName?: PalaceName;
  onNavigateFocus?: (focusArea: AnalysisFocusArea) => void;
}

type AnalysisStreamPhase = 'idle' | 'requesting' | 'receiving';

interface AnalysisStreamStatus {
  phase: AnalysisStreamPhase;
  focusArea: AnalysisFocusArea | null;
  receivedChars: number;
  receivedChunks: number;
}

const IDLE_STREAM_STATUS: AnalysisStreamStatus = {
  phase: 'idle',
  focusArea: null,
  receivedChars: 0,
  receivedChunks: 0,
};

const STREAM_STATUS_UPDATE_INTERVAL_MS = 500;

const ApiKeySetup = lazy(async () => {
  const module = await import('./ApiKeySetup');
  return { default: module.ApiKeySetup };
});

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

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ chart, targetPalaceName, onNavigateFocus }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.1-pro-preview');
  const [isLoading, setIsLoading] = useState(false);

  const [analysisResult, setAnalysisResult] = useState<StructuredAiResponse | null>(null);
  const [currentThread, setCurrentThread] = useState<AnalysisThread | null>(null);
  const [currentChatSession, setCurrentChatSession] = useState<GeminiChatSession | null>(null);
  const [error, setError] = useState<string>('');
  const [question, setQuestion] = useState<string>('');
  const [streamStatus, setStreamStatus] = useState<AnalysisStreamStatus>(IDLE_STREAM_STATUS);
  const analyzeRequestIdRef = useRef(0);
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

        setCurrentChatSession(GeminiService.createChatSession(apiKey, selectedModel));
      })
      .catch(() => {
        if (!cancelled) {
          setCurrentChatSession(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [apiKey, selectedModel, hasAnalysisResult]);

  useEffect(() => () => {
    analyzeRequestIdRef.current += 1;
    pendingStreamStatusRef.current = null;
    if (streamStatusTimerRef.current) {
      clearTimeout(streamStatusTimerRef.current);
      streamStatusTimerRef.current = null;
    }
  }, []);

  const handleAnalyze = async (specificPalace?: PalaceName) => {
    if (!apiKey) {
      setError('Vui lòng mở khóa API key trước.');
      return;
    }

    const sourceThread = currentThread;
    const focusArea: AnalysisFocusArea = specificPalace ?? 'overall';
    const bridgeContext = AnalysisThreadService.buildBridgeContext(sourceThread, focusArea);
    const requestId = analyzeRequestIdRef.current + 1;
    analyzeRequestIdRef.current = requestId;

    setIsLoading(true);
    setError('');
    setStreamStatus({
      phase: 'requesting',
      focusArea,
      receivedChars: 0,
      receivedChunks: 0,
    });

    try {
      const { GeminiService } = await loadGeminiServiceModule();
      const result = await GeminiService.analyzeChartJSON(
        apiKey,
        chart,
        specificPalace,
        undefined,
        selectedModel,
        bridgeContext,
        {
          onStreamEvent: (event) => {
            if (analyzeRequestIdRef.current !== requestId) {
              return;
            }

            scheduleStreamStatus({
              phase: 'receiving',
              focusArea,
              receivedChars: event.receivedChars,
              receivedChunks: event.receivedChunks,
            });
          },
        },
      );
      if (analyzeRequestIdRef.current !== requestId) {
        return;
      }

      const thread = AnalysisThreadService.createThread(chart, focusArea, result, bridgeContext);
      AnalysisThreadService.saveThread(thread);
      syncThreadState(thread);
    } catch (err: unknown) {
      if (analyzeRequestIdRef.current !== requestId) {
        return;
      }

      const message = err instanceof Error ? err.message : 'Lỗi khi gọi AI.';
      setError(message);
    } finally {
      if (analyzeRequestIdRef.current === requestId) {
        pendingStreamStatusRef.current = null;
        if (streamStatusTimerRef.current) {
          clearTimeout(streamStatusTimerRef.current);
          streamStatusTimerRef.current = null;
        }
        setIsLoading(false);
        setStreamStatus(IDLE_STREAM_STATUS);
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
      setError('');
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
    setQuestion('');
    setError('');

    const threadWithUserTurn = AnalysisThreadService.appendTurn(currentThread, 'user', userMessage);
    syncThreadState(threadWithUserTurn);
    AnalysisThreadService.saveThread(threadWithUserTurn);

    try {
      setIsLoading(true);
      const aiResponse = await currentChatSession.sendMessage(currentThread, userMessage);
      const threadWithReply = AnalysisThreadService.appendTurn(threadWithUserTurn, 'ai', aiResponse);
      syncThreadState(threadWithReply);
      AnalysisThreadService.saveThread(threadWithReply);
    } catch (_err: unknown) {
      setError('AI không thể trả lời câu hỏi lúc này.');
    } finally {
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
    setError('');
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
        setError('');
        return;
      }

      void handleAnalyze(undefined);
    }
  };

  const renderAnalysisCards = (data: StructuredAiResponse) => (
    <div className="grid grid-cols-1 gap-5 animate-fade-in mt-6">
      {currentThread?.memory.bridgeContext && (
        <div className="py-1">
           <p className="text-sm text-blue-100/90 leading-relaxed">{currentThread.memory.bridgeContext.transitionReason}</p>
           <p className="text-xs text-blue-200/60 mt-2">Neo theo mạch trước: {currentThread.memory.bridgeContext.summary}</p>
        </div>
      )}

      <div className="py-1">
         <h3 className="text-lg text-gold font-bold mb-3 flex items-center gap-2"><span>🧭</span> Tóm Tắt Nhanh</h3>
         <p className="text-white/90 text-sm leading-relaxed whitespace-pre-line">{data.summary}</p>
      </div>

      {currentThread?.memory.conversationRecap && currentThread.turns.length >= 4 && (
        <div className="py-1">
           <h3 className="text-base text-white/90 font-bold mb-3 flex items-center gap-2"><span>🧵</span> Tóm Tắt Cuộc Trao Đổi</h3>
           <p className="text-sm text-white/75 leading-relaxed whitespace-pre-line">{currentThread.memory.conversationRecap}</p>
        </div>
      )}

      <div className="py-1">
           <h3 className="text-lg text-blue-300 font-bold mb-3 flex items-center gap-2"><span>🔮</span> Cận Cảnh {(visiblePalaceFocus || 'Tổng Quan Mệnh Bàn').toUpperCase()}</h3>
         <p className="text-white/90 text-sm leading-relaxed whitespace-pre-line">{data.palace_analysis}</p>
      </div>

      {data.key_points.length > 0 && (
        <div className="py-1">
           <h3 className="text-lg text-sky-300 font-bold mb-3 flex items-center gap-2"><span>🪶</span> Mấu Chốt Nổi Bật</h3>
           <ul className="list-disc pl-5 text-sm space-y-2 text-white/85">
             {data.key_points.map((point, i) => <li key={i}>{point}</li>)}
           </ul>
        </div>
      )}

      <div className="py-1">
         <h3 className="text-lg text-purple-300 font-bold mb-3 flex items-center gap-2"><span>📐</span> Tam Phương Tứ Chính (Nghiệp Quả Vay Mượn)</h3>
         <ul className="list-disc pl-5 text-sm space-y-2 text-white/80">
           {data.karmic_interactions.map((ki, i) => <li key={i}>{ki}</li>)}
         </ul>
       </div>

      {((currentThread?.memory.relatedPalaces.length ?? 0) > 0 || currentFocus !== 'overall') && (
        <div className="py-1">
           <h3 className="text-lg text-cyan-200 font-bold mb-3 flex items-center gap-2"><span>🧭</span> Đi Theo Cung Liên Kết</h3>
           <div className="flex flex-wrap gap-2">
             {currentFocus !== 'overall' && (
              <button
                type="button"
                onClick={() => handleNavigateFocus('overall')}
                 className="px-0 py-1 text-sm text-cyan-100 hover:text-cyan transition-colors text-left"
               >
                 Xem lại tổng quan mệnh bàn
               </button>
             )}
             {(currentThread?.memory.relatedPalaces ?? data.referenced_palaces.filter((palace) => palace !== currentFocus)).map((palace) => (
              <button
                key={palace}
                type="button"
                onClick={() => handleNavigateFocus(palace)}
                 className="px-0 py-1 text-sm text-white/70 hover:text-cyan transition-colors text-left"
               >
                 Chuyển sang cung {palace}
               </button>
             ))}
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="py-1">
             <h3 className="text-lg text-red-300 font-bold mb-3 flex items-center gap-2"><span>🔥</span> Kích Hoạt Tứ Hóa & Cục</h3>
             <p className="text-white/80 text-sm leading-relaxed">{data.sihua_triggers}</p>
          </div>

          <div className="py-1">
             <h3 className="text-lg text-emerald-300 font-bold mb-3 flex items-center gap-2"><span>💡</span> Đặc Chỉ Lời Khuyên</h3>
             <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">{data.modern_advice}</p>
          </div>
      </div>

      {(currentThread?.memory.suggestedQuestions.length || data.follow_up_suggestions.length > 0) && (
        <div className="py-1">
           <h3 className="text-lg text-white/90 font-bold mb-3 flex items-center gap-2"><span>💬</span> Gợi Ý Theo Mạch Hiện Tại</h3>
           <div className="flex flex-wrap gap-2">
             {(currentThread?.memory.suggestedQuestions.length
               ? currentThread.memory.suggestedQuestions
               : data.follow_up_suggestions
             ).map((suggestion, i) => (
              <button
                key={`${suggestion}-${i}`}
                type="button"
                onClick={() => setQuestion(suggestion)}
                  className="px-0 py-1 text-sm text-white/68 hover:text-gold transition-colors text-left"
               >
                 {suggestion}
               </button>
             ))}
           </div>
        </div>
      )}
    </div>
  );

  const loadingFocusArea = streamStatus.focusArea ?? currentFocus;
  const loadingMessage = streamStatus.phase === 'receiving'
    ? `Gemini đã bắt đầu trả dữ liệu cho ${formatFocusAreaLabel(loadingFocusArea)}. Đã nhận ${streamStatus.receivedChunks} đợt, khoảng ${formatStreamSize(streamStatus.receivedChars)}.`
    : `Đang gửi dữ kiện ${formatFocusAreaLabel(loadingFocusArea)} tới Gemini để tạo luận giải.`;
  const loadingHint = streamStatus.phase === 'requesting' && isThinkingHeavyModel(selectedModel)
    ? 'Model hiện tại đang suy luận sâu để tăng độ chính xác, nên có thể mất vài giây trước khi phản hồi đầu tiên xuất hiện.'
    : 'Khi có chunk đầu tiên, trạng thái này sẽ tự chuyển sang chế độ streaming.';

  return (
    <div className="w-full mt-10 max-w-[1200px] mx-auto animate-fade-up">
      <div className="p-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
           <h2 className="text-xl sm:text-2xl font-serif-sc text-gold flex items-center gap-2">
             <span>✨</span> Đại Sư AI ({selectedModel.replace('gemini-', '').toUpperCase()})
           </h2>
           <div className="flex flex-wrap items-center gap-2">
                {visiblePalaceFocus && (
                  <span className="text-blue-200 px-1 py-1 text-xs whitespace-nowrap">
                    Điểm Ngắm: Cung {visiblePalaceFocus}
                  </span>
                )}
               {apiKey && currentThread && currentThread.turns.length > 0 && (
                  <button
                    type="button"
                    onClick={handleResetThread}
                    className="text-white/76 border border-white/10 hover:border-gold/30 px-2 py-1 flex items-center gap-1 rounded-sm text-xs transition-colors"
                    title="Xóa mạch hội thoại đang lưu cho vùng trọng tâm hiện tại"
                  >
                    <span>↺</span> Làm Mới Hội Thoại
                  </button>
               )}
               {apiKey && (
                  <button
                    onClick={() => {
                      if (confirm('Khóa tạm thời hoặc đổi API Key khác?')) {
                         cancelActiveAnalysis();
                         setApiKey('');
                         syncThreadState(null);
                         setCurrentChatSession(null);
                         setQuestion('');
                      }
                    }}
                    className="text-red-200 border border-red-500/30 hover:border-red-400/50 px-2 py-1 flex items-center gap-1 rounded-sm text-xs transition-colors"
                    title="Nút này giúp bạn khóa lại AI hoặc cài lại Key nếu bị lỗi Error 400"
                  >
                    <span>⚙️</span> Đổi / Khóa Key
                  </button>
               )}
           </div>
        </div>

        {!apiKey ? (
          <Suspense fallback={<div className="py-8 text-center text-white/45 text-sm">Đang chuẩn bị cấu hình BYOK...</div>}>
            <ApiKeySetup onKeyReady={(key, model) => {
              setApiKey(key);
              setSelectedModel(model);
            }} />
          </Suspense>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between mb-2">
              <p className="text-sm text-white/56 max-w-2xl">Bạn có thể bấm trực tiếp vào cung trên mệnh bàn, hoặc dùng nút phân tích tổng quan khi cần một góc nhìn rộng hơn.</p>

              {!analysisResult && (
                 <button
                   onClick={() => handleAnalyze(targetPalaceName)}
                   disabled={isLoading}
                   className="btn-primary min-w-[200px]"
                 >
                   {isLoading ? 'Đang thấu thị...' : 'Phân Tích Bức Tranh Tổng Thể'}
                 </button>
              )}
            </div>

            {error && <div className="text-red-300 text-sm">{error}</div>}

            {isLoading && streamStatus.phase !== 'idle' && !analysisResult && (
                <div className="flex flex-col items-center justify-center p-10 mt-6">
                   <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-gold animate-spin mb-4"></div>
                   <span className="text-gold/90 text-sm text-center max-w-xl">{loadingMessage}</span>
                   <span className="text-white/46 text-xs text-center max-w-xl mt-3">{loadingHint}</span>
                </div>
            )}

            {isLoading && streamStatus.phase !== 'idle' && analysisResult && (
              <div className="mt-4 rounded-sm border border-gold/20 bg-white/[0.03] px-4 py-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 h-4 w-4 rounded-full border-2 border-white/20 border-t-gold animate-spin shrink-0"></div>
                  <div className="space-y-1">
                    <p className="text-sm text-gold/90">
                      Đang làm mới luận giải cho {formatFocusAreaLabel(loadingFocusArea)}.
                    </p>
                    <p className="text-xs text-white/58">
                      {loadingMessage} Kết quả hiện tại vẫn được giữ trên màn hình để tránh trống giao diện.
                    </p>
                    <p className="text-[11px] text-white/40">
                      {loadingHint}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {analysisResult && renderAnalysisCards(analysisResult)}

            {currentChatSession && analysisResult && currentThread && (
               <div className="mt-10 pt-2">
                 <h4 className="text-lg text-gold/80 mb-4 flex items-center gap-2"><span>💬</span> Đàm Thoại Trực Tiếp Mệnh Bàn</h4>
                 <p className="text-xs text-white/50 mb-4">
                   {currentThread.turns.length > 0
                     ? `Đang tiếp tục ${currentThread.turns.length} lượt trao đổi đã lưu cho ${currentThread.focusArea === 'overall' ? 'tổng quan mệnh bàn' : `cung ${currentThread.focusArea}`}.`
                     : `Thread mới đã sẵn sàng cho ${currentThread.focusArea === 'overall' ? 'tổng quan mệnh bàn' : `cung ${currentThread.focusArea}`}. Bạn có thể hỏi sâu tiếp ngay.`}
                 </p>
                 {currentThread.memory.bridgeContext && (
                   <p className="text-xs text-white/40 mb-4">
                     Nối tiếp từ {currentThread.memory.bridgeContext.sourceFocusArea === 'overall' ? 'tổng quan mệnh bàn' : `cung ${currentThread.memory.bridgeContext.sourceFocusArea}`}.
                   </p>
                 )}

                 <div className="analysis-chat-log flex flex-col gap-3 mb-4 max-h-60 overflow-y-scroll pr-2 custom-scrollbar">
                   {currentThread.turns.map(turn => (
                    <div key={turn.id} className={`py-2 text-sm max-w-[85%] ${turn.role === 'user' ? 'text-blue-100 self-end ml-auto' : 'text-white/90 self-start mr-auto'}`}>
                       {turn.role === 'ai' && <strong className="block text-gold mb-1 text-xs">Đại Sư AI</strong>}
                       {turn.role === 'user' && <strong className="block text-blue-300 mb-1 text-xs">Bạn</strong>}
                       <div className="whitespace-pre-line">{turn.msg}</div>
                     </div>
                   ))}
                   {isLoading && currentThread.turns.length > 0 && <div className="text-xs text-white/46 italic">Đang soạn phản hồi...</div>}
                 </div>

                 <form onSubmit={handleSendMessage} className="flex flex-col sm:flex-row gap-3">
                   <input
                     type="text"
                     className="input flex-1"
                     placeholder={isLoading ? 'Vui lòng chờ AI trả lời...' : `Hỏi tiếp về ${currentThread.focusArea === 'overall' ? 'mệnh bàn này' : `cung ${currentThread.focusArea}`}...`}
                     value={question}
                     onChange={e => setQuestion(e.target.value)}
                     disabled={isLoading}
                   />
                   <button type="submit" disabled={isLoading || !question.trim()} className="btn-primary w-full sm:w-24">Gửi</button>
                 </form>
               </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
