import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  // 프론트엔드 소스 루트: src/client/
  root: path.resolve(__dirname, 'client'),
  build: {
    // ✅ 빌드 결과물을 'src/build'가 아닌, 현재 src 바로 아래의 'build' 폴더에 생성
    outDir: path.resolve(__dirname, './build'),
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://192.168.219.130:11501',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'ws://192.168.219.130:11501',
        ws: true,
      },
    },
  },
});
