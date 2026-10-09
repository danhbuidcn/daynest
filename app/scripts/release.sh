#!/usr/bin/env bash
# Build release APK + AAB signed with the keystore in app/.env. Usage: npm run release
set -euo pipefail
cd "$(dirname "$0")/.."

# Release keystore SHA-1 (registered in the "release" Android OAuth client)
EXPECTED_SHA1="47:FA:14:1E:96:20:68:4B:AC:C8:32:C2:6C:AE:3D:DD:17:9B:A5:93"

[ -f .env ] || { echo "Missing app/.env (cp .env.example .env, then fill it in)"; exit 1; }
set -a; . ./.env; set +a
: "${ANDROID_KEYSTORE_BASE64:?Missing ANDROID_KEYSTORE_BASE64 in app/.env}"
: "${ANDROID_KEYSTORE_PASSWORD:?Missing ANDROID_KEYSTORE_PASSWORD in app/.env}"
: "${ANDROID_KEY_ALIAS:?Missing ANDROID_KEY_ALIAS in app/.env}"

TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
export DAYNEST_KEYSTORE_FILE="$TMP/release.jks"
echo "$ANDROID_KEYSTORE_BASE64" | base64 -d > "$DAYNEST_KEYSTORE_FILE"

SHA1=$(keytool -list -v -keystore "$DAYNEST_KEYSTORE_FILE" -storepass "$ANDROID_KEYSTORE_PASSWORD" -alias "$ANDROID_KEY_ALIAS" 2>/dev/null | awk '/SHA1:/ {print $2}' || true)
[ "$SHA1" = "$EXPECTED_SHA1" ] || { echo "Wrong keystore: SHA-1 $SHA1, expected $EXPECTED_SHA1"; exit 1; }

npx expo prebuild --platform android --clean --no-install
(cd android && ./gradlew assembleRelease bundleRelease)

OUT=dist; mkdir -p "$OUT"
NAME="daynest-$(grep -oP "version: '\K[^']+" app.config.ts)-$(grep -oP 'versionCode: \K[0-9]+' app.config.ts)"
cp android/app/build/outputs/apk/release/app-release.apk "$OUT/$NAME.apk"
cp android/app/build/outputs/bundle/release/app-release.aab "$OUT/$NAME.aab"
echo "Done: app/$OUT/$NAME.apk (test install), app/$OUT/$NAME.aab (Google Play)"
