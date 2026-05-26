# 第三方系统集成（嵌入模式）

其他系统可通过 **iframe** 或 **新窗口** 打开本系统页面，并通过 **URL 查询参数** 传入登录态与布局配置。解析后会写入 `sessionStorage`，并从地址栏移除敏感参数。

## 快速示例（全屏嵌入，无顶栏/侧栏）

```
https://your-host/home?embed=1&token=YOUR_ACCESS_TOKEN&username=zhangsan
```

## URL 参数

### 鉴权

| 参数 | 说明 |
|------|------|
| `token` | 访问令牌（与 `access_token` 二选一，写入 `sessionStorage` 的 `sp_token`） |
| `access_token` | 同 `token` |
| `username` | 仅展示用户名；写入简易用户对象，**不请求** `/auth/current-user` |
| `user` | Base64 编码的 `CurrentUser` JSON（含权限树时按权限校验；写入后**不请求** `/auth/current-user`） |

仅传 `token` 时仍会调用 `/auth/current-user` 拉取完整用户与权限。

### 布局（可组合）

| 参数 | 说明 |
|------|------|
| `embed=1` | 快捷模式：隐藏顶栏、侧栏、页签，内容区全屏 |
| `showHeader` / `hideHeader` | `1`/`0`、`true`/`false` |
| `showSider` / `hideSider` | 同上 |
| `showTabs` / `hideTabs` | 顶栏下页签；未传时默认与 `showHeader` 一致 |

示例：保留顶栏、隐藏侧栏

```
/home?token=xxx&hideSider=1
```

示例：仅隐藏顶栏

```
/home?token=xxx&hideHeader=1
```

## 用户对象（`user` 参数）

将 `CurrentUser` JSON 做 UTF-8 → Base64（URL 中注意 `+`/`/` 转义，或使用 URL-safe Base64）：

```js
const user = { id: '1', username: 'admin', roles: [], permissions: [...], menu_permissions: [], button_permissions: [] }
const userParam = btoa(unescape(encodeURIComponent(JSON.stringify(user))))
const url = `https://your-host/home?embed=1&token=TOKEN&user=${encodeURIComponent(userParam)}`
```

## 嵌入模式权限

`embed=1` 或任一布局为「嵌入态」（未同时显示顶栏+侧栏+页签）时，**跳过路由菜单权限校验**，由父系统控制可访问页面。若通过 `user` 传入完整权限树，可按需改回校验逻辑。

## 代码入口

- 解析与存储：`src/utils/embed.ts`
- 布局 composable：`src/composables/useEmbedLayout.ts`
- 路由守卫：首屏 `bootstrapEmbedFromRoute` + 去敏 `replace`
- 布局组件：`src/layouts/AdminLayout.vue`

## 工具函数

```ts
import { buildEmbedEntryUrl } from '@/utils/embed'

buildEmbedEntryUrl({
  baseUrl: 'https://your-host',
  path: '/home',
  token: 'xxx',
  username: '张三',
  embed: true,
})
```
