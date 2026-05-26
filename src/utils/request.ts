import { message } from 'ant-design-vue'
import { createHttpClient } from '@Oceaninnerpeace/public-base-request'
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

import { microBasePath } from '@/config/app'
import { apiBaseURL } from '@/config/env'
import { clearToken, getToken } from '@/utils/auth'

function resolveLoginPath(): string {
  if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    return `${microBasePath}/login`
  }
  return '/login'
}

function redirectToLogin() {
  clearToken()
  void import('@/store').then(({ store }) => {
    store.dispatch('clearCurrentUser')
  })
  const loginPath = resolveLoginPath()
  const { pathname, search } = window.location
  if (pathname === loginPath || pathname.endsWith('/login')) return
  const redirect = encodeURIComponent(pathname + search)
  window.location.assign(`${loginPath}?redirect=${redirect}`)
}

const { instance: service, get, post, put, del } = createHttpClient({
  baseURL: apiBaseURL,
  getToken,
  notify: { error: (msg) => message.error(msg) },
  onAttachAuthHeaders(headers, token) {
    headers.token = token
  },
  onUnauthorized: redirectToLogin,
})

export default service
export { del, get, post, put }
