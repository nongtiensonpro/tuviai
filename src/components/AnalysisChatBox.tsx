import React from 'react';
import type { AnalysisThread } from '../core/types/ZiweiTypes';
import type { AnalysisStreamStatus } from './useAnalysisAiState';

interface AnalysisChatBoxProps {
  currentThread: AnalysisThread;
  isLoading: boolean;
  question: string;
  pendingChatMessage: string | null;
  pendingChatElapsedMs: number;
  streamStatus: AnalysisStreamStatus;
  hasChatError: boolean;
  suggestedRecoveryModel: string | null;
  onQuestionChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancelActiveChatRequest: () => void;
  onRetryLastMessage: () => Promise<void>;
  onRetryLastMessageWithSuggestedModel: () => Promise<void>;
  onResetThread: () => void;
}

function formatRetryDelay(ms: number): string {
  return `${(ms / 1000).toFixed(ms >= 10_000 ? 0 : 1)} giây`;
}

function formatElapsed(ms: number): string {
  const seconds = Math.max(1, Math.round(ms / 1000));
  return `${seconds} giây`;
}

export const AnalysisChatBox: React.FC<AnalysisChatBoxProps> = ({
  currentThread,
  isLoading,
  question,
  pendingChatMessage,
  pendingChatElapsedMs,
  streamStatus,
  hasChatError,
  suggestedRecoveryModel,
  onQuestionChange,
  onSubmit,
  onCancelActiveChatRequest,
  onRetryLastMessage,
  onRetryLastMessageWithSuggestedModel,
  onResetThread,
}) => (
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

    <div className="analysis-chat-log flex flex-col gap-4 mb-4 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
      {currentThread.turns.map(turn => (
        <div 
          key={turn.id} 
          className={`text-sm max-w-[85%] px-4 py-3 rounded-2xl transition-all duration-300 ${
            turn.role === 'user' 
              ? 'bg-cyan/8 border border-cyan/20 text-[#e6f7ff] self-end ml-auto rounded-tr-none shadow-[0_4px_12px_rgba(143,179,190,0.05)]' 
              : 'bg-gold/5 border border-gold/15 text-[#fffaf0]/90 self-start mr-auto rounded-tl-none shadow-[0_4px_12px_rgba(212,175,55,0.05)]'
          }`}
        >
          {turn.role === 'ai' && <strong className="block text-gold mb-1.5 text-xs font-semibold uppercase tracking-wider">Đại Sư AI</strong>}
          {turn.role === 'user' && <strong className="block text-cyan mb-1.5 text-xs font-semibold uppercase tracking-wider">Bạn</strong>}
          <div className="whitespace-pre-line leading-relaxed">{turn.msg}</div>
        </div>
      ))}
      {pendingChatMessage && (
        <div className="bg-cyan/8 border border-cyan/20 text-[#e6f7ff] self-end ml-auto rounded-2xl rounded-tr-none px-4 py-3 text-sm max-w-[85%] shadow-[0_4px_12px_rgba(143,179,190,0.05)]">
          <strong className="block text-cyan mb-1.5 text-xs font-semibold uppercase tracking-wider">Bạn</strong>
          <div className="whitespace-pre-line leading-relaxed">{pendingChatMessage}</div>
          <div className="mt-3 rounded-lg border border-cyan/15 bg-cyan/5 px-3 py-2 text-xs text-[#e6f7ff]/70 leading-relaxed">
            {streamStatus.phase === 'retrying'
              ? `AI đang thử trả lời lại cho câu hỏi này. Dự kiến thêm ${streamStatus.retryAfterMs > 0 ? formatRetryDelay(streamStatus.retryAfterMs) : 'ít giây'}.`
              : streamStatus.phase === 'requesting'
                ? `Câu hỏi đã được gửi. AI đang đọc lại mạch trao đổi, khoảng ${formatElapsed(pendingChatElapsedMs)} rồi.`
                : `AI đang chuẩn bị câu trả lời, khoảng ${formatElapsed(pendingChatElapsedMs)} rồi.`}
          </div>
        </div>
      )}
      {isLoading && currentThread.turns.length > 0 && !pendingChatMessage && (
        <div className="text-xs text-gold/60 italic px-2 animate-pulse">
          {streamStatus.phase === 'retrying'
            ? `AI đang thử trả lời lại, dự kiến trong ${streamStatus.retryAfterMs > 0 ? formatRetryDelay(streamStatus.retryAfterMs) : 'ít giây'}.`
            : 'AI đang truyền tin và soạn câu trả lời...'}
        </div>
      )}
    </div>

    <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
      <input
        type="text"
        className="input flex-1"
        placeholder={isLoading ? 'Vui lòng chờ AI trả lời...' : `Hỏi tiếp về ${currentThread.focusArea === 'overall' ? 'mệnh bàn này' : `cung ${currentThread.focusArea}`}...`}
        value={question}
        onChange={e => onQuestionChange(e.target.value)}
        disabled={isLoading}
      />
      <button type="submit" disabled={isLoading || !question.trim()} className="btn-primary w-full sm:w-24">Gửi</button>
    </form>

    {pendingChatMessage && (
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onCancelActiveChatRequest}
          disabled={!isLoading}
          className="text-xs text-white/65 underline underline-offset-2 disabled:opacity-40"
        >
          Dừng lần gửi này
        </button>
      </div>
    )}

    {hasChatError && (
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void onRetryLastMessage()}
          disabled={isLoading}
          className="text-xs text-white/70 underline underline-offset-2 disabled:opacity-40"
        >
          Gửi lại câu hỏi vừa rồi
        </button>
        {suggestedRecoveryModel && (
          <button
            type="button"
            onClick={() => void onRetryLastMessageWithSuggestedModel()}
            disabled={isLoading}
            className="text-xs text-white/70 underline underline-offset-2 disabled:opacity-40"
          >
            Gửi lại bằng {suggestedRecoveryModel}
          </button>
        )}
        <button
          type="button"
          onClick={onResetThread}
          disabled={isLoading}
          className="text-xs text-white/55 underline underline-offset-2 disabled:opacity-40"
        >
          Xóa mạch trao đổi này
        </button>
      </div>
    )}
  </div>
);
