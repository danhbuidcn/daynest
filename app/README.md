# Daynest app

Cần: Node 24, Java 17, Android SDK, emulator hoặc điện thoại (có tài khoản Google là test user).

```bash
cp .env.example .env    # rồi điền
npm install
npm run android         # build + cài + chạy
npm run typecheck && npm run lint && npm test
```

DB: [supabase/README.md](../supabase/README.md).
