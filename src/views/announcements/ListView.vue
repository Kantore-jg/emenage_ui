<template>
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2><i class="fas fa-bullhorn"></i> Communiqués Officiels</h2>
    <router-link v-if="canCreate" to="/announcements/create" class="btn btn-primary">
      <i class="fas fa-plus"></i> Publier un communiqué
    </router-link>
  </div>

  <template v-if="announcements.length > 0">
    <div v-for="a in announcements" :key="a.id" class="card mb-3">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start">
          <div class="flex-grow-1">
            <h5 class="card-title"><i class="fas fa-stamp text-primary"></i> {{ a.titre }}</h5>
            <p class="card-text">{{ a.contenu }}</p>
            <p class="text-muted small mb-0">
              <i class="fas fa-building"></i> <strong>Autorité:</strong> {{ a.autorite }} |
              <i class="fas fa-user"></i> <strong>Auteur:</strong> {{ a.author_name }} |
              <i class="fas fa-calendar"></i> {{ formatDate(a.date) }}
            </p>
          </div>
          <div class="d-flex gap-2">
            <router-link :to="`/announcements/${a.id}`" class="btn btn-sm btn-primary">Lire <i class="fas fa-arrow-right"></i></router-link>
            <template v-if="canEdit(a)">
              <router-link :to="`/announcements/${a.id}/edit`" class="btn btn-sm btn-warning"><i class="fas fa-edit"></i> Modifier</router-link>
              <button class="btn btn-sm btn-danger" @click="deleteAnnouncement(a.id)"><i class="fas fa-trash"></i> Supprimer</button>
            </template>
          </div>
        </div>
      </div>
    </div>
  </template>
  <div v-else class="alert alert-info">
    <i class="fas fa-info-circle"></i> Aucun communiqué disponible pour le moment.
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../../stores/auth'
import api from '../../services/api'

const { user, isAuthenticated } = useAuth()
const announcements = ref([])

const canCreate = computed(() => isAuthenticated.value && ['chef_quartier', 'ministere', 'admin'].includes(user.value?.role))

function canEdit(a) {
  return isAuthenticated.value && (user.value?.id === a.author_id || user.value?.role === 'admin')
}

function formatDate(d) { return new Date(d).toLocaleDateString('fr-FR') }

async function loadData() {
  try {
    const { data } = await api.get('/announcements')
    announcements.value = data.announcements || []
  } catch (e) { console.error(e) }
}

async function deleteAnnouncement(id) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce communiqué ?')) return
  try {
    await api.delete(`/announcements/${id}`)
    await loadData()
  } catch (e) {
    alert(e.response?.data?.message || 'Erreur')
  }
}

onMounted(loadData)
</script>
