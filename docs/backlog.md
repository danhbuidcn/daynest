# Backlog

Làm theo Scrum, sprint nhỏ. Đích đến: [Spec Giai đoạn 1](specs/2026-10-09-giai-doan-1-design.md).

## Quy tắc

- Mỗi sprint đi đủ vòng **docs → thiết kế → code**. Mỗi bước có todo riêng, duyệt rồi mới làm.
- Cuối sprint phải có bản **chạy được trên Android** (máy thật).
- DB chỉ thêm bảng sprint đó cần, qua migration trong `supabase/migrations/`.
- Không làm trước tính năng của sprint sau.

## Sprint

| Sprint | Nội dung | Cuối sprint chạy được |
| --- | --- | --- |
| **S1** | Nền móng — xem chi tiết bên dưới | Đăng nhập Google, vào app 5 tab trống |
| S2 | Lịch tháng: dương, âm, ngày lễ VN (`lib/lunar`, TDD) | Xem lịch âm dương |
| S3 | Event đơn giản: tạo, sửa, xoá, không lặp, không nhắc | Lưu event lên Supabase |
| S4 | Lặp dương lịch + nhắc nhở + xem tuần / ngày / danh sách | Nhận thông báo |
| S5 | Lặp âm lịch (ngày giỗ) + ngoại lệ "chỉ lần này" | Lưu ngày giỗ |
| S6 | Kéo Google Calendar (1 chiều) | Thấy event Google trên lịch |
| S7 | Todo | Quản lý todo |
| S8 | Notes | Quản lý note |
| S9 | Diary + Thống kê + Cài đặt | Xong GĐ1 |
| Sau GĐ1 | Chi tiêu, Chu kỳ kinh nguyệt, web | — |

## S1 — Nền móng

- Khung Expo (TypeScript, Expo Router) + development build, package `com.danhbuidcn.daynest`.
- Điều hướng 5 tab: Lịch · Quản lý · `+` · Thống kê · Cài đặt — màn trống.
- Đăng nhập Google qua Supabase: đăng nhập, giữ phiên khi mở lại app, đăng xuất.
- DB tối thiểu: `profiles`, `user_settings` + RLS.
- **Ký app và nâng version:**
  - Tạo **1 keystore release** duy nhất, đưa cho bạn kèm mật khẩu. Không commit vào repo (repo public).
  - Bạn lưu keystore vào password manager + bản sao dự phòng. Build ở PC hay laptop đều dùng cùng keystore này → cùng chữ ký.
  - Bản cài v1 nâng lên v2 không mất dữ liệu khi: cùng package, cùng chữ ký, `versionCode` tăng dần. Tài liệu S1 ghi rõ quy tắc tăng version.
  - SHA-1 của keystore debug + release (và của Play App Signing khi lên store) đăng ký vào Google OAuth client Android.
- Hướng dẫn bạn tạo project Supabase và Google Cloud OAuth.
