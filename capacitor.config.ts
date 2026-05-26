import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.constructionpro.app',
  appName: 'Construction Pro',
  webDir: 'out/en',
  server: {
    androidScheme: 'file',
    iosScheme: 'file',
    allowNavigation: ['*']
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: '#1f2937',
      androidSplashResourceName: 'splash',
      androidSplashDrawable: 'splash',
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