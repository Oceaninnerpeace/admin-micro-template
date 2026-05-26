import { get, post } from '@/utils/request'

/** 统一响应外壳（与后端约定） */
export interface ApiEnvelope<T = unknown> {
  code: number
  message: string
  timestamp?: number
  data: T
}

/** 登录请求体 */
export interface LoginParams {
  username: string
  password: string
  captcha_code: string
  captcha_key: string
}

export interface LoginRole {
  id: string
  role_name: string
  description?: string | null
  create_at?: number
  update_at?: number
}

export interface LoginUserInfo {
  id: string
  username: string
  email?: string
  phone?: string
  create_at?: number
  roles?: LoginRole[]
  permissions?: unknown[]
  menu_permissions?: unknown[]
  button_permissions?: unknown[]
}

/** `data` 字段：登录成功载荷 */
export interface LoginResultData {
  access_token: string
  refresh_token: string
  expires_in: number
  user_info: LoginUserInfo
}

/** 获取图形验证码后的 `data`（字段名兼容多种后端命名） */
export interface CaptchaResultData {
  captcha_key: string
  captcha_image?: string
}

const MOCK_FLAG = import.meta.env.VITE_USE_MOCK_AUTH === 'true'

/** 验证码接口路径，默认 `/auth/captcha`，可在 `.env` 中设置 `VITE_AUTH_CAPTCHA_PATH` */
const captchaPath =
  (import.meta.env.VITE_AUTH_CAPTCHA_PATH as string | undefined)?.trim() || '/auth/captcha'

function normalizeCaptchaData(raw: Record<string, unknown>): CaptchaResultData {
  const captcha_key = String(raw.captcha_key ?? raw.key ?? '')
  const captcha_image = [raw.captcha_image, raw.image, raw.img].find(
    (v) => typeof v === 'string',
  ) as string | undefined
  return { captcha_key, captcha_image }
}

export function toImageSrc(image: string | undefined): string {
  if (!image) return ''
  if (image.startsWith('data:') || image.startsWith('http://') || image.startsWith('https://')) {
    return image
  }
  return `data:image/png;base64,${image}`
}

/**
 * 获取登录验证码（key + 可选 base64 图片）
 * - 默认 GET `captchaPath`（常为 `/auth/captcha`）
 * - mock 模式下返回固定 key 与占位图，便于无后端联调
 */
export function fetchLoginCaptcha() {
  if (MOCK_FLAG) {
    return new Promise<CaptchaResultData>((resolve) => {
      window.setTimeout(() => {
        resolve({
          captcha_key: 'mock-captcha-key',
          captcha_image:
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        })
      }, 100)
    })
  }
  return get<ApiEnvelope<Record<string, unknown>>>(captchaPath).then((body) =>
    normalizeCaptchaData((body?.data ?? {}) as Record<string, unknown>),
  )
}

/**
 * 用户登录 POST `/auth/login`
 * - 开发环境 base 为 `/rjgc/api/api` 时，由子应用 Vite 代理到 `VITE_PROXY_TARGET`；嵌入基座时见 `VITE_QIANKUN_DEV_ORIGIN`
 * - `.env.development` 中 `VITE_USE_MOCK_AUTH=true` 可走本地假数据
 */
export function login(data: LoginParams) {
  if (MOCK_FLAG) {
    return new Promise<LoginResultData>((resolve) => {
      window.setTimeout(() => {
        resolve({
          access_token: `mock_access_${Date.now()}`,
          refresh_token: `mock_refresh_${Date.now()}`,
          expires_in: 7200,
          user_info: {
            id: '0',
            username: data.username,
          },
        })
      }, 300)
    })
  }
  return post<ApiEnvelope<LoginResultData>>('/auth/login', data).then((body) => body.data)
}
