import { computed } from 'vue'
import { getEmbedLayout, type EmbedLayoutConfig } from '@/utils/embed'

export function useEmbedLayout() {
  const layout = computed<EmbedLayoutConfig>(() => getEmbedLayout())

  const showHeader = computed(() => layout.value.showHeader)
  const showSider = computed(() => layout.value.showSider)
  const showTabs = computed(() => layout.value.showTabs)
  const isEmbed = computed(() => layout.value.isEmbed)
  const isFullscreenContent = computed(
    () => !layout.value.showHeader && !layout.value.showSider,
  )

  return {
    layout,
    showHeader,
    showSider,
    showTabs,
    isEmbed,
    isFullscreenContent,
  }
}
