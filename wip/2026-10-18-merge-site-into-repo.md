# 2026-10-18 — Gộp trang chính sách / xoá tài khoản vào repo `daynest`, bỏ repo `daynest-site` — ✅ xong

## Input

- Bạn (2026-10-18): xoá repo `daynest-site` vì `daynest` đã public; muốn giữ tất cả trong 1 repo. Hoãn đưa lên Google Play.

## Plan

- [x] Chép trang vào `docs/site/` (`index.html`, `privacy/en|vi.html`, `delete-account/`) + `docs/.nojekyll`.
- [x] `app/src/lib/legal.ts`: `SITE` → `https://danhbuidcn.github.io/daynest/site`.
- [x] Bật GitHub Pages cho `daynest` (nhánh `main`, thư mục `/docs`), kiểm tra 3 trang mở được.
- [x] Xoá repo GitHub `daynest-site` (2026-11-04; thư mục `~/Documents/projects/daynest-site` đã không còn).

## Kết quả

- Bản app đã cài (build 12) còn trỏ link cũ → lỗi 404 sau khi xoá; build sau sẽ trỏ link mới.
- Khi đưa lên Play / OAuth consent screen: dùng link `https://danhbuidcn.github.io/daynest/site/privacy/en.html`.
