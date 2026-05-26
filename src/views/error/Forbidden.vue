<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useStore } from 'vuex'
import { getToken } from '@/utils/auth'

const store = useStore()
const loggedIn = computed(() => !!getToken() && !!store.state.currentUser)
</script>

<template>
  <div class="err-page err-page--403">
    <div class="err-card">
      <div class="err-code">403</div>
      <h1 class="err-title">无访问权限</h1>
      <p class="err-desc">
        <template v-if="loggedIn">您没有权限查看该页面，请联系管理员开通权限。</template>
        <template v-else>请先登录后再访问。</template>
      </p>
      <RouterLink class="err-link" :to="loggedIn ? '/dashboard' : '/login'">
        {{ loggedIn ? '返回首页' : '去登录' }}
      </RouterLink>
    </div>
  </div>
</template>
