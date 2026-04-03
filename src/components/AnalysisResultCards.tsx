import React from 'react';
import type { AnalysisFocusArea, AnalysisThread, PalaceName } from '../core/types/ZiweiTypes';
import type { StructuredAiResponse } from '../services/PromptBuilder';

interface AnalysisResultCardsProps {
  data: StructuredAiResponse;
  currentThread: AnalysisThread | null;
  currentFocus: AnalysisFocusArea;
  visiblePalaceFocus?: PalaceName;
  onNavigateFocus: (focusArea: AnalysisFocusArea) => void;
  onPickSuggestion: (suggestion: string) => void;
}

export const AnalysisResultCards: React.FC<AnalysisResultCardsProps> = ({
  data,
  currentThread,
  currentFocus,
  visiblePalaceFocus,
  onNavigateFocus,
  onPickSuggestion,
}) => (
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
              onClick={() => onNavigateFocus('overall')}
              className="px-0 py-1 text-sm text-cyan-100 hover:text-cyan transition-colors text-left"
            >
              Xem lại tổng quan mệnh bàn
            </button>
          )}
          {(currentThread?.memory.relatedPalaces ?? data.referenced_palaces.filter((palace) => palace !== currentFocus)).map((palace) => (
            <button
              key={palace}
              type="button"
              onClick={() => onNavigateFocus(palace)}
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
              onClick={() => onPickSuggestion(suggestion)}
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
