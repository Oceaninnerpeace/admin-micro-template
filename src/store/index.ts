import { createStore } from 'vuex'
import { fetchCurrentUser as fetchCurrentUserApi } from '@/api/currentUser'
import type { CurrentUser } from '@/api/currentUser'

export interface RootState {
  currentUser: CurrentUser | null
}

export const store = createStore<RootState>({
  state: () => ({
    currentUser: null,
  }),
  mutations: {
    setCurrentUser(state, user: CurrentUser | null) {
      state.currentUser = user
    },
  },
  actions: {
    async fetchCurrentUser({ commit }) {
      const user = await fetchCurrentUserApi()
      commit('setCurrentUser', user)
      return user
    },
    clearCurrentUser({ commit }) {
      commit('setCurrentUser', null)
    },
  },
  getters: {
    currentUser: (s) => s.currentUser,
    currentUsername: (s) => s.currentUser?.username ?? '',
  },
})
