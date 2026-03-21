<template>
  <h2 class="mb-4"><i class="fas fa-bell"></i> Notifications</h2>

  <div v-if="loading" class="text-center py-5">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Chargement...</span>
    </div>
  </div>

  <template v-else>
    <div v-if="notifications.length === 0" class="text-center py-5">
      <i class="fas fa-bell-slash fa-3x text-muted mb-3 d-block"></i>
      <p class="text-muted">Aucune notification pour le moment.</p>
    </div>

    <div v-else class="notifications-list">
      <div
        v-for="n in notifications"
        :key="n.id"
        class="card mb-2"
        :class="{ 'border-primary': !n.lu }"
      >
        <div class="card-body d-flex justify-content-between align-items-start">
          <div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <i class="fas fa-circle" :class="n.lu ? 'text-secondary' : 'text-primary'" style="font-size: 0.5rem;"></i>
              <strong>{{ n.titre }}</strong>
            </div>
            <p class="mb-1">{{ n.message }}</p>
            <small class="text-muted">{{ new Date(n.created_at).toLocaleString('fr-FR') }}</small>
          </div>
          <button @click="handleDelete(n.id)" class="btn btn-sm btn-outline-danger ms-3" title="Supprimer">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  </template>
</template>

<script setup>
import { onMounted } from 'vue'
import { useNotifications } from '../stores/notifications'

const { notifications, loading, fetchNotifications, deleteNotification } = useNotifications()

async function handleDelete(id) {
  await deleteNotification(id)
}

onMounted(fetchNotifications)
</script>
