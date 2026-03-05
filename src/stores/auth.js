import { reactive, computed } from 'vue'
import api from '../services/api'

const state = reactive({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,
})

export function useAuth() {
  const isAuthenticated = computed(() => !!state.token)
  const user = computed(() => state.user)

  async function login(identifiant, password) {
    const { data } = await api.post('/auth/login', { identifiant, password })
    state.token = data.token
    state.user = data.user
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    return data
  }

  async function logout() {
    try {
      await api.post('/auth/logout')
    } catch (e) { /* ignore */ }
    state.token = null
    state.user = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  async function fetchUser() {
    try {
      const { data } = await api.get('/auth/user')
      state.user = data
      localStorage.setItem('user', JSON.stringify(data))
      return data
    } catch (e) {
      state.token = null
      state.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      throw e
    }
  }

  function updateUser(userData) {
    state.user = userData
    localStorage.setItem('user', JSON.stringify(userData))
  }

  return { isAuthenticated, user, login, logout, fetchUser, updateUser }
}
