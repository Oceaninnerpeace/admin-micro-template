<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const title = computed(() => String(route.meta.title ?? '页面'))
</script>

<template>
  <div class="route-placeholder">
    <h1 class="route-placeholder-title">{{ title }}</h1>
    <p class="route-placeholder-desc">功能开发中，敬请期待。</p>
  </div>
</template>
