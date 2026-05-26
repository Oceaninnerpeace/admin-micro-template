import { get, put } from '@/utils/request'

/** 当前登录用户资料 */
export interface UserProfile {
  username: string
  displayName?: string
  avatar?: string
}

/** GET /user/profile */
export function fetchUserProfile() {
  return get<UserProfile>('/user/profile')
}

/** PUT /user/profile */
export function updateUserProfile(data: Partial<UserProfile>) {
  return put<UserProfile>('/user/profile', data)
}
