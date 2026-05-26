<script setup lang="ts">
import type { PermissionNode } from './types'
import { Empty } from 'ant-design-vue'
import PermissionMenuItems from './PermissionMenuItems.vue'

withDefaults(
  defineProps<{
    nodes: PermissionNode[]
    /** 展开宽度 */
    expandWidth?: number
    /** 折叠宽度 */
    collapseWidth?: number
    /** 侧栏背景，默认使用 CSS 变量 --sps-sider-bg */
    background?: string
    emptyDescription?: string
  }>(),
  {
    expandWidth: 200,
    collapseWidth: 40,
    background: 'var(--sps-sider-bg, #001529)',
    emptyDescription: '暂无菜单权限',
  },
)

const collapsed = defineModel<boolean>('collapsed', { required: true })
const selectedKeys = defineModel<string[]>('selectedKeys', { required: true })
const openKeys = defineModel<string[]>('openKeys', { required: true })

const emit = defineEmits<{
  menuClick: [info: { key: string | number }]
}>()

function onMenuClick(info: { key: string | number }) {
  emit('menuClick', info)
}
</script>

<template>
  <a-layout-sider
    v-model:collapsed="collapsed"
    :width="expandWidth"
    :collapsed-width="collapseWidth"
    class="sps-sidebar app-sidebar sp-sider"
    :style="{ background }"
  >
    <a-menu
      v-model:open-keys="openKeys"
      v-model:selected-keys="selectedKeys"
      mode="inline"
      theme="dark"
      class="app-sidebar__menu sp-menu sp-sider-menu"
      :inline-collapsed="collapsed"
      @click="onMenuClick"
    >
      <a-empty
        v-if="!nodes.length"
        class="app-sidebar__empty"
        :description="emptyDescription"
        :image="Empty.PRESENTED_IMAGE_SIMPLE"
      />
      <PermissionMenuItems v-else :nodes="nodes" />
    </a-menu>
  </a-layout-sider>
</template>
