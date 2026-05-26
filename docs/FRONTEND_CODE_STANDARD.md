# 前端代码规范（Vue3 + TypeScript）

> 适用仓库：`admin-micro-template` 及其衍生项目  
> 目标：统一代码风格，降低协作成本，提升可维护性

## 1. 总体原则

- 可读性优先于“炫技”写法。
- 优先复用已有组件/工具，避免重复造轮子。
- 一处定义，多处复用：常量、类型、工具函数抽离到公共目录。
- 业务代码与框架代码分层，禁止跨层随意依赖。

## 2. 目录与分层

- `src/api`：仅放接口调用与 DTO 类型，不写页面逻辑。
- `src/views`：页面容器，负责组合组件和处理页面级状态。
- `src/components`：通用组件，不直接耦合具体业务接口。
- `src/utils`：纯函数工具与通用能力（无页面副作用）。
- `src/router`：路由定义、菜单映射、权限守卫。
- `src/store`：全局状态，避免存放临时页面状态。

约束：

- 页面禁止直接 `fetch/axios`，统一从 `src/api` 导入。
- 页面禁止直接修改全局样式变量，统一在样式入口管理。

## 3. TypeScript 规范

- 必须开启严格类型（保持 `tsconfig` 严格模式）。
- 禁止使用 `any`；确有必要时用 `unknown` 并做类型收窄。
- 接口响应必须定义类型，禁止“裸对象”到处传递。
- 导出函数需声明返回类型（公共模块必须显式返回类型）。

示例：

```ts
export async function fetchUserDetail(id: string): Promise<UserDetail> {
  const res = await get<ApiEnvelope<UserDetail>>(`/user/${id}`)
  return res.data
}
```

## 4. Vue 组件规范

- 组件名使用 `PascalCase`，文件名与组件名一致。
- `script setup` 默认开启，组件必须声明 `name`（`defineOptions`）。
- Props 需定义类型与默认值（`withDefaults`）。
- 组件对外事件统一 `defineEmits`，事件名使用 `kebab-case`。
- 复杂逻辑抽到 `composables`，组件文件避免超过 300 行。

示例：

```vue
<script setup lang="ts">
defineOptions({ name: 'UserTable' })

const props = withDefaults(defineProps<{ loading?: boolean }>(), {
  loading: false,
})
</script>
```

## 5. 命名规范

- 变量/函数：`camelCase`
- 类型/接口/枚举：`PascalCase`
- 常量：`UPPER_SNAKE_CASE`
- Vue 文件名：`PascalCase.vue`
- 路由 `name`：`kebab-case`（如 `system-user`）

语义要求：

- 布尔变量用 `is/has/can/should` 前缀（如 `isLoading`）。
- 获取函数用 `fetch/load/get`；提交动作用 `create/update/remove`。

## 6. API 与数据处理

- 所有 API 统一通过 `src/utils/request.ts`。
- API 层只做：请求参数拼装、响应结构转换、类型输出。
- 页面层不应感知后端 envelope 结构（如 `code/message/data`）。
- 错误提示统一走全局通知策略，禁止到处 `alert`。

## 7. 样式规范

- 优先使用现有设计令牌（CSS 变量）和组件库样式能力。
- 页面级样式放在 `src/styles/components`，禁止散落在任意目录。
- 避免深层选择器和 `!important` 滥用。
- 主题变量集中管理：颜色、间距、圆角、阴影统一来源。

## 8. 路由与权限

- 所有业务页面必须配置 `meta.title`。
- 需要权限控制的页面配置 `meta.permissions`。
- 菜单 key 与路由 path 映射统一维护在 `src/router/menu-map.ts`。
- 禁止在页面中手写权限判断字符串，统一走权限工具。

## 9. 日志与异常

- 开发日志使用 `console.debug/info`，发布前应清理无效日志。
- 捕获异常必须给出可定位信息（模块、动作、关键参数）。
- 不吞错：`catch` 后至少上报或转换为可见错误提示。

## 10. Git 与提交规范（Conventional Commits）

格式：

```text
type(scope): subject
```

常用类型：

- `feat`: 新功能
- `fix`: 缺陷修复
- `docs`: 文档更新
- `refactor`: 重构（非修复、非功能）
- `style`: 纯样式/格式调整
- `test`: 测试相关
- `chore`: 工具链、构建、依赖

要求：

- `subject` 使用英文小写开头，简洁说明“做了什么”。
- 一次 commit 聚焦一类改动，避免“功能+重构+格式化”混提交。

## 11. Code Review 基线

CR 至少检查：

- 是否有明确类型边界，是否引入 `any`。
- 是否复用已有能力而非重复实现。
- 是否影响现有权限、路由、登录流程。
- 是否包含必要的错误处理与空态处理。
- 是否有文档/注释同步更新（路由、配置、API 变更）。

## 12. 禁止项

- 禁止直接修改第三方库源码。
- 禁止在业务代码中硬编码环境地址、Token、密钥。
- 禁止把临时调试代码（mock 分支、调试开关）直接合入主分支。
- 禁止未经过评审就改动全局基础能力（路由守卫、request 拦截器）。

## 13. 落地建议

- ESLint：保障语法与最佳实践。
- Prettier：保障格式统一。
- Husky + lint-staged：提交前自动校验。
- CI：PR 必须通过 lint/type-check/build。

---

如需按你们团队习惯进一步细化，可在此基础上扩展：

- Vue 组件复杂度阈值（行数、圈复杂度）
- 覆盖率门槛（如单测覆盖率 >= 70%）
- 分支命名与发布流程（GitFlow / trunk-based）
