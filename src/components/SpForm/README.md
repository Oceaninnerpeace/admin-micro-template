# SpForm

配置化表单组件，API 设计对齐 [Vben Form](https://doc.vben.pro/components/common-ui/vben-form.html)。支持 Schema 驱动渲染、查询表单（折叠 / 内置按钮 / 免校验提交）以及 `useSpForm` 组合式封装。

## 目录结构

```
SpForm/
├── SpForm.vue          # 表单 UI（栅格、折叠、操作区）
├── useSpForm.ts        # 组合式 API，返回 [Form, formApi]
├── types.ts            # 类型定义
├── index.ts            # 导出入口
├── adapter/
│   ├── component.ts    # 组件注册、旧名映射、v-model 属性名
│   └── schema.ts       # schema 规范化
└── README.md
```

## 快速开始

### 推荐：`useSpForm`

```ts
import { useSpForm } from '@/components/SpForm'
import type { SpFormSchema } from '@/components/SpForm'

const schema: SpFormSchema[] = [
  {
    fieldName: 'name',
    label: '名称',
    component: 'Input',
    rules: [{ required: true, message: '请输入名称' }],
    componentProps: { placeholder: '请输入' },
  },
]

const [BaseForm, formApi] = useSpForm({
  schema,
  layout: 'vertical',
  initialValues: { name: '' },
  handleSubmit: async (values) => {
    console.log(values)
  },
})
```

```vue
<template>
  <BaseForm />
</template>
```

### 直接使用组件

```vue
<script setup lang="ts">
import { reactive } from 'vue'
import { SpForm } from '@/components/SpForm'

const model = reactive({ keyword: '' })
const schema = [{ fieldName: 'keyword', label: '关键词', component: 'Input' }]
</script>

<template>
  <SpForm :model="model" :schema="schema" />
</template>
```

### 兼容旧用法：`useAppForm`

登录等页面仍可使用 `@/hooks/useAppForm`（`model` + `fields` + `<SpForm />`）。新页面请优先 `useSpForm`。

---

## Schema（`SpFormSchema`）

| 字段                | 说明                                            |
| ------------------- | ----------------------------------------------- |
| `fieldName`         | 字段名（推荐，等同 Vben `fieldName`）           |
| `name`              | 已废弃，请用 `fieldName`                        |
| `label`             | 表单项标签                                      |
| `component`         | 组件类型，见下方「内置组件」                    |
| `componentProps`    | 传给控件的 props（如 `options`、`placeholder`） |
| `rules`             | Ant Design Vue 校验规则                         |
| `ifShow`            | `boolean` 或 `(values) => boolean`，控制显隐    |
| `hidden`            | 已废弃，请用 `ifShow`                           |
| `slotName`          | `component: 'Slot'` 时使用的插槽名              |
| `valueFormat`       | 提交 / `getValues` 时转换字段值                 |
| `defaultValue`      | 默认值                                          |
| `disabled`          | `boolean` 或 `(values) => boolean`              |
| `formItemProps`     | 传给 `a-form-item` 的额外 props                 |
| `help`              | 表单项下方说明文案                              |
| `prefix` / `suffix` | 控件前后缀（返回 VNode）                        |
| `dependencies`      | 字段联动，见下文                                |

### 字段联动（`dependencies`）

对齐 Vben `FormItemDependencies`，**必须配置 `triggerFields`**（由哪些字段变化触发重算）。

| 属性             | 说明                                                    |
| ---------------- | ------------------------------------------------------- |
| `triggerFields`  | 触发字段名列表（必填）                                  |
| `if`             | 为 `false` 时不渲染（销毁 DOM）                         |
| `show`           | 为 `false` 时 CSS 隐藏（保留 DOM）                      |
| `disabled`       | 动态禁用                                                |
| `required`       | 动态必填                                                |
| `rules`          | 动态校验；可返回 `'required'`、`null` 或 `RuleObject[]` |
| `componentProps` | 动态合并到控件 props（如下拉 options）                  |
| `trigger`        | `triggerFields` 变化时执行的副作用                      |

回调第二参数为 `SpFormDependenciesApi`：`getValues`、`setValues`、`setFieldValue`。

```ts
{
  fieldName: 'subType',
  component: 'Select',
  dependencies: {
    triggerFields: ['sourceType'],
    componentProps(values) {
      if (values.sourceType === 'A') {
        return { options: [{ label: 'A-1', value: 'a1' }] }
      }
      return { options: [] }
    },
    trigger(_values, api) {
      api?.setFieldValue('subType', undefined)
    },
  },
}
```

与顶层 `ifShow` / `disabled` 同时存在时：**先应用 `dependencies`，再应用 schema 上的 `ifShow` / `disabled`**。

示例：

```ts
{
  fieldName: 'type',
  label: '类型',
  component: 'Select',
  componentProps: {
    allowClear: true,
    options: [
      { label: '台账', value: 'ledger' },
      { label: '记录', value: 'record' },
    ],
  },
}
```

插槽字段：

```ts
{ fieldName: 'captcha', label: '验证码', component: 'Slot', slotName: 'captcha' }
```

```vue
<BaseForm>
  <template #captcha="{ model }">
    <!-- 自定义控件 -->
  </template>
</BaseForm>
```

---

## `useSpForm` 配置（`UseSpFormOptions`）

### 基础

| 选项            | 说明                                                 | 默认值     |
| --------------- | ---------------------------------------------------- | ---------- |
| `schema`        | 表单项配置数组                                       | 必填       |
| `fields`        | 已废弃，同 `schema`                                  | —          |
| `initialValues` | 初始值                                               | `{}`       |
| `layout`        | `horizontal` / `vertical` / `inline`                 | `vertical` |
| `formProps`     | 透传 `a-form`（`labelCol`、`wrapperCol` 等）         | —          |
| `commonConfig`  | 全局 `componentProps` / `formItemProps` / `disabled` | —          |

`commonConfig.componentProps` 里常见的 `style: { width: '100%' }` 只会作用于 Input、Select 等块级控件；**Switch / Checkbox / Radio** 等内联控件会自动忽略其中的 `width`，避免开关被拉满一行。
| `wrapperClass` | 栅格容器 class | — |
| `handleSubmit` | 提交回调（经 `valueFormat` 后的值） | — |
| `handleReset` | 重置回调 | — |

### 高级能力

| 选项                       | 说明                                                                     | 默认值  |
| -------------------------- | ------------------------------------------------------------------------ | ------- |
| `fieldMappingTime`         | 将数组字段映射为两个提交字段（如 `RangePicker` → `startTime`/`endTime`） | —       |
| `handleValuesChange`       | 值变化回调 `(values, fieldsChanged)`                                     | —       |
| `submitOnChange`           | 值变化后防抖提交（表格搜索常用）                                         | `false` |
| `submitOnChangeDebounceMs` | `submitOnChange` 防抖毫秒                                                | `300`   |
| `compact`                  | 紧凑模式，不预留校验文案占位                                             | `false` |
| `scrollToFirstError`       | 校验失败后滚动到第一个错误项                                             | `false` |
| `collapseTriggerResize`    | 折叠/展开后触发 `window.resize`                                          | `false` |

`fieldMappingTime` 示例：

```ts
fieldMappingTime: [
  ['timeRange', ['startTime', 'endTime'], 'YYYY-MM-DD'],
  // 第三项为 null 时不格式化；可为 (value, fieldName) => unknown
],
```

`getValues` / `handleSubmit` 会依次执行：`fieldMappingTime` → 各字段 `valueFormat`。

### 查询表单 / 操作区

| 选项                    | 说明                                        | 默认值                                |
| ----------------------- | ------------------------------------------- | ------------------------------------- |
| `showDefaultActions`    | 显示查询、重置按钮                          | 有 `handleSubmit` 时为 `true`         |
| `showCollapseButton`    | 显示展开 / 收起                             | `false`                               |
| `collapsed`             | 是否折叠                                    | `false`                               |
| `collapsedRows`         | 折叠时保留的行数（× 栅格列数 = 可见字段数） | `1`                                   |
| `submitButtonOptions`   | 提交按钮配置（如 `{ content: '查询' }`）    | 文案「提交」                          |
| `resetButtonOptions`    | 重置按钮配置                                | 文案「重置」                          |
| `actionLayout`          | `newLine` / `rowEnd` / `inline`             | `newLine`                             |
| `actionPosition`        | `left` / `center` / `right`                 | `right`                               |
| `actionWrapperClass`    | 操作区额外 class                            | —                                     |
| `actionButtonsReverse`  | 调换重置与提交顺序                          | `false`                               |
| `queryMode`             | 提交不校验，直接 `handleSubmit`             | 开启 `showCollapseButton` 时为 `true` |
| `submitOnEnter`         | 回车触发提交（`textarea` 除外）             | `false`                               |
| `handleCollapsedChange` | 折叠状态变化回调                            | —                                     |

### 查询表单示例

```ts
const [QueryForm, formApi] = useSpForm({
  schema: queryFormDemoSchema,
  layout: 'horizontal',
  wrapperClass: 'sp-form-grid--2',
  showCollapseButton: true,
  collapsed: true,
  collapsedRows: 1,
  queryMode: true,
  submitButtonOptions: { content: '查询' },
  resetButtonOptions: { content: '重置' },
  formProps: {
    labelCol: { style: { width: '72px' } },
    wrapperCol: { style: { flex: 1 } },
  },
  handleSubmit: (values) => {
    /* 不经过 rules 校验 */
  },
  handleReset: () => {},
})
```

完整示例见：`src/views/form-demo/FormDemo.vue`。

---

## `formApi` 方法

| 方法                              | 说明                                                 |
| --------------------------------- | ---------------------------------------------------- |
| `validate` / `validateFields`     | 校验表单                                             |
| `getValues`                       | 获取当前值（应用 `valueFormat`）                     |
| `setValues`                       | 批量设值                                             |
| `resetForm`                       | 重置为 `initialValues` 并触发 `handleReset`          |
| `resetFields` / `clearValidate`   | 透传 Ant Design Form                                 |
| `setSchema`                       | 替换 schema 并重建 model                             |
| `updateSchema`                    | 按 `fieldName` 合并更新部分 schema                   |
| `setValues(patch, filterFields?)` | 设值；`filterFields` 默认 `true`，忽略非 schema 字段 |
| `submit`                          | 提交：查询模式不校验，否则先校验再 `handleSubmit`    |
| `setState`                        | 动态更新折叠、按钮、schema 等                        |
| `getState`                        | 读取当前可配置状态                                   |

`setState` 示例：

```ts
formApi.setState({
  collapsed: false,
  submitButtonOptions: { content: '查询', loading: true },
})
```

---

## 栅格布局（`wrapperClass`）

内置 class（定义于 `SpForm.vue`）：

| Class             | 说明                |
| ----------------- | ------------------- |
| `sp-form-grid--2` | 双列（≤768px 单列） |
| `sp-form-grid--3` | 三列（≤768px 单列） |

折叠可见字段数 = `collapsedRows × 列数`（根据 `wrapperClass` 解析列数，亦识别 `grid-cols-2` / `grid-cols-3`）。

---

## 内置组件（`component`）

| 类型                              | 说明                                                                              |
| --------------------------------- | --------------------------------------------------------------------------------- |
| `Input`                           | 输入框                                                                            |
| `InputPassword`                   | 密码框                                                                            |
| `Textarea`                        | 多行文本                                                                          |
| `InputNumber`                     | 数字                                                                              |
| `Select`                          | 下拉                                                                              |
| `AutoComplete`                    | 自动完成                                                                          |
| `DatePicker` / `RangePicker`      | 日期 / 范围                                                                       |
| `TimePicker`                      | 时间                                                                              |
| `Switch`                          | 开关（Ant Design Vue `Switch`，内联控件不会继承 `commonConfig` 的 `width: 100%`） |
| `Checkbox` / `CheckboxGroup`      | 复选                                                                              |
| `Radio` / `RadioGroup`            | 单选                                                                              |
| `TreeSelect`                      | 树选择                                                                            |
| `Slot`                            | 插槽                                                                              |
| `Divider`                         | 分割线                                                                            |
| `DefaultButton` / `PrimaryButton` | 按钮（表单项内）                                                                  |

### 旧版组件名（自动转换）

| 旧名             | 新名            |
| ---------------- | --------------- |
| `input`          | `Input`         |
| `input-password` | `InputPassword` |
| `textarea`       | `Textarea`      |
| `select`         | `Select`        |
| `date-picker`    | `DatePicker`    |
| `switch`         | `Switch`        |
| `slot`           | `Slot`          |

---

## `valueFormat`

在 `getValues` / 提交时对单字段做转换：

```ts
{
  fieldName: 'range',
  component: 'RangePicker',
  valueFormat(value, setValue) {
    setValue('startTime', value?.[0])
    setValue('endTime', value?.[1])
    return undefined // 删除原字段
  },
}
```

---

## 导出

```ts
import { SpForm, useSpForm } from '@/components/SpForm'
import type {
  SpFormSchema,
  SpFormApi,
  UseSpFormOptions,
  SpFormQueryOptions,
  SpFormActionButtonOptions,
} from '@/components/SpForm'
```

---

## 与 Vben Form 的差异（简要）

- 基于 **Ant Design Vue** `a-form`，非 Vben 内置 Form 引擎。
- 尚未覆盖：`formFieldProps`（vee-validate）、`getFieldComponentRef` 等 Vben 专属能力。
- 已对齐常用能力：查询表单、`dependencies`、`fieldMappingTime`、`valueFormat`、`handleValuesChange`、`submitOnChange`、`compact`、`scrollToFirstError`、`formApi.setState` / `updateSchema`。

## 参考

- 项目演示：`src/views/form-demo/FormDemo.vue`
- Vben 文档：https://doc.vben.pro/components/common-ui/vben-form.html
