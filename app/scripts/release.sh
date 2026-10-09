#!/usr/bin/env bash
# Build bản release (APK + AAB) ký bằng keystore trong app/.env. Dùng: npm run release
set -euo pipefail
cd "$(dirname "$0")/.."

# SHA-1 keystore release (đã đăng ký trong OAuth client Android "release")
EXPECTED_SHA1="47:FA:14:1E:96:20:68:4B:AC:C8:32:C2:6C:AE:3D:DD:17:9B:A5:93"

[ -f .env ] || { echo "Thiếu app/.env (cp .env.example .env rồi điền)"; exit 1; }
set -a; . ./.env; set +a
: "${ANDROID_KEYSTORE_BASE64:?Thiếu ANDROID_KEYSTORE_BASE64 trong app/.env}"
: "${ANDROID_KEYSTORE_PASSWORD:?Thiếu ANDROID_KEYSTORE_PASSWORD trong app/.env}"
: "${ANDROID_KEY_ALIAS:?Thiếu ANDROID_KEY_ALIAS trong app/.env}"

TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
export DAYNEST_KEYSTORE_FILE="$TMP/release.jks"
echo "$ANDROID_KEYSTORE_BASE64" | base64 -d > "$DAYNEST_KEYSTORE_FILE"

SHA1=$(keytool -list -v -keystore "$DAYNEST_KEYSTORE_FILE" -storepass "$ANDROID_KEYSTORE_PASSWORD" -alias "$ANDROID_KEY_ALIAS" 2>/dev/null | awk '/SHA1:/ {print $2}' || true)
[ "$SHA1" = "$EXPECTED_SHA1" ] || { echo "Keystore sai: SHA-1 $SHA1, cần $EXPECTED_SHA1"; exit 1; }

npx expo prebuild --platform android --clean --no-install
(cd android && ./gradlew assembleRelease bundleRelease)

OUT=dist; mkdir -p "$OUT"
NAME="daynest-$(grep -oP "version: '\K[^']+" app.config.ts)-$(grep -oP 'versionCode: \K[0-9]+' app.config.ts)"
cp android/app/build/outputs/apk/release/app-release.apk "$OUT/$NAME.apk"
cp android/app/build/outputs/bundle/release/app-release.aab "$OUT/$NAME.aab"
echo "Xong: app/$OUT/$NAME.apk (cài thử), app/$OUT/$NAME.aab (Google Play)"
