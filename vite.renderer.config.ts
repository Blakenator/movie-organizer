import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    sourcemap: 'inline',
    // lib: {
    //   entry: './src/ui/renderer.ts',
    // },
    rollupOptions: {
      output: {
        esModule: true,
      },
    },
  },
});
