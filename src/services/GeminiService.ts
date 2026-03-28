/**
 * GeminiService.ts — Tương tác trực tiếp với Google Gemini AI (Backend-less)
 * Hỗ trợ Structured Output (JSON) và Lịch sử Chat (Session)
 */
import { GoogleGenAI, Type } from '@google/genai';
import { PromptBuilder, type StructuredAiResponse, analyzeSchema } from './PromptBuilder';
import type { ZiweiChart } from '../core/types/ZiweiTypes';

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
    targetPalaceName?: string,
    userQuestion?: string,
    modelName: string = 'gemini-3.1-pro-preview'
  ): Promise<StructuredAiResponse> {
    
    if (!apiKey) throw new Error("API Key không hợp lệ.");

    try {
      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = PromptBuilder.buildSystemInstruction();
      const prompt = PromptBuilder.buildAnalysisPrompt(chart, targetPalaceName, userQuestion);

      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
          // Ép kiểu đầu ra thành JSON có cấu trúc chuẩn theo Schema định nghĩa ở PromptBuilder
          responseMimeType: "application/json",
          // Lưu ý: @google/genai SDK v0.1 dùng `responseSchema` theo OpenAPI hoặc TypeScript
          // Việc định nghĩa type Type.OBJECT thông qua Type enum tuỳ biến
          responseSchema: analyzeSchema as any
        }
      });

      const responseText = response.text;
      if (!responseText) throw new Error("Không có dữ liệu trả về.");
      
      return JSON.parse(responseText) as StructuredAiResponse;

    } catch (error: any) {
      console.error("Gemini API Error:", error);
      throw new Error(error.message || "Lỗi gọi API Google Gemini.");
    }
  }

  /**
   * Tính năng Chat đàm thoại. Mở 1 Chat Session.
   */
  static createChatSession(apiKey: string, chart: ZiweiChart, targetPalaceName?: string, modelName: string = 'gemini-3.1-pro-preview') {
    if (!apiKey) throw new Error("API Key không hợp lệ.");
    const ai = new GoogleGenAI({ apiKey });
    const systemInstruction = PromptBuilder.buildSystemInstruction();
    
    const contextPrompt = PromptBuilder.buildAnalysisPrompt(chart, targetPalaceName);

    // Bắt đầu một Chat session
    const chat = ai.chats.create({
      model: modelName,
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });

    return {
      // Gửi context giả làm 1 lượt mồi trước khi người dùng đặt câu hỏi
      initialize: async () => {
         await chat.sendMessage({ message: `Giữ context này làm nền tảng phân tích: \n\n${contextPrompt}` });
      },
      sendMessage: async (msg: string) => {
         const response = await chat.sendMessage({ message: msg });
         return response.text || "AI không trả lời được.";
      }
    };
  }
}
