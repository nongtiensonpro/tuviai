# Rule: Strict TypeScript Types

## Mục Đích
Đảm bảo mọi cấu trúc dữ liệu Tử Vi đều có TypeScript Interface rõ ràng.

## Quy Tắc

1. **Mọi object liên quan đến Tử Vi** phải có interface trong `src/core/types/ZiweiTypes.ts`
2. **Không dùng `any`** — dùng `unknown` nếu cần, sau đó narrow type
3. **Strict mode** luôn bật trong tsconfig.json
4. **Enum thay vì string literals** cho các tập hợp cố định (TenCan, TwoelveChi, v.v.)

## Các Type Bắt Buộc Phải Có

```typescript
// Phải định nghĩa đầy đủ:
TenCan          // 10 Thiên Can
TwoelveChi      // 12 Địa Chi  
NguHanhCuc      // 5 loại Cục (2,3,4,5,6)
LunarDate       // Ngày âm lịch
Palace          // Cung trong mệnh bàn
Star            // Vì sao (tên + độ sáng)
SihuaTrigger    // Tứ Hóa kích hoạt
ZiweiChart      // Toàn bộ mệnh bàn
```

## Ví Dụ Đúng

```typescript
// ✅ ĐÚNG
export interface Star {
  name: string;
  brightness: 'M' | 'V' | 'Đ' | 'B' | 'H' | '';
  sihua?: 'Lộc' | 'Quyền' | 'Khoa' | 'Kỵ';
}

// ❌ SAI - không dùng any
const palace: any = { stars: [] };
```
