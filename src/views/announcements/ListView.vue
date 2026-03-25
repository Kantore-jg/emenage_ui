<template>
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2><i class="fas fa-bullhorn"></i> {{ $t('announcements.title') }}</h2>
    <router-link v-if="canCreate" to="/announcements/create" class="btn btn-primary">
      <i class="fas fa-plus"></i> {{ $t('announcements.publish') }}
    </router-link>
  </div>

  <div class="card mb-4">
    <div class="card-body py-3">
      <form @submit.prevent="loadData(1)" class="row g-2 align-items-end">
        <div class="col-md-6">
          <input type="text" class="form-control" v-model="search" :placeholder="$t('announcements.searchPlaceholder')">
        </div>
        <div class="col-md-2">
          <button type="submit" class="btn btn-primary"><i class="fas fa-search"></i> {{ $t('common.search') }}</button>
        </div>
        <div class="col-md-2">
          <button v-if="search" type="button" class="btn btn-secondary" @click="search = ''; loadData(1)"><i class="fas fa-times"></i> {{ $t('common.reset') }}</button>
        </div>
        <div class="col-md-2 text-end">
          <span class="badge bg-primary fs-6">{{ pagination.total }} {{ $t('announcements.count') }}</span>
        </div>
      </form>
    </div>
  </div>

  <div v-if="loading" class="text-center py-5">
    <div class="spinner-border text-primary"></div>
  </div>

  <template v-else-if="announcements.length > 0">
    <div v-for="a in announcements" :key="a.id" class="card mb-3">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start">
          <div class="flex-grow-1">
            <h5 class="card-title"><i class="fas fa-stamp text-primary"></i> {{ a.titre }}</h5>
            <p class="card-text">{{ a.contenu }}</p>
            <p class="text-muted small mb-0">
              <i class="fas fa-building"></i> <strong>{{ $t('announcements.authority') }}:</strong> {{ a.autorite }} |
              <i class="fas fa-user"></i> <strong>{{ $t('announcements.author') }}:</strong> {{ a.author_name }} |
              <i class="fas fa-calendar"></i> {{ formatDate(a.date) }}
            </p>
          </div>
          <div class="d-flex gap-2">
            <router-link :to="`/announcements/${a.id}`" class="btn btn-sm btn-primary">{{ $t('announcements.read') }} <i class="fas fa-arrow-right"></i></router-link>
            <template v-if="canEdit(a)">
              <router-link :to="`/announcements/${a.id}/edit`" class="btn btn-sm btn-warning"><i class="fas fa-edit"></i> {{ $t('common.edit') }}</router-link>
              <button class="btn btn-sm btn-danger" @click="deleteAnnouncement(a.id)"><i class="fas fa-trash"></i> {{ $t('common.delete') }}</button>
            </template>
          </div>
        </div>
      </div>
    </div>
    <AppPagination :pagination="pagination" @page-change="loadData" />
  </template>
  <div v-else class="alert alert-info">
    <i class="fas fa-info-circle"></i> {{ $t('announcements.noAnnouncement') }}
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuth } from '../../stores/auth'
import { useI18n } from 'vue-i18n'
import api from '../../services/api'
import AppPagination from '../../components/AppPagination.vue'

const { user, isAuthenticated } = useAuth()
const { t } = useI18n()
const announcements = ref([])
const search = ref('')
const loading = ref(false)
const currentPage = ref(1)
const pagination = reactive({ current_page: 1, last_page: 1, per_page: 10, total: 0, from: 0, to: 0 })

const authorityRoles = ['collinaire', 'zonal', 'communal', 'provincial', 'ministere', 'admin']
const canCreate = computed(() => isAuthenticated.value && authorityRoles.includes(user.value?.role))

function canEdit(a) {
  return isAuthenticated.value && (user.value?.id === a.author_id || user.value?.role === 'admin')
}

function formatDate(d) { return new Date(d).toLocaleDateString('fr-FR') }

async function loadData(page = 1) {
  loading.value = true
  currentPage.value = page
  try {
    const params = { page, per_page: 10 }
    if (search.value) params.search = search.value
    const { data } = await api.get('/announcements', { params })
    announcements.value = data.announcements || []
    if (data.pagination) Object.assign(pagination, data.pagination)
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

async function deleteAnnouncement(id) {
  if (!confirm(t('announcements.deleteConfirm'))) return
  try {
    await api.delete(`/announcements/${id}`)
    await loadData(currentPage.value)
  } catch (e) {
    alert(e.response?.data?.message || t('errors.generic'))
  }
}

onMounted(() => loadData(1))
</script>
