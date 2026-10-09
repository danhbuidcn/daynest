# Daynest

A personal app that keeps everything about your day in one place. Two parts:

- **Notes:** notes, diary, todo, expenses.
- **Calendar:** solar and lunar calendar, events (lunar yearly repeat for death anniversaries), reminders, Google Calendar sync, menstrual cycle.

Mobile (Android + iOS) first, web later. Built with Scrum in small sprints — see the [sprint list](docs/specs/index.md#4-sprint).

## Structure

| Folder | Content | Tech |
| --- | --- | --- |
| `app/` | Mobile app (Android + iOS) | React Native + Expo |
| `api/` | Backend API (not used in phase 1) | Go, on top of Supabase (Postgres, Auth, Storage) |
| `web/` | Web app (later) | Nuxt 3 + Nuxt UI |
| `docs/` | Docs: specs per sprint, research (Vietnamese) | — |
| `playbook/` | AI skills and reference docs for Claude Code | — |

## Docs

- [Docs index](docs/index.md)
- [Main spec](docs/specs/index.md)
