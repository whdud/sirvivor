import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'dronewar',
  brand: {
    displayName: '드론 워',
    primaryColor: '#FF4444',
    icon: '',
    bridgeColorMode: 'inverted',
  },
  web: {
    host: '125.130.241.135',  // ⭐ localhost에서 IP로 변경!
    port: 3000,
    commands: {
      dev: 'node server.js',
      build: '',
    },
  },
  permissions: [],
  webViewProps: {
    type: 'game',
  },
  outdir: '.',
});