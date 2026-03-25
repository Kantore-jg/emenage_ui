<template>
  <h2 class="mb-4"><i class="fas fa-home"></i> {{ $t('households.title') }}</h2>

  <div class="card mb-4">
    <div class="card-header"><i class="fas fa-filter"></i> {{ $t('households.searchFilters') }}</div>
    <div class="card-body">
      <form @submit.prevent="loadData(1)" class="row g-3">
        <div class="col-md-5">
          <label class="form-label">{{ $t('common.search') }}</label>
          <input type="text" class="form-control" v-model="filters.search" :placeholder="$t('households.searchPlaceholder')">
        </div>
        <div class="col-md-4">
          <label class="form-label">{{ $t('households.quarter') }}</label>
          <select class="form-select" v-model="filters.quartier">
            <option value="">{{ $t('households.allQuarters') }}</option>
            <option v-for="q in quartiers" :key="q" :value="q">{{ q }}</option>
          </select>
        </div>
        <div class="col-md-3 d-flex align-items-end gap-2">
          <button type="submit" class="btn btn-primary"><i class="fas fa-search"></i> {{ $t('common.search') }}</button>
          <button type="button" class="btn btn-secondary" @click="resetFilters"><i class="fas fa-times"></i> {{ $t('common.reset') }}</button>
        </div>
      </form>
    </div>
  </div>

  <div class="card">
    <div class="card-header d-flex justify-content-between align-items-center">
      <span><i class="fas fa-list"></i> {{ $t('nav.households') }} <span class="badge bg-primary ms-1">{{ pagination.total }}</span></span>
      <router-link to="/dashboard/gouvernement" class="btn btn-sm btn-secondary"><i class="fas fa-arrow-left"></i> {{ $t('common.back') }}</router-link>
    </div>
    <div class="card-body">
      <div v-if="loading" class="text-center py-4">
        <div class="spinner-border spinner-border-sm text-primary"></div> {{ $t('common.loading') }}
      </div>
      <template v-else-if="households.length > 0">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>{{ $t('households.headOfFamily') }}</th>
                <th>{{ $t('households.quarter') }}</th>
                <th>{{ $t('households.address') }}</th>
                <th>{{ $t('households.membersCount') }}</th>
                <th>{{ $t('households.guestsCount') }}</th>
                <th>{{ $t('common.date') }}</th>
                <th>{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="h in households" :key="h.id">
                <td><strong>{{ h.chef_nom }}</strong><br><small class="text-muted"><i class="fas fa-phone"></i> {{ h.chef_telephone }}</small></td>
                <td><span class="badge bg-info"><i class="fas fa-map-marker-alt"></i> {{ h.quartier }}</span></td>
                <td>{{ h.adresse }}</td>
                <td><span class="badge bg-primary">{{ h.nb_membres || 0 }}</span></td>
                <td><span class="badge bg-warning">{{ h.nb_invites_presents || 0 }}</span></td>
                <td><small>{{ formatDate(h.created_at) }}</small></td>
                <td><router-link :to="`/households/${h.id}`" class="btn btn-sm btn-primary"><i class="fas fa-eye"></i> {{ $t('common.details') }}</router-link></td>
              </tr>
            </tbody>
          </table>
        </div>
        <AppPagination :pagination="pagination" @page-change="loadData" />
      </template>
      <div v-else class="alert alert-info"><i class="fas fa-info-circle"></i> {{ $t('households.noHousehold') }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '../../services/api'
import AppPagination from '../../components/AppPagination.vue'

const households = ref([])
const quartiers = ref([])
const filters = reactive({ search: '', quartier: '' })
const loading = ref(false)
const pagination = reactive({ current_page: 1, last_page: 1, per_page: 15, total: 0, from: 0, to: 0 })

function formatDate(d) { return new Date(d).toLocaleDateString('fr-FR') }

async function loadData(page = 1) {
  loading.value = true
  try {
    const params = { page, per_page: 15 }
    if (filters.search) params.search = filters.search
    if (filters.quartier) params.quartier = filters.quartier
    const { data } = await api.get('/households', { params })
    households.value = data.households || []
    quartiers.value = data.quartiers || []
    if (data.pagination) Object.assign(pagination, data.pagination)
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

function resetFilters() {
  filters.search = ''
  filters.quartier = ''
  loadData(1)
}

onMounted(() => loadData(1))
</script>
