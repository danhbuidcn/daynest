import type { ExpoConfig } from 'expo/config';

// version + versionCode: xem docs/specs/sprint-1/design/build.md
const config: ExpoConfig = {
  name: 'Daynest',
  slug: 'daynest',
  scheme: 'daynest',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  ios: {
    bundleIdentifier: 'com.danhbuidcn.daynest',
    supportsTablet: false,
  },
  android: {
    package: 'com.danhbuidcn.daynest',
    versionCode: 1,
    adaptiveIcon: {
      backgroundColor: '#5BBE98',
      foregroundImage: './assets/android-icon-foreground.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  plugins: [
    'expo-router',
    'expo-font',
    [
      'expo-splash-screen',
      { image: './assets/splash-icon.png', imageWidth: 120, backgroundColor: '#FAF8F5' },
    ],
    [
      'expo-image-picker',
      { photosPermission: 'Daynest needs access to your photos to set your profile picture.' },
    ],
  ],
  experiments: { typedRoutes: true },
};

export default config;
