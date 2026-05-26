# admin-micro-template

基于 **智慧电站（smart-power-admin）** 抽取的 **Vue 3 + Vite 6 + Ant Design Vue** 后台管理模板，支持：

- 独立运行或 **Qiankun 微前端子应用** 嵌入 `public-base-fe` 基座
- 登录 / 权限路由 / 权限侧栏 / 多页签布局
- **SpForm**  schema 表单、iframe **embed** 外接
- `@Oceaninnerpeace/public-base-request` 统一请求

## 技术栈

| 项 | 版本 |
|----|------|
| Vue | 3.5 |
| Vite | 6 |
| Ant Design Vue | 4.2 |
| Vue Router / Vuex | 4.x |
| Tailwind CSS | 4 |
| vite-plugin-qiankun | 1.x |

## 快速开始

```bash
cd D:\code\admin-micro-template
pnpm install
pnpm dev
```

浏览器打开 `http://localhost:5180`（端口见 `.env.development` 的 `VITE_DEV_PORT`）。

无后端时可在 `.env.development` 设置 `VITE_USE_MOCK_AUTH=true` 使用 mock 登录与用户权限。

## 复制为新项目

详见 [docs/TEMPLATE.md](./docs/TEMPLATE.md)。

核心修改项：

| 文件 | 说明 |
|------|------|
| `.env.*` | 应用名、API、Qiankun 名、微前端路径、端口 |
| `src/config/app.ts` | 读取上述环境变量 |
| `src/router/routes.ts` | 业务路由 |
| `src/router/menu-map.ts` | 权限菜单 key → path |
| `package.json` | `name`、依赖版本 |

## 接入基座（public-base-fe）

在基座 `src/config/portal-apps.ts` 增加一项（示例）：

```ts
{
  id: 'my-app',
  title: '我的系统',
  name: 'admin-template',           // 与 VITE_QIANKUN_APP_NAME 一致
  entry: '//localhost:5180',
  activeRule: '/micro/app',         // 与 VITE_MICRO_BASE_PATH 一致
  type: 'qiankun',
}
```

基座 `.env.development`：

```env
VITE_MICRO_MY_APP_ENTRY=//localhost:5180
```

## 目录说明

```
src/
  api/              HTTP 模块（auth、currentUser、user）
  components/SpForm  通用表单
  composables/      embed 布局、页签
  config/           app、env
  layouts/          AdminLayout
  router/           routes、menu-map、守卫
  utils/            request、auth、permission、qiankun、embed
packages/admin-sider  权限树侧栏（workspace 包）
```

## 与智慧电站差异

- 已移除：电站首页大屏、顶栏滚动告警、智慧电站业务路由占位
- 保留：登录、权限侧栏、页签、SpForm、embed、Qiankun 生命周期
- 默认路由：工作台、用户/角色占位、表单示例、监控占位

## License

MIT（模板代码）；业务接入后按公司规范即可。
