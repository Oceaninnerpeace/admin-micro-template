/** 与 Ant Design Form.Item 的 name 一致 */
export type SchemaNamePath = string | (string | number)[]

function toSegments(path: SchemaNamePath): (string | number)[] {
  return Array.isArray(path) ? path : [path]
}

export function getPathValue(obj: unknown, path: SchemaNamePath): unknown {
  const keys = toSegments(path)
  let cur: unknown = obj
  for (const k of keys) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = (cur as Record<string | number, unknown>)[k]
  }
  return cur
}

export function setPathValue(
  obj: Record<string, unknown>,
  path: SchemaNamePath,
  value: unknown,
): void {
  const keys = toSegments(path)
  if (keys.length === 0) return
  let cur: Record<string | number, unknown> = obj
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i]!
    const next = cur[k]
    if (next == null || typeof next !== 'object') {
      const nk = keys[i + 1]
      cur[k] = typeof nk === 'number' ? [] : {}
    }
    cur = cur[k] as Record<string | number, unknown>
  }
  cur[keys[keys.length - 1]!] = value as never
}
