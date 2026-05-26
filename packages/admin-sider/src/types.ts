/** 权限树节点（菜单 / 目录 / 按钮），与后端 current-user 约定一致 */
export interface PermissionNode {
  id: string
  key: string | null
  label: string
  permission: string
  icon: string | null
  /** 1 菜单 2 按钮等 */
  permission_type: number
  sorting: number
  children: PermissionNode[] | null
}

export interface PermissionMenuOptions {
  /** 后端 key 与前端路由 path 不一致时的映射 */
  routeMap?: Record<string, string>
}
