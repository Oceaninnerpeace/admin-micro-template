import type { RouteRecordRaw } from 'vue-router'

import AdminLayout from '@/layouts/AdminLayout.vue'
import FormDemo from '@/views/form-demo/FormDemo.vue'

/**
 * 业务路由表：复制模板后在此扩展。
 * meta.permissions 与后端菜单 permission key 对应，见 src/router/menu-map.ts
 */
export const appRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/Login.vue'),
    meta: { public: true, noPermissionCheck: true },
  },
  {
    path: '/404',
    name: 'not-found',
    component: () => import('@/views/error/NotFound.vue'),
    meta: { public: true, noPermissionCheck: true },
  },
  {
    path: '/403',
    name: 'forbidden',
    component: () => import('@/views/error/Forbidden.vue'),
    meta: { public: true, noPermissionCheck: true },
  },
  {
    path: '/',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: { name: 'dashboard' } },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/dashboard/Dashboard.vue'),
        meta: { title: '工作台', permissions: ['MENU_DASHBOARD', '/dashboard'] },
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/views/profile/Profile.vue'),
        meta: { title: '个人信息' },
      },
      {
        path: 'form-demo',
        name: 'form-demo',
        component: FormDemo,
        meta: { title: '表单示例', permissions: ['MENU_FORM_DEMO', '/form-demo'] },
      },
      {
        path: 'system/user',
        name: 'system-user',
        component: () => import('@/views/placeholder/RoutePlaceholder.vue'),
        meta: { title: '用户管理', permissions: ['MENU_SYSTEM_USER', '/system/user'] },
      },
      {
        path: 'system/role',
        name: 'system-role',
        component: () => import('@/views/placeholder/RoutePlaceholder.vue'),
        meta: { title: '角色管理', permissions: ['MENU_SYSTEM_ROLE', '/system/role'] },
      },
      {
        path: 'monitor/live',
        name: 'monitor-live',
        component: () => import('@/views/placeholder/RoutePlaceholder.vue'),
        meta: { title: '实时监控', permissions: ['MENU_MONITOR_LIVE', '/monitor/live'] },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'not-found' },
  },
]
