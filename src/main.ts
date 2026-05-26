import 'ant-design-vue/dist/reset.css'
import '@admin-template/admin-sider/style.css'
import './styles/global.css'

import Antd from 'ant-design-vue'
import { createApp, type App as VueApp } from 'vue'
import {
  qiankunWindow,
  renderWithQiankun,
} from 'vite-plugin-qiankun/dist/helper'

import { apiBaseURL, appMode, isDev } from '@/config/env'
import { qiankunAppName } from '@/config/app'
import { store } from '@/store'
import { clearEmbedSession } from '@/utils/embed'
import { clearPortalHost } from '@/utils/portal-host'
import { applyQiankunHostProps, type QiankunHostProps } from '@/utils/qiankun-host'
import '@/utils/request'

import App from './App.vue'
import { createAdminRouter } from './router'

let app: VueApp | null = null

function getMountEl(container?: HTMLElement) {
  return (container?.querySelector('#app') ??
    document.querySelector('#app')) as HTMLElement
}

async function render(props: QiankunHostProps = {}) {
  applyQiankunHostProps(props)

  const mountEl = getMountEl(props.container)
  if (!mountEl) return

  if (isDev) {
    console.info(`[${qiankunAppName}] mode=${appMode} apiBaseURL=${apiBaseURL}`)
  }

  app = createApp(App)
  app.use(Antd)
  app.use(store)
  app.use(createAdminRouter())
  app.mount(mountEl)
}

function destroy() {
  app?.unmount()
  app = null
  clearEmbedSession()
  clearPortalHost()
}

renderWithQiankun({
  bootstrap() {
    return Promise.resolve()
  },
  mount(props) {
    return render(props as QiankunHostProps)
  },
  unmount() {
    destroy()
    return Promise.resolve()
  },
  update() {
    return Promise.resolve()
  },
})

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  void render()
}
