import type { PermissionMenuOptions, PermissionNode } from './types'

let menuKeyRouteMap: Record<string, string> = {}

/** 配置菜单 key → 前端路由 path 映射（可在应用启动时调用） */
export function configurePermissionMenuRouteMap(map: Record<string, string>): void {
  menuKeyRouteMap = { ...map }
}

/** 可变的全局映射表（与智慧电站原 MENU_KEY_ROUTE_MAP 用法兼容） */
export function getPermissionMenuRouteMap(): Record<string, string> {
  return menuKeyRouteMap
}

export function createPermissionMenuHelpers(options: PermissionMenuOptions = {}) {
  if (options.routeMap) {
    configurePermissionMenuRouteMap(options.routeMap)
  }

  return {
    configurePermissionMenuRouteMap,
    normalizeAppPathForMenu,
    menuRoutePath,
    appRouteForPermissionNode,
    filterSidebarNodes,
    findMenuSelectionState,
  }
}

export function normalizeAppPathForMenu(appPath: string): string {
  return menuKeyRouteMap[appPath] ?? appPath
}

export function menuRoutePath(key: string | null): string | null {
  if (key == null || key === '') return null
  return key.startsWith('/') ? key : `/${key}`
}

export function appRouteForPermissionNode(node: PermissionNode): string | null {
  const raw = menuRoutePath(node.key)
  if (!raw) return null
  return menuKeyRouteMap[raw] ?? raw
}

function sortTree(nodes: PermissionNode[]): PermissionNode[] {
  const sorted = [...nodes].sort((a, b) => a.sorting - b.sorting)
  return sorted.map((n) => (n.children?.length ? { ...n, children: sortTree(n.children) } : n))
}

/** 侧栏菜单树：剔除按钮权限，过滤空目录，按 sorting 排序 */
export function filterSidebarNodes(nodes: PermissionNode[] | null | undefined): PermissionNode[] {
  if (!nodes?.length) return []
  const mapped = nodes
    .filter((n) => n.permission_type !== 2)
    .map((n) => {
      const rawChildren = n.children?.filter((c): c is PermissionNode => !!c) ?? []
      const children = rawChildren.length ? filterSidebarNodes(rawChildren) : null
      return { ...n, children: children?.length ? children : null }
    })
    .filter((n) => {
      if (n.children?.length) return true
      return n.permission_type === 1 && !!n.key
    })
  return sortTree(mapped)
}

export function findMenuSelectionState(
  appPath: string,
  nodes: PermissionNode[],
  ancestorOpenKeys: string[] = [],
): { selected: string; openKeys: string[] } | undefined {
  for (const n of nodes) {
    const subKey = `sub-${n.id}`
    const children = n.children ?? []
    if (children.length > 0) {
      const hit = findMenuSelectionState(appPath, children, [...ancestorOpenKeys, subKey])
      if (hit) return hit
    }
    const link = appRouteForPermissionNode(n)
    if (link && (appPath === link || appPath.startsWith(`${link}/`))) {
      return { selected: link, openKeys: ancestorOpenKeys }
    }
  }
  return undefined
}
