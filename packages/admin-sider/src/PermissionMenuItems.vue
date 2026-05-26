<script setup lang="ts">
import type { PermissionNode } from './types'
import { appRouteForPermissionNode } from './permission-menu'
import { resolveMenuIcon } from './resolve-menu-icon'
import PermissionMenuItems from './PermissionMenuItems.vue'

const props = withDefaults(
  defineProps<{
    nodes: PermissionNode[]
    parentIcon?: string | null
  }>(),
  { parentIcon: null },
)

function effectiveIcon(node: PermissionNode): string | null | undefined {
  return node.icon ?? props.parentIcon ?? undefined
}

function inheritIcon(node: PermissionNode): string | null | undefined {
  return node.icon ?? props.parentIcon ?? undefined
}
</script>

<template>
  <template v-for="node in nodes" :key="node.id">
    <a-sub-menu v-if="node.children?.length" :key="`sub-${node.id}`">
      <template #icon>
        <component :is="resolveMenuIcon(effectiveIcon(node))" />
      </template>
      <template #title>{{ node.label }}</template>
      <PermissionMenuItems :nodes="node.children" :parent-icon="inheritIcon(node) ?? null" />
    </a-sub-menu>
    <a-menu-item v-else :key="String(appRouteForPermissionNode(node) ?? `leaf-${node.id}`)">
      <template #icon>
        <component :is="resolveMenuIcon(effectiveIcon(node), { leafFallback: true })" />
      </template>
      {{ node.label }}
    </a-menu-item>
  </template>
</template>
