import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
  if (command === 'serve') {
    return {
        plugins: [vue()],
        server: {
            port: 8082,
        },
    }
  } else if (command === "build-bundle") {


  }
})
