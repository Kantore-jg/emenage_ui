<template>
  <div>
    <h2 class="mb-4"><i class="fas fa-search"></i> {{ $t('search.title') }}</h2>

    <div class="card mb-4">
      <div class="card-body">
        <div class="input-group">
          <span class="input-group-text"><i class="fas fa-search"></i></span>
          <input
            type="text"
            class="form-control form-control-lg"
            v-model="query"
            :placeholder="$t('search.placeholder')"
            @keyup.enter="doSearch"
            autofocus
          >
          <button class="btn btn-primary" @click="doSearch" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm"></span>
            <span v-else>{{ $t('common.search') }}</span>
          </button>
        </div>
        <small v-if="query.length > 0 && query.length < 2" class="text-muted mt-1 d-block">
          {{ $t('search.minChars') }}
        </small>
      </div>
    </div>

    <div v-if="loading" class="text-center py-4">
      <span class="spinner-border text-primary"></span>
      <p class="mt-2 text-muted">{{ $t('search.searching') }}</p>
    </div>

    <div v-else-if="searched && totalResults === 0" class="alert alert-info">
      <i class="fas fa-info-circle"></i> {{ $t('search.noResults', { query: searchedQuery }) }}
    </div>

    <template v-else-if="searched">
      <p class="text-muted mb-3">
        {{ $t('search.resultsFor', { query: searchedQuery }) }}
        — <strong>{{ totalResults }}</strong> {{ $t('common.results') }}
      </p>

      <div v-if="results.users?.length" class="card mb-3">
        <div class="card-header"><i class="fas fa-users"></i> {{ $t('search.usersSection') }} ({{ results.users.length }})</div>
        <div class="list-group list-group-flush">
          <div v-for="u in results.users" :key="'u-'+u.id" class="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{{ u.nom }}</strong>
              <small class="text-muted ms-2">{{ u.telephone }}</small>
              <span class="badge bg-secondary ms-2">{{ $t('roles.' + u.role) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="results.households?.length" class="card mb-3">
        <div class="card-header"><i class="fas fa-house-user"></i> {{ $t('search.householdsSection') }} ({{ results.households.length }})</div>
        <div class="list-group list-group-flush">
          <router-link v-for="h in results.households" :key="'h-'+h.id" :to="`/households/${h.id}`" class="list-group-item list-group-item-action">
            <div class="d-flex justify-content-between">
              <div>
                <strong>{{ h.quartier }}</strong> - {{ h.adresse }}
                <br><small class="text-muted"><i class="fas fa-user"></i> {{ $t('search.headOfFamily') }}: {{ h.chef_nom }}</small>
              </div>
              <i class="fas fa-chevron-right text-muted align-self-center"></i>
            </div>
          </router-link>
        </div>
      </div>

      <div v-if="results.apartments?.length" class="card mb-3">
        <div class="card-header"><i class="fas fa-building"></i> {{ $t('apartments.title') }} ({{ results.apartments.length }})</div>
        <div class="list-group list-group-flush">
          <router-link v-for="apt in results.apartments" :key="'apt-'+apt.id" :to="`/apartments/${apt.id}`" class="list-group-item list-group-item-action">
            <div class="d-flex justify-content-between">
              <div>
                <strong>{{ apt.avenue }}, N°{{ apt.numero }}</strong>
                <br><small class="text-muted"><i class="fas fa-user"></i> {{ $t('apartments.owner') }}: {{ apt.owner_nom }} — <i class="fas fa-map-marker-alt"></i> {{ apt.zone_name }}</small>
              </div>
              <i class="fas fa-chevron-right text-muted align-self-center"></i>
            </div>
          </router-link>
        </div>
      </div>

      <div v-if="results.announcements?.length" class="card mb-3">
        <div class="card-header"><i class="fas fa-bullhorn"></i> {{ $t('search.announcementsSection') }} ({{ results.announcements.length }})</div>
        <div class="list-group list-group-flush">
          <router-link v-for="a in results.announcements" :key="'a-'+a.id" :to="`/announcements/${a.id}`" class="list-group-item list-group-item-action">
            <div class="d-flex justify-content-between">
              <div>
                <strong>{{ a.titre }}</strong>
                <br><small class="text-muted">{{ a.autorite }} - {{ formatDate(a.date) }}</small>
              </div>
              <i class="fas fa-chevron-right text-muted align-self-center"></i>
            </div>
          </router-link>
        </div>
      </div>

      <div v-if="results.reports?.length" class="card mb-3">
        <div class="card-header"><i class="fas fa-exclamation-triangle"></i> {{ $t('search.reportsSection') }} ({{ results.reports.length }})</div>
        <div class="list-group list-group-flush">
          <div v-for="r in results.reports" :key="'r-'+r.id" class="list-group-item">
            <div class="d-flex justify-content-between">
              <div>
                <span class="text-truncate d-inline-block" style="max-width: 400px;">{{ r.description }}</span>
                <br><small class="text-muted">{{ r.citizen_nom }} - {{ formatDate(r.created_at) }}</small>
              </div>
              <span class="badge align-self-center" :class="{
                'bg-warning text-dark': r.statut === 'en_attente',
                'bg-primary': r.statut === 'en_cours',
                'bg-success': r.statut === 'resolu'
              }">{{ r.statut }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="results.members?.length" class="card mb-3">
        <div class="card-header"><i class="fas fa-user-friends"></i> {{ $t('search.membersSection') }} ({{ results.members.length }})</div>
        <div class="list-group list-group-flush">
          <div v-for="m in results.members" :key="'m-'+m.id" class="list-group-item">
            <strong>{{ m.nom }}</strong>
            <small class="text-muted ms-2">{{ m.telephone }}</small>
            <span class="badge bg-info ms-2">{{ m.type }}</span>
            <br><small class="text-muted">{{ $t('search.household') }}: {{ m.quartier }} ({{ $t('search.headOfFamily') }}: {{ m.chef_nom }})</small>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../services/api'

const route = useRoute()
const query = ref('')
const searchedQuery = ref('')
const results = ref({})
const totalResults = ref(0)
const loading = ref(false)
const searched = ref(false)

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR')
}

async function doSearch() {
  if (query.value.length < 2) return
  loading.value = true
  searched.value = true
  searchedQuery.value = query.value
  try {
    const { data } = await api.get('/search', { params: { q: query.value } })
    results.value = data.results
    totalResults.value = data.total
  } catch (e) {
    console.error(e)
    results.value = {}
    totalResults.value = 0
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (route.query.q) {
    query.value = route.query.q
    doSearch()
  }
})
</script>
