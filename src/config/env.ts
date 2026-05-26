/**
 * 运行/构建模式由 Vite 注入：development | test | production
 * 对应 npm 脚本与 .env.[mode] 文件
 */
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

export type AppMode = 'development' | 'test' | 'production'

export const appMode = import.meta.env.MODE as AppMode

export const isDev = import.meta.env.DEV
export const isProd = import.meta.env.PROD
export const isTest = import.meta.env.MODE === 'test'

function joinOriginPath(origin: string, pathname: string): string {
  const base = origin.replace(/\/$/, '')
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`
  return `${base}${path}`
}

/**
 * 解析接口 baseURL
 * - 独立运行：相对路径走当前 dev server（5177）的 Vite 代理
 * - 嵌入基座：相对路径会落在基座域名（如 :8000），需改指向子应用 dev 源
 */
function resolveApiBaseURL(): string {
  const configured = String(import.meta.env.VITE_API_BASE_URL ?? '').trim() || '/api'

  const needSubAppDevOrigin =
    qiankunWindow.__POWERED_BY_QIANKUN__ &&
    import.meta.env.DEV &&
    configured.startsWith('/') &&
    !configured.startsWith('//')

  if (needSubAppDevOrigin) {
    const origin = String(
      import.meta.env.VITE_QIANKUN_DEV_ORIGIN ?? 'http://localhost:5180',
    ).trim()
    return joinOriginPath(origin, configured)
  }

  return configured
}

/** 接口 baseURL（已处理微前端开发环境） */
export const apiBaseURL = resolveApiBaseURL()
