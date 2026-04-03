import React from 'react';
import type { AiErrorCode } from '../core/types/ZiweiTypes';
import type { AnalysisStreamStatus, ModelFallbackState, UiErrorState } from './useAnalysisAiState';

interface AnalysisStatusStackProps {
  errorState: UiErrorState | null;
  fallbackState: ModelFallbackState | null;
  suggestedRecoveryModel: string | null;
  lastFailureScope: 'analysis' | 'chat' | null;
  isShowingLastGoodResult: boolean;
  analysisResultExists: boolean;
  isLoading: boolean;
  streamStatus: AnalysisStreamStatus;
  loadingFocusArea: string;
  loadingMessage: string;
  loadingHint: string;
  onRetryAnalyze: () => void;
  onRetryAnalyzeWithSuggestedModel: () => void;
}

function formatRetryDelay(ms: number): string {
  return `${(ms / 1000).toFixed(ms >= 10_000 ? 0 : 1)} giây`;
}

function formatFocusLabel(focusArea: string): string {
  return focusArea === 'overall' ? 'tổng quan mệnh bàn' : `cung ${focusArea}`;
}

export const AnalysisStatusStack: React.FC<AnalysisStatusStackProps> = ({
  errorState,
  fallbackState,
  suggestedRecoveryModel,
  lastFailureScope,
  isShowingLastGoodResult,
  analysisResultExists,
  isLoading,
  streamStatus,
  loadingFocusArea,
  loadingMessage,
  loadingHint,
  onRetryAnalyze,
  onRetryAnalyzeWithSuggestedModel,
}) => (
  <>
    {errorState && (
      <div className="rounded-sm border border-red-500/25 bg-red-950/20 px-4 py-3">
        <p className="text-sm text-red-200">{errorState.message}</p>
        <p className="mt-1 text-xs text-red-100/75">{errorState.suggestion}</p>
        {lastFailureScope === 'analysis' && (
          <p className="mt-2 text-[11px] text-red-100/60">
            Bạn có thể thử lại ngay, hoặc đổi tạm sang model khác nếu muốn phản hồi mượt hơn.
          </p>
        )}
        {fallbackState && (
          <p className="mt-2 text-[11px] text-red-100/65">
            Lần gần nhất bạn đã chuyển từ `{fallbackState.fromModel}` sang `{fallbackState.toModel}` vì lỗi `{fallbackState.reasonCode}`.
          </p>
        )}
        {errorState.retryable && (
          <div className="mt-3 flex flex-wrap gap-3">
            {lastFailureScope === 'analysis' && (
              <button
                type="button"
                onClick={onRetryAnalyze}
                disabled={isLoading}
                className="text-xs text-red-100 underline underline-offset-2 disabled:opacity-40"
              >
                Thử lại ngay
              </button>
            )}
            {lastFailureScope === 'analysis' && suggestedRecoveryModel && (
              <button
                type="button"
                onClick={onRetryAnalyzeWithSuggestedModel}
                disabled={isLoading}
                className="text-xs text-red-100 underline underline-offset-2 disabled:opacity-40"
              >
                Đổi tạm sang {suggestedRecoveryModel}
              </button>
            )}
          </div>
        )}
      </div>
    )}

    {fallbackState && !errorState && (
      <div className="rounded-sm border border-amber-500/20 bg-amber-950/15 px-4 py-3">
        <p className="text-sm text-amber-200">
          Hiện bạn đang dùng tạm `{fallbackState.toModel}` thay cho `{fallbackState.fromModel}` để AI trả lời đều hơn.
        </p>
      </div>
    )}

    {analysisResultExists && isShowingLastGoodResult && (
      <div className="rounded-sm border border-cyan-500/20 bg-cyan-950/15 px-4 py-3">
        <p className="text-sm text-cyan-100">Mình đang giữ lại phần luận giải gần nhất để bạn không bị đứt mạch đọc trong lúc thử lại hoặc đổi model.</p>
      </div>
    )}

    {isLoading && streamStatus.phase !== 'idle' && !analysisResultExists && (
      <div className="flex flex-col items-center justify-center p-10 mt-6">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-gold animate-spin mb-4"></div>
        <span className="text-gold/90 text-sm text-center max-w-xl">{loadingMessage}</span>
        <span className="text-white/46 text-xs text-center max-w-xl mt-3">{loadingHint}</span>
      </div>
    )}

    {isLoading && streamStatus.phase !== 'idle' && analysisResultExists && (
      <div className="mt-4 rounded-sm border border-gold/20 bg-white/[0.03] px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 h-4 w-4 rounded-full border-2 border-white/20 border-t-gold animate-spin shrink-0"></div>
          <div className="space-y-1">
            <p className="text-sm text-gold/90">
              Đang làm mới luận giải cho {formatFocusLabel(loadingFocusArea)}.
            </p>
            <p className="text-xs text-white/58">
              {loadingMessage} Kết quả hiện tại vẫn được giữ trên màn hình để tránh trống giao diện.
            </p>
            <p className="text-[11px] text-white/40">
              {loadingHint}
            </p>
            {streamStatus.phase === 'retrying' && streamStatus.retryCode && (
              <p className="text-[11px] text-white/30">
                AI đang được gọi lại sau lỗi `{streamStatus.retryCode}`, dự kiến trong khoảng {formatRetryDelay(streamStatus.retryAfterMs)}.
              </p>
            )}
          </div>
        </div>
      </div>
    )}
  </>
);
