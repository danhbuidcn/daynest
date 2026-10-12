# Daynest

A personal app that keeps everything about your day in one place. Three parts:

- **Calendar:** solar and lunar calendar, events (lunar yearly repeat for death anniversaries), reminders, Google Calendar sync, menstrual cycle.
- **Notes:** notes with checklists, categories, pins, search, trash.
- **Expenses:** spending by day, week, month.

Mobile (Android + iOS) first, web later. Built with Scrum in small sprints — see the [sprint list](docs/specs/index.md#4-sprint).

## Structure

| Folder | Content | Tech |
| --- | --- | --- |
| `app/` | Mobile app (Android + iOS) | React Native + Expo |
| `api/` | Backend API (not used in phase 1) | Go, on top of Supabase (Postgres, Auth, Storage) |
| `web/` | Web app (later) | Nuxt 3 + Nuxt UI |
| `docs/` | Docs: specs per sprint (Vietnamese) | — |
| `playbook/` | AI skills and reference docs for Claude Code | — |

## Sprint workflow

Every sprint goes through the same 5 phases. Each phase is one todo in `wip/` (see [CLAUDE.md](CLAUDE.md)) and waits for approval before work starts.

| # | Phase | Output |
| --- | --- | --- |
| 1 | **Scope** | What the sprint does and does not do |
| 2 | **Spec** | `docs/specs/sprint-N/index.md` (goals, scope, DoD) · main spec updated if scope changed |
| 3 | **Mockup** | `docs/specs/sprint-N/design/mockups.html` — new or changed screens only · approved before code |
| 4 | **Implement** | One step per item: code → `npm run typecheck && npm run lint && npm test` → try on a real device → commit + push |
| 5 | **Release** | [End of sprint](docs/specs/index.md#cuối-sprint-mọi-sprint): tick DoD → bump version → build APK → install on device → tag + GitHub Release |

## Docs

- [Docs index](docs/index.md)
- [Main spec](docs/specs/index.md)
