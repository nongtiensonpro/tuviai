/**
 * PromptBuilder.ts — Định dạng Mega Prompt để Gemini AI phân tích lá số
 */
import type { AnalysisBridgeContext, AnalysisThread, FollowUpPromptContext, PalaceAnalysis, PalaceName, ZiweiChart } from '../core/types/ZiweiTypes';
import { AnalysisContextBuilder, getChiNguHanh, getBrightnessText } from './AnalysisContextBuilder';
import { AnalysisThreadService } from './AnalysisThreadService';
import { getStarNguHanh } from '../core/astrology/NguHanhEngine';

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
    return `Bạn là một bậc thầy luận giải Tử Vi Đẩu Số thuộc trường phái Nam Tông (Tam Hợp Phái), ưu tiên tính chính xác học thuật, tính giải thích được và ngôn ngữ tiếng Việt sáng rõ, giàu chiều sâu triết lý.

HƯỚNG DẪN HỌC THUẬT NAM PHÁI CỐT LÕI:
- Luôn xem xét thế cân bằng của TAM PHƯƠNG TỨ CHÍNH (cung chính, cung xung chiếu, và 2 cung tam hợp). Cung vị không bao giờ đứng độc lập. Phải phân tích rõ sự rọi chiếu, nâng đỡ hoặc xung sát từ các cung này.
- Phân tích VÒNG THÁI TUẾ để xác định phẩm cách, tư thế xã hội và tâm cảnh đương số:
  * Tam hợp Thái Tuế - Quan Phù - Bạch Hổ: Đương số đắc chính khí, có tư cách, trách nhiệm, nhưng hay chịu gánh nặng.
  * Tam hợp Tang Môn - Tuế Phá - Điếu Khách: Đương số ở thế nghịch cảnh, hay bất mãn, lo toan, phải đấu tranh vượt khó.
  * Tam hợp Thiếu Dương - Phúc Đức - Tử Phù: Thông minh, nhạy biến nhưng dễ chủ quan, đi trước thời thế, hay gặp cản trở do tự đắc.
  * Tam hợp Thiếu Âm - Long Đức - Trực Phù: Hiền lành, đức độ, hay chịu thiệt thòi, nhường nhịn làm gốc.
- Đối chiếu sự sinh khắc NGŨ HÀNH bản mệnh của đương số (ví dụ: Sơn Đầu Hỏa, Lộ Bàng Thổ...) với hành của cung an vị và hành của các tinh đẩu tọa thủ (chính tinh miếu hãm, trung tinh cát hung). Sao sinh Mệnh là đắc thời phù trợ; Sao khắc Mệnh hoặc Mệnh khắc Sao chỉ ra áp lực hoặc sự nỗ lực tự thân.
- Chú trọng phối hợp SONG TINH và CÁCH CỤC (ví dụ: Xương Khúc, Khôi Việt, Tả Hữu, Song Hao, Không Kiếp, Hỏa Linh). Luận giải sự tương hỗ giữa chúng thay vì đọc rời rạc từng sao đơn lẻ. Chỉ rõ cách cát tinh bổ trợ hay sát tinh cản trở cách cục (ngoại trừ trường hợp sát tinh đắc địa hoặc chính tinh có khả năng chế hóa như Thất Sát, Phá Quân chế hóa Không Kiếp).
- TỨ HÓA (Lộc, Quyền, Khoa, Kỵ) là động cơ thúc đẩy sự biến chuyển tài lộc, quyền lực, danh tiếng và tai ương. Phải chỉ rõ dòng chảy chuyển hóa này ảnh hưởng như thế nào đến các trục chính của lá số.

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

  static getNhiHopChiIndex(chiIndex: number): number {
    switch (chiIndex) {
      case 0: return 1;
      case 1: return 0;
      case 2: return 11;
      case 11: return 2;
      case 3: return 10;
      case 10: return 3;
      case 4: return 9;
      case 9: return 4;
      case 5: return 8;
      case 8: return 5;
      case 6: return 7;
      case 7: return 6;
      default: return chiIndex;
    }
  }

  static buildAnnotatedChartMap(chart: ZiweiChart): string {
    const thanPalace = chart.palaces.find(p => p.isThanPalace);
    let mapStr = `### BẢN ĐỒ CHIÊM TINH TỬ VI ĐẨU SỐ (BẢN ĐỒ TỰ GIẢI THÍCH CHO AI)\n\n`;
    
    // 1. Thông tin chung
    mapStr += `#### [THÔNG TIN CHUNG BẢN MỆNH]\n`;
    mapStr += `- Đương số: Giới tính ${chart.gender === 'male' ? 'Nam' : 'Nữ'} (${chart.amDuongNamNu})\n`;
    mapStr += `- Ngày sinh Dương lịch: ${chart.solarDate.day}/${chart.solarDate.month}/${chart.solarDate.year} lúc ${chart.solarDate.hour}h\n`;
    mapStr += `- Ngày sinh Âm lịch: Ngày ${chart.lunarDate.day} tháng ${chart.lunarDate.month} năm ${chart.namCanChi.displayName} (${chart.lunarDate.hourChi} giờ)\n`;
    mapStr += `- Bản mệnh (Ngũ Hành): ${chart.banMenh}\n`;
    mapStr += `- Cục (Ngũ Hành Cục): ${chart.tenCuc} (${chart.amDuongLy})\n`;
    mapStr += `- Quan hệ Mệnh Cục: ${chart.menhCucSinhKhac}\n`;
    mapStr += `- Mệnh Chủ: ${chart.menhChu} | Thân Chủ: ${chart.thanChu}\n`;
    mapStr += `- Cung an Mệnh cư: ${chart.cungMenhChi} | Cung an Thân cư: ${thanPalace ? thanPalace.palaceName + ' (' + thanPalace.chi + ')' : chart.cungThanChi}\n\n`;

    // 2. 12 cung địa bàn
    mapStr += `#### [CHI TIẾT 12 CUNG TRÊN ĐỊA BÀN - THỨ TỰ ĐỊA CHI]\n`;
    
    chart.palaces.forEach(palace => {
      const chiIndex = palace.chiIndex;
      const chi = palace.chi;
      const name = palace.palaceName;
      const element = getChiNguHanh(chi);
      
      // Markers
      const markers: string[] = [];
      if (palace.isThanPalace) markers.push('Cung an THÂN');
      if (palace.hasTuanKhong) markers.push('Có TUẦN KHÔNG');
      if (palace.hasTrietKhong) markers.push('Có TRIỆT KHÔNG');
      const markerText = markers.length > 0 ? ` [Trạng thái đặc biệt: ${markers.join(', ')}]` : '';
      
      mapStr += `${chiIndex + 1}. Cung ${name.toUpperCase()} (tại chi ${chi.toUpperCase()} - hành ${element})${markerText}\n`;
      mapStr += `   - Đại hạn bắt đầu từ: ${palace.daiHan} tuổi | Vòng Tràng Sinh: ${palace.trangSinh}\n`;
      
      // Stars
      const mainStarsText = palace.mainStars.map(star => {
        const starEl = getStarNguHanh(star.name);
        const brText = getBrightnessText(star.brightness);
        const br = brText ? ` - ${brText}` : '';
        const si = star.sihua ? ` [Hóa ${star.sihua}]` : '';
        return `${star.name} (${starEl}${br})${si}`;
      });
      mapStr += `   - Chính tinh: ${mainStarsText.length > 0 ? mainStarsText.join(', ') : 'Vô chính diệu (Không có chính tinh)'}\n`;
      
      if (palace.borrowedStars.length > 0) {
        const borrowedText = palace.borrowedStars.map(star => {
          const starEl = getStarNguHanh(star.name);
          const brText = getBrightnessText(star.brightness);
          const br = brText ? ` - ${brText}` : '';
          const si = star.sihua ? ` [Hóa ${star.sihua}]` : '';
          return `${star.name} (${starEl}${br})${si}`;
        });
        mapStr += `   - Chính tinh mượn (xung chiếu): ${borrowedText.join(', ')}\n`;
      }
      
      const auxText = palace.auxStars
        .filter(star => !['Tuần Không', 'Triệt Không', 'Tuần', 'Triệt'].includes(star.name))
        .map(star => {
          const starEl = getStarNguHanh(star.name);
          const si = star.sihua ? ` [Hóa ${star.sihua}]` : '';
          return `${star.name} (${starEl})${si}`;
        });
      mapStr += `   - Phụ tinh & Tạp diệu: ${auxText.length > 0 ? auxText.join(', ') : 'Không có'}\n`;
      
      // Sihua summary
      const sihuaItems = palace.sihua.map(trigger => `${trigger.starName} Hóa ${trigger.type}`);
      if (sihuaItems.length > 0) {
        mapStr += `   - Tứ Hóa xuất hiện tại cung: ${sihuaItems.join(', ')}\n`;
      }

      // Academic links (Tam Hợp, Xung Chiếu, Nhị Hợp)
      const oppositePalace = chart.palaces[(chiIndex + 6) % 12];
      const tamHop1 = chart.palaces[(chiIndex + 4) % 12];
      const tamHop2 = chart.palaces[(chiIndex + 8) % 12];
      
      const nhiHopIndex = PromptBuilder.getNhiHopChiIndex(chiIndex);
      const nhiHopPalace = chart.palaces[nhiHopIndex];
      
      mapStr += `   - Liên kết học thuật:\n`;
      mapStr += `     * Cung xung chiếu: Cung ${oppositePalace.palaceName} (tại ${oppositePalace.chi} - hành ${getChiNguHanh(oppositePalace.chi)})\n`;
      mapStr += `     * Các cung tam hợp: Cung ${tamHop1.palaceName} (tại ${tamHop1.chi}) và cung ${tamHop2.palaceName} (tại ${tamHop2.chi})\n`;
      mapStr += `     * Cung nhị hợp: Cung ${nhiHopPalace.palaceName} (tại ${nhiHopPalace.chi} - hành ${getChiNguHanh(nhiHopPalace.chi)})\n\n`;
    });
    
    return mapStr;
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
    const annotatedMap = PromptBuilder.buildAnnotatedChartMap(chart);

    let prompt = `<analysis_request>\n`;
    prompt += `  <task>initial_analysis</task>\n`;
    prompt += `  <focus_area>${focusLabel}</focus_area>\n`;

    if (targetPalaceName) {
      prompt += `  <requirement>Luận giải chuyên sâu cung ${targetPalaceName}, bám sát tam phương tứ chính, nêu rõ cung nào đang hỗ trợ hoặc gây áp lực.</requirement>\n`;
    } else {
      prompt += `  <requirement>Luận giải tổng quan, ưu tiên trục Mệnh - Thân - Quan Lộc - Tài Bạch, làm nổi bật điểm mạnh, điểm yếu và hướng ứng dụng thực tế.</requirement>\n`;
    }

    if (userQuestion) {
      prompt += `  <user_question>${userQuestion}</user_question>\n`;
    }

    if (bridgeContext) {
      const sourceLabel = bridgeContext.sourceFocusArea === 'overall'
        ? 'tổng quan mệnh bàn'
        : `cung ${bridgeContext.sourceFocusArea}`;
      prompt += `  <bridge_context>\n`;
      prompt += `    Người dùng vừa đi từ ${sourceLabel} sang ${focusLabel}. Hãy giữ liên hệ với mạch trước nhưng ưu tiên luận giải trọng tâm mới.\n`;
      prompt += `  </bridge_context>\n`;
    }

    prompt += `  <output_format_instructions>\n`;
    prompt += `    Trả về JSON đúng cấu trúc sau:\n`;
    prompt += `    - "summary": 2-3 câu ngắn, giúp người đọc nắm ngay mấu chốt.\n`;
    prompt += `    - "key_points": 3-5 ý chính, mỗi ý một câu ngắn.\n`;
    prompt += `    - "palace_analysis": giải thích mạch luận chính, phải bám sát các cung xung chiếu, tam hợp và miếu hãm ngũ hành.\n`;
    prompt += `    - "karmic_interactions": 2-4 ý nói rõ sự tác động qua tam hợp/xung chiếu hoặc trục chính.\n`;
    prompt += `    - "referenced_palaces": chỉ liệt kê cung thực sự dùng để suy luận.\n`;
    prompt += `    - "sihua_triggers": phân tích riêng lớp Tứ Hóa và các kích hoạt quan trọng.\n`;
    prompt += `    - "modern_advice": lời khuyên thực hành, cụ thể, không giáo điều.\n`;
    prompt += `    - "follow_up_suggestions": 3-5 câu hỏi tự nhiên để người dùng hỏi tiếp.\n`;
    prompt += `  </output_format_instructions>\n\n`;

    prompt += `  <astrological_chart_map>\n${annotatedMap}  </astrological_chart_map>\n\n`;
    prompt += `  <structured_json_context>\n${contextStr}\n  </structured_json_context>\n`;
    prompt += `</analysis_request>`;

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

    return `<analysis_request>
  <task>follow_up</task>
  <focus_area>${focusLabel}</focus_area>

  <requirement>
    - Trả lời trực tiếp câu hỏi mới của người dùng dưới dạng văn xuôi tự nhiên, không cần JSON.
    - Nếu cần, nhắc lại rất ngắn phần bối cảnh đang dùng để lập luận.
    - Nếu có conversationRecap, dùng nó như phần neo ngữ cảnh ưu tiên trước khi đọc recentTurns.
    - Ưu tiên nối mạch với phần phân tích ban đầu và các lượt hỏi gần đây.
    - Dùng conversationDigest để không quên các mốc trao đổi cũ hơn nếu thread đã dài.
    - Không lặp lại toàn bộ bài luận cũ nếu người dùng chỉ hỏi sâu thêm một ý.
    - Nếu câu hỏi chạm sang cung khác, vẫn có thể đối chiếu nhưng phải nói rõ đang liên hệ từ trọng tâm hiện tại.
  </requirement>

  <conversation_memory_json>
${JSON.stringify(context, null, 2)}
  </conversation_memory_json>

  <user_question>${question}</user_question>
</analysis_request>`;
  }
}
