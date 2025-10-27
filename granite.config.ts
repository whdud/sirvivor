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
    host: 'localhost',
    port: 3000,  // ⭐ 5173에서 3000으로 변경!
    commands: {
      dev: 'node server.js',  // ⭐ server.js 실행
      build: '',
    },
  },
  permissions: [],
  webViewProps: {
    type: 'game',
  },
  outdir: '.',
});