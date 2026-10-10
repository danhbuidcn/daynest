import type { ExpoConfig } from 'expo/config';

// version + versionCode: see docs/specs/sprint-1/design/build.md
const config: ExpoConfig = {
  name: 'Daynest',
  slug: 'daynest',
  scheme: 'daynest',
  version: '1.0.1',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  ios: {
    bundleIdentifier: 'com.danhbuidcn.daynest',
    supportsTablet: false,
  },
  android: {
    package: 'com.danhbuidcn.daynest',
    versionCode: 2,
    adaptiveIcon: {
      backgroundColor: '#5BBE98',
      foregroundImage: './assets/android-icon-foreground.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  plugins: [
    './plugins/withReleaseSigning',
    'expo-router',
    'expo-font',
    '@react-native-community/datetimepicker',
    [
      'expo-splash-screen',
      { image: './assets/splash-icon.png', imageWidth: 120, backgroundColor: '#FAF8F5' },
    ],
  ],
  experiments: { typedRoutes: true },
};

export default config;
