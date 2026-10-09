# Daynest app

Needs: Node 24, Java 17, Android SDK, an emulator or a phone (with a Google account added as a test user).

```bash
cp .env.example .env    # then fill it in
npm install
npm run android         # build + install + run
npm run typecheck && npm run lint && npm test
```

## `app/.env`

| Variable | Where to get it |
| --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API Keys → Publishable key |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Google Cloud → Google Auth Platform → Clients → client "Web" → Client ID |
| `ANDROID_KEYSTORE_*`, `ANDROID_KEY_ALIAS` | Release keystore |

The release keystore is the most important secret: lose it and you can no longer update the app; leak it and others can sign fake builds. Store the whole `app/.env` in a password manager. A new machine only needs a copy of `app/.env` to build.

DB: [supabase/README.md](../supabase/README.md).
