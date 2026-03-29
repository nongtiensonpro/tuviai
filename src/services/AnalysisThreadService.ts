import { AnalysisContextBuilder } from './AnalysisContextBuilder';
import type {
  AnalysisBridgeContext,
  AnalysisFocusArea,
  AnalysisThread,
  ChatRole,
  ChatTurn,
  PalaceAnalysis,
  PalaceName,
  ZiweiChart,
} from '../core/types/ZiweiTypes';

const STORAGE_PREFIX = 'tuviai_analysis_thread';
const MAX_RECENT_TURNS = 6;

interface SessionStorageLike {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

function getStorage(): SessionStorageLike | null {
  const storage = (globalThis as { sessionStorage?: SessionStorageLike }).sessionStorage;
  if (!storage) {
    return null;
  }

  return storage;
}

function createTurnId(role: ChatRole, createdAt: number): string {
  return `${role}-${createdAt}-${Math.random().toString(36).slice(2, 8)}`;
}

function isChatRole(value: unknown): value is ChatRole {
  return value === 'user' || value === 'ai';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}

function parseChatTurn(value: unknown): ChatTurn | null {
  if (!isRecord(value) || !isChatRole(value.role) || typeof value.msg !== 'string' || typeof value.createdAt !== 'number') {
    return null;
  }

  return {
    id: typeof value.id === 'string' ? value.id : createTurnId(value.role, value.createdAt),
    role: value.role,
    msg: value.msg,
    createdAt: value.createdAt,
  };
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string').map(item => item.trim()).filter(Boolean);
}

function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}...`;
}

function dedupeStrings(items: string[], maxItems: number): string[] {
  return Array.from(new Set(items.map(item => item.trim()).filter(Boolean))).slice(0, maxItems);
}

function dedupePalaces(items: PalaceName[], maxItems: number): PalaceName[] {
  return Array.from(new Set(items)).slice(0, maxItems);
}

function labelFocusArea(focusArea: AnalysisFocusArea): string {
  return focusArea === 'overall' ? 'tổng quan mệnh bàn' : `cung ${focusArea}`;
}

function parseThread(value: unknown): AnalysisThread | null {
  if (!isRecord(value) || !isRecord(value.analysis) || !isRecord(value.memory)) {
    return null;
  }

  const turns = Array.isArray(value.turns)
    ? value.turns.map(parseChatTurn).filter((turn): turn is ChatTurn => !!turn)
    : [];

  const analysis = value.analysis;

  if (
    typeof value.id !== 'string'
    || typeof value.chartFingerprint !== 'string'
    || typeof value.createdAt !== 'number'
    || typeof value.updatedAt !== 'number'
    || typeof analysis.summary !== 'string'
    || typeof analysis.palace_analysis !== 'string'
    || typeof analysis.sihua_triggers !== 'string'
    || typeof analysis.modern_advice !== 'string'
    || !Array.isArray(analysis.key_points)
    || !Array.isArray(analysis.karmic_interactions)
    || !Array.isArray(analysis.referenced_palaces)
    || !Array.isArray(analysis.follow_up_suggestions)
  ) {
    return null;
  }

  const focusArea = value.focusArea;
  if (focusArea !== 'overall' && typeof focusArea !== 'string') {
    return null;
  }

  const memory = value.memory;
  if (
    (memory.focusArea !== 'overall' && typeof memory.focusArea !== 'string')
    || typeof memory.analysisSummary !== 'string'
  ) {
    return null;
  }

  return {
    id: value.id,
    chartFingerprint: value.chartFingerprint,
    focusArea: focusArea as AnalysisFocusArea,
    analysis: {
      summary: analysis.summary,
      palace_analysis: analysis.palace_analysis,
      key_points: parseStringArray(analysis.key_points),
      karmic_interactions: parseStringArray(analysis.karmic_interactions),
      referenced_palaces: parseStringArray(analysis.referenced_palaces) as PalaceAnalysis['referenced_palaces'],
      sihua_triggers: analysis.sihua_triggers,
      modern_advice: analysis.modern_advice,
      follow_up_suggestions: parseStringArray(analysis.follow_up_suggestions),
    },
    memory: {
      focusArea: memory.focusArea as AnalysisFocusArea,
      analysisSummary: memory.analysisSummary,
      keyPoints: parseStringArray(memory.keyPoints),
      referencedPalaces: parseStringArray(memory.referencedPalaces) as PalaceAnalysis['referenced_palaces'],
      relatedPalaces: parseStringArray(memory.relatedPalaces) as PalaceName[],
      focusHighlights: parseStringArray(memory.focusHighlights),
      chartHighlights: parseStringArray(memory.chartHighlights),
      suggestedQuestions: parseStringArray(memory.suggestedQuestions),
      conversationRecap: typeof memory.conversationRecap === 'string' ? memory.conversationRecap : '',
      bridgeContext: isRecord(memory.bridgeContext) && typeof memory.bridgeContext.summary === 'string'
        ? {
            sourceFocusArea: (memory.bridgeContext.sourceFocusArea ?? 'overall') as AnalysisFocusArea,
            targetFocusArea: (memory.bridgeContext.targetFocusArea ?? focusArea) as AnalysisFocusArea,
            summary: memory.bridgeContext.summary,
            referencedPalaces: parseStringArray(memory.bridgeContext.referencedPalaces) as PalaceName[],
            recentUserQuestions: parseStringArray(memory.bridgeContext.recentUserQuestions),
            transitionReason: typeof memory.bridgeContext.transitionReason === 'string'
              ? memory.bridgeContext.transitionReason
              : '',
          }
        : undefined,
    },
    turns,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

export class AnalysisThreadService {
  static readonly MAX_RECENT_TURNS = MAX_RECENT_TURNS;

  static buildChartFingerprint(chart: ZiweiChart): string {
    return [
      chart.solarDate.day,
      chart.solarDate.month,
      chart.solarDate.year,
      chart.solarDate.hour,
      chart.gender,
      chart.namCanChi.displayName,
      chart.cungMenhChi,
      chart.cungThanChi,
    ].join('|');
  }

  static buildThreadId(chart: ZiweiChart, focusArea: AnalysisFocusArea): string {
    return `${this.buildChartFingerprint(chart)}::${focusArea}`;
  }

  static createThread(
    chart: ZiweiChart,
    focusArea: AnalysisFocusArea,
    analysis: PalaceAnalysis,
    bridgeContext?: AnalysisBridgeContext,
  ): AnalysisThread {
    const now = Date.now();
    const context = AnalysisContextBuilder.buildInitialAnalysisContext(
      chart,
      focusArea === 'overall' ? undefined : focusArea,
      undefined,
      bridgeContext,
    );

    const thread: AnalysisThread = {
      id: this.buildThreadId(chart, focusArea),
      chartFingerprint: this.buildChartFingerprint(chart),
      focusArea,
      analysis,
      memory: {
        focusArea,
        analysisSummary: analysis.summary,
        keyPoints: analysis.key_points,
        referencedPalaces: analysis.referenced_palaces,
        relatedPalaces: [],
        focusHighlights: context.derivedSignals.focusContext.focusHighlights,
        chartHighlights: context.derivedSignals.chartHighlights.slice(0, 3),
        suggestedQuestions: [],
        conversationRecap: '',
        bridgeContext,
      },
      turns: [],
      createdAt: now,
      updatedAt: now,
    };

    return this.refreshThreadMemory(thread);
  }

  static cloneThread(thread: AnalysisThread): AnalysisThread {
    return {
      ...thread,
      analysis: {
        ...thread.analysis,
        key_points: [...thread.analysis.key_points],
        karmic_interactions: [...thread.analysis.karmic_interactions],
        referenced_palaces: [...thread.analysis.referenced_palaces],
        follow_up_suggestions: [...thread.analysis.follow_up_suggestions],
      },
      memory: {
        ...thread.memory,
        keyPoints: [...thread.memory.keyPoints],
        referencedPalaces: [...thread.memory.referencedPalaces],
        relatedPalaces: [...thread.memory.relatedPalaces],
        focusHighlights: [...thread.memory.focusHighlights],
        chartHighlights: [...thread.memory.chartHighlights],
        suggestedQuestions: [...thread.memory.suggestedQuestions],
        conversationRecap: thread.memory.conversationRecap,
        bridgeContext: thread.memory.bridgeContext ? {
          ...thread.memory.bridgeContext,
          referencedPalaces: [...thread.memory.bridgeContext.referencedPalaces],
          recentUserQuestions: [...thread.memory.bridgeContext.recentUserQuestions],
        } : undefined,
      },
      turns: thread.turns.map(turn => ({ ...turn })),
    };
  }

  static appendTurn(thread: AnalysisThread, role: ChatRole, msg: string, createdAt: number = Date.now()): AnalysisThread {
    const nextTurn: ChatTurn = {
      id: createTurnId(role, createdAt),
      role,
      msg,
      createdAt,
    };

    return this.refreshThreadMemory({
      ...this.cloneThread(thread),
      turns: [...thread.turns, nextTurn],
      updatedAt: createdAt,
    });
  }

  static resetConversation(thread: AnalysisThread): AnalysisThread {
    const now = Date.now();

    return this.refreshThreadMemory({
      ...this.cloneThread(thread),
      turns: [],
      updatedAt: now,
    });
  }

  static getRecentTurns(thread: AnalysisThread, limit: number = MAX_RECENT_TURNS): Array<Pick<ChatTurn, 'role' | 'msg'>> {
    return thread.turns.slice(-limit).map(turn => ({
      role: turn.role,
      msg: turn.msg,
    }));
  }

  static getConversationDigest(thread: AnalysisThread, recentLimit: number = MAX_RECENT_TURNS): string[] {
    const olderTurns = thread.turns.slice(0, Math.max(0, thread.turns.length - recentLimit));
    if (olderTurns.length === 0) {
      return [];
    }

    const digest: string[] = [];
    for (let index = 0; index < olderTurns.length; index += 2) {
      const current = olderTurns[index];
      const next = olderTurns[index + 1];
      if (!current) {
        continue;
      }

      if (current.role === 'user' && next?.role === 'ai') {
        digest.push(`Đã trao đổi: người dùng hỏi "${truncateText(current.msg, 80)}"; AI trả lời "${truncateText(next.msg, 110)}".`);
        continue;
      }

      digest.push(`${current.role === 'user' ? 'Người dùng' : 'AI'} từng nói: "${truncateText(current.msg, 120)}".`);
    }

    return digest.slice(-3);
  }

  static buildBridgeContext(
    sourceThread: AnalysisThread | null,
    targetFocusArea: AnalysisFocusArea,
  ): AnalysisBridgeContext | undefined {
    if (!sourceThread || sourceThread.focusArea === targetFocusArea) {
      return undefined;
    }

    const recentUserQuestions = sourceThread.turns
      .filter(turn => turn.role === 'user')
      .slice(-2)
      .map(turn => truncateText(turn.msg, 90));

    return {
      sourceFocusArea: sourceThread.focusArea,
      targetFocusArea,
      summary: sourceThread.analysis.summary,
      referencedPalaces: sourceThread.memory.referencedPalaces,
      recentUserQuestions,
      transitionReason: `Người dùng vừa chuyển từ ${labelFocusArea(sourceThread.focusArea)} sang ${labelFocusArea(targetFocusArea)} để đào sâu mối liên hệ tiếp theo.`,
    };
  }

  static buildContextualSuggestions(thread: AnalysisThread): string[] {
    const focusLabel = labelFocusArea(thread.focusArea);
    const relatedPalaces = thread.memory.relatedPalaces.slice(0, 2);

    const suggestions = [
      ...thread.analysis.follow_up_suggestions,
      thread.focusArea === 'overall'
        ? 'Nếu đào sâu cung Quan Lộc thì điểm nào nổi bật nhất?'
        : `Nếu nhìn ${focusLabel} theo góc sự nghiệp thì nên ưu tiên điều gì?`,
      thread.focusArea === 'overall'
        ? 'Tài Bạch đang hỗ trợ hay tạo áp lực cho hướng phát triển hiện tại?'
        : `${focusLabel} đang liên hệ với cung Mệnh ra sao?`,
      thread.focusArea === 'overall'
        ? 'Điểm nào trong lá số nên chuyển hóa trước để dễ tiến bộ hơn?'
        : `Dấu hiệu nào trong ${focusLabel} cần thận trọng nhất?`,
      ...relatedPalaces.map(palace => `Nếu đối chiếu thêm với cung ${palace} thì bức tranh thay đổi ra sao?`),
      ...(thread.memory.bridgeContext
        ? [`Mạch vừa chuyển từ ${labelFocusArea(thread.memory.bridgeContext.sourceFocusArea)} sang đây nói lên điều gì?`]
        : []),
    ];

    return dedupeStrings(suggestions, 6);
  }

  static buildConversationRecap(thread: AnalysisThread): string {
    if (thread.turns.length === 0) {
      return '';
    }

    const userQuestions = thread.turns
      .filter(turn => turn.role === 'user')
      .slice(-3)
      .map(turn => truncateText(turn.msg, 90));
    const aiReplies = thread.turns
      .filter(turn => turn.role === 'ai')
      .slice(-2)
      .map(turn => truncateText(turn.msg, 120));

    const segments = [
      `Trọng tâm hiện tại: ${labelFocusArea(thread.focusArea)}.`,
      `Mấu chốt ban đầu: ${truncateText(thread.analysis.summary, 120)}`,
      userQuestions.length > 0 ? `Các câu hỏi gần đây: ${userQuestions.join(' | ')}` : '',
      aiReplies.length > 0 ? `Những ý AI đã nhấn mạnh: ${aiReplies.join(' | ')}` : '',
    ].filter(Boolean);

    return segments.join(' ');
  }

  static collectRelatedPalaces(thread: AnalysisThread): PalaceName[] {
    const related = dedupePalaces([
      ...thread.memory.referencedPalaces,
      ...(thread.memory.bridgeContext?.referencedPalaces ?? []),
    ], 6);

    return related.filter(palace => palace !== thread.focusArea);
  }

  static refreshThreadMemory(thread: AnalysisThread): AnalysisThread {
    const nextThread = this.cloneThread(thread);

    nextThread.memory.relatedPalaces = this.collectRelatedPalaces(nextThread);
    nextThread.memory.conversationRecap = this.buildConversationRecap(nextThread);
    nextThread.memory.suggestedQuestions = this.buildContextualSuggestions(nextThread);
    return nextThread;
  }

  static saveThread(thread: AnalysisThread): void {
    const storage = getStorage();
    if (!storage) {
      return;
    }

    storage.setItem(`${STORAGE_PREFIX}:${thread.id}`, JSON.stringify(thread));
  }

  static loadThread(chart: ZiweiChart, focusArea: AnalysisFocusArea): AnalysisThread | null {
    const storage = getStorage();
    if (!storage) {
      return null;
    }

    const raw = storage.getItem(`${STORAGE_PREFIX}:${this.buildThreadId(chart, focusArea)}`);
    if (!raw) {
      return null;
    }

    try {
      const thread = parseThread(JSON.parse(raw));
      return thread ? this.refreshThreadMemory(thread) : null;
    } catch {
      return null;
    }
  }

  static clearThread(chart: ZiweiChart, focusArea: AnalysisFocusArea): void {
    const storage = getStorage();
    if (!storage) {
      return;
    }

    storage.removeItem(`${STORAGE_PREFIX}:${this.buildThreadId(chart, focusArea)}`);
  }
}
