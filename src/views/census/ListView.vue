<template>
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2><i class="fas fa-clipboard-list"></i> {{ $t('census.title') }}</h2>
    <router-link to="/censuses/create" class="btn btn-primary">
      <i class="fas fa-plus"></i> {{ $t('census.newCampaign') }}
    </router-link>
  </div>

  <div class="card mb-4">
    <div class="card-body py-3">
      <form @submit.prevent="load(1)" class="row g-2 align-items-end">
        <div class="col-md-4">
          <input type="text" class="form-control" v-model="searchQuery" :placeholder="$t('census.searchPlaceholder')">
        </div>
        <div class="col-md-3">
          <select class="form-select" v-model="filterStatut" @change="load(1)">
            <option value="">{{ $t('census.allStatuses') }}</option>
            <option value="brouillon">{{ $t('census.draft') }}</option>
            <option value="actif">{{ $t('census.active') }}</option>
            <option value="termine">{{ $t('census.completed') }}</option>
            <option value="archive">{{ $t('census.archived') }}</option>
          </select>
        </div>
        <div class="col-md-2">
          <button type="submit" class="btn btn-primary"><i class="fas fa-search"></i></button>
          <button v-if="searchQuery" type="button" class="btn btn-secondary ms-1" @click="searchQuery = ''; load(1)"><i class="fas fa-times"></i></button>
        </div>
        <div class="col-md-2">
          <span class="badge bg-primary fs-6">{{ pagination.total }} {{ $t('census.count') }}</span>
        </div>
      </form>
    </div>
  </div>

  <div v-if="loading" class="text-center py-5">
    <div class="spinner-border text-primary"></div>
  </div>

  <div v-else-if="censuses.length === 0" class="text-center py-5 text-muted">
    <i class="fas fa-clipboard fa-3x mb-3"></i>
    <p>{{ $t('census.noCampaign') }}</p>
  </div>

  <div v-else>
    <table class="table table-hover align-middle">
      <thead>
        <tr>
          <th>{{ $t('census.titleCol') }}</th>
          <th>{{ $t('census.descriptionCol') }}</th>
          <th>{{ $t('census.statusCol') }}</th>
          <th>{{ $t('census.geoArea') }}</th>
          <th>{{ $t('census.dates') }}</th>
          <th>{{ $t('census.fields') }}</th>
          <th>{{ $t('census.agents') }}</th>
          <th>{{ $t('census.responses') }}</th>
          <th class="text-center">{{ $t('common.actions') }}</th>
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
            <span class="badge" :class="statutBadge(c.statut)">{{ c.statut }}</span>
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
          <td><i class="fas fa-list"></i> {{ c.fields_count }}</td>
          <td><i class="fas fa-users"></i> {{ c.agents_count }}</td>
          <td><i class="fas fa-file-alt"></i> {{ c.responses_count }}</td>
          <td class="text-center">
            <router-link :to="`/censuses/${c.id}`" class="btn btn-outline-primary btn-sm me-1 mb-1" :title="$t('common.view')">
              <i class="fas fa-eye"></i>
            </router-link>
            <button @click="deleteCensus(c.id)" class="btn btn-outline-danger btn-sm mb-1" :title="$t('common.delete')">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <AppPagination :pagination="pagination" @page-change="load" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../../services/api'
import AppPagination from '../../components/AppPagination.vue'

const { t } = useI18n()
const censuses = ref([])
const filterStatut = ref('')
const searchQuery = ref('')
const loading = ref(true)
const pagination = reactive({ current_page: 1, last_page: 1, per_page: 15, total: 0, from: 0, to: 0 })

function statutBadge(s) {
  return { brouillon: 'bg-secondary', actif: 'bg-success', termine: 'bg-info', archive: 'bg-dark' }[s] || 'bg-secondary'
}

function formatDate(d) { return new Date(d).toLocaleDateString('fr-FR') }

async function load(page = 1) {
  loading.value = true
  try {
    const params = { page, per_page: 15 }
    if (filterStatut.value) params.statut = filterStatut.value
    if (searchQuery.value) params.search = searchQuery.value
    const { data } = await api.get('/censuses', { params })
    censuses.value = data.censuses || []
    if (data.pagination) Object.assign(pagination, data.pagination)
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

async function deleteCensus(id) {
  if (!confirm(t('census.deleteConfirm'))) return
  try {
    await api.delete(`/censuses/${id}`)
    censuses.value = censuses.value.filter(c => c.id !== id)
  } catch (e) {
    console.error(e)
    alert(t('errors.generic'))
  }
}

onMounted(() => load(1))
</script>
