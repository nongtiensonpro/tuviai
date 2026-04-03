/**
 * AnalysisPanel.tsx
 * Hiển thị khung luận giải Tử Vi bằng AI (Structured UI Cards) và thread hỏi đáp có memory ngắn hạn
 */
import React, { Suspense, lazy } from 'react';
import type { AnalysisFocusArea, PalaceName, ZiweiChart } from '../core/types/ZiweiTypes';
import { AnalysisChatBox } from './AnalysisChatBox';
import { AnalysisHeader } from './AnalysisHeader';
import { AnalysisResultCards } from './AnalysisResultCards';
import { AnalysisStatusStack } from './AnalysisStatusStack';
import { useAnalysisAiState } from './useAnalysisAiState';

export interface AnalysisPanelProps {
  chart: ZiweiChart;
  targetPalaceName?: PalaceName;
  onNavigateFocus?: (focusArea: AnalysisFocusArea) => void;
}

const ApiKeySetup = lazy(async () => {
  const module = await import('./ApiKeySetup');
  return { default: module.ApiKeySetup };
});

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ chart, targetPalaceName, onNavigateFocus }) => {
  const {
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
    question,
    pendingChatMessage,
    pendingChatElapsedMs,
    streamStatus,
    currentFocus,
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
    retryAnalyze,
    retryAnalyzeWithSuggestedModel,
    cancelActiveChatRequest,
    retryLastMessage,
    retryLastMessageWithSuggestedModel,
    handleKeyReady,
    handleLockKey,
    suggestedRecoveryModel,
    lastFailureScope,
  } = useAnalysisAiState({
    chart,
    targetPalaceName,
    onNavigateFocus,
  });

  return (
    <div className="w-full mt-10 max-w-[1200px] mx-auto animate-fade-up">
      <div className="p-0">
        <AnalysisHeader
          activeModel={activeModel}
          selectedModel={selectedModel}
          activeModelHealthText={activeModelHealthText}
          visiblePalaceFocus={visiblePalaceFocus}
          apiKey={apiKey}
          currentThread={currentThread}
          onResetThread={handleResetThread}
          onLockKey={handleLockKey}
        />

        {!apiKey ? (
          <Suspense fallback={<div className="py-8 text-center text-white/45 text-sm">Đang chuẩn bị cấu hình BYOK...</div>}>
            <ApiKeySetup onKeyReady={handleKeyReady} />
          </Suspense>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between mb-2">
              <p className="text-sm text-white/56 max-w-2xl">
                Bạn có thể bấm trực tiếp vào cung trên mệnh bàn, hoặc dùng nút phân tích tổng quan khi cần một góc nhìn rộng hơn. {activeModelLatencyText}
              </p>

              {!analysisResult && (
                <button
                  onClick={() => void handleAnalyze(targetPalaceName)}
                  disabled={isLoading}
                  className="btn-primary min-w-[200px]"
                >
                  {isLoading ? 'Đang thấu thị...' : 'Phân Tích Bức Tranh Tổng Thể'}
                </button>
              )}
            </div>

            <AnalysisStatusStack
              errorState={errorState}
              fallbackState={fallbackState}
              suggestedRecoveryModel={suggestedRecoveryModel}
              lastFailureScope={lastFailureScope}
              isShowingLastGoodResult={isShowingLastGoodResult}
              analysisResultExists={!!analysisResult}
              isLoading={isLoading}
              streamStatus={streamStatus}
              loadingFocusArea={loadingFocusArea}
              loadingMessage={loadingMessage}
              loadingHint={loadingHint}
              onRetryAnalyze={retryAnalyze}
              onRetryAnalyzeWithSuggestedModel={retryAnalyzeWithSuggestedModel}
            />

            {analysisResult && (
              <AnalysisResultCards
                data={analysisResult}
                currentThread={currentThread}
                currentFocus={currentFocus}
                visiblePalaceFocus={visiblePalaceFocus}
                onNavigateFocus={handleNavigateFocus}
                onPickSuggestion={setQuestion}
              />
            )}

            {currentChatSession && analysisResult && currentThread && (
              <AnalysisChatBox
                currentThread={currentThread}
                isLoading={isLoading}
                question={question}
                pendingChatMessage={pendingChatMessage}
                pendingChatElapsedMs={pendingChatElapsedMs}
                streamStatus={streamStatus}
                hasChatError={lastFailureScope === 'chat'}
                suggestedRecoveryModel={suggestedRecoveryModel}
                onQuestionChange={setQuestion}
                onSubmit={handleSendMessage}
                onCancelActiveChatRequest={cancelActiveChatRequest}
                onRetryLastMessage={retryLastMessage}
                onRetryLastMessageWithSuggestedModel={retryLastMessageWithSuggestedModel}
                onResetThread={handleResetThread}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
