import type { Component, VNode } from 'vue'
import type { RuleObject } from 'ant-design-vue/es/form/interface'
import type { SchemaNamePath } from '@/utils/formPath'
import type { SpFormComponentType } from './adapter/component'
import type { SpFormFieldMappingTimeRule } from './utils/formValues'

export type { SpFormComponentType }

export interface SpFormFieldOption {
  label: string
  value: string | number | boolean
  disabled?: boolean
}

/** dependencies 回调中可用的表单 API（精简版） */
export interface SpFormDependenciesApi {
  getValues: () => Record<string, unknown>
  setValues: (patch: Record<string, unknown>, filterFields?: boolean) => void
  setFieldValue: (field: SchemaNamePath, value: unknown) => void
}

/** 字段联动配置，对齐 Vben FormItemDependencies */
export interface SpFormItemDependencies {
  /** 触发联动的字段名；这些字段变化时会重新计算本项 */
  triggerFields: string[]
  /** 为 false 时不渲染（销毁 DOM） */
  if?: boolean | ((values: Record<string, unknown>, api?: SpFormDependenciesApi) => boolean)
  /** 为 false 时 CSS 隐藏（仍保留 DOM） */
  show?: boolean | ((values: Record<string, unknown>, api?: SpFormDependenciesApi) => boolean)
  disabled?: boolean | ((values: Record<string, unknown>, api?: SpFormDependenciesApi) => boolean)
  required?: boolean | ((values: Record<string, unknown>, api?: SpFormDependenciesApi) => boolean)
  rules?:
    | RuleObject
    | RuleObject[]
    | string
    | null
    | ((
        values: Record<string, unknown>,
        api?: SpFormDependenciesApi,
      ) => RuleObject | RuleObject[] | string | null | undefined)
  componentProps?:
    | Record<string, unknown>
    | ((
        values: Record<string, unknown>,
        api?: SpFormDependenciesApi,
      ) => Record<string, unknown> | void)
  /** triggerFields 变化时执行 */
  trigger?: (values: Record<string, unknown>, api?: SpFormDependenciesApi) => void
}

/** 表单项 schema（对齐 Vben Form：fieldName + component + componentProps） */
export interface SpFormSchema {
  /** 字段名（推荐，与 Vben fieldName 一致） */
  fieldName?: SchemaNamePath
  /** @deprecated 使用 fieldName */
  name?: SchemaNamePath
  label?: string
  component: SpFormComponentType | string
  componentProps?: Record<string, unknown>
  rules?: RuleObject | RuleObject[] | string
  /** 动态显示 */
  ifShow?: boolean | ((values: Record<string, unknown>) => boolean)
  /** @deprecated 使用 ifShow */
  hidden?: boolean | (() => boolean)
  /** Slot 插槽名 */
  slotName?: string
  /** 提交 / getValues 时的值转换 */
  valueFormat?: (
    value: unknown,
    setValue: (field: SchemaNamePath, val: unknown) => void,
    values: Record<string, unknown>,
  ) => unknown
  suffix?: () => VNode | string
  prefix?: () => VNode | string
  help?: string
  formItemProps?: Record<string, unknown>
  defaultValue?: unknown
  disabled?: boolean | ((values: Record<string, unknown>) => boolean)
  /** 字段联动 */
  dependencies?: SpFormItemDependencies
}

/** @deprecated 使用 SpFormSchema */
export type SpFormFieldSchema = SpFormSchema

export interface SpFormCommonConfig {
  componentProps?: Record<string, unknown>
  formItemProps?: Record<string, unknown>
  disabled?: boolean
}

export interface SpFormRootProps {
  layout?: 'horizontal' | 'vertical' | 'inline'
  labelCol?: Record<string, unknown>
  wrapperCol?: Record<string, unknown>
  colon?: boolean
  size?: 'small' | 'middle' | 'large'
  disabled?: boolean
  scrollToFirstError?: boolean | Record<string, unknown>
}

/** 操作按钮配置（对齐 Vben ActionButtonOptions） */
export interface SpFormActionButtonOptions {
  content?: string
  show?: boolean
  disabled?: boolean
  loading?: boolean
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text'
  size?: 'small' | 'middle' | 'large'
  class?: string
  [key: string]: unknown
}

export type SpFormActionLayout = 'newLine' | 'rowEnd' | 'inline'
export type SpFormActionPosition = 'left' | 'center' | 'right'

/** 查询表单 / 操作区配置（可经 useSpForm 或 SpForm props 传入） */
export interface SpFormQueryOptions {
  /** 是否显示默认操作按钮（查询/重置） */
  showDefaultActions?: boolean
  showCollapseButton?: boolean
  /** 折叠状态 */
  collapsed?: boolean
  /** 折叠时保留的行数（结合栅格列数计算可见字段数） */
  collapsedRows?: number
  submitButtonOptions?: SpFormActionButtonOptions
  resetButtonOptions?: SpFormActionButtonOptions
  actionLayout?: SpFormActionLayout
  actionPosition?: SpFormActionPosition
  actionWrapperClass?: string
  /** 调换重置与提交按钮顺序 */
  actionButtonsReverse?: boolean
  /** 查询模式：提交不校验，直接触发 handleSubmit */
  queryMode?: boolean
  /** 回车提交 */
  submitOnEnter?: boolean
  /** 字段变更时提交（内部防抖，默认 300ms） */
  submitOnChange?: boolean
  /** submitOnChange 防抖毫秒数 */
  submitOnChangeDebounceMs?: number
  handleCollapsedChange?: (collapsed: boolean) => void
  /** 折叠/展开后触发 window resize（如图表自适应） */
  collapseTriggerResize?: boolean
}

export type { SpFormFieldMappingTimeRule }

export interface SpFormAdvancedOptions {
  /** 数组字段映射为两个提交字段（如 RangePicker → startTime/endTime） */
  fieldMappingTime?: SpFormFieldMappingTimeRule[]
  /** 值变化回调（fieldsChanged 为 schema 中的 fieldName） */
  handleValuesChange?: (values: Record<string, unknown>, fieldsChanged: string[]) => void
  /** 紧凑模式：不预留校验文案占位高度 */
  compact?: boolean
  /** 校验失败后滚动到第一个错误项 */
  scrollToFirstError?: boolean
}

export interface UseSpFormOptions<T extends Record<string, unknown> = Record<string, unknown>>
  extends SpFormQueryOptions, SpFormAdvancedOptions {
  schema: SpFormSchema[]
  /** @deprecated 使用 schema */
  fields?: SpFormSchema[]
  initialValues?: Partial<T>
  commonConfig?: SpFormCommonConfig
  formProps?: SpFormRootProps
  layout?: SpFormRootProps['layout']
  wrapperClass?: string
  handleSubmit?: (values: T) => void | Promise<void>
  handleReset?: (values?: Record<string, unknown>) => void | Promise<void>
}

export type SpFormState = Partial<
  Pick<
    UseSpFormOptions,
    | 'schema'
    | 'commonConfig'
    | 'formProps'
    | 'layout'
    | 'wrapperClass'
    | 'showDefaultActions'
    | 'showCollapseButton'
    | 'collapsed'
    | 'collapsedRows'
    | 'submitButtonOptions'
    | 'resetButtonOptions'
    | 'actionLayout'
    | 'actionPosition'
    | 'actionWrapperClass'
    | 'actionButtonsReverse'
    | 'queryMode'
    | 'submitOnEnter'
    | 'submitOnChange'
    | 'submitOnChangeDebounceMs'
    | 'collapseTriggerResize'
    | 'fieldMappingTime'
    | 'compact'
    | 'scrollToFirstError'
  >
>

export interface SpFormExpose {
  validate: (nameList?: SchemaNamePath | SchemaNamePath[]) => Promise<unknown>
  validateFields: (nameList?: SchemaNamePath | SchemaNamePath[]) => Promise<unknown>
  resetFields: (name?: SchemaNamePath | SchemaNamePath[]) => void
  clearValidate: (name?: SchemaNamePath | SchemaNamePath[]) => void
  getValues: () => Record<string, unknown>
  setValues: (patch: Record<string, unknown>) => void
  /** 内置操作区提交（查询模式不校验） */
  submitForm?: () => Promise<void>
}

export interface SpFormApi extends SpFormExpose {
  formRef: import('vue').Ref<SpFormExpose | null>
  model: Record<string, unknown>
  schema: import('vue').ShallowRef<SpFormSchema[]>
  setSchema: (next: SpFormSchema[]) => void
  updateSchema: (partial: SpFormSchema[]) => void
  resetForm: () => void
  /** @param filterFields 为 true 时忽略不在 schema 中的字段 */
  setValues: (patch: Record<string, unknown>, filterFields?: boolean) => void
  /** 提交：查询模式不校验，否则先校验 */
  submit: () => Promise<void>
  setState: (state: SpFormState | ((prev: SpFormState) => SpFormState)) => void
  getState: () => SpFormState
}

export type SpFormWrapperComponent = Component
