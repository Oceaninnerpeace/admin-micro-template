import type { LocationQuery, RouteLocationNormalized } from 'vue-router'
import type { CurrentUser } from '@/api/currentUser'
import { setToken } from '@/utils/auth'

/** sessionStorage：嵌入模式布局（跨路由保持） */
const LAYOUT_STORAGE_KEY = 'sp_embed_layout'
/** 本次会话是否已通过 URL 注入用户（避免重复拉取 current-user） */
const USER_INJECTED_KEY = 'sp_embed_user_injected'

export interface EmbedLayoutConfig {
  /** 是否嵌入/第三方集成场景 */
  isEmbed: boolean
  showHeader: boolean
  showSider: boolean
  /** 顶栏页签条；嵌入全屏时通常与 header 一并关闭 */
  showTabs: boolean
}

const DEFAULT_LAYOUT: EmbedLayoutConfig = {
  isEmbed: false,
  showHeader: true,
  showSider: true,
  showTabs: true,
}

const EMBED_QUERY_KEYS = new Set([
  'embed',
  'token',
  'access_token',
  'username',
  'user',
  'showHeader',
  'hideHeader',
  'showSider',
  'hideSider',
  'showTabs',
  'hideTabs',
])

function queryValue(query: LocationQuery, key: string): string | undefined {
  const raw = query[key]
  if (raw == null) return undefined
  const v = Array.isArray(raw) ? raw[0] : raw
  return v == null ? undefined : String(v)
}

function parseTruthy(val: string | undefined): boolean | undefined {
  if (val == null || val === '') return undefined
  const s = val.trim().toLowerCase()
  if (['1', 'true', 'yes', 'on'].includes(s)) return true
  if (['0', 'false', 'no', 'off'].includes(s)) return false
  return undefined
}

function resolveVisibility(
  showKey: string | undefined,
  hideKey: string | undefined,
  defaultVisible: boolean,
): boolean {
  const hide = parseTruthy(hideKey)
  if (hide !== undefined) return !hide
  const show = parseTruthy(showKey)
  if (show !== undefined) return show
  return defaultVisible
}

export function parseEmbedLayoutFromQuery(query: LocationQuery): EmbedLayoutConfig {
  const embedFlag = parseTruthy(queryValue(query, 'embed')) === true

  if (embedFlag) {
    return {
      isEmbed: true,
      showHeader: false,
      showSider: false,
      showTabs: false,
    }
  }

  const showHeader = resolveVisibility(
    queryValue(query, 'showHeader'),
    queryValue(query, 'hideHeader'),
    true,
  )
  const showSider = resolveVisibility(
    queryValue(query, 'showSider'),
    queryValue(query, 'hideSider'),
    true,
  )
  const showTabs = resolveVisibility(
    queryValue(query, 'showTabs'),
    queryValue(query, 'hideTabs'),
    showHeader,
  )

  const isEmbed = !showHeader || !showSider || !showTabs

  return { isEmbed, showHeader, showSider, showTabs }
}

function loadStoredLayout(): EmbedLayoutConfig | null {
  try {
    const raw = sessionStorage.getItem(LAYOUT_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as EmbedLayoutConfig
  } catch {
    return null
  }
}

export function persistEmbedLayout(config: EmbedLayoutConfig): void {
  sessionStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(config))
}

export function getEmbedLayout(): EmbedLayoutConfig {
  return loadStoredLayout() ?? { ...DEFAULT_LAYOUT }
}

export function clearEmbedSession(): void {
  sessionStorage.removeItem(LAYOUT_STORAGE_KEY)
  sessionStorage.removeItem(USER_INJECTED_KEY)
}

export function isEmbedUserInjected(): boolean {
  return sessionStorage.getItem(USER_INJECTED_KEY) === '1'
}

function markEmbedUserInjected(): void {
  sessionStorage.setItem(USER_INJECTED_KEY, '1')
}

function decodeUserFromQuery(encoded: string): CurrentUser | null {
  try {
    const json = decodeURIComponent(
      atob(encoded.replace(/-/g, '+').replace(/_/g, '/')),
    )
    const data = JSON.parse(json) as CurrentUser
    if (!data || typeof data !== 'object' || !data.id || !data.username) return null
    return {
      roles: [],
      permissions: [],
      menu_permissions: [],
      button_permissions: [],
      ...data,
    }
  } catch {
    return null
  }
}

function minimalUserFromUsername(username: string): CurrentUser {
  return {
    id: 'embed',
    username,
    roles: [],
    permissions: [],
    menu_permissions: [],
    button_permissions: [],
  }
}

export interface EmbedBootstrapResult {
  /** 需要从地址栏移除敏感参数并 replace 导航 */
  shouldStripQuery: boolean
  cleanedQuery: Record<string, string>
}

/**
 * 解析 URL 中的嵌入参数：布局、token、用户。
 * 布局写入 sessionStorage；token 写入 sessionStorage（auth 模块）。
 */
export function bootstrapEmbedFromRoute(
  to: RouteLocationNormalized,
  setCurrentUser: (user: CurrentUser) => void,
): EmbedBootstrapResult {
  const query = to.query
  const hasEmbedParams = [...EMBED_QUERY_KEYS].some((k) => queryValue(query, k) != null)

  if (hasEmbedParams) {
    const layout = parseEmbedLayoutFromQuery(query)
    persistEmbedLayout(layout)
  }

  const token = queryValue(query, 'token') ?? queryValue(query, 'access_token')
  if (token) {
    setToken(token)
  }

  const userEncoded = queryValue(query, 'user')
  if (userEncoded) {
    const user = decodeUserFromQuery(userEncoded)
    if (user) {
      setCurrentUser(user)
      markEmbedUserInjected()
    }
  } else {
    const username = queryValue(query, 'username')
    if (username) {
      setCurrentUser(minimalUserFromUsername(username))
      markEmbedUserInjected()
    }
  }

  const cleanedQuery: Record<string, string> = {}
  for (const [key, val] of Object.entries(query)) {
    if (EMBED_QUERY_KEYS.has(key)) continue
    if (val == null) continue
    cleanedQuery[key] = Array.isArray(val) ? String(val[0]) : String(val)
  }

  return {
    shouldStripQuery: hasEmbedParams,
    cleanedQuery,
  }
}

/** 构建第三方系统集成示例 URL（文档/调试） */
export function buildEmbedEntryUrl(options: {
  baseUrl: string
  path?: string
  token: string
  username?: string
  embed?: boolean
  hideHeader?: boolean
  hideSider?: boolean
}): string {
  const url = new URL(options.path ?? '/dashboard', options.baseUrl)
  url.searchParams.set('token', options.token)
  if (options.username) url.searchParams.set('username', options.username)
  if (options.embed) {
    url.searchParams.set('embed', '1')
  } else {
    if (options.hideHeader) url.searchParams.set('hideHeader', '1')
    if (options.hideSider) url.searchParams.set('hideSider', '1')
  }
  return url.toString()
}
