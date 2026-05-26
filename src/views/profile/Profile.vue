<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { UserOutlined } from '@ant-design/icons-vue'

const store = useStore()

const user = computed(() => store.state.currentUser)

const roles = computed(() => user.value?.roles ?? [])

/** 后端可能为秒或毫秒时间戳 */
function toMilliseconds(ts: number): number {
  return ts < 1e12 ? ts * 1000 : ts
}

function formatDateTime(ts?: number): string {
  if (ts == null || Number.isNaN(ts)) return '—'
  const d = new Date(toMilliseconds(ts))
  if (Number.isNaN(d.getTime())) return '—'
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const createdDisplay = computed(() => formatDateTime(user.value?.create_at))
</script>

<template>
  <div class="profile-page">
    <h1 class="profile-page__heading">个人信息</h1>

    <!-- 使用容器查询：按「内容区实际宽度」分列，避免视口>992 但主区域仍窄时出现挤压双列 -->
    <div class="profile-page__grid">
      <section class="profile-card profile-card--overview" aria-labelledby="profile-overview-title">
        <h2 id="profile-overview-title" class="profile-card__title">个人概览</h2>

        <div class="profile-overview__header">
          <div class="profile-overview__avatar" aria-hidden="true">
            <UserOutlined />
          </div>
          <p class="profile-overview__name">{{ user?.username ?? '—' }}</p>
        </div>

        <dl class="profile-overview__rows">
          <div class="profile-overview__row">
            <dt class="profile-overview__label">创建时间</dt>
            <dd class="profile-overview__value">{{ createdDisplay }}</dd>
          </div>
          <div class="profile-overview__row">
            <dt class="profile-overview__label">邮箱</dt>
            <dd class="profile-overview__value">{{ user?.email ?? '—' }}</dd>
          </div>
          <div class="profile-overview__row profile-overview__row--last">
            <dt class="profile-overview__label">手机号</dt>
            <dd class="profile-overview__value">{{ user?.phone ?? '—' }}</dd>
          </div>
        </dl>
      </section>

      <section class="profile-card profile-card--roles" aria-labelledby="profile-roles-title">
        <h2 id="profile-roles-title" class="profile-card__title">角色信息</h2>

        <div v-if="roles.length" class="profile-roles__tags">
          <span v-for="r in roles" :key="r.id" class="profile-role-tag">{{ r.role_name }}</span>
        </div>
        <p v-else class="profile-roles__empty">暂无角色</p>
      </section>
    </div>
  </div>
</template>
