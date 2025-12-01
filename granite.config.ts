import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'dronewar',
  brand: {
    displayName: '드론 워',
    primaryColor: '#FF4444',
    icon: 'https://i.imgur.com/DfDIySv.png',
    bridgeColorMode: 'inverted',
  },
  web: {
    host: '218.155.155.217',  // ⭐ 현재 IP 주소
    port: 3000,
    commands: {
      dev: 'node server.js',
      build: 'node build.js',
    },
  },
  permissions: [],
  webViewProps: {
    type: 'game',
  },
  outdir: './dist',
});