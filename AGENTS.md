# AGENTS.md — Cognitive Architecture: Tử Vi Đẩu Số AI

## Mô Tả Dự Án
Ứng dụng web **Tử Vi Đẩu Số** (Zi Wei Dou Shu) hoàn toàn tĩnh (Static Web App). Không có backend. Deploy miễn phí lên GitHub Pages.

## Quy Tắc Bất Biến (KHÔNG ĐƯỢC VI PHẠM)

1. **TUYỆT ĐỐI KHÔNG tạo server-side code**: Không tạo server.js, api/*, *.server.ts, express/*, hoặc bất kỳ logic server nào.
2. **Ứng dụng phải hoạt động 100% tĩnh**: Output phải là HTML/CSS/JS thuần, có thể mở bằng `file://` hoặc GitHub Pages.
3. **Tương tác Gemini API phải qua BYOK**: Người dùng cung cấp API key của riêng họ. Developer key KHÔNG ĐƯỢC hardcode vào mã nguồn.
4. **Mọi tính toán sao phải dùng TypeScript thuần**: Không để AI tự ảo giác công thức chiêm tinh học.

## Tech Stack

- **Framework**: Astro (static output) + React (Islands)
- **Styling**: Tailwind CSS
- **Language**: TypeScript (strict mode)
- **Lunar Calendar**: @dqcai/vn-lunar
- **AI Integration**: @google/genai SDK (không dùng OpenAI compat layer để tránh CORS)
- **Security**: Web Crypto API (PBKDF2 + AES-GCM)
- **Hosting**: GitHub Pages (branch gh-pages)

## Cấu Trúc Thư Mục Quan Trọng

```
src/core/          — Engine tính toán Tử Vi (TypeScript thuần)
src/components/    — React Islands components
src/services/      — Crypto + Gemini AI services
src/pages/         — Astro pages
.agents/           — Cognitive files cho AI agents
```

## Khi Viết Code, Agent Phải Luôn:
- Kiểm tra `.agents/rules/` trước khi tạo bất kỳ file mới nào
- Đọc `.agents/skills/ziwei-algorithm/SKILL.md` trước khi viết logic Tử Vi
- Đảm bảo mọi type/interface được định nghĩa trong `src/core/types/ZiweiTypes.ts`
- Chạy `npm test` sau khi viết engine logic
