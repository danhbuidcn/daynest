# Daynest

App cá nhân gom mọi thứ của một ngày vào một chỗ. Có 2 phần:

- **Ghi chú:** note, diary, todo, chi tiêu.
- **Lịch:** dương lịch, âm lịch, event (lặp theo âm lịch cho ngày giỗ), nhắc nhở, kéo Google Calendar, chu kỳ kinh nguyệt.

Làm mobile (Android + iOS) trước, web sau. Làm theo Scrum, từng sprint nhỏ — xem [danh sách sprint](docs/specs/index.md#4-sprint).

## Cấu trúc

| Thư mục | Nội dung | Công nghệ |
| --- | --- | --- |
| `app/` | Mobile app (Android + iOS) | React Native + Expo |
| `api/` | Backend API (chưa dùng ở GĐ1) | Go, trên nền Supabase (Postgres, Auth, Storage) |
| `web/` | Web app (làm sau) | Nuxt 3 + Nuxt UI |
| `docs/` | Tài liệu: spec theo sprint, khảo sát | — |
| `playbook/` | Skill AI và tài liệu tham khảo cho Claude Code | — |

## Tài liệu

- [Mục lục tài liệu](docs/index.md)
- [Spec tổng](docs/specs/index.md)
