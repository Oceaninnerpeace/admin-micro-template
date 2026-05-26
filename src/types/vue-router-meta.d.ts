import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** 无需登录即可访问 */
    public?: boolean
    /** 跳过菜单/按钮权限校验（登录页、404、403 等） */
    noPermissionCheck?: boolean
    /**
     * 访问该路由所需权限：任意命中即可（permission 编码如 `MENU_HOME`，或菜单 `key` 如 `/home`）
     * 未配置则不校验，仅要求已登录
     */
    permissions?: string[]
    /** 占位页等使用的页面标题 */
    title?: string
  }
}
