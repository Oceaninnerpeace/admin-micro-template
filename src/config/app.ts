/**
 * 应用级配置（从 .env 读取，复制模板后按项目修改）
 */
export const appTitle = import.meta.env.VITE_APP_TITLE || '后台管理系统'

/** Qiankun 子应用名，须与 vite-plugin-qiankun 及基座 portal-apps 一致 */
export const qiankunAppName = import.meta.env.VITE_QIANKUN_APP_NAME || 'admin-template'

/** 嵌入基座时的路由前缀，如 /micro/power */
export const microBasePath =
  String(import.meta.env.VITE_MICRO_BASE_PATH || '/micro/app').replace(/\/$/, '') || '/micro/app'

export const devServerPort = Number(import.meta.env.VITE_DEV_PORT || 5180)
