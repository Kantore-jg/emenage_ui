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

  <div v-else class="row g-3">
    <div class="col-md-6 col-lg-4" v-for="c in censuses" :key="c.id">
      <div class="card h-100">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h5 class="card-title mb-0">{{ c.titre }}</h5>
            <span class="badge" :class="statutBadge(c.statut)">{{ c.statut }}</span>
          </div>
          <p v-if="c.description" class="text-muted small mb-2">{{ c.description?.substring(0, 100) }}{{ c.description?.length > 100 ? '...' : '' }}</p>
          <div class="small text-muted mb-3">
            <div v-if="c.geographic_area"><i class="fas fa-map-marker-alt"></i> {{ c.geographic_area.name }}</div>
            <div v-if="c.date_debut"><i class="fas fa-calendar"></i> {{ formatDate(c.date_debut) }} → {{ c.date_fin ? formatDate(c.date_fin) : '...' }}</div>
            <div><i class="fas fa-list"></i> {{ c.fields_count }} champs</div>
            <div><i class="fas fa-users"></i> {{ c.agents_count }} agents</div>
            <div><i class="fas fa-file-alt"></i> {{ c.responses_count }} réponses</div>
          </div>
        </div>
        <div class="card-footer bg-transparent">
          <router-link :to="`/censuses/${c.id}`" class="btn btn-outline-primary btn-sm w-100">
            <i class="fas fa-eye"></i> Voir détails
          </router-link>
        </div>
      </div>
    </div>
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

onMounted(load)
</script>
