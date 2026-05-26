import { computed, ref, watch } from 'vue'
import type { RouteLocationNormalizedLoaded, Router } from 'vue-router'
import { getEmbedLayout } from '@/utils/embed'

export interface LayoutTab {
  key: string
  label: string
  closable: boolean
}

/** 工作台 Tab，不可关闭 */
export const HOME_TAB_PATH = '/dashboard'

export const DEFAULT_LAYOUT_TABS: LayoutTab[] = [
  { key: HOME_TAB_PATH, label: '工作台', closable: false },
]

function isTabClosable(path: string): boolean {
  return path !== HOME_TAB_PATH
}

const SKIP_TAB_PATHS = new Set(['/login', '/403', '/404'])

function isLayoutTabPath(path: string): boolean {
  if (!path || path === '/' || SKIP_TAB_PATHS.has(path)) return false
  return true
}

export function useLayoutTabs(router: Router, route: RouteLocationNormalizedLoaded) {
  const tabsEnabled = computed(() => getEmbedLayout().showTabs)

  const tabs = ref<LayoutTab[]>(DEFAULT_LAYOUT_TABS.map((t) => ({ ...t })))
  const tabActive = ref(route.path || HOME_TAB_PATH)

  function tabLabelForRoute(r: RouteLocationNormalizedLoaded): string {
    const title = r.meta.title
    return typeof title === 'string' && title ? title : r.path
  }

  function syncTabFromRoute(r: RouteLocationNormalizedLoaded) {
    if (!isLayoutTabPath(r.path)) return
    const exists = tabs.value.some((t) => t.key === r.path)
    if (!exists) {
      tabs.value.push({
        key: r.path,
        label: tabLabelForRoute(r),
        closable: isTabClosable(r.path),
      })
    } else {
      tabs.value = tabs.value.map((t) =>
        t.key === r.path ? { ...t, label: tabLabelForRoute(r) } : t,
      )
    }
    tabActive.value = r.path
  }

  watch(
    () => route.fullPath,
    () => syncTabFromRoute(route),
    { immediate: true },
  )

  function onTabEdit(targetKey: string | MouseEvent | KeyboardEvent, action: string) {
    if (action !== 'remove' || typeof targetKey !== 'string') return
    const idx = tabs.value.findIndex((t) => t.key === targetKey)
    if (idx < 0) return
    const removed = tabs.value[idx]
    if (!removed.closable) return
    tabs.value = tabs.value.filter((t) => t.key !== targetKey)
    if (tabActive.value === targetKey) {
      const nextTab = tabs.value[idx] ?? tabs.value[idx - 1]
      const nextKey = nextTab?.key ?? HOME_TAB_PATH
      tabActive.value = nextKey
      void router.push(nextKey)
    }
  }

  watch(tabActive, (key) => {
    if (key && key !== route.path) void router.push(key)
  })

  return { tabs, tabActive, tabsEnabled, onTabEdit }
}
