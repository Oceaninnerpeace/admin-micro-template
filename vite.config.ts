import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import qiankun from 'vite-plugin-qiankun'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const importMapJson = JSON.stringify({
  imports: {
    vue: 'https://esm.sh/vue@3.5.13',
    'vue-router': 'https://esm.sh/vue-router@4.5.0?deps=vue@3.5.13',
    'ant-design-vue': 'https://esm.sh/ant-design-vue@4.2.6?deps=vue@3.5.13',
    '@ant-design/icons-vue': 'https://esm.sh/@ant-design/icons-vue@7.0.1?deps=vue@3.5.13',
  },
})

function prodImportMapPlugin(command: 'build' | 'serve') {
  return {
    name: 'prod-import-map',
    transformIndexHtml(html: string) {
      if (command !== 'build') return html
      return html.replace('<!--IMPORT_MAP-->', `<script type="importmap">${importMapJson}</script>`)
    },
  }
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://127.0.0.1:8080'
  const apiPrefix = env.VITE_API_BASE_URL || '/api'
  const qiankunName = env.VITE_QIANKUN_APP_NAME || 'admin-template'
  const devPort = Number(env.VITE_DEV_PORT || 5180)

  return {
    plugins: [
      vue(),
      tailwindcss(),
      prodImportMapPlugin(command),
      qiankun(qiankunName, { useDevMode: true }),
    ],
    server: {
      port: devPort,
      cors: true,
      origin: `http://localhost:${devPort}`,
      proxy: {
        [apiPrefix]: {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    build: {
      rollupOptions: {
        external: (id) => {
          if (id === 'vue' || id === 'vue-router' || id === 'ant-design-vue') return true
          if (id === '@ant-design/icons-vue' || id.startsWith('@ant-design/icons-vue/')) {
            return true
          }
          return false
        },
      },
    },
  }
})
