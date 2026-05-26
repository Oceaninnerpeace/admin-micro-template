<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'

import { appTitle } from '@/config/app'

const store = useStore()
const username = computed(() => store.getters.currentUsername || '用户')
</script>

<template>
  <div class="tpl-dashboard">
    <h1 class="tpl-dashboard__title">{{ appTitle }}</h1>
    <p class="tpl-dashboard__desc">欢迎，{{ username }}。这是后台管理模板的工作台，请从侧栏进入业务模块。</p>
    <a-card title="快速开始" bordered>
      <ul class="tpl-dashboard__list">
        <li>在 <code>src/router/routes.ts</code> 增加业务路由</li>
        <li>在 <code>src/router/menu-map.ts</code> 配置权限 key 与 path 映射</li>
        <li>在 <code>.env.development</code> 修改 API、Qiankun 名称与微前端路径</li>
        <li>参考 <code>docs/TEMPLATE.md</code> 接入基座或独立部署</li>
      </ul>
    </a-card>
  </div>
</template>

<style scoped>
.tpl-dashboard__title {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 600;
}

.tpl-dashboard__desc {
  margin: 0 0 20px;
  color: rgb(255 255 255 / 65%);
}

.tpl-dashboard__list {
  margin: 0;
  padding-left: 20px;
  line-height: 1.8;
}

.tpl-dashboard__list code {
  padding: 2px 6px;
  font-size: 12px;
  background: rgb(255 255 255 / 8%);
  border-radius: 4px;
}
</style>
