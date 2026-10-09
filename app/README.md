# Daynest app

Cần: Node 24, Java 17, Android SDK, emulator hoặc điện thoại (có tài khoản Google là test user).

```bash
cp .env.example .env    # rồi điền
npm install
npm run android         # build + cài + chạy
npm run typecheck && npm run lint && npm test
```

## `app/.env`

| Biến | Lấy ở đâu |
| --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API Keys → Publishable key |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Google Cloud → Google Auth Platform → Clients → client "Web" → Client ID |
| `ANDROID_KEYSTORE_*`, `ANDROID_KEY_ALIAS` | Keystore release |

Keystore release là bí mật quan trọng nhất: mất thì không cập nhật được app, lộ thì người khác ký giả được. Lưu cả file `app/.env` vào password manager. Máy mới chỉ cần chép `app/.env` sang là build được.

DB: [supabase/README.md](../supabase/README.md).
