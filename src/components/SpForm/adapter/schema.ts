import type { SpFormSchema } from '../types'
import { normalizeComponentType } from './component'

/** 将旧版 fields（name + kebab component）规范为 Vben 风格 schema */
export function normalizeSchema(list: SpFormSchema[]): SpFormSchema[] {
  return list.map((item) => {
    const fieldName = item.fieldName ?? item.name
    if (!fieldName) {
      console.warn('[SpForm] schema 项缺少 fieldName / name', item)
    }
    const component = normalizeComponentType(String(item.component))
    const slotName = item.slotName ?? (component === 'Slot' ? 'default' : undefined)
    return {
      ...item,
      fieldName,
      name: fieldName,
      component,
      slotName,
    }
  })
}

export function schemaFieldKey(field: SpFormSchema): string {
  const path = field.fieldName ?? field.name
  if (!path) return ''
  return Array.isArray(path) ? path.join('.') : path
}
