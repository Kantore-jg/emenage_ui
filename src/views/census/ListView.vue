<template>
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2><i class="fas fa-clipboard-list"></i> Campagnes de Recensement</h2>
    <router-link to="/censuses/create" class="btn btn-primary">
      <i class="fas fa-plus"></i> Nouvelle campagne
    </router-link>
  </div>

  <div class="card mb-4">
    <div class="card-body py-3">
      <div class="row g-2 align-items-end">
        <div class="col-md-3">
          <select class="form-select" v-model="filterStatut" @change="load">
            <option value="">Tous les statuts</option>
            <option value="brouillon">Brouillon</option>
            <option value="actif">Actif</option>
            <option value="termine">Terminé</option>
            <option value="archive">Archivé</option>
          </select>
        </div>
        <div class="col-md-2">
          <span class="badge bg-primary fs-6">{{ censuses.length }} campagnes</span>
        </div>
      </div>
    </div>
  </div>

  <div v-if="loading" class="text-center py-5">
    <div class="spinner-border text-primary"></div>
  </div>

  <div v-else-if="censuses.length === 0" class="text-center py-5 text-muted">
    <i class="fas fa-clipboard fa-3x mb-3"></i>
    <p>Aucune campagne de recensement</p>
  </div>

  <div v-else>
    <table class="table table-hover align-middle">
      <thead>
        <tr>
          <th>Titre</th>
          <th>Description</th>
          <th>Statut</th>
          <th>Aire géographique</th>
          <th>Dates</th>
          <th>Champs</th>
          <th>Agents</th>
          <th>Réponses</th>
          <th class="text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in censuses" :key="c.id">
          <td>{{ c.titre }}</td>
          <td>
            <span v-if="c.description">
              {{ c.description?.substring(0, 100) }}<span v-if="c.description?.length > 100">...</span>
            </span>
          </td>
          <td>
            <span class="badge" :class="statutBadge(c.statut)">
              {{ c.statut }}
            </span>
          </td>
          <td>
            <span v-if="c.geographic_area">
              <i class="fas fa-map-marker-alt"></i> {{ c.geographic_area.name }}
            </span>
          </td>
          <td>
            <span v-if="c.date_debut">
              <i class="fas fa-calendar"></i>
              {{ formatDate(c.date_debut) }}
              <span v-if="c.date_fin"> → {{ formatDate(c.date_fin) }}</span>
              <span v-else> → ...</span>
            </span>
          </td>
          <td>
            <i class="fas fa-list"></i> {{ c.fields_count }}
          </td>
          <td>
            <i class="fas fa-users"></i> {{ c.agents_count }}
          </td>
          <td>
            <i class="fas fa-file-alt"></i> {{ c.responses_count }}
          </td>
          <td class="text-center">
            <router-link :to="`/censuses/${c.id}`" class="btn btn-outline-primary btn-sm me-1 mb-1" title="Voir">
              <i class="fas fa-eye"></i>
            </router-link>
            <button @click="deleteCensus(c.id)" class="btn btn-outline-danger btn-sm mb-1" title="Supprimer">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../services/api'

const censuses = ref([])
const filterStatut = ref('')
const loading = ref(true)

function statutBadge(s) {
  return { brouillon: 'bg-secondary', actif: 'bg-success', termine: 'bg-info', archive: 'bg-dark' }[s] || 'bg-secondary'
}

function formatDate(d) { return new Date(d).toLocaleDateString('fr-FR') }

async function load() {
  loading.value = true
  try {
    const params = {}
    if (filterStatut.value) params.statut = filterStatut.value
    const { data } = await api.get('/censuses', { params })
    censuses.value = data.censuses || []
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

async function deleteCensus(id) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette campagne ?')) return
  try {
    await api.delete(`/censuses/${id}`)
    censuses.value = censuses.value.filter(c => c.id !== id)
  } catch (e) {
    console.error(e)
    alert('Erreur lors de la suppression.')
  }
}

onMounted(load)
</script>
