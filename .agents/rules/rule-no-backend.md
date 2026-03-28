# Rule: No Backend

## Mục Đích
Ngăn chặn tuyệt đối việc tạo bất kỳ logic server-side nào trong dự án này.

## Quy Tắc

TUYỆT ĐỐI KHÔNG tạo các file/thư mục sau:
- `server.js`, `server.ts`
- `api/` directory
- `*.server.ts`, `*.server.js`
- `express`, `fastify`, `koa`, `hono` imports
- `next.config.js` với `{ output: 'server' }`
- Bất kỳ file nào import `fs`, `path`, `http`, `https` từ Node.js core

## Lý Do
Ứng dụng này phải hoạt động hoàn toàn 100% tĩnh để deploy miễn phí lên GitHub Pages.
Không có chi phí vận hành backend.

## Thay Thế Được Phép
- Client-side fetch() đến external APIs (Gemini API)
- localStorage / sessionStorage cho lưu trữ cục bộ
- Web Crypto API cho mã hóa phía client
- Static JSON files trong public/ directory
