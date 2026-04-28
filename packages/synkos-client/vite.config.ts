import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';
import dts from 'vite-plugin-dts';
import cssInjectedByJs from 'vite-plugin-css-injected-by-js';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const _require = createRequire(import.meta.url);
const synkosUiRoot = path.dirname(_require.resolve('@synkos/ui/package.json'));

export default defineConfig({
  plugins: [
    vue({ template: { transformAssetUrls } }),
    quasar({ autoImportComponentCase: 'pascal' }),
    cssInjectedByJs(),
    dts({ include: ['src'], insertTypesEntry: true }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "variables" as *;`,
        loadPaths: [path.join(synkosUiRoot, 'src/styles')],
      },
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'SynkosClient',
      fileName: () => 'synkos-client.js',
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'vue',
        'vue-router',
        'pinia',
        'vue-i18n',
        'quasar',
        'synkos',
        'axios',
        /^@capacitor\//,
        /^@capgo\//,
        /^@synkos\//,
      ],
      output: {
        globals: {
          vue: 'Vue',
          quasar: 'Quasar',
          pinia: 'Pinia',
        },
      },
    },
  },
});
