/**
 * AnalysisPanel.tsx
 * Hiển thị khung luận giải Tử Vi bằng AI (Structured UI Cards) và thread hỏi đáp có memory ngắn hạn
 */
import React, { useEffect, useState } from 'react';
import type { AnalysisFocusArea, AnalysisThread, PalaceName, ZiweiChart } from '../core/types/ZiweiTypes';
import { GeminiService, type GeminiChatSession } from '../services/GeminiService';
import type { StructuredAiResponse } from '../services/PromptBuilder';
import { AnalysisThreadService } from '../services/AnalysisThreadService';
import { ApiKeySetup } from './ApiKeySetup';

export interface AnalysisPanelProps {
  chart: ZiweiChart;
  targetPalaceName?: PalaceName;
  onNavigateFocus?: (focusArea: AnalysisFocusArea) => void;
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

  const currentFocus: AnalysisFocusArea = targetPalaceName ?? 'overall';
  const visiblePalaceFocus = currentThread && currentThread.focusArea !== 'overall'
    ? currentThread.focusArea
    : targetPalaceName;

  const syncThreadState = (thread: AnalysisThread | null) => {
    setCurrentThread(thread);
    setAnalysisResult(thread?.analysis ?? null);
  };

  useEffect(() => {
    if (!apiKey) {
      setCurrentChatSession(null);
      return;
    }

    setCurrentChatSession(GeminiService.createChatSession(apiKey, selectedModel));
  }, [apiKey, selectedModel]);

  const handleAnalyze = async (specificPalace?: PalaceName) => {
    if (!apiKey) {
      setError('Vui lòng mở khóa API key trước.');
      return;
    }

    const sourceThread = currentThread;
    const focusArea: AnalysisFocusArea = specificPalace ?? 'overall';
    const bridgeContext = AnalysisThreadService.buildBridgeContext(sourceThread, focusArea);

    setIsLoading(true);
    setError('');
    syncThreadState(null);

    try {
      const result = await GeminiService.analyzeChartJSON(
        apiKey,
        chart,
        specificPalace,
        undefined,
        selectedModel,
        bridgeContext,
      );
      const thread = AnalysisThreadService.createThread(chart, focusArea, result, bridgeContext);
      AnalysisThreadService.saveThread(thread);
      syncThreadState(thread);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi khi gọi AI.';
      setError(message);
    } finally {
      setIsLoading(false);
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
    <div className="grid grid-cols-1 gap-6 animate-fade-in mt-6">
      {currentThread?.memory.bridgeContext && (
        <div className="bg-blue-950/30 border border-blue-500/20 p-4 rounded-lg">
           <p className="text-sm text-blue-100/90 leading-relaxed">{currentThread.memory.bridgeContext.transitionReason}</p>
           <p className="text-xs text-blue-200/60 mt-2">Neo theo mạch trước: {currentThread.memory.bridgeContext.summary}</p>
        </div>
      )}

      <div className="bg-gradient-to-br from-amber-900/20 to-black/40 border border-gold/30 p-5 rounded-lg shadow-inner">
         <h3 className="text-lg text-gold font-bold mb-3 flex items-center gap-2"><span>🧭</span> Tóm Tắt Nhanh</h3>
         <p className="text-white/90 text-sm leading-relaxed whitespace-pre-line">{data.summary}</p>
      </div>

      {currentThread?.memory.conversationRecap && currentThread.turns.length >= 4 && (
        <div className="bg-black/30 border border-white/10 p-5 rounded-lg">
           <h3 className="text-base text-white/90 font-bold mb-3 flex items-center gap-2"><span>🧵</span> Tóm Tắt Cuộc Trao Đổi</h3>
           <p className="text-sm text-white/75 leading-relaxed whitespace-pre-line">{currentThread.memory.conversationRecap}</p>
        </div>
      )}

      <div className="bg-gradient-to-br from-indigo-900/30 to-black/40 border border-blue-500/30 p-5 rounded-lg shadow-inner">
         <h3 className="text-lg text-blue-300 font-bold mb-3 flex items-center gap-2"><span>🔮</span> Cận Cảnh {(visiblePalaceFocus || 'Tổng Quan Mệnh Bàn').toUpperCase()}</h3>
         <p className="text-white/90 text-sm leading-relaxed whitespace-pre-line">{data.palace_analysis}</p>
      </div>

      {data.key_points.length > 0 && (
        <div className="bg-gradient-to-br from-sky-900/20 to-black/40 border border-sky-500/30 p-5 rounded-lg">
           <h3 className="text-lg text-sky-300 font-bold mb-3 flex items-center gap-2"><span>🪶</span> Mấu Chốt Nổi Bật</h3>
           <ul className="list-disc pl-5 text-sm space-y-2 text-white/85">
             {data.key_points.map((point, i) => <li key={i}>{point}</li>)}
           </ul>
        </div>
      )}

      <div className="bg-gradient-to-br from-purple-900/20 to-black/40 border border-purple-500/30 p-5 rounded-lg">
         <h3 className="text-lg text-purple-300 font-bold mb-3 flex items-center gap-2"><span>📐</span> Tam Phương Tứ Chính (Nghiệp Quả Vay Mượn)</h3>
         <ul className="list-disc pl-5 text-sm space-y-2 text-white/80">
           {data.karmic_interactions.map((ki, i) => <li key={i}>{ki}</li>)}
         </ul>
       </div>

      {((currentThread?.memory.relatedPalaces.length ?? 0) > 0 || currentFocus !== 'overall') && (
        <div className="bg-gradient-to-br from-cyan-950/20 to-black/40 border border-cyan-500/20 p-5 rounded-lg">
           <h3 className="text-lg text-cyan-200 font-bold mb-3 flex items-center gap-2"><span>🧭</span> Đi Theo Cung Liên Kết</h3>
           <div className="flex flex-wrap gap-2">
             {currentFocus !== 'overall' && (
               <button
                 type="button"
                 onClick={() => handleNavigateFocus('overall')}
                 className="px-3 py-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 hover:bg-cyan-500/15 text-sm text-cyan-100 transition-colors text-left"
               >
                 Xem lại tổng quan mệnh bàn
               </button>
             )}
             {(currentThread?.memory.relatedPalaces ?? data.referenced_palaces.filter((palace) => palace !== currentFocus)).map((palace) => (
               <button
                 key={palace}
                 type="button"
                 onClick={() => handleNavigateFocus(palace)}
                 className="px-3 py-2 rounded-full border border-cyan-400/20 bg-white/5 hover:bg-white/10 text-sm text-white/85 transition-colors text-left"
               >
                 Chuyển sang cung {palace}
               </button>
             ))}
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-red-900/20 to-black/40 border border-red-500/30 p-5 rounded-lg">
             <h3 className="text-lg text-red-300 font-bold mb-3 flex items-center gap-2"><span>🔥</span> Kích Hoạt Tứ Hóa & Cục</h3>
             <p className="text-white/80 text-sm leading-relaxed">{data.sihua_triggers}</p>
          </div>

          <div className="bg-gradient-to-br from-green-900/20 to-black/40 border border-emerald-500/30 p-5 rounded-lg">
             <h3 className="text-lg text-emerald-300 font-bold mb-3 flex items-center gap-2"><span>💡</span> Đặc Chỉ Lời Khuyên</h3>
             <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">{data.modern_advice}</p>
          </div>
      </div>

      {(currentThread?.memory.suggestedQuestions.length || data.follow_up_suggestions.length > 0) && (
        <div className="bg-gradient-to-br from-stone-900/30 to-black/40 border border-white/10 p-5 rounded-lg">
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
                 className="px-3 py-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-sm text-white/85 transition-colors text-left"
               >
                 {suggestion}
               </button>
             ))}
           </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full mt-10 max-w-5xl mx-auto animate-fade-up">
      <div className="bg-black/50 border border-gold/40 rounded-xl p-6 md:p-8 backdrop-blur shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-white/10 pb-4 gap-3">
           <h2 className="text-2xl font-serif-sc text-gold flex items-center gap-2">
             <span>✨</span> Đại Sư AI ({selectedModel.replace('gemini-', '').toUpperCase()})
           </h2>
           <div className="flex flex-wrap items-center gap-2">
               {visiblePalaceFocus && (
                  <span className="bg-blue-900/50 text-blue-200 border border-blue-500/50 px-2 py-1 rounded text-xs whitespace-nowrap">
                    Điểm Ngắm: Cung {visiblePalaceFocus}
                  </span>
               )}
               {apiKey && currentThread && currentThread.turns.length > 0 && (
                  <button
                    type="button"
                    onClick={handleResetThread}
                    className="bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 px-2 py-1 flex items-center gap-1 rounded text-xs transition-colors"
                    title="Xóa mạch hội thoại đang lưu cho vùng trọng tâm hiện tại"
                  >
                    <span>↺</span> Làm Mới Hội Thoại
                  </button>
               )}
               {apiKey && (
                  <button
                    onClick={() => {
                      if (confirm('Khóa tạm thời hoặc đổi API Key khác?')) {
                         setApiKey('');
                         syncThreadState(null);
                         setCurrentChatSession(null);
                         setQuestion('');
                      }
                    }}
                    className="bg-red-900/40 text-red-200 border border-red-500/30 hover:bg-red-900/80 px-2 py-1 flex items-center gap-1 rounded text-xs transition-colors"
                    title="Nút này giúp bạn khóa lại AI hoặc cài lại Key nếu bị lỗi Error 400"
                  >
                    <span>⚙️</span> Đổi / Khóa Key
                  </button>
               )}
           </div>
        </div>

        {!apiKey ? (
          <ApiKeySetup onKeyReady={(key, model) => {
            setApiKey(key);
            setSelectedModel(model);
          }} />
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-white/60">Bạn có thể bấm trực tiếp vào Cung trên Mệnh Bàn, hoặc bấm nút Luận giải bên dưới cạn Mệnh.</p>

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

            {error && <div className="text-red-400 bg-red-900/20 p-4 rounded text-sm">{error}</div>}

            {isLoading && !analysisResult && (
                <div className="flex flex-col items-center justify-center p-10 mt-6 bg-black/30 rounded-lg">
                   <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-gold animate-spin mb-4"></div>
                   <span className="text-gold text-sm animate-pulse">Vũ trụ đang tái lập kết nối thần trí... Hệ thống phân tách JSON dữ liệu siêu việt...</span>
                </div>
            )}

            {analysisResult && renderAnalysisCards(analysisResult)}

            {currentChatSession && analysisResult && currentThread && (
               <div className="mt-10 border-t border-white/20 pt-6">
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

                 <div className="flex flex-col gap-3 mb-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                   {currentThread.turns.map(turn => (
                     <div key={turn.id} className={`p-3 rounded-lg text-sm max-w-[85%] ${turn.role === 'user' ? 'bg-blue-900/40 text-blue-100 self-end ml-auto' : 'bg-gray-800/60 text-white/90 self-start mr-auto'}`}>
                        {turn.role === 'ai' && <strong className="block text-gold mb-1 text-xs">Đại Sư AI</strong>}
                        {turn.role === 'user' && <strong className="block text-blue-300 mb-1 text-xs">Bạn</strong>}
                        <div className="whitespace-pre-line">{turn.msg}</div>
                     </div>
                   ))}
                   {isLoading && currentThread.turns.length > 0 && <div className="text-xs text-white/50 italic animate-pulse">Đại sư đang suy ngẫm...</div>}
                 </div>

                 <form onSubmit={handleSendMessage} className="flex gap-3">
                   <input
                     type="text"
                     className="input flex-1 bg-black/40 focus:border-gold"
                     placeholder={isLoading ? 'Vui lòng chờ AI trả lời...' : `Hỏi tiếp về ${currentThread.focusArea === 'overall' ? 'mệnh bàn này' : `cung ${currentThread.focusArea}`}...`}
                     value={question}
                     onChange={e => setQuestion(e.target.value)}
                     disabled={isLoading}
                   />
                   <button type="submit" disabled={isLoading || !question.trim()} className="btn-primary w-24">Gửi</button>
                 </form>
               </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
