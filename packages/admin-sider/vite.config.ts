import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: path.resolve(dirname, 'src/index.ts'),
      name: 'SmartPowerSider',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['vue', 'ant-design-vue', '@ant-design/icons-vue'],
      output: {
        globals: {
          vue: 'Vue',
          'ant-design-vue': 'antd',
          '@ant-design/icons-vue': 'Icons',
        },
        assetFileNames: 'style.css',
      },
    },
    cssCodeSplit: false,
  },
})
