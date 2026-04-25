import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import cssInjectedByJs from 'vite-plugin-css-injected-by-js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [vue(), cssInjectedByJs(), dts({ include: ['src'], insertTypesEntry: true })],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "variables" as *;`,
        loadPaths: [path.resolve(__dirname, 'src/styles')],
      },
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'SynkosUI',
      fileName: () => 'synkos-ui.js',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vue', 'quasar'],
      output: {
        globals: { vue: 'Vue', quasar: 'Quasar' },
      },
    },
  },
});
