import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.constructionpro.app',
  appName: 'Construction Pro',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    allowNavigation: ['*']
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: '#1f2937',
      androidSplashResourceName: 'splash',
      showSpinner: false
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#1f2937'
    }
  }
};

export default config;