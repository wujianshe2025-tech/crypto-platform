import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [],
  server: {
    port: 5173
  },
  build: {
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  }
});
