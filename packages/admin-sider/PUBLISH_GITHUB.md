# 发布到 GitHub Packages（npm 私服）

GitHub Packages 地址：`https://npm.pkg.github.com`  
**包名 scope 必须和你的 GitHub 用户名或组织名一致**，例如 GitHub 用户 `louha` → 包名 `@louha/smart-power-sider`。

---

## 1. 在 GitHub 建仓库

例如：`https://github.com/YOUR_GITHUB_USERNAME/smart-power-sider`  
（也可放在 monorepo `smart-power-admin` 里，但 npm 包仍按 `package.json` 的 `name` 发布。）

---

## 2. 创建 Personal Access Token（PAT）

GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)** → **Generate new token**

勾选权限：

| 权限 | 用途 |
|------|------|
| `write:packages` | 发布包 |
| `read:packages` | 安装包 |
| `repo` | 私有仓库发布时需要 |

复制 token（只显示一次），在 PowerShell 临时设置：

```powershell
$env:GITHUB_TOKEN="ghp_你的token"
```

---

## 3. 改包名与仓库信息

编辑 `package.json`：

```json
{
  "name": "@YOUR_GITHUB_USERNAME/smart-power-sider",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/YOUR_GITHUB_USERNAME/smart-power-sider.git"
  },
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

发布用 **dist** 入口（`pnpm build` 后）：

```json
"files": ["dist"],
"exports": {
  ".": {
    "types": "./dist/index.d.ts",
    "import": "./dist/index.js"
  },
  "./style.css": "./dist/style.css"
}
```

> monorepo 内开发仍通过 `workspace:*` + `tsconfig` 指向 `src`，与发布配置可并存。

---

## 4. 配置 `.npmrc`

复制 `.npmrc.example` 为 `.npmrc`，把 `YOUR_GITHUB_USERNAME` 换成你的用户名：

```ini
@YOUR_GITHUB_USERNAME:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

---

## 5. 发布

```bash
cd packages/smart-power-sider
pnpm build
npm publish
```

成功后可在 GitHub 仓库页 **Packages** 里看到。

---

## 6. 其它项目安装

项目根目录 `.npmrc`：

```ini
@YOUR_GITHUB_USERNAME:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

```bash
pnpm add @YOUR_GITHUB_USERNAME/smart-power-sider
```

```ts
import { PermissionSidebar } from '@YOUR_GITHUB_USERNAME/smart-power-sider'
import '@YOUR_GITHUB_USERNAME/smart-power-sider/style.css'
```

---

## 7. CI 自动发布（可选）

在仓库 `.github/workflows/publish-sider.yml`：

```yaml
name: Publish sider to GitHub Packages
on:
  push:
    tags: ['sider-v*']
jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          registry-url: https://npm.pkg.github.com
          scope: '@YOUR_GITHUB_USERNAME'
      - run: pnpm install
      - run: pnpm --filter @smart-power/sider build
      - run: npm publish --workspace packages/smart-power-sider
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 常见问题

**403 Forbidden**  
- Token 缺 `write:packages`  
- 包名 `@xxx/...` 的 `xxx` 与 token 所属用户/组织不一致  

**404 Not Found（安装时）**  
- 安装方 `.npmrc` 未配置 `@scope:registry`  
- 私有包未授权 `read:packages`  

**和 npmjs 的关系**  
- 只发到 `npm.pkg.github.com`，不会出现在 https://www.npmjs.com  
