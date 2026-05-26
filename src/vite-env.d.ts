/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE?: string
  readonly VITE_QIANKUN_APP_NAME?: string
  readonly VITE_MICRO_BASE_PATH?: string
  readonly VITE_DEV_PORT?: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_QIANKUN_DEV_ORIGIN?: string
  readonly VITE_USE_MOCK_AUTH?: string
  readonly VITE_PROXY_TARGET?: string
  readonly VITE_AUTH_CAPTCHA_PATH?: string
}

export {}
