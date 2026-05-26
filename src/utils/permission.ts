import type { RouteLocationNormalized } from 'vue-router'
import type { CurrentUser, PermissionNode } from '@/api/currentUser'

/** 从当前用户收集所有可用的权限标识（permission 码 + 路由 key + 菜单/按钮码） */
export function permissionCodeSetFromUser(user: CurrentUser | null): Set<string> {
  const set = new Set<string>()
  if (!user) return set

  function walk(nodes: PermissionNode[]) {
    for (const n of nodes) {
      if (n.permission) set.add(n.permission)
      if (n.key) set.add(n.key)
      const children = n.children
      if (children?.length) {
        walk(children.filter((c): c is PermissionNode => c != null))
      }
    }
  }

  walk(user.permissions ?? [])
  for (const m of user.menu_permissions ?? []) {
    if (m.permission_code) set.add(m.permission_code)
  }
  for (const b of user.button_permissions ?? []) {
    if (b.permission_code) set.add(b.permission_code)
  }
  return set
}

/**
 * 从匹配到的路由链上取「最深一层」声明的 `meta.permissions`（子路由覆盖父级）
 */
export function getRequiredPermissions(to: RouteLocationNormalized): string[] | null {
  for (let i = to.matched.length - 1; i >= 0; i--) {
    const raw = to.matched[i]?.meta?.permissions
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.filter((x): x is string => typeof x === 'string' && x.length > 0)
    }
  }
  return null
}

/** 已登录用户对目标路由是否具备任一所需权限 */
export function hasRouteAccess(to: RouteLocationNormalized, user: CurrentUser | null): boolean {
  const required = getRequiredPermissions(to)
  if (!required) return true
  const set = permissionCodeSetFromUser(user)
  return required.some((code) => set.has(code))
}
