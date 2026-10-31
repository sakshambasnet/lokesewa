import type { ExpoConfig } from 'expo/config';

// Only public values here. Secrets never go into the app (rules.md §4).
const config: ExpoConfig = {
  name: 'Loksewa',
  slug: 'loksewa-app',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'loksewa',
  userInterfaceStyle: 'automatic',
  ios: {
    bundleIdentifier: 'com.loksewa.app',
  },
  android: {
    package: 'com.loksewa.app',
    versionCode: 1,
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-sqlite',
    'expo-secure-store',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#1D4ED8',
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    env: process.env.EXPO_PUBLIC_ENV ?? 'development',
  },
};

export default config;
