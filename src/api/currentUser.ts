import type { PermissionNode } from '@admin-template/admin-sider'
import { get } from '@/utils/request'
import type { ApiEnvelope } from './auth'

export type { PermissionNode }

export interface CurrentUserRole {
  id: string
  role_name: string
  description?: string | null
  create_at?: number
  update_at?: number
}

export interface MenuPermissionItem {
  id: string
  permission_name: string
  permission_code: string
  permission_type: number
  create_at: number
  update_at: number
}

export interface ButtonPermissionItem {
  id: string
  permission_name: string
  permission_code: string
  permission_type: number
  create_at: number
  update_at: number
}

/** GET `/auth/current-user` 返回的 `data` */
export interface CurrentUser {
  id: string
  username: string
  email?: string
  phone?: string
  create_at?: number
  roles: CurrentUserRole[]
  permissions: PermissionNode[]
  menu_permissions: MenuPermissionItem[]
  button_permissions: ButtonPermissionItem[]
}

const MOCK_FLAG = import.meta.env.VITE_USE_MOCK_AUTH === 'true'

function mockCurrentUser(): CurrentUser {
  const t = Date.now()
  return {
    id: '0',
    username: 'mock',
    email: undefined,
    phone: undefined,
    roles: [],
    permissions: [
      {
        id: 'd',
        key: '/dashboard',
        label: '工作台',
        permission: 'MENU_DASHBOARD',
        icon: 'HomeOutlined',
        permission_type: 1,
        sorting: 1,
        children: null,
      },
      {
        id: 'su',
        key: '/system/user',
        label: '用户管理',
        permission: 'MENU_SYSTEM_USER',
        icon: 'UserOutlined',
        permission_type: 1,
        sorting: 2,
        children: null,
      },
      {
        id: 'fd',
        key: '/form-demo',
        label: '表单示例',
        permission: 'MENU_FORM_DEMO',
        icon: 'FormOutlined',
        permission_type: 1,
        sorting: 3,
        children: null,
      },
    ],
    menu_permissions: [
      {
        id: '1',
        permission_name: '工作台',
        permission_code: 'MENU_DASHBOARD',
        permission_type: 1,
        create_at: t,
        update_at: t,
      },
      {
        id: '2',
        permission_name: '用户管理',
        permission_code: 'MENU_SYSTEM_USER',
        permission_type: 1,
        create_at: t,
        update_at: t,
      },
    ],
    button_permissions: [],
  }
}

/**
 * 当前登录用户详情（含权限树）
 * - 需已写入 access_token；请求头由 `@/utils/request` 统一附加 `Authorization: Bearer <token>`
 */
export function fetchCurrentUser() {
  if (MOCK_FLAG) {
    return Promise.resolve(mockCurrentUser())
  }
  return get<ApiEnvelope<CurrentUser>>('/auth/current-user').then((body) => body.data)
}
