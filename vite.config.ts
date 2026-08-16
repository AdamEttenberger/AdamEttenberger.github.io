import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import { date_formatUTCString } from './src/util/date.ts'

// https://vite.dev/config/
export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
  var config = {
    plugins: [ vue() ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    define: {
      __BUILD_TIMESTAMP__: JSON.stringify(date_formatUTCString(Date.now())),
    }
  };
  switch (command) {
    case 'serve':
      // dev specific config
      break;
    case 'build':
      // build specific config
      break;
  }
  return config;
})
