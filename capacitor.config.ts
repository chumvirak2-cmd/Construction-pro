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
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: '#1f2937',
      androidSplashResourceName: 'splash_logo',
      androidSplashDrawable: 'splash_logo',
      imageName: 'logo',
      showSpinner: false
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#1f2937'
    }
  }
};

export default config;