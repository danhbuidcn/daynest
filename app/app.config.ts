import type { ExpoConfig } from 'expo/config';

// version + versionCode: see docs/specs/sprint-1/design/build.md
const config: ExpoConfig = {
  name: 'Daynest',
  slug: 'daynest',
  scheme: 'daynest',
  version: '3.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  ios: {
    bundleIdentifier: 'com.danhbuidcn.daynest',
    supportsTablet: false,
  },
  android: {
    package: 'com.danhbuidcn.daynest',
    versionCode: 4,
    adaptiveIcon: {
      backgroundColor: '#5BBE98',
      foregroundImage: './assets/android-icon-foreground.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    // F3: exact reminder times when the OS allows it (otherwise Android may delay them a few minutes).
    permissions: ['android.permission.SCHEDULE_EXACT_ALARM'],
  },
  plugins: [
    './plugins/withReleaseSigning',
    'expo-router',
    'expo-font',
    '@react-native-community/datetimepicker',
    ['expo-notifications', { icon: './assets/android-icon-monochrome.png', color: '#5BBE98' }],
    [
      'expo-splash-screen',
      { image: './assets/splash-icon.png', imageWidth: 120, backgroundColor: '#FAF8F5' },
    ],
  ],
  experiments: { typedRoutes: true },
};

export default config;
