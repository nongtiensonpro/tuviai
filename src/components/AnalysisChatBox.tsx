import React from 'react';
import type { AnalysisThread } from '../core/types/ZiweiTypes';
import type { AnalysisStreamStatus } from './useAnalysisAiState';

interface AnalysisChatBoxProps {
  currentThread: AnalysisThread;
  isLoading: boolean;
  question: string;
  streamStatus: AnalysisStreamStatus;
  onQuestionChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

function formatRetryDelay(ms: number): string {
  return `${(ms / 1000).toFixed(ms >= 10_000 ? 0 : 1)} giây`;
}

export const AnalysisChatBox: React.FC<AnalysisChatBoxProps> = ({
  currentThread,
  isLoading,
  question,
  streamStatus,
  onQuestionChange,
  onSubmit,
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

    <div className="analysis-chat-log flex flex-col gap-3 mb-4 max-h-60 overflow-y-scroll pr-2 custom-scrollbar">
      {currentThread.turns.map(turn => (
        <div key={turn.id} className={`py-2 text-sm max-w-[85%] ${turn.role === 'user' ? 'text-blue-100 self-end ml-auto' : 'text-white/90 self-start mr-auto'}`}>
          {turn.role === 'ai' && <strong className="block text-gold mb-1 text-xs">Đại Sư AI</strong>}
          {turn.role === 'user' && <strong className="block text-blue-300 mb-1 text-xs">Bạn</strong>}
          <div className="whitespace-pre-line">{turn.msg}</div>
        </div>
      ))}
      {isLoading && currentThread.turns.length > 0 && (
        <div className="text-xs text-white/46 italic">
          {streamStatus.phase === 'retrying'
            ? `Gemini đang tự thử lại sau sự cố tạm thời, dự kiến trong ${streamStatus.retryAfterMs > 0 ? formatRetryDelay(streamStatus.retryAfterMs) : 'ít giây'}.`
            : 'Đang soạn phản hồi...'}
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
  </div>
);
