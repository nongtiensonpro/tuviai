# Kế hoạch nâng cấp Nam Phái Tử Vi

Cập nhật: 2026-06-24

## Trạng thái tổng quan

Milestone 2 đã hoàn thành theo phạm vi đã triển khai: chuẩn hóa catalog sao, bổ sung guardrail chống sai tên sao, phân biệt rõ Thiên Không với Địa Không, và đưa Tuần Không/Triệt Không thành marker sao trong dữ liệu lá số.

Mục tiêu cuối cùng là nâng engine lập lá số theo hướng Nam Phái Tử Vi, tăng độ chính xác, tăng độ đầy đủ của hệ thống sao lên hơn 120 sao, đồng thời giữ toàn bộ ứng dụng 100% static theo kiến trúc Astro + React hiện tại.

## Nguyên tắc bất biến

- Không tạo server-side code.
- Không thêm API route, server, Express, Fastify, Hono, hoặc Node server runtime.
- Mọi logic an sao phải là TypeScript thuần trong `src/core`.
- Mọi type/interface liên quan đến Tử Vi phải đặt trong `src/core/types/ZiweiTypes.ts`.
- Không hardcode API key. Gemini vẫn dùng BYOK ở client.
- Mọi công thức Tử Vi phải dựa trên `.agents/skills/ziwei-algorithm/SKILL.md` hoặc nguồn đã được ghi chú, không tự suy diễn.
- Mỗi thay đổi thuật toán phải có unit test hoặc regression test đi kèm.
- Sau khi sửa engine phải chạy `npm test`.

## Milestone 0: Nền tảng và MCP

Trạng thái: Hoàn thành.

Mục tiêu:

- Xác nhận `codebase-memory-mcp` hoạt động trong Codex.
- Index repository để có khả năng tra cứu kiến trúc, dependency, symbol, hotspot và impact.
- Nắm cấu trúc dự án static Astro + React + TypeScript.

Kết quả:

- MCP project hiện dùng tên `D-tuviai`.
- Repository đã được index bằng `codebase-memory-mcp`.
- Chỉ mục gần nhất sau Milestone 2: `867` nodes, `1556` edges.

## Milestone 1: Kiểm toán lõi lập lá số

Trạng thái: Hoàn thành.

Mục tiêu:

- Rà các công thức nền: lịch âm, giờ sinh, Mệnh/Thân, Cục, Tử Vi, 14 chính tinh, Tứ Hóa, Tuần/Triệt, Đại hạn, Tiểu vận.
- Giữ chuẩn Nam Tông/Tam Hợp đã có trong skill.
- Bảo vệ các case nhạy cảm như giờ Tý sớm và giờ mặt trời thực.

Kết quả chính:

- Giữ quy ước Tý sớm mặc định `earlyZiMode: 'next_day'`.
- Thêm test trực tiếp cho `earlyZiMode: 'same_day'` và mặc định `next_day`.
- Khóa các regression chart hiện có bằng test.
- Giữ build output là static.

## Milestone 2: Catalog sao và guardrail độ chính xác

Trạng thái: Hoàn thành.

Phạm vi hoàn thành:

- Thêm type cho catalog sao:
  - `StarScope`
  - `StarGroup`
  - `StarVerificationStatus`
  - `StarDefinition`
- Tạo `src/core/astrology/StarCatalog.ts`.
- Chuẩn hóa các nhóm sao hiện có:
  - 14 chính tinh.
  - Lục Cát.
  - Lục Sát.
  - Sao cố định.
  - Vòng Thái Tuế.
  - Vòng Lộc Tồn/Bác Sĩ.
  - Vòng Trường Sinh.
  - Nhóm tháng/ngày/giờ.
  - Nhóm theo địa chi năm.
  - Nhóm lưu niên.
  - Marker Tuần/Triệt.
- Đặt `NATAL_STAR_TARGET = 121`.
- Catalog hiện có khoảng 106 sao natal đã có cơ sở trong engine/test; chưa tính sao lưu niên và marker.
- Bổ sung `getStarDefinition`, `isKnownStarName`, `getNatalStarDefinitions`, `getNatalStarCount`.
- Đổi `NguHanhEngine` sang fail-fast với sao chưa biết, không fallback về Thổ.
- Bổ sung ngũ hành cho `Thiên Không`.
- An `Thiên Không` trong vòng Thái Tuế, đồng cung với `Thiếu Dương`.
- Giữ `Địa Không` là sao Lục Sát riêng, an theo giờ sinh từ Hợi đếm nghịch.
- Đưa `Tuần Không` và `Triệt Không` vào `auxStars` như marker sao, đồng thời vẫn giữ cờ `hasTuanKhong` và `hasTrietKhong`.
- Thêm bảo vệ chống nhân đôi marker Tuần/Triệt khi hàm bị gọi lặp.

Test đã thêm hoặc mở rộng:

- `__tests__/StarCatalog.test.ts`
  - Catalog không trùng tên sao.
  - Sao natal trong catalog phải resolve được ngũ hành.
  - `Thiên Không` đi cùng `Thiếu Dương`.
  - `Thiên Không` và `Địa Không` không bị lẫn.
  - Sao natal trong catalog phải xuất hiện qua các reference chart đã sinh.
- `__tests__/AuxStarExhaustive.test.ts`
  - Kiểm đủ 60 hoa giáp cho Tuần Không.
  - Kiểm đủ 60 hoa giáp cho Triệt Không.
  - Kiểm cả cờ lẫn marker `Tuần Không`/`Triệt Không`.
- `__tests__/AuxMinorStarEngine.test.ts`
  - Lá số hoàn chỉnh phải có đúng 2 cung Tuần, 2 cung Triệt.
  - Lá số hoàn chỉnh phải có đúng 2 marker `Tuần Không`, 2 marker `Triệt Không`.
- `__tests__/ZiweiEngine.test.ts`
  - Test rõ hai chế độ Tý sớm/Tý muộn.

Xác minh gần nhất:

```text
npm test -- --runInBand
20 test suites passed
151 tests passed
```

## Milestone 3: Mở rộng lên hơn 120 sao natal

Trạng thái: Chưa bắt đầu.

Mục tiêu:

- Nâng số sao natal từ khoảng 106 lên ít nhất 121 sao đã xác minh.
- Không thêm tên sao chỉ để đủ số lượng.
- Mỗi sao mới phải có:
  - tên chuẩn,
  - nhóm sao,
  - phạm vi `natal` hoặc phạm vi phù hợp,
  - ngũ hành,
  - công thức an sao,
  - test vị trí,
  - mô tả nếu UI/analysis đang cần.

Cách làm:

- Lập bảng ứng viên sao còn thiếu từ các nguồn Nam phái đáng tin cậy.
- Phân loại ứng viên thành:
  - sao có công thức đã rõ trong tài liệu nội bộ,
  - sao phổ biến nhưng cần xác minh thêm,
  - sao biến hóa hoặc marker không nên tính vào natal count.
- Ưu tiên các sao có công thức deterministic theo năm, tháng, ngày, giờ.
- Chỉ merge từng cụm nhỏ, mỗi cụm có test riêng.

Tiêu chí hoàn thành:

- `getNatalStarCount() >= 121`.
- Không có sao natal nào thiếu ngũ hành.
- Không có sao natal nào trong catalog nhưng không thể sinh ra từ engine hoặc fixture kiểm thử.
- `npm test` xanh.
- `npm run build` xanh.

## Milestone 4: Chuẩn hóa engine an sao phụ

Trạng thái: Chưa bắt đầu.

Mục tiêu:

- Giảm rủi ro sai lệch khi mở rộng sao phụ.
- Tách các bảng an sao theo nhóm để dễ kiểm toán.
- Tránh logic rải rác khó so sánh với tài liệu Nam phái.

Hướng triển khai:

- Tách helper dùng chung cho an sao theo:
  - Can năm.
  - Chi năm.
  - Tháng âm.
  - Ngày âm.
  - Giờ sinh.
  - Vòng 12 sao thuận/nghịch.
- Mỗi nhóm sao mới đi kèm bảng expected positions.
- Các hàm an sao phải trả về dữ liệu bất biến hoặc clone an toàn.

Tiêu chí hoàn thành:

- Engine không mutate input ngoài ý muốn.
- Mỗi nhóm sao phụ có test độc lập.
- Các công thức có source comment rõ ràng.

## Milestone 5: Đồng bộ UI, mô tả sao và prompt AI

Trạng thái: Chưa bắt đầu.

Mục tiêu:

- Sao đã an trong engine phải hiển thị nhất quán trong UI.
- Prompt Gemini phải nhận đủ dữ liệu sao nhưng không bị trùng marker.
- Mô tả sao không rơi vào fallback chung khi sao đã nằm trong catalog.

Hướng triển khai:

- Đồng bộ `StarCatalog` với `StarDescriptions`.
- Kiểm `PalaceCell` để marker Tuần/Triệt hiển thị đúng vai trò.
- Kiểm `PromptBuilder` và `AnalysisContextBuilder` để không trùng dữ liệu giữa cờ và marker.
- Thêm test coverage cho mô tả sao mới.

Tiêu chí hoàn thành:

- Không có sao known nào thiếu mô tả tối thiểu.
- UI không hiển thị trùng Tuần/Triệt.
- Prompt AI giữ cấu trúc rõ ràng, không pha lẫn sao natal và lưu niên.

## Milestone 6: Bộ lá số chuẩn và đối chiếu thực tế

Trạng thái: Chưa bắt đầu.

Mục tiêu:

- Tăng độ tin cậy bằng bộ reference chart đủ rộng.
- Bắt regression khi sửa công thức an sao.

Hướng triển khai:

- Mở rộng fixture từ các nguồn đã được xác minh.
- Mỗi fixture nên có:
  - ngày giờ dương lịch,
  - giới tính,
  - âm lịch kỳ vọng,
  - Mệnh/Thân,
  - Cục,
  - chính tinh,
  - các sao phụ trọng yếu,
  - Tuần/Triệt,
  - đại hạn.
- Tách test theo nhóm công thức để khi fail biết chính xác công thức nào lệch.

Tiêu chí hoàn thành:

- Có bộ fixture bao phủ đủ 10 Thiên Can, 12 Địa Chi, 12 giờ sinh.
- Có case giờ Tý sớm, tháng nhuận, true solar time.
- Test regression chỉ ra sai lệch theo cung và tên sao cụ thể.

## Milestone 7: Tối ưu chất lượng phát hành

Trạng thái: Chưa bắt đầu.

Mục tiêu:

- Chuẩn bị engine đủ ổn định để người dùng lập lá số và luận giải bằng Gemini BYOK.
- Giữ app nhẹ, tĩnh, dễ deploy GitHub Pages.

Hướng triển khai:

- Chạy `npm test` và `npm run build` trước mỗi mốc hoàn thành.
- Dùng `codebase-memory-mcp` để kiểm impact sau mỗi cụm thay đổi lớn.
- Rà bundle size nếu thêm dữ liệu mô tả sao nhiều.
- Viết changelog ngắn cho người dùng cuối.

Tiêu chí hoàn thành:

- Build static thành công.
- Không có backend artifact.
- Không có API key hardcode.
- Không có sao unknown lọt qua fail-fast.
- Lá số vẫn mở được bằng GitHub Pages hoặc static hosting.

## Rủi ro cần kiểm soát

- Nhầm `Thiên Không` với `Địa Không`.
- Thêm sao nhưng thiếu ngũ hành hoặc mô tả.
- Tính sao lưu niên như sao natal làm sai chỉ tiêu >120.
- Dùng marker Tuần/Triệt hai lần trong UI/prompt.
- Mở rộng công thức theo tài liệu chưa thống nhất mà không có fixture xác minh.
- Chuyển nhầm sang server-side khi thêm tính năng AI hoặc dữ liệu.

## Bước tiếp theo đề xuất

Milestone 3 nên bắt đầu bằng một bảng ứng viên sao còn thiếu, mỗi dòng gồm tên sao, nhóm, công thức, nguồn, trạng thái xác minh và test dự kiến. Sau đó chỉ triển khai các cụm sao đã đủ công thức, ưu tiên nhóm deterministic và dễ kiểm chứng trước.
