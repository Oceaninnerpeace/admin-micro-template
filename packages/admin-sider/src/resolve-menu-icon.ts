import type { Component } from 'vue'
import * as Icons from '@ant-design/icons-vue'

/** 将后端返回的 icon 字符串解析为 Ant Design Vue 图标组件 */
export function resolveMenuIcon(
  name: string | null | undefined,
  options?: { leafFallback?: boolean },
): Component {
  if (!name) {
    return options?.leafFallback ? Icons.FileOutlined : Icons.MenuOutlined
  }
  const Icon = (Icons as Record<string, Component>)[name]
  return Icon ?? (options?.leafFallback ? Icons.FileOutlined : Icons.MenuOutlined)
}
