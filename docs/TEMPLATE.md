# 从模板创建新业务系统

## 1. 复制仓库

```bash
# 方式 A：克隆后改 remote
git clone <本仓库地址> my-new-admin
cd my-new-admin
rm -rf .git && git init

# 方式 B：直接复制目录
xcopy /E /I D:\code\admin-micro-template D:\code\my-new-admin
cd D:\code\my-new-admin
git init
```

## 2. 必改配置

### 环境变量（`.env.development` 等）

```env
VITE_APP_TITLE=我的业务系统
VITE_QIANKUN_APP_NAME=my-new-admin      # 全局唯一，与 vite-plugin-qiankun 一致
VITE_MICRO_BASE_PATH=/micro/my-app      # 基座 activeRule
VITE_DEV_PORT=5181                      # 避免与其它子应用冲突
VITE_API_BASE_URL=/api
VITE_PROXY_TARGET=http://你的后端地址
```

### package.json

- `name`: `my-new-admin`
- 若发布侧栏包，可改 `packages/admin-sider` 的 `name` 为 `@your-scope/admin-sider`

## 3. 路由与菜单

1. 在 `src/router/routes.ts` 的 `AdminLayout` children 下增加页面
2. 在 `src/router/menu-map.ts` 增加 `权限key或path` → `前端path` 映射
3. 后端 `current-user.permissions` 树中叶子 `key` 应与 map 中的 path 或 `meta.permissions` 一致

## 4. API 模块

在 `src/api/` 新建业务文件，并在 `src/api/index.ts` 导出：

```ts
export * from './order'
```

页面中：

```ts
import { listOrders } from '@/api'
```

## 5. 依赖公共包

| 包 | 用途 |
|----|------|
| `@Oceaninnerpeace/public-base-request` | Axios 封装 |
| `@Oceaninnerpeace/public-base-components` | 可选：PbTable、监控播放器等 |

`.npmrc` 参考 `.npmrc.example` 配置 GitHub Packages。

## 6. 基座注册 checklist

- [ ] `portal-apps.ts` 的 `name` = `VITE_QIANKUN_APP_NAME`
- [ ] `activeRule` = `VITE_MICRO_BASE_PATH`
- [ ] 开发 entry 端口 = `VITE_DEV_PORT`
- [ ] 子应用先 `pnpm dev`，再启动基座

## 7. 可选：发布侧栏包

若多个项目共用侧栏，可单独发布 `packages/admin-sider`；单项目保持 `workspace:*` 即可。

## 8. 监控 / 视频（可选）

业务需要摄像头时，在项目中安装：

```bash
pnpm add @Oceaninnerpeace/public-base-components hls.js
```

使用 `PbMonitorPanel` 等组件，后端提供 ZLMediaKit 的 HLS/WebRTC 地址。参见 `public-base-fe` 仓库的 `docs/MONITOR.md`。
