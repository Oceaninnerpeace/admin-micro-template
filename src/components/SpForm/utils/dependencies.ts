import type { RuleObject } from 'ant-design-vue/es/form/interface'
import type { SpFormDependenciesApi, SpFormItemDependencies, SpFormSchema } from '../types'
import { getPathValue } from '@/utils/formPath'
import { schemaFieldKey } from '../adapter/schema'

export interface ResolvedFieldDependencies {
  /** `dependencies.if` 为 false 时不渲染（销毁） */
  render: boolean
  /** `dependencies.show` 为 false 时 CSS 隐藏 */
  show: boolean
  disabled: boolean
  rules: RuleObject | RuleObject[] | undefined
  componentProps: Record<string, unknown>
}

function evalDep<T>(
  value: T | ((values: Record<string, unknown>, api?: SpFormDependenciesApi) => T) | undefined,
  values: Record<string, unknown>,
  api: SpFormDependenciesApi | undefined,
  defaultValue: T,
): T {
  if (value === undefined) return defaultValue
  if (typeof value === 'function') {
    return (value as (values: Record<string, unknown>, api?: SpFormDependenciesApi) => T)(
      values,
      api,
    )
  }
  return value
}

function toRuleList(rules: SpFormSchema['rules']): RuleObject[] {
  if (!rules) return []
  if (typeof rules === 'string') {
    if (rules === 'required') {
      return [{ required: true, message: '必填', trigger: 'blur' }]
    }
    return []
  }
  return Array.isArray(rules) ? rules : [rules]
}

function mergeRequiredRules(
  base: RuleObject | RuleObject[] | string | undefined,
  required: boolean,
): RuleObject | RuleObject[] | undefined {
  if (!required) return base as RuleObject | RuleObject[] | undefined
  const list = toRuleList(base)
  if (list.some((r) => r.required))
    return list.length ? list : (base as RuleObject | RuleObject[] | undefined)
  return [...list, { required: true, message: '必填', trigger: 'blur' }]
}

function resolveRules(
  field: SpFormSchema,
  deps: SpFormItemDependencies,
  values: Record<string, unknown>,
  api: SpFormDependenciesApi | undefined,
): RuleObject | RuleObject[] | undefined {
  let rules: RuleObject | RuleObject[] | string | undefined = field.rules

  if (deps.rules !== undefined) {
    const dynamic = typeof deps.rules === 'function' ? deps.rules(values, api) : deps.rules
    if (dynamic === 'required') {
      rules = [{ required: true, message: '必填', trigger: 'blur' }]
    } else if (dynamic === null || dynamic === undefined) {
      rules = undefined
    } else if (typeof dynamic === 'string') {
      rules = dynamic
    } else {
      rules = dynamic
    }
  }

  if (deps.required !== undefined) {
    const required = evalDep(deps.required, values, api, false)
    return mergeRequiredRules(rules, required)
  }

  return rules as RuleObject | RuleObject[] | undefined
}

export function resolveFieldDependencies(
  field: SpFormSchema,
  values: Record<string, unknown>,
  api?: SpFormDependenciesApi,
): ResolvedFieldDependencies {
  const deps = field.dependencies
  if (!deps) {
    return {
      render: true,
      show: true,
      disabled: false,
      rules: field.rules as RuleObject | RuleObject[] | undefined,
      componentProps: {},
    }
  }

  const render = deps.if !== undefined ? evalDep(deps.if, values, api, true) : true
  const show = deps.show !== undefined ? evalDep(deps.show, values, api, true) : true
  const disabled = deps.disabled !== undefined ? evalDep(deps.disabled, values, api, false) : false

  let componentProps: Record<string, unknown> = {}
  if (deps.componentProps !== undefined) {
    const extra =
      typeof deps.componentProps === 'function'
        ? deps.componentProps(values, api)
        : deps.componentProps
    componentProps = extra ?? {}
  }

  return {
    render,
    show,
    disabled,
    rules: resolveRules(field, deps, values, api),
    componentProps,
  }
}

/** 收集 schema 中声明的 trigger 字段 */
export function collectDependencyTriggerFields(schema: SpFormSchema[]): string[] {
  const set = new Set<string>()
  for (const field of schema) {
    field.dependencies?.triggerFields?.forEach((name) => set.add(name))
  }
  return [...set]
}

export function snapshotTriggerFields(
  model: Record<string, unknown>,
  triggerFields: string[],
): Record<string, unknown> {
  const snap: Record<string, unknown> = {}
  for (const name of triggerFields) {
    snap[name] = getPathValue(model, name)
  }
  return snap
}

export function detectTriggerFieldChanges(
  prev: Record<string, unknown>,
  next: Record<string, unknown>,
): string[] {
  const keys = new Set([...Object.keys(prev), ...Object.keys(next)])
  const changed: string[] = []
  for (const key of keys) {
    if (prev[key] !== next[key]) changed.push(key)
  }
  return changed
}

/** 在 trigger 字段变化时执行 dependencies.trigger */
export function runDependencyTriggers(
  schema: SpFormSchema[],
  values: Record<string, unknown>,
  changedFields: string[],
  api?: SpFormDependenciesApi,
): void {
  for (const field of schema) {
    const deps = field.dependencies
    if (!deps?.trigger || !deps.triggerFields?.length) continue
    const hit = deps.triggerFields.some((name) => changedFields.includes(name))
    if (hit) {
      deps.trigger(values, api)
    }
  }
}

export function getResolvedField(
  field: SpFormSchema,
  map: Map<string, ResolvedFieldDependencies>,
): ResolvedFieldDependencies {
  return (
    map.get(schemaFieldKey(field)) ?? {
      render: true,
      show: true,
      disabled: false,
      rules: field.rules as RuleObject | RuleObject[] | undefined,
      componentProps: {},
    }
  )
}
