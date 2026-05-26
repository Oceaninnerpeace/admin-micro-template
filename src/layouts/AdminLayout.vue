<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { theme } from 'ant-design-vue'
import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from '@ant-design/icons-vue'
import { PermissionSidebar } from '@admin-template/admin-sider'

import { appTitle } from '@/config/app'
import { useEmbedLayout } from '@/composables/useEmbedLayout'
import { useLayoutTabs } from '@/composables/useLayoutTabs'
import { clearToken } from '@/utils/auth'
import {
  filterSidebarNodes,
  findMenuSelectionState,
  normalizeAppPathForMenu,
} from '@/utils/permissionMenu'

const router = useRouter()
const route = useRoute()
const store = useStore()
const { showHeader, showSider, showTabs, isEmbed, isFullscreenContent } = useEmbedLayout()

const displayName = computed(() => store.getters.currentUsername || '用户')
const logoutModalOpen = ref(false)
const collapsed = ref(false)
const selectedKeys = ref<string[]>([])
const openKeys = ref<string[]>([])

const menuTree = computed(() => filterSidebarNodes(store.state.currentUser?.permissions ?? []))

function applyRouteToMenu() {
  const tree = menuTree.value
  const path = normalizeAppPathForMenu(route.path)
  const hit = findMenuSelectionState(path, tree)
  if (hit) {
    selectedKeys.value = [hit.selected]
    openKeys.value = [...hit.openKeys]
    return
  }
  selectedKeys.value = route.path ? [route.path] : []
}

watch(() => route.path, applyRouteToMenu)
watch(menuTree, applyRouteToMenu, { immediate: true })

const { tabs, tabActive, tabsEnabled, onTabEdit } = useLayoutTabs(router, route)

const antdTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#1677ff',
    colorBgElevated: '#0d2847',
    colorBgContainer: '#0d2847',
    colorBorder: '#1a3a5c',
    colorText: 'rgba(255,255,255,0.88)',
    colorTextSecondary: 'rgba(255,255,255,0.65)',
  },
}

function onUserMenuClick(info: { key: string | number }) {
  const key = String(info.key)
  if (key === 'profile') {
    void router.push({ name: 'profile' })
  } else if (key === 'logout') {
    logoutModalOpen.value = true
  }
}

function confirmLogout() {
  logoutModalOpen.value = false
  clearToken()
  void store.dispatch('clearCurrentUser')
  void router.push({ path: '/login' })
}

function onSideMenuClick(info: { key: string | number }) {
  const key = String(info.key)
  if (!key || key.startsWith('sub-') || key.startsWith('leaf-')) return
  if (key !== route.path) void router.push(key)
}
</script>

<template>
  <a-config-provider :theme="antdTheme">
    <a-layout
      class="sp-root"
      :class="{
        'sp-root--embed': isEmbed,
        'sp-root--fullscreen': isFullscreenContent,
      }"
    >
      <a-layout-header v-if="showHeader" class="sp-header">
        <div class="sp-header-left">
          <div class="sp-brand-mark" aria-hidden="true" />
          <span class="sp-brand-text">{{ appTitle }}</span>
          <span class="sp-trigger" title="展开/收起菜单" @click="collapsed = !collapsed">
            <MenuUnfoldOutlined v-if="collapsed" />
            <MenuFoldOutlined v-else />
          </span>
        </div>

        <div class="sp-header-end">
          <div class="sp-header-right">
            <a-dropdown
              placement="bottomRight"
              :trigger="['hover']"
              overlay-class-name="sp-user-dropdown"
            >
              <div class="sp-header-user-trigger" tabindex="0" role="button" aria-haspopup="true">
                <a-avatar :size="32" class="sp-user-avatar">
                  <template #icon>
                    <UserOutlined />
                  </template>
                </a-avatar>
                <span class="sp-username">{{ displayName }}</span>
              </div>
              <template #overlay>
                <a-menu @click="onUserMenuClick">
                  <a-menu-item key="profile">
                    <UserOutlined />
                    <span>个人信息</span>
                  </a-menu-item>
                  <a-menu-item key="logout">
                    <LogoutOutlined />
                    <span>退出登录</span>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </div>
      </a-layout-header>

      <a-layout
        class="sp-body"
        :class="{ 'sp-body--standalone': isFullscreenContent }"
      >
        <PermissionSidebar
          v-if="showSider"
          v-model:collapsed="collapsed"
          v-model:selected-keys="selectedKeys"
          v-model:open-keys="openKeys"
          :nodes="menuTree"
          background="var(--sp-header-bg)"
          @menu-click="onSideMenuClick"
        />

        <a-layout class="sp-main" :class="{ 'sp-main--standalone': !showSider }">
          <a-tabs
            v-if="tabsEnabled"
            v-model:active-key="tabActive"
            type="editable-card"
            hide-add
            class="sp-tabs"
            @edit="onTabEdit"
          >
            <a-tab-pane
              v-for="tab in tabs"
              :key="tab.key"
              :tab="tab.label"
              :closable="tab.closable"
            />
          </a-tabs>

          <a-layout-content
            class="sp-content"
            :class="{ 'sp-content--embed': isEmbed || isFullscreenContent }"
          >
            <div
              class="sp-content-inner"
              :class="{ 'sp-content-inner--fullscreen': isFullscreenContent }"
            >
              <router-view />
            </div>
          </a-layout-content>
        </a-layout>
      </a-layout>
    </a-layout>

    <a-modal
      v-model:open="logoutModalOpen"
      :footer="null"
      centered
      wrap-class-name="sp-logout-modal-wrap"
      width="420"
    >
      <template #title>
        <span class="sp-logout-modal-title">
          <span class="sp-logout-modal-warn" aria-hidden="true">!</span>
          退出登录
        </span>
      </template>
      <p class="sp-logout-modal-message">确定要退出当前账号吗？</p>
      <div class="sp-logout-modal-footer">
        <a-button class="sp-logout-btn-cancel" @click="logoutModalOpen = false">取消</a-button>
        <a-button type="primary" danger class="sp-logout-btn-ok" @click="confirmLogout">确定</a-button>
      </div>
    </a-modal>
  </a-config-provider>
</template>
