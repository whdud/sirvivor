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
    host: '210.103.109.142',  // ⭐ 현재 IP 주소
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