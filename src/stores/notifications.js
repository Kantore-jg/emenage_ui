import { ref, computed } from 'vue'
import api from '../services/api'

const notifications = ref([])
const loading = ref(false)

const unreadCount = computed(() => notifications.value.filter(n => !n.lu).length)

async function fetchNotifications() {
  loading.value = true
  try {
    const { data } = await api.get('/dashboard/notifications')
    notifications.value = data
  } catch {
    // silently fail
  } finally {
    loading.value = false
  }
}

async function deleteNotification(id) {
  try {
    await api.delete(`/dashboard/notifications/${id}`)
    notifications.value = notifications.value.filter(n => n.id !== id)
  } catch (e) {
    console.error(e)
  }
}

function clearNotifications() {
  notifications.value = []
}

export function useNotifications() {
  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    deleteNotification,
    clearNotifications,
  }
}
