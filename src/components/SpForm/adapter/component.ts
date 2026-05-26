import type { Component } from 'vue'
import { h, markRaw } from 'vue'
import {
  AutoComplete,
  Button,
  Checkbox,
  DatePicker,
  Divider,
  Input,
  InputNumber,
  Radio,
  Select,
  Switch,
  TimePicker,
  TreeSelect,
} from 'ant-design-vue'

/** 与 Vben Form 一致的组件类型名（Ant Design Vue） */
export type SpFormComponentType =
  | 'AutoComplete'
  | 'Checkbox'
  | 'CheckboxGroup'
  | 'DatePicker'
  | 'DefaultButton'
  | 'Divider'
  | 'Input'
  | 'InputNumber'
  | 'InputPassword'
  | 'PrimaryButton'
  | 'Radio'
  | 'RadioGroup'
  | 'RangePicker'
  | 'Select'
  | 'Switch'
  | 'Textarea'
  | 'TimePicker'
  | 'TreeSelect'
  /** 自定义插槽，由 SpForm 渲染 */
  | 'Slot'

const { TextArea: Textarea } = Input
const { Password: InputPassword } = Input
const { Group: RadioGroup } = Radio
const { Group: CheckboxGroup } = Checkbox
const { RangePicker } = DatePicker

/** 旧版 kebab-case 组件名 → Vben 风格 PascalCase */
export const LEGACY_COMPONENT_MAP: Record<string, SpFormComponentType> = {
  input: 'Input',
  'input-password': 'InputPassword',
  textarea: 'Textarea',
  number: 'InputNumber',
  select: 'Select',
  'date-picker': 'DatePicker',
  switch: 'Switch',
  checkbox: 'Checkbox',
  'radio-group': 'RadioGroup',
  'checkbox-group': 'CheckboxGroup',
  slot: 'Slot',
}

function withDefaultPlaceholder(component: Component, kind: 'input' | 'select') {
  return (
    props: Record<string, unknown>,
    { attrs, slots }: { attrs: Record<string, unknown>; slots: Record<string, unknown> },
  ) => {
    const placeholder =
      (props.placeholder as string | undefined) ??
      (attrs.placeholder as string | undefined) ??
      (kind === 'input' ? '请输入' : '请选择')
    return h(component, { ...props, ...attrs, placeholder }, slots)
  }
}

const baseComponents: Record<SpFormComponentType, Component> = {
  AutoComplete: markRaw(withDefaultPlaceholder(AutoComplete, 'input')),
  Checkbox: markRaw(Checkbox),
  CheckboxGroup: markRaw(CheckboxGroup),
  DatePicker: markRaw(DatePicker),
  DefaultButton: markRaw(
    (
      props: Record<string, unknown>,
      ctx: { attrs: Record<string, unknown>; slots: Record<string, unknown> },
    ) => h(Button, { ...props, ...ctx.attrs, type: 'default' }, ctx.slots),
  ),
  Divider: markRaw(Divider),
  Input: markRaw(withDefaultPlaceholder(Input, 'input')),
  InputNumber: markRaw(withDefaultPlaceholder(InputNumber, 'input')),
  InputPassword: markRaw(withDefaultPlaceholder(InputPassword, 'input')),
  PrimaryButton: markRaw(
    (
      props: Record<string, unknown>,
      ctx: { attrs: Record<string, unknown>; slots: Record<string, unknown> },
    ) => h(Button, { ...props, ...ctx.attrs, type: 'primary' }, ctx.slots),
  ),
  Radio: markRaw(Radio),
  RadioGroup: markRaw(RadioGroup),
  RangePicker: markRaw(RangePicker),
  Select: markRaw(withDefaultPlaceholder(Select, 'select')),
  Switch: markRaw(Switch),
  Textarea: markRaw(withDefaultPlaceholder(Textarea, 'input')),
  TimePicker: markRaw(TimePicker),
  TreeSelect: markRaw(withDefaultPlaceholder(TreeSelect, 'select')),
  Slot: markRaw('div' as unknown as Component),
}

const registry = { ...baseComponents }

export function registerSpFormComponents(extra: Partial<Record<string, Component>>) {
  Object.assign(registry, extra)
}

export function resolveSpFormComponent(type: string): Component {
  const normalized = (LEGACY_COMPONENT_MAP[type] ?? type) as SpFormComponentType
  const cmp = registry[normalized]
  if (!cmp) {
    console.warn(`[SpForm] 未注册组件: ${type}，已回退为 Input`)
    return registry.Input
  }
  return cmp
}

export function normalizeComponentType(component: string): SpFormComponentType | string {
  return LEGACY_COMPONENT_MAP[component] ?? component
}

/** v-model 绑定字段名（对齐 Vben modelPropNameMap） */
export const MODEL_PROP_MAP: Record<string, string> = {
  Checkbox: 'checked',
  Radio: 'checked',
  Switch: 'checked',
}

export function modelPropNameFor(component: string): string {
  const type = normalizeComponentType(component)
  return MODEL_PROP_MAP[type as string] ?? 'value'
}

/** 不应被 commonConfig 拉满宽度的内联控件（如 Switch、Checkbox） */
export const INLINE_FORM_COMPONENTS = new Set<SpFormComponentType | string>([
  'Switch',
  'Checkbox',
  'Radio',
  'Divider',
])

export function isInlineFormComponent(component: string): boolean {
  return INLINE_FORM_COMPONENTS.has(normalizeComponentType(component))
}

/** 合并 props 时去掉 style.width，避免 Switch 等被 commonConfig 设为 100% */
export function omitStyleWidth(props: Record<string, unknown>): Record<string, unknown> {
  const style = props.style
  if (!style || typeof style !== 'object' || Array.isArray(style)) {
    return props
  }
  const nextStyle = { ...(style as Record<string, unknown>) }
  delete nextStyle.width
  if (Object.keys(nextStyle).length === 0) {
    const { style: _removed, ...rest } = props
    return rest
  }
  return { ...props, style: nextStyle }
}
