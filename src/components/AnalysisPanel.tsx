/**
 * AnalysisPanel.tsx
 * Hiển thị khung luận giải Tử Vi bằng AI (Structured UI Cards) và Chat Session
 */
import React, { useState, useEffect } from 'react';
import type { ZiweiChart, PalaceName } from '../core/types/ZiweiTypes';
import { GeminiService } from '../services/GeminiService';
import type { StructuredAiResponse } from '../services/PromptBuilder';
import { ApiKeySetup } from './ApiKeySetup';

export interface AnalysisPanelProps {
  chart: ZiweiChart;
  targetPalaceName?: string;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ chart, targetPalaceName }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  // State for Structured Output
  const [analysisResult, setAnalysisResult] = useState<StructuredAiResponse | null>(null);
  const [error, setError] = useState<string>('');
  
  // State for Chat Session
  const [chatLog, setChatLog] = useState<{ role: 'user' | 'ai', msg: string }[]>([]);
  const [currentChatSession, setCurrentChatSession] = useState<any>(null);
  const [question, setQuestion] = useState<string>('');

  // Tự động phân tích lại khi người dùng bấm vào một cung mới (nếu AI đã kích hoạt)
  useEffect(() => {
    if (apiKey && targetPalaceName) {
      handleAnalyze(targetPalaceName);
    }
  }, [targetPalaceName, apiKey]);

  const handleAnalyze = async (specificPalace?: string) => {
    if (!apiKey) {
      setError('Vui lòng mở khóa API key trước.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setAnalysisResult(null);
    setChatLog([]); // Reset chat khi phân tích cái mới
    
    try {
       // 1. Fetch Structured JSON
       const result = await GeminiService.analyzeChartJSON(apiKey, chart, specificPalace);
       setAnalysisResult(result);
       
       // 2. Initialize Chat session ngầm định để đàm thoại tiếp nối Mệnh Bàn
       const session = GeminiService.createChatSession(apiKey, chart, specificPalace);
       await session.initialize();
       setCurrentChatSession(session);
    } catch (err: any) {
       setError(err.message || 'Lỗi khi gọi AI.');
    } finally {
       setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !currentChatSession) return;
    
    const usermsg = question;
    setQuestion('');
    setChatLog(prev => [...prev, { role: 'user', msg: usermsg }]);
    
    try {
      setIsLoading(true);
      const aiResponse = await currentChatSession.sendMessage(usermsg);
      setChatLog(prev => [...prev, { role: 'ai', msg: aiResponse }]);
    } catch (err: any) {
      setError("AI không thể trả lời câu hỏi lúc này.");
    } finally {
      setIsLoading(false);
    }
  };

  // UI Components cho Structured Output
  const renderAnalysisCards = (data: StructuredAiResponse) => {
    return (
      <div className="grid grid-cols-1 gap-6 animate-fade-in mt-6">
        {/* Card: Phân Tích Cung */}
        <div className="bg-gradient-to-br from-indigo-900/30 to-black/40 border border-blue-500/30 p-5 rounded-lg shadow-inner">
           <h3 className="text-lg text-blue-300 font-bold mb-3 flex items-center gap-2"><span>🔮</span> Cận Cảnh {(targetPalaceName || 'Tổng Quan Mệnh Bàn').toUpperCase()}</h3>
           <p className="text-white/90 text-sm leading-relaxed whitespace-pre-line">{data.palace_analysis}</p>
        </div>

        {/* Card: Tương Tác Tam Phương Tứ Chính */}
        <div className="bg-gradient-to-br from-purple-900/20 to-black/40 border border-purple-500/30 p-5 rounded-lg">
           <h3 className="text-lg text-purple-300 font-bold mb-3 flex items-center gap-2"><span>📐</span> Tam Phương Tứ Chính (Nghiệp Quả Vay Mượn)</h3>
           <ul className="list-disc pl-5 text-sm space-y-2 text-white/80">
             {data.karmic_interactions.map((ki, i) => <li key={i}>{ki}</li>)}
           </ul>
        </div>

        {/* Row lưới 2 card cuối */}
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
      </div>
    );
  };

  return (
    <div className="w-full mt-10 max-w-5xl mx-auto animate-fade-up">
      <div className="bg-black/50 border border-gold/40 rounded-xl p-6 md:p-8 backdrop-blur shadow-2xl">
        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
           <h2 className="text-2xl font-serif-sc text-gold flex items-center gap-3">
             <span>✨</span> Đại Sư AI (Gemini 2.5 Flash)
           </h2>
           {targetPalaceName && (
              <span className="bg-blue-900/50 text-blue-200 border border-blue-500/50 px-3 py-1 rounded text-xs">Điểm Ngắm: Cung {targetPalaceName}</span>
           )}
        </div>

        {!apiKey ? (
          <ApiKeySetup onKeyReady={key => setApiKey(key)} />
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

            {/* HIỂN THỊ CÁC THẺ UI DỰA TRÊN STRUCTURED JSON THAY VÌ TEXT MARKDOWN RAW */}
            {analysisResult && renderAnalysisCards(analysisResult)}

            {/* CHAT SESSION KHU VỰC ĐÀM THOẠI */}
            {currentChatSession && analysisResult && (
               <div className="mt-10 border-t border-white/20 pt-6">
                 <h4 className="text-lg text-gold/80 mb-4 flex items-center gap-2"><span>💬</span> Đàm Thoại Trực Tiếp Mệnh Bàn</h4>
                 
                 <div className="flex flex-col gap-3 mb-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                   {chatLog.map((log, i) => (
                     <div key={i} className={`p-3 rounded-lg text-sm max-w-[85%] ${log.role === 'user' ? 'bg-blue-900/40 text-blue-100 self-end ml-auto' : 'bg-gray-800/60 text-white/90 self-start mr-auto'}`}>
                        {log.role === 'ai' && <strong className="block text-gold mb-1 text-xs">Đại Sư AI</strong>}
                        {log.role === 'user' && <strong className="block text-blue-300 mb-1 text-xs">Bạn</strong>}
                        <div dangerouslySetInnerHTML={{ __html: log.msg.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br/>') }} />
                     </div>
                   ))}
                   {isLoading && chatLog.length > 0 && <div className="text-xs text-white/50 italic animate-pulse">Đại sư đang suy ngẫm...</div>}
                 </div>

                 <form onSubmit={handleSendMessage} className="flex gap-3">
                   <input 
                     type="text" 
                     className="input flex-1 bg-black/40 focus:border-gold"
                     placeholder={isLoading ? "Vui lòng chờ AI trả lời..." : `Hỏi bất kỳ điều gì về (Cung ${targetPalaceName || 'Bản Mệnh'})...`}
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
