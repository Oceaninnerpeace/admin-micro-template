/**
 * 后端权限菜单 key → 前端路由 path
 * 与智慧电站 dist 一致：侧栏按 currentUser.permissions 树渲染，叶子 key 映射到 path
 */
export const MENU_KEY_ROUTE_MAP: Record<string, string> = {
  '/dashboard': '/dashboard',
  '/form-demo': '/form-demo',
  '/system/user': '/system/user',
  '/system/role': '/system/role',
  '/monitor/live': '/monitor/live',
}
