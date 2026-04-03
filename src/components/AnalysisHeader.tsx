import React from 'react';
import type { AnalysisThread, PalaceName } from '../core/types/ZiweiTypes';

interface AnalysisHeaderProps {
  activeModel: string;
  selectedModel: string;
  activeModelHealthText: string;
  visiblePalaceFocus?: PalaceName;
  apiKey: string;
  currentThread: AnalysisThread | null;
  onResetThread: () => void;
  onLockKey: () => void;
}

export const AnalysisHeader: React.FC<AnalysisHeaderProps> = ({
  activeModel,
  selectedModel,
  activeModelHealthText,
  visiblePalaceFocus,
  apiKey,
  currentThread,
  onResetThread,
  onLockKey,
}) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
    <h2 className="text-xl sm:text-2xl font-serif-sc text-gold flex items-center gap-2">
      <span>✨</span> Đại Sư AI ({activeModel.replace('gemini-', '').toUpperCase()})
    </h2>
    <div className="flex flex-wrap items-center gap-2">
      {activeModel !== selectedModel && (
        <span className="text-amber-200 px-1 py-1 text-xs whitespace-nowrap">
          Đang dùng model dự phòng
        </span>
      )}
      <span className="text-white/55 px-1 py-1 text-xs whitespace-nowrap">
        {activeModelHealthText}
      </span>
      {visiblePalaceFocus && (
        <span className="text-blue-200 px-1 py-1 text-xs whitespace-nowrap">
          Điểm Ngắm: Cung {visiblePalaceFocus}
        </span>
      )}
      {apiKey && currentThread && currentThread.turns.length > 0 && (
        <button
          type="button"
          onClick={onResetThread}
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
              onLockKey();
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
);
