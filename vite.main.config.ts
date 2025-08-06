import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  resolve: {
    // Some libs that can run in both Web and Node.js, such as `axios`, we need to tell Vite to build them in Node.js.
    browserField: false,
    mainFields: ['module', 'jsnext:main', 'jsnext'],
  },
  build: {
    sourcemap: 'inline',
    // lib: {
    //   formats: ['es'],
    //   entry: 'src/backend/main.ts',
    //   name: 'main',
    //   fileName: 'main',
    // },
    rollupOptions: {
      external: ['sqlite3', 'canvas', 'jsdom'],
      // output: {
      //   preserveModules: true,
      //   interop: 'auto',
      // },
    },
  },
});
