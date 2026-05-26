import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized, Router } from 'vue-router'
import { configurePermissionMenuRouteMap } from '@admin-template/admin-sider'
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

import { microBasePath } from '@/config/app'
import { clearToken, getToken } from '@/utils/auth'
import { bootstrapEmbedFromRoute, getEmbedLayout, isEmbedUserInjected } from '@/utils/embed'
import { store } from '@/store'
import { hasRouteAccess } from '@/utils/permission'

import { MENU_KEY_ROUTE_MAP } from './menu-map'
import { appRoutes } from './routes'

configurePermissionMenuRouteMap(MENU_KEY_ROUTE_MAP)

function resolveRouterBase() {
  if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    return microBasePath
  }
  return import.meta.env.BASE_URL
}

function pickRedirect(to: RouteLocationNormalized) {
  const redirect = to.query.redirect
  if (typeof redirect === 'string' && redirect.startsWith('/')) {
    return redirect
  }
  return { name: 'dashboard' }
}

function setupRouterGuard(router: Router) {
  router.beforeEach(async (to, _from, next) => {
    const embedBootstrap = bootstrapEmbedFromRoute(to, (user) => {
      store.commit('setCurrentUser', user)
    })
    if (embedBootstrap.shouldStripQuery) {
      next({
        path: to.path,
        query: embedBootstrap.cleanedQuery,
        hash: to.hash,
        replace: true,
      })
      return
    }

    const token = getToken()
    const embedLayout = getEmbedLayout()

    if (to.meta.public) {
      if (token && to.name === 'login') {
        try {
          if (!store.state.currentUser) {
            await store.dispatch('fetchCurrentUser')
          }
        } catch {
          /* 跳转首页后由受保护路由再拉取 */
        }
        next(pickRedirect(to))
        return
      }
      next()
      return
    }

    if (!token) {
      store.dispatch('clearCurrentUser')
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }

    try {
      if (!store.state.currentUser && !isEmbedUserInjected()) {
        await store.dispatch('fetchCurrentUser')
      }
    } catch {
      clearToken()
      store.dispatch('clearCurrentUser')
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }

    if (
      !to.meta.noPermissionCheck &&
      !embedLayout.isEmbed &&
      !hasRouteAccess(to, store.state.currentUser)
    ) {
      next({ name: 'forbidden', replace: true })
      return
    }

    next()
  })
}

export function createAdminRouter() {
  const router = createRouter({
    history: createWebHistory(resolveRouterBase()),
    routes: appRoutes,
  })
  setupRouterGuard(router)
  return router
}

const router = createAdminRouter()

export default router
