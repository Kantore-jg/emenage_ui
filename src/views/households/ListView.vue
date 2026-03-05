<template>
  <h2 class="mb-4"><i class="fas fa-home"></i> Liste des Ménages</h2>

  <div class="card mb-4">
    <div class="card-header"><i class="fas fa-filter"></i> Filtres de Recherche</div>
    <div class="card-body">
      <form @submit.prevent="loadData" class="row g-3">
        <div class="col-md-4">
          <label class="form-label">Quartier</label>
          <select class="form-select" v-model="filters.quartier">
            <option value="">Tous les quartiers</option>
            <option v-for="q in quartiers" :key="q" :value="q">{{ q }}</option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label">Zone</label>
          <input type="text" class="form-control" v-model="filters.zone" placeholder="Rechercher par zone...">
        </div>
        <div class="col-md-4">
          <label class="form-label">Commune</label>
          <input type="text" class="form-control" v-model="filters.commune" placeholder="Rechercher par commune...">
        </div>
        <div class="col-12">
          <button type="submit" class="btn btn-primary"><i class="fas fa-search"></i> Rechercher</button>
          <button type="button" class="btn btn-secondary ms-2" @click="resetFilters"><i class="fas fa-times"></i> Réinitialiser</button>
        </div>
      </form>
    </div>
  </div>

  <div class="card">
    <div class="card-header d-flex justify-content-between align-items-center">
      <span><i class="fas fa-list"></i> Ménages ({{ households.length }})</span>
      <router-link to="/dashboard/gouvernement" class="btn btn-sm btn-secondary"><i class="fas fa-arrow-left"></i> Retour</router-link>
    </div>
    <div class="card-body">
      <template v-if="households.length > 0">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr><th>Chef de Famille</th><th>Quartier</th><th>Adresse</th><th>Membres</th><th>Invités</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              <tr v-for="h in households" :key="h.id">
                <td><strong>{{ h.chef_nom }}</strong><br><small class="text-muted"><i class="fas fa-phone"></i> {{ h.chef_telephone }}</small></td>
                <td><span class="badge bg-info"><i class="fas fa-map-marker-alt"></i> {{ h.quartier }}</span></td>
                <td>{{ h.adresse }}</td>
                <td><span class="badge bg-primary">{{ h.nb_membres || 0 }}</span></td>
                <td><span class="badge bg-warning">{{ h.nb_invites_presents || 0 }}</span></td>
                <td><small>{{ formatDate(h.created_at) }}</small></td>
                <td><router-link :to="`/households/${h.id}`" class="btn btn-sm btn-primary"><i class="fas fa-eye"></i> Détails</router-link></td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
      <div v-else class="alert alert-info"><i class="fas fa-info-circle"></i> Aucun ménage trouvé.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '../../services/api'

const households = ref([])
const quartiers = ref([])
const filters = reactive({ quartier: '', zone: '', commune: '' })

function formatDate(d) { return new Date(d).toLocaleDateString('fr-FR') }

async function loadData() {
  try {
    const params = {}
    if (filters.quartier) params.quartier = filters.quartier
    if (filters.zone) params.zone = filters.zone
    if (filters.commune) params.commune = filters.commune
    const { data } = await api.get('/households', { params })
    households.value = data.households || []
    quartiers.value = data.quartiers || []
  } catch (e) { console.error(e) }
}

function resetFilters() {
  filters.quartier = ''; filters.zone = ''; filters.commune = ''
  loadData()
}

onMounted(loadData)
</script>
