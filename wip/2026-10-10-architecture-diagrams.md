# 2026-10-10 — Spec kiến trúc bằng biểu đồ Mermaid — ✅ xong

## Input

- Yêu cầu: tạo `docs/specs/architecture.md` thể hiện kiến trúc dự án bằng biểu đồ Mermaid: app hoạt động + lưu dữ liệu ra sao, user hoạt động ra sao, xử lý traffic, logic tổng quát, 2 tài khoản / 2 máy xung đột dữ liệu xử lý thế nào…

## Plan

- [x] Đọc spec tổng, S2 (db, F2, F3, F4, F5, F7) và code hiện tại (`lib/supabase.ts`, `features/auth`, `features/events`).
- [x] Viết `docs/specs/architecture.md`: 15 biểu đồ — tổng quan, các lớp app, ERD, luồng user, đăng nhập + vòng đời phiên, giới hạn 2 thiết bị, đọc lịch (event lặp), ghi dữ liệu (idempotency, khoá lạc quan), xung đột (2 tài khoản, 2 máy), đồng bộ Google, nhắc nhở, traffic, lỗi.
- [x] Đánh dấu phần chưa code (Google, nhắc nhở) là "theo spec".
- [x] Kiểm tra cú pháp bằng `@mermaid-js/mermaid-cli`: 15/15 render được.
- [x] Thêm link ở [Spec tổng §3](../docs/specs/index.md#3-kiến-trúc).

## Kết quả

- [docs/specs/architecture.md](../docs/specs/architecture/index.md) — xem được trên GitHub / VS Code (Markdown Preview Mermaid).
