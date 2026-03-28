/**
 * PromptBuilder.ts — Định dạng Mega Prompt để Gemini AI phân tích lá số
 */
import type { ZiweiChart, PalaceName } from '../core/types/ZiweiTypes';
import { chartToPromptContext } from '../core/astrology/ChartBuilder';

export interface StructuredAiResponse {
  palace_analysis: string;
  karmic_interactions: string[];
  sihua_triggers: string;
  modern_advice: string;
}

export const analyzeSchema = {
  type: "object",
  properties: {
    palace_analysis: {
      type: "string",
      description: "Phân tích kỹ càng về ý nghĩa của các CHÍNH TINH và PHỤ TINH tại cung được chỉ định (hoặc tổng quan nếu không chỉ định cung).",
    },
    karmic_interactions: {
      type: "array",
      items: { type: "string" },
      description: "Danh sách 2-4 gạch đầu dòng phân tích sự tương tác từ Tam Phương Tứ Chính (Tam hợp, Xung chiếu) ảnh hưởng đến cung này.",
    },
    sihua_triggers: {
      type: "string",
      description: "Phân tích sự kích hoạt của Tứ Hóa (Lộc, Quyền, Khoa, Kỵ) nếu có chiếu vào cung này, hoặc đánh giá Cục/Mệnh nếu xem tổng quát.",
    },
    modern_advice: {
      type: "string",
      description: "Lời khuyên thực tế ứng dụng vào cuộc sống hiện đại (đầu tư, sự nghiệp, tình duyên, v.v.).",
    },
  },
  required: ["palace_analysis", "karmic_interactions", "sihua_triggers", "modern_advice"],
};

export class PromptBuilder {
  static buildSystemInstruction(): string {
    return `Bạn là một Tôn sư Tử Vi Đẩu Số uyên bác, thông thái, am hiểu sâu sắc Tam Hợp phái và Bắc Phái Tứ Hóa.
Bạn được cung cấp một **Mệnh Bàn Tử Vi hoàn chỉnh dạng JSON** chứa cấu trúc 12 cung, 14 chính tinh và thần sát.

QUY TẮC LUẬN GIẢI KIÊN QUYẾT:
1. LUÔN BÁM SÁT MỆNH BÀN JSON. Không được phát minh, không tự bịa sao không có mặt trong cung.
2. NẾU VÔ CHÍNH DIỆU (không có chính tinh): Bắt buộc mượn chính tinh ở cung đối diện (Xung Chiếu) để phân tích, ghi rõ là "Mượn sao... từ cung...".
3. THÁI ĐỘ: Điềm tĩnh, khách quan, mang tính an ủi và định hướng hướng thiện. Không hù dọa tiêu cực.
4. LUẬN ĐOÁN THEO TAM PHƯƠNG TỨ CHÍNH: Khi phân tích một cung, đồng thời phải xem rễ của nó từ 3 cung tam hợp và 1 cung xung chiếu. Đánh giá sự xuất hiện Lục Cát, Lục Sát Tinh.
5. CẤU TRÚC ĐẦU RA: Bạn phải ép kiểu trả về ĐÚNG mô hình JSON Schema yêu cầu (palace_analysis, karmic_interactions, sihua_triggers, modern_advice). Không trả về Markdown thông thường bên ngoài vùng JSON.`;
  }

  static buildAnalysisPrompt(chart: ZiweiChart, targetPalaceName?: string, userQuestion?: string): string {
    const contextStr = chartToPromptContext(chart);
    
    let prompt = `Đây là dữ liệu Mệnh Bàn Tử Vi của đương số:\n\`\`\`json\n${contextStr}\n\`\`\`\n\n`;
    
    if (targetPalaceName) {
      prompt += `Yêu cầu Tôn Sư tập trung CHUYÊN SÂU luận giải cung: **${targetPalaceName}**.\n`;
      prompt += `Hãy áp dụng phương pháp nhìn "Tam Phương Tứ Chính" xung quanh cung ${targetPalaceName} để đưa ra đánh giá chính xác nhất.\n\n`;
    } else {
      prompt += `Xin Tôn Sư hãy luận giải tổng quan cuộc đời, điểm mạnh, điểm yếu từ Cung Mệnh, Thân, Tài Bạch, Quan Lộc.\n\n`;
    }

    if (userQuestion) {
      prompt += `Đương số có câu hỏi cụ thể sau: "${userQuestion}"\n\nXin hãy lồng ghép câu trả lời vào phần "modern_advice" hoặc "palace_analysis".`;
    }

    return prompt;
  }
}
