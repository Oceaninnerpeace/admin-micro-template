import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

import { store } from '@/store'
import { setToken } from '@/utils/auth'
import {
  type EmbedLayoutConfig,
  persistEmbedLayout,
} from '@/utils/embed'
import {
  bindPortalHost,
  type QiankunMountProps,
} from '@/utils/portal-host'

export type QiankunHostProps = QiankunMountProps & {
  token?: string
  getToken?: () => string
  getUserInfo?: () => unknown
}

/** 门户接入：子应用自带顶栏、侧栏、页签 */
const PORTAL_LAYOUT: EmbedLayoutConfig = {
  isEmbed: false,
  showHeader: true,
  showSider: true,
  showTabs: true,
}

/** 外接嵌入：仅内容区 */
const EMBED_FULLSCREEN_LAYOUT: EmbedLayoutConfig = {
  isEmbed: true,
  showHeader: false,
  showSider: false,
  showTabs: false,
}

/**
 * 接入公共基座 / 外系统时的布局与可选 Token
 * - poweredByPortal：保留智慧电站完整壳子（顶栏 + 左侧菜单）
 * - embed=1：全屏内容，隐藏壳子
 */
export function applyQiankunHostProps(props: QiankunHostProps = {}) {
  const inQiankun = qiankunWindow.__POWERED_BY_QIANKUN__ || props.embed === true

  bindPortalHost(props)

  if (props.embed === true) {
    persistEmbedLayout(EMBED_FULLSCREEN_LAYOUT)
  } else if (inQiankun) {
    persistEmbedLayout(PORTAL_LAYOUT)
  }

  const token = props.token || props.getToken?.() || ''
  if (token) {
    setToken(token)
  }

  const user = props.getUserInfo?.()
  if (user && typeof user === 'object') {
    store.commit('setCurrentUser', user)
    sessionStorage.setItem('sp_embed_user_injected', '1')
  }
}
