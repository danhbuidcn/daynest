// Bản release ký bằng keystore release. Keystore lấy từ app/.env, scripts/release.sh giải ra file tạm
// và truyền đường dẫn qua DAYNEST_KEYSTORE_FILE. Không có biến này thì Gradle báo thiếu storeFile khi build release.
const { withAppBuildGradle } = require('expo/config-plugins');

const MARKER = '// daynest-release-signing';

const RELEASE_SIGNING = `
        release { ${MARKER}
            if (System.getenv('DAYNEST_KEYSTORE_FILE')) {
                storeFile file(System.getenv('DAYNEST_KEYSTORE_FILE'))
                storePassword System.getenv('ANDROID_KEYSTORE_PASSWORD')
                keyAlias System.getenv('ANDROID_KEY_ALIAS')
                keyPassword System.getenv('ANDROID_KEYSTORE_PASSWORD')
            }
        }`;

module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (cfg) => {
    let gradle = cfg.modResults.contents;
    if (gradle.includes(MARKER)) return cfg;

    gradle = gradle.replace(/signingConfigs\s*\{/, (m) => `${m}${RELEASE_SIGNING}`);
    gradle = gradle.replace(
      /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?)signingConfig signingConfigs\.debug/,
      '$1signingConfig signingConfigs.release',
    );
    if (!gradle.includes(MARKER) || !gradle.includes('signingConfig signingConfigs.release')) {
      throw new Error('withReleaseSigning: không tìm thấy signingConfigs/buildTypes trong app/build.gradle');
    }
    cfg.modResults.contents = gradle;
    return cfg;
  });
};
