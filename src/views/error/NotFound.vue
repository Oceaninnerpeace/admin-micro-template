<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="err-page err-page--404">
    <div class="err-card">
      <div class="err-code">404</div>
      <h1 class="err-title">页面不存在</h1>
      <p class="err-desc">您访问的地址有误或页面已被移除。</p>
      <RouterLink class="err-link" to="/dashboard">返回工作台</RouterLink>
    </div>
  </div>
</template>
