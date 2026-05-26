import { toRaw } from 'vue'
import type { SpFormSchema } from '../types'
import { getPathValue, setPathValue, type SchemaNamePath } from '@/utils/formPath'
import { schemaFieldKey } from '../adapter/schema'

/** 时间范围映射规则，对齐 Vben fieldMappingTime */
export type SpFormFieldMappingTimeRule = [
  sourceField: string,
  targetFields: [string, string],
  format?: string | null | ((value: unknown, fieldName: string) => unknown),
]

export function getSchemaFieldKeys(schema: SpFormSchema[]): string[] {
  return schema
    .map((field) => {
      const name = field.fieldName ?? field.name
      if (!name) return ''
      return Array.isArray(name) ? name.join('.') : name
    })
    .filter(Boolean)
}

function shallowFieldEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, index) => item === b[index])
  }
  return false
}

/** 检测 schema 中哪些字段相对上一次快照发生变化 */
export function detectChangedSchemaFields(
  schema: SpFormSchema[],
  prev: Record<string, unknown>,
  next: Record<string, unknown>,
): string[] {
  const changed: string[] = []
  for (const key of getSchemaFieldKeys(schema)) {
    if (!shallowFieldEqual(getPathValue(prev, key), getPathValue(next, key))) {
      changed.push(key)
    }
  }
  return changed
}

function formatMappingValue(
  value: unknown,
  format: SpFormFieldMappingTimeRule[2],
  fieldName: string,
): unknown {
  if (value == null) return value
  if (format === null || format === undefined) return value
  if (typeof format === 'function') return format(value, fieldName)
  if (
    typeof format === 'string' &&
    typeof value === 'object' &&
    value !== null &&
    'format' in value &&
    typeof (value as { format: (pattern: string) => string }).format === 'function'
  ) {
    return (value as { format: (pattern: string) => string }).format(format)
  }
  return value
}

export function applyFieldMappingTime(
  values: Record<string, unknown>,
  rules?: SpFormFieldMappingTimeRule[],
): Record<string, unknown> {
  if (!rules?.length) return values
  const out = { ...values }
  for (const [sourceField, [startField, endField], format] of rules) {
    const raw = getPathValue(out, sourceField)
    if (!Array.isArray(raw)) continue
    setPathValue(out, startField, formatMappingValue(raw[0], format, startField))
    setPathValue(out, endField, formatMappingValue(raw[1], format, endField))
    delete out[sourceField]
  }
  return out
}

export function applyValueFormat(
  schema: SpFormSchema[],
  values: Record<string, unknown>,
): Record<string, unknown> {
  const out = { ...values }
  for (const field of schema) {
    const name = field.fieldName ?? field.name
    if (!name || !field.valueFormat) continue
    const raw = getPathValue(out, name)
    const setValue = (target: SchemaNamePath, val: unknown) => setPathValue(out, target, val)
    const formatted = field.valueFormat(raw, setValue, out)
    if (formatted === undefined) {
      if (!Array.isArray(name)) {
        delete out[name]
      }
    } else {
      setPathValue(out, name, formatted)
    }
  }
  return out
}

export function processFormValues(
  schema: SpFormSchema[],
  model: Record<string, unknown>,
  options?: {
    fieldMappingTime?: SpFormFieldMappingTimeRule[]
  },
): Record<string, unknown> {
  const raw = { ...toRaw(model) }
  const mapped = applyFieldMappingTime(raw, options?.fieldMappingTime)
  return applyValueFormat(schema, mapped)
}

export function filterValuesBySchema(
  patch: Record<string, unknown>,
  schema: SpFormSchema[],
): Record<string, unknown> {
  const allowed = new Set(getSchemaFieldKeys(schema))
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(patch)) {
    if (allowed.has(key)) {
      out[key] = value
    }
  }
  return out
}

export function mergeSchemaByField(
  current: SpFormSchema[],
  partial: SpFormSchema[],
): SpFormSchema[] {
  const keyOf = (field: SpFormSchema) => schemaFieldKey(field)
  const partialMap = new Map(partial.map((item) => [keyOf(item), item]))
  const merged = current.map((item) => {
    const patch = partialMap.get(keyOf(item))
    if (!patch) return item
    partialMap.delete(keyOf(item))
    return { ...item, ...patch }
  })
  for (const item of partialMap.values()) {
    merged.push(item)
  }
  return merged
}
