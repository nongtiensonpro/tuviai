/**
 * GeminiService.ts — Tương tác trực tiếp với Google Gemini AI (Backend-less)
 * Hỗ trợ Structured Output (JSON) và Lịch sử Chat (Session)
 */
import { GoogleGenAI } from '@google/genai';
import { PromptBuilder, type StructuredAiResponse, analyzeSchema } from './PromptBuilder';
import type { AnalysisBridgeContext, AnalysisThread, PalaceAnalysis, PalaceName, ZiweiChart } from '../core/types/ZiweiTypes';

export interface GeminiChatSession {
  sendMessage: (thread: AnalysisThread, msg: string) => Promise<string>;
}

export interface GeminiAnalysisStreamEvent {
  chunkText: string;
  fullText: string;
  receivedChars: number;
  receivedChunks: number;
}

export interface GeminiAnalyzeOptions {
  onStreamEvent?: (event: GeminiAnalysisStreamEvent) => void;
}

const PALACE_NAMES = new Set<PalaceName>([
  'Mệnh',
  'Phụ Mẫu',
  'Phúc Đức',
  'Điền Trạch',
  'Quan Lộc',
  'Nô Bộc',
  'Thiên Di',
  'Tật Ách',
  'Tài Bạch',
  'Tử Tức',
  'Phu Thê',
  'Huynh Đệ',
]);

function parseString(value: unknown, fallback: string = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

function parseStringArray(value: unknown, minItems: number = 0): string[] {
  const items = Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string').map(item => item.trim()).filter(Boolean)
    : [];

  if (items.length >= minItems) {
    return items;
  }

  return items;
}

function parseReferencedPalaces(value: unknown): PalaceName[] {
  return parseStringArray(value).filter((item): item is PalaceName => PALACE_NAMES.has(item as PalaceName));
}

function normalizeAnalysisResponse(payload: unknown): PalaceAnalysis {
  const raw = (payload && typeof payload === 'object') ? payload as Record<string, unknown> : {};

  return {
    summary: parseString(raw.summary, 'Chưa thể tạo tóm tắt rõ ràng từ phản hồi AI.'),
    palace_analysis: parseString(raw.palace_analysis, 'AI chưa trả về phần luận giải chi tiết.'),
    key_points: parseStringArray(raw.key_points),
    karmic_interactions: parseStringArray(raw.karmic_interactions),
    referenced_palaces: parseReferencedPalaces(raw.referenced_palaces),
    sihua_triggers: parseString(raw.sihua_triggers, 'Chưa có phân tích Tứ Hóa rõ ràng.'),
    modern_advice: parseString(raw.modern_advice, 'Chưa có lời khuyên thực hành rõ ràng.'),
    follow_up_suggestions: parseStringArray(raw.follow_up_suggestions),
  };
}

function extractJsonPayload(responseText: string): string {
  const trimmed = responseText.trim();
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

export class GeminiService {
  /**
   * Gọi AI phân tích Mệnh Bàn trả về Structured JSON Output
   * @param apiKey API Key thật (đã giải mã)
   * @param chart Dữ liệu Mệnh bàn
   * @param targetPalaceName Tùy chọn, tập trung vào 1 cung
   * @param userQuestion (Tùy chọn) Câu hỏi cụ thể
   */
  static async analyzeChartJSON(
    apiKey: string,
    chart: ZiweiChart,
    targetPalaceName?: PalaceName,
    userQuestion?: string,
    modelName: string = 'gemini-3.1-pro-preview',
    bridgeContext?: AnalysisBridgeContext,
    options?: GeminiAnalyzeOptions,
  ): Promise<StructuredAiResponse> {
    
    if (!apiKey) throw new Error("API Key không hợp lệ.");

    try {
      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = PromptBuilder.buildSystemInstruction();
      const prompt = PromptBuilder.buildAnalysisPrompt(chart, targetPalaceName, userQuestion, bridgeContext);
      const response = await ai.models.generateContentStream({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
          responseMimeType: "application/json",
          responseSchema: analyzeSchema
        }
      });

      let responseText = '';
      let receivedChunks = 0;

      for await (const chunk of response) {
        const chunkText = chunk.text ?? '';
        if (!chunkText) {
          continue;
        }

        responseText += chunkText;
        receivedChunks += 1;
        options?.onStreamEvent?.({
          chunkText,
          fullText: responseText,
          receivedChars: responseText.length,
          receivedChunks,
        });
      }

      if (!responseText) throw new Error("Không có dữ liệu trả về.");

      return normalizeAnalysisResponse(JSON.parse(extractJsonPayload(responseText)));

    } catch (error: unknown) {
      console.error("Gemini API Error:", error);
      const message = error instanceof Error ? error.message : "Lỗi gọi API Google Gemini.";
      throw new Error(message);
    }
  }

  /**
   * Tính năng Chat đàm thoại. Tạo phiên follow-up dùng thread memory cục bộ.
   */
  static createChatSession(
    apiKey: string,
    modelName: string = 'gemini-3.1-pro-preview',
  ): GeminiChatSession {
    if (!apiKey) throw new Error("API Key không hợp lệ.");
    const ai = new GoogleGenAI({ apiKey });

    return {
      sendMessage: async (thread: AnalysisThread, msg: string) => {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: PromptBuilder.buildFollowUpPrompt(thread, msg),
          config: {
            systemInstruction: PromptBuilder.buildFollowUpSystemInstruction(),
            temperature: 0.7,
          },
        });

        return response.text?.trim() || "AI không trả lời được.";
      },
    };
  }
}
