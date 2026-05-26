# @admin-template/admin-sider

权限树侧栏组件，从智慧电站 `smart-power-sider` 泛化而来。

- `PermissionSidebar`：Ant Design Vue 侧栏
- `filterSidebarNodes` / `findMenuSelectionState`：与后端 `permissions` 树配合

在应用启动时通过 `configurePermissionMenuRouteMap` 注册菜单 key → 路由 path（见主应用 `src/router/menu-map.ts`）。
