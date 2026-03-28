---
description: workflow để build và deploy ứng dụng lên GitHub Pages
---

# Deploy to GitHub Pages

// turbo-all

## Bước 1: Chạy unit tests trước khi deploy

```bash
npm test
```

Kiểm tra output — nếu có test nào fail, DỪNG và báo lỗi. Không deploy khi test fail.

## Bước 2: Build production bundle

```bash
npm run build
```

Kiểm tra thư mục `dist/` đã được tạo thành công.

## Bước 3: Preview build locally (tùy chọn)

```bash
npm run preview
```

Truy cập http://localhost:4321 để kiểm tra trước khi deploy.

## Bước 4: Commit và push lên GitHub

```bash
git add -A
git commit -m "build: deploy update $(date +%Y-%m-%d)"
git push origin main
```

GitHub Actions sẽ tự động deploy lên gh-pages branch.

## Bước 5: Kiểm tra GitHub Pages

Truy cập: https://[username].github.io/tuviai

Nếu chưa enable GitHub Pages:
1. Vào repository Settings → Pages
2. Source: Deploy from a branch
3. Branch: gh-pages / root
