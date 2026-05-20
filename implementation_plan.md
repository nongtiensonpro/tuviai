# Kế Hoạch Nâng Cấp Hệ Thống Luận Giải AI với Định Dạng Tương Tác (HTML/SVG)

Yêu cầu nâng cấp câu lệnh nhắc (Megaprompt) và định dạng đầu ra của AI sang cấu trúc **HTML/SVG** là một bước tiến cực lớn. Thay vì văn bản thuần (Plain Text / Markdown) đơn điệu, chúng ta sẽ tối ưu hóa khả năng hiển thị của AI, giúp kết quả luận giải trở nên trực quan, sinh động, dễ đọc và cho phép tương tác trực tiếp (ví dụ: các khối thông tin ẩn/hiện, bảng so sánh trực quan, sơ đồ SVG liên kết cung vị).

---

## 1. Giải Pháp Thiết Kế Megaprompt & Định Dạng Đầu Ra (HTML/SVG)

### 1.1. Tiêu chuẩn cấu trúc HTML & SVG mà AI cần tuân thủ
Chúng ta sẽ bổ sung các chỉ thị nghiêm ngặt vào Megaprompt (`PromptBuilder.ts`) để hướng dẫn AI định dạng các trường phân tích (`palace_analysis`, `sihua_triggers`, `modern_advice`, và các lượt Chat tiếp theo) bằng mã HTML5 ngữ nghĩa và an toàn, kết hợp với sơ đồ SVG.

AI được phép sử dụng các thẻ và lớp CSS Cosmic Alchemy sau:
*   **Chi tiết mở rộng (`<details class="ai-interactive-details">` và `<summary class="ai-interactive-summary">`)**: Dùng cho phần giải thích chuyên sâu về tinh hệ, các sao phụ phụ trợ, hoặc các khía cạnh kỹ thuật phức tạp của Tử Vi (Tam phương Tứ chính, Tứ Hóa ẩn) để không làm loãng luồng đọc chính. Phần nội dung chi tiết sẽ được bọc trong `<div class="ai-interactive-content">`.
*   **Bảng thông tin trực quan (`<table class="w-full border-collapse my-3">`)**: Dùng để so sánh miếu hãm, đắc thất của chòm sao, bảng đối chiếu sao tam hợp.
*   **Bố cục phân vùng đặc sắc**: Sử dụng các thẻ `div` với lớp tiện ích Cosmic Alchemy như `.glass-card` (thẻ kính mờ thâm sâu), `.text-gold` (vàng kim hoàng gia), `.text-coral` (màu san hô ấm áp), `.text-cyan` (xanh thiên thể dịu nhẹ), `.font-semibold`, `.border-l-2`, `.border-gold/20`, `.bg-gold/5`, v.v.
*   **Sơ đồ SVG trực quan (`<svg>`)**: Cho phép AI tự vẽ biểu đồ luồng năng lượng tam hợp, sơ đồ liên kết nhị hợp, hoặc biểu đồ cột biểu thị mức độ mạnh yếu của các cung liên quan.
*   **Giới hạn An Toàn**: AI không được sử dụng Javascript trong HTML (tránh `onclick`, `script` tag), không dùng link ngoài không an toàn (`href`), chỉ sử dụng các thẻ HTML5 cơ bản được liệt kê và các lớp CSS thuộc Design System.

---

## 2. Chi Tiết Các Thay Đổi Đề Xuất Phân Theo File

### 2.1. [MODIFY] [PromptBuilder.ts](file:///d:/tuviai/src/services/PromptBuilder.ts)
*   **Cập nhật `buildSystemInstruction()`**:
    *   Bổ sung hướng dẫn chi tiết về **TIÊU CHUẨN ĐỊNH DẠNG TƯƠNG TÁC (HTML & SVG)**.
    *   Yêu cầu AI viết các trường `palace_analysis`, `sihua_triggers` và `modern_advice` bằng cấu trúc HTML5 sinh động thay vì Plain Text.
    *   Khuyến khích AI bọc các suy luận học thuật phức tạp hoặc các yếu tố phụ tinh trong các thẻ `<details>` và `<summary>` có thiết kế sang trọng để tối ưu hóa trải nghiệm đọc.
    *   Định nghĩa rõ danh sách lớp Tailwind CSS được phép dùng (`text-gold`, `text-coral`, `text-cyan`, `glass-card`, `border-gold/15`, `p-3`, `bg-gold/5`, v.v.).
*   **Cập nhật `buildFollowUpSystemInstruction()`**:
    *   Áp dụng các chỉ dẫn định dạng HTML/SVG tương tự vào các câu trả lời đàm thoại tiếp theo, cho phép cuộc hội thoại Chat cũng sinh động và giàu tương tác.
*   **Cập nhật `analyzeSchema`**:
    *   Tinh chỉnh phần mô tả (`description`) cho các trường `palace_analysis`, `sihua_triggers` và `modern_advice` để nhấn mạnh yêu cầu đầu ra dạng HTML/SVG.

### 2.2. [MODIFY] [global.css](file:///d:/tuviai/src/styles/global.css)
*   Thêm các lớp CSS chuyên dụng để làm đẹp cho các thẻ `<details>` và `<summary>` do AI sinh ra (như `.ai-interactive-details`, `.ai-interactive-summary`, `.ai-interactive-content`).
*   Thiết kế biểu tượng mũi tên quay mượt mà, màu sắc vàng-san hô ấm áp phù hợp với phong cách Cosmic Alchemy.

### 2.3. [MODIFY] [AnalysisResultCards.tsx](file:///d:/tuviai/src/components/AnalysisResultCards.tsx)
*   Thay thế việc hiển thị thô `{data.palace_analysis}`, `{data.sihua_triggers}`, `{data.modern_advice}` bằng cơ chế hiển thị HTML an toàn:
    *   Sử dụng `dangerouslySetInnerHTML={{ __html: field }}`.
    *   Bọc trong một container an toàn để đảm bảo giao diện không bị vỡ và các thành phần bên trong được thừa hưởng thiết kế đồng nhất.

### 2.4. [MODIFY] [AnalysisChatBox.tsx](file:///d:/tuviai/src/components/AnalysisChatBox.tsx)
*   Nâng cấp cơ chế hiển thị tin nhắn của AI trong chat log:
    *   Thay thế việc hiển thị thô `{turn.msg}` bằng `dangerouslySetInnerHTML={{ __html: turn.msg }}` cho các tin nhắn từ phía AI (`turn.role === 'ai'`). Tin nhắn của người dùng (`turn.role === 'user'`) vẫn giữ nguyên định dạng văn bản thuần để bảo mật tuyệt đối.

---

## 3. Kế Hoạch Xác Minh (Verification Plan)

### 3.1. Kiểm thử Tự Động (Automated Tests)
*   Chạy lại `npm.cmd test` để kiểm tra:
    *   `PromptBuilder.test.ts` đảm bảo Megaprompt mới vẫn chứa đủ các khóa dữ liệu và cấu trúc nghiệp vụ.
    *   Đảm bảo không phát sinh bất kỳ lỗi cú pháp TypeScript nào trong các file bị chỉnh sửa.

### 3.2. Kiểm thử Thủ Công (Manual Verification)
*   **Trực quan hóa & Tương tác**: 
    1. Tiến hành chạy thử nghiệm sinh lá số và phân tích bằng API key thực tế.
    2. Kiểm tra xem các khối thông tin `<details>` có hiển thị gọn gàng và click mở rộng được không.
    3. Xác minh các thẻ màu `text-gold`, `text-coral`, `text-cyan` hiển thị chuẩn màu sắc của phong cách Cosmic Alchemy.
    4. Kiểm tra xem nếu AI sinh ra sơ đồ SVG, SVG đó có hiển thị đúng trục cung vị mượt mà không.
    5. Đảm bảo chat log hiển thị tin nhắn HTML của AI trơn tru và không bị lỗi vỡ khung.
