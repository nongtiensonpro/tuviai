# Tử Vi AI

Tử Vi AI là một ứng dụng web lập lá số và hỗ trợ luận giải Tử Vi Đẩu Số. Dự án này được xây dựng gần như hoàn toàn bằng các công cụ AI, từ viết mã, rà soát cấu trúc, mở rộng regression tests, đến kiểm tra chéo thuật toán an sao.

Một phần rất lớn của quá trình phát triển dự án dựa trên việc tìm kiếm, đối chiếu và tổng hợp nhiều nguồn thông tin công khai trên internet. AI không chỉ hỗ trợ sinh mã, mà còn được dùng như một lớp nghiên cứu kỹ thuật để so sánh công thức, khóa fixture tham chiếu, và từng bước nâng cao độ chính xác của engine.

## Dự án này dùng để làm gì

Dự án được xây dựng để:

- lập lá số Tử Vi Đẩu Số trực tiếp trên web
- hiển thị đầy đủ bố cục 12 cung, chính tinh, phụ tinh và các chỉ dấu quan trọng
- hỗ trợ luận giải bằng AI dựa trên lá số đã tính
- tạo nền tảng kiểm chứng độ chính xác bằng test regression thay vì sửa thuật toán theo cảm tính

Mục tiêu dài hạn của dự án không chỉ là “xem được lá số”, mà là xây một engine có thể kiểm chứng, mở rộng và cải thiện dần về độ chính xác.

## Điểm nổi bật của dự án

- Ứng dụng hoạt động theo hướng static-first, phù hợp triển khai lên GitHub Pages
- Logic lập lá số nằm ở TypeScript thuần, không để AI tự sinh công thức trong lúc runtime
- Có lớp regression test với nhiều lá số tham chiếu công khai để chống sai lệch khi sửa thuật toán
- Có thể tích hợp AI luận giải nhưng vẫn tách riêng khỏi phần tính toán chiêm tinh cốt lõi

## Công nghệ sử dụng

### Frontend

- [Astro](https://docs.astro.build/) cho kiến trúc static site
- [React](https://react.dev/) cho các interactive islands
- [Tailwind CSS](https://tailwindcss.com/) cho styling

### Core Engine

- [TypeScript](https://www.typescriptlang.org/) strict mode cho toàn bộ logic lập lá số
- [`@dqcai/vn-lunar`](https://www.npmjs.com/package/@dqcai/vn-lunar) để chuyển đổi dương lịch sang âm lịch

### AI Integration

- [`@google/genai`](https://www.npmjs.com/package/@google/genai) cho phần phân tích và luận giải
- mô hình BYOK, người dùng tự cung cấp API key của riêng họ

### Test

- [Jest](https://jestjs.io/)
- [ts-jest](https://kulshekhar.github.io/ts-jest/)

## Kiến trúc dự án

Các thư mục chính:

```text
src/
├── components/   # React UI components
├── core/         # Engine tính toán Tử Vi Đẩu Số
├── data/         # Dữ liệu mô tả, từ điển, glossary
├── pages/        # Astro pages
├── services/     # AI services, thread/context builders, crypto helpers
├── styles/       # CSS/Tailwind styles
└── workers/      # Web workers cho các tác vụ tính toán
```

Trong đó:

- `src/core/` là phần quan trọng nhất, chứa logic tính cung, cục, chính tinh, phụ tinh, tứ hóa và các quy tắc chiêm tinh
- `src/components/` và `src/pages/` chịu trách nhiệm render giao diện
- `src/services/` xử lý phần luận giải AI, prompt/context và các tiện ích đi kèm
- `__tests__/` giữ regression tests và các fixture lá số tham chiếu

## Triết lý kỹ thuật của dự án

Dự án này đi theo một số nguyên tắc rất rõ:

- không dùng server-side code cho engine chính
- ưu tiên kiến trúc web tĩnh, dễ deploy và dễ kiểm soát
- công thức chiêm tinh phải nằm trong mã nguồn TypeScript, không giao cho AI “ứng biến”
- mọi thay đổi lớn ở engine nên được khóa lại bằng test
- độ chính xác phải được nâng dần bằng đối chiếu thực tế và regression, không bằng cảm giác

## AI đã tham gia vào dự án như thế nào

AI được dùng ở nhiều lớp khác nhau:

- viết và tái cấu trúc mã nguồn
- rà soát công thức, bảng tra và luồng tính toán
- so sánh kết quả engine với các lá số công khai trên internet
- tạo và mở rộng bộ test fixtures
- phát hiện vùng có nguy cơ sai lệch cao như `Cục`, `Tử Vi`, `14 chính tinh`, `borrowed stars`, phụ tinh trọng yếu
- hỗ trợ viết tài liệu và chuẩn hóa cấu trúc dự án

Nói ngắn gọn, đây là một dự án được xây theo kiểu AI-assisted engineering ở mức rất sâu, không chỉ dùng AI để viết vài đoạn code rời rạc.

## Tình trạng kiểm thử

Dự án hiện có:

- unit tests cho các engine và service chính
- regression tests cho lá số tham chiếu
- fixture coverage tests để đảm bảo bộ lá số tham chiếu không bị mỏng đi theo thời gian

Điều này giúp việc nâng cấp thuật toán an sao bớt rủi ro hơn rất nhiều.

## Yêu cầu môi trường

- Node.js `>= 22.12.0`

## Chạy dự án

Cài dependency:

```sh
npm install
```

Chạy môi trường phát triển:

```sh
npm run dev
```

Build static site:

```sh
npm run build
```

Preview bản build:

```sh
npm run preview
```

## Chạy test

Chạy toàn bộ test:

```sh
npm test
```

Chạy test ở chế độ watch:

```sh
npm run test:watch
```

## Ghi chú

Đây không phải là một dự án “AI viết xong là xong”. Giá trị thực của repo nằm ở chỗ:

- AI được dùng liên tục như một công cụ phát triển
- kết quả được kiểm tra lại bằng test và đối chiếu nguồn công khai
- engine được cải tiến dần từng lớp để tăng độ chính xác thực tế

Nếu tiếp tục mở rộng, dự án này có thể trở thành một nền tảng Tử Vi web có khả năng kiểm chứng tốt hơn nhiều so với kiểu triển khai chỉ dựa vào bảng tra rời rạc hoặc prompt AI thuần túy.
