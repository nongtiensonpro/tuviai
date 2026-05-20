/**
 * PromptBuilder.ts — Định dạng Mega Prompt để Gemini AI phân tích lá số
 */
import type { AnalysisBridgeContext, AnalysisThread, FollowUpPromptContext, PalaceAnalysis, PalaceName, ZiweiChart } from '../core/types/ZiweiTypes';
import { AnalysisContextBuilder } from './AnalysisContextBuilder';
import { AnalysisThreadService } from './AnalysisThreadService';

export type StructuredAiResponse = PalaceAnalysis;

export const analyzeSchema = {
  type: "object",
  properties: {
    summary: {
      type: "string",
      description: "Tóm tắt 2-3 câu bằng tiếng Việt, giúp người đọc nắm nhanh mấu chốt của phần luận giải.",
    },
    palace_analysis: {
      type: "string",
      description: "Phân tích kỹ lưỡng dưới dạng định dạng HTML5 tương tác (details/summary, ai-table, inline svg). Giải thích chi tiết dựa trên chính tinh, phụ tinh, vô chính diệu, sao mượn và tam phương tứ chính.",
    },
    key_points: {
      type: "array",
      items: { type: "string" },
      description: "3-5 ý chính ngắn gọn bằng tiếng Việt, mỗi ý một câu ngắn, cô đọng các luận điểm mạnh nhất.",
    },
    karmic_interactions: {
      type: "array",
      items: { type: "string" },
      description: "Danh sách 2-4 gạch đầu dòng phân tích sự tương tác từ Tam Phương Tứ Chính, chỉ rõ cung nào đang nâng đỡ hoặc gây áp lực.",
    },
    referenced_palaces: {
      type: "array",
      items: { type: "string" },
      description: "Tên các cung thực sự được dùng để lập luận. Chỉ liệt kê các cung đã nhắc đến trong suy luận.",
    },
    sihua_triggers: {
      type: "string",
      description: "Phân tích bằng định dạng HTML5 tương tác sự kích hoạt của Tứ Hóa (Lộc, Quyền, Khoa, Kỵ) trong vùng trọng tâm hoặc trên các trục chính của lá số.",
    },
    modern_advice: {
      type: "string",
      description: "Lời khuyên thực tế bằng định dạng HTML5 tương tác, dễ áp dụng trong đời sống hiện đại, tránh mơ hồ và tránh hù dọa.",
    },
    follow_up_suggestions: {
      type: "array",
      items: { type: "string" },
      description: "3-5 câu hỏi ngắn, tự nhiên, giúp người dùng hỏi tiếp sau khi đọc phần phân tích đầu tiên.",
    },
  },
  required: [
    "summary",
    "palace_analysis",
    "key_points",
    "karmic_interactions",
    "referenced_palaces",
    "sihua_triggers",
    "modern_advice",
    "follow_up_suggestions",
  ],
};

export class PromptBuilder {
  static buildSystemInstruction(): string {
    return `Bạn là chuyên gia luận giải Tử Vi Đẩu Số, ưu tiên tính chính xác, tính giải thích được và ngôn ngữ tiếng Việt sáng rõ.

NGUYÊN TẮC BẮT BUỘC:
1. Chỉ sử dụng dữ kiện có trong context JSON. Không tự phát minh sao, cung, hạn hoặc dữ kiện đời thực không được cung cấp.
2. Luôn phân biệt dữ kiện với suy luận. Khi kết luận, phải nói ngắn gọn vì sao kết luận đó hợp lý.
3. Nếu cung vô chính diệu, bắt buộc xét sao mượn từ cung xung chiếu và nêu rõ điều này trong phần phân tích.
4. Nếu đang phân tích một cung cụ thể, bắt buộc xét tam phương tứ chính của cung đó trước khi cho lời khuyên.
5. Nếu đang phân tích tổng quan, ưu tiên trục Mệnh, Thân, Quan Lộc, Tài Bạch và các tín hiệu nổi bật đã được tóm tắt trong context.
6. Giọng điệu điềm tĩnh, có chiều sâu, không mê tín cực đoan, không hù dọa, không quyết định thay người dùng.
7. Đầu ra phải là JSON hợp lệ, đúng schema, không bọc markdown, không thêm text ngoài JSON.
8. Trong "referenced_palaces", chỉ liệt kê những cung thực sự đã dùng để lập luận.
9. TIÊU CHUẨN ĐỊNH DẠNG TƯƠNG TÁC (HTML & SVG): Các trường phân tích ("palace_analysis", "sihua_triggers", "modern_advice") phải được trình bày bằng định dạng HTML5 ngữ nghĩa và tương tác kết hợp sơ đồ inline SVG (nếu cần minh họa trực quan).
   - Bắt buộc dùng thẻ <details class="ai-interactive-details"><summary class="ai-interactive-summary">Tiêu đề ẩn/hiện</summary><div class="ai-interactive-content">Nội dung giải thích chi tiết...</div></details> để bọc các phần phân tích kỹ thuật chuyên sâu về phụ tinh, chòm sao nhỏ, tam phương tứ chính ẩn hoặc lập luận học thuật nhằm giữ cho luồng đọc chính luôn gọn gàng và dễ theo dõi.
   - Sử dụng cấu trúc bảng <table class="ai-table"><thead><tr><th>Đặc tính</th><th>Ý nghĩa</th></tr></thead><tbody><tr><td>...</td><td>...</td></tr></tbody></table> khi so sánh miếu hãm chòm sao hoặc đối chiếu đắc thất của sao.
   - Được phép dùng các lớp CSS Cosmic Alchemy sau để định dạng văn bản: "text-gold" (vàng hoàng gia), "text-coral" (san hô ấm), "text-cyan" (xanh thiên thể), "glass-card" (thẻ kính mờ), "font-semibold", "font-bold", "border border-gold/15", "p-3", "bg-gold/5", "rounded-lg", "my-2".
   - Tuyệt đối không dùng thẻ <script>, các thuộc tính sự kiện như "onclick", hay đường dẫn "href" không an toàn. Tất cả mã HTML phải tự đóng thẻ chuẩn xác và lồng nhau hợp lệ.`;
  }

  static buildFollowUpSystemInstruction(): string {
    return `${this.buildSystemInstruction()}
10. Với follow-up, hãy trả lời bằng văn xuôi tự nhiên bằng tiếng Việt sử dụng định dạng HTML5 tương tác (details/summary, ai-table, inline svg) khi giải thích sâu hoặc trình bày bảng biểu trực quan, không cần JSON.
11. Bám sát "threadMemory" và "recentTurns"; nếu câu hỏi vượt khỏi dữ kiện hiện có, nói rõ giới hạn thay vì suy diễn.
12. Ưu tiên tính liên tục hội thoại: nối tiếp đúng mạch trao đổi trước đó, nhưng vẫn nhắc lại ngắn gọn bối cảnh nếu cần.
13. Nếu có "conversationDigest", hãy dùng nó để nối mạch phần trao đổi cũ hơn, tránh bỏ quên ý quan trọng đã nói trước đó.`;
  }

  static buildAnalysisPrompt(
    chart: ZiweiChart,
    targetPalaceName?: PalaceName,
    userQuestion?: string,
    bridgeContext?: AnalysisBridgeContext,
  ): string {
    const context = AnalysisContextBuilder.buildInitialAnalysisContext(chart, targetPalaceName, userQuestion, bridgeContext);
    const contextStr = AnalysisContextBuilder.stringifyContext(context);
    const focusLabel = targetPalaceName ?? 'tổng quan mệnh bàn';

    let prompt = `NHIỆM VỤ: initial_analysis\n`;
    prompt += `TRỌNG TÂM: ${focusLabel}\n`;

    if (targetPalaceName) {
      prompt += `YÊU CẦU: Luận giải chuyên sâu cung ${targetPalaceName}, bám sát tam phương tứ chính, nêu rõ cung nào đang hỗ trợ hoặc gây áp lực.\n`;
    } else {
      prompt += `YÊU CẦU: Luận giải tổng quan, ưu tiên trục Mệnh - Thân - Quan Lộc - Tài Bạch, làm nổi bật điểm mạnh, điểm yếu và hướng ứng dụng thực tế.\n`;
    }

    if (userQuestion) {
      prompt += `CÂU HỎI RIÊNG CỦA ĐƯƠNG SỐ: "${userQuestion}"\n`;
    }

    if (bridgeContext) {
      const sourceLabel = bridgeContext.sourceFocusArea === 'overall'
        ? 'tổng quan mệnh bàn'
        : `cung ${bridgeContext.sourceFocusArea}`;
      prompt += `NỐI MẠCH TỪ TRAO ĐỔI TRƯỚC: Người dùng vừa đi từ ${sourceLabel} sang ${focusLabel}. Hãy giữ liên hệ với mạch trước nhưng ưu tiên luận giải trọng tâm mới.\n`;
    }

    prompt += `\nYÊU CẦU TRIỂN KHAI NỘI DUNG:
- "summary": 2-3 câu ngắn, giúp người đọc nắm ngay mấu chốt.
- "key_points": 3-5 ý chính, mỗi ý một câu ngắn.
- "palace_analysis": giải thích mạch luận chính, phải bám sát các snapshot và highlights đã cho.
- "karmic_interactions": 2-4 ý nói rõ sự tác động qua tam hợp/xung chiếu hoặc trục chính.
- "referenced_palaces": chỉ liệt kê cung thực sự dùng để suy luận.
- "sihua_triggers": phân tích riêng lớp Tứ Hóa và các kích hoạt quan trọng.
- "modern_advice": lời khuyên thực hành, cụ thể, không giáo điều.
- "follow_up_suggestions": 3-5 câu hỏi tự nhiên để người dùng có thể hỏi tiếp ngay sau phần này.

NGỮ CẢNH CÓ CẤU TRÚC:
\`\`\`json
${contextStr}
\`\`\``;

    return prompt;
  }

  static buildFollowUpPrompt(thread: AnalysisThread, question: string): string {
    const context: FollowUpPromptContext = {
      userIntent: {
        mode: 'follow_up',
        focusArea: thread.focusArea,
        userQuestion: question,
      },
      threadMemory: thread.memory,
      conversationRecap: thread.memory.conversationRecap,
      conversationDigest: AnalysisThreadService.getConversationDigest(thread),
      recentTurns: AnalysisThreadService.getRecentTurns(thread),
      totalTurns: thread.turns.length,
      question,
    };

    const focusLabel = thread.focusArea === 'overall' ? 'tổng quan mệnh bàn' : `cung ${thread.focusArea}`;

    return `NHIỆM VỤ: follow_up
TRỌNG TÂM: ${focusLabel}

YÊU CẦU TRẢ LỜI:
- Trả lời trực tiếp câu hỏi mới của người dùng, không cần JSON.
- Nếu cần, nhắc lại rất ngắn phần bối cảnh đang dùng để lập luận.
- Nếu có conversationRecap, dùng nó như phần neo ngữ cảnh ưu tiên trước khi đọc recentTurns.
- Ưu tiên nối mạch với phần phân tích ban đầu và các lượt hỏi gần đây.
- Dùng conversationDigest để không quên các mốc trao đổi cũ hơn nếu thread đã dài.
- Không lặp lại toàn bộ bài luận cũ nếu người dùng chỉ hỏi sâu thêm một ý.
- Nếu câu hỏi chạm sang cung khác, vẫn có thể đối chiếu nhưng phải nói rõ đang liên hệ từ trọng tâm hiện tại.

MEMORY HỘI THOẠI:
\`\`\`json
${JSON.stringify(context, null, 2)}
\`\`\`

CÂU HỎI MỚI:
${question}`;
  }
}
