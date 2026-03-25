<template>
  <h2 class="mb-4"><i class="fas fa-bell"></i> {{ $t('notifications.title') }}</h2>

  <div class="card mb-4">
    <div class="card-body py-3">
      <div class="row g-2 align-items-end">
        <div class="col-md-4">
          <label class="form-label small">{{ $t('notifications.typeLabel') }}</label>
          <select class="form-select form-select-sm" v-model="filterType" @change="loadNotifications(1)">
            <option value="">{{ $t('notifications.allTypes') }}</option>
            <option value="nouveau_membre">{{ $t('notifications.newMember') }}</option>
            <option value="nouvel_invite">{{ $t('notifications.newGuest') }}</option>
            <option value="validation">{{ $t('notifications.validation') }}</option>
            <option value="nouveau_paiement">{{ $t('notifications.newPayment') }}</option>
            <option value="validation_paiement">{{ $t('notifications.paymentValidated') }}</option>
          </select>
        </div>
        <div class="col-md-2">
          <span class="badge bg-primary fs-6">{{ pagination.total }} {{ $t('notifications.count') }}</span>
        </div>
      </div>
    </div>
  </div>

  <div v-if="pageLoading" class="text-center py-5">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">{{ $t('common.loading') }}</span>
    </div>
  </div>

  <template v-else>
    <div v-if="notifications.length === 0" class="text-center py-5">
      <i class="fas fa-bell-slash fa-3x text-muted mb-3 d-block"></i>
      <p class="text-muted">{{ $t('notifications.noNotification') }}</p>
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
              <span class="badge bg-light text-dark border" style="font-size: 0.65rem;">{{ typeLabel(n.type) }}</span>
            </div>
            <p class="mb-1">{{ n.message }}</p>
            <small class="text-muted">{{ new Date(n.created_at).toLocaleString('fr-FR') }}</small>
          </div>
          <button @click="handleDelete(n.id)" class="btn btn-sm btn-outline-danger ms-3" :title="$t('common.delete')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <AppPagination :pagination="pagination" @page-change="loadNotifications" />
  </template>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../services/api'
import AppPagination from '../components/AppPagination.vue'

const { t } = useI18n()
const notifications = ref([])
const pageLoading = ref(false)
const filterType = ref('')
const currentPage = ref(1)
const pagination = reactive({ current_page: 1, last_page: 1, per_page: 20, total: 0, from: 0, to: 0 })

function typeLabel(type) {
  const map = {
    nouveau_membre: t('notifications.newMember'),
    nouvel_invite: t('notifications.newGuest'),
    validation: t('notifications.validation'),
    nouveau_paiement: t('notifications.newPayment'),
    validation_paiement: t('notifications.paymentValidated'),
  }
  return map[type] || type
}

async function loadNotifications(page = 1) {
  pageLoading.value = true
  currentPage.value = page
  try {
    const params = { page, per_page: 20 }
    if (filterType.value) params.type = filterType.value
    const { data } = await api.get('/dashboard/notifications', { params })
    notifications.value = data.notifications || []
    if (data.pagination) Object.assign(pagination, data.pagination)
  } catch (e) { console.error(e) }
  finally { pageLoading.value = false }
}

async function handleDelete(id) {
  try {
    await api.delete(`/dashboard/notifications/${id}`)
    notifications.value = notifications.value.filter(n => n.id !== id)
    pagination.total = Math.max(0, pagination.total - 1)
  } catch (e) { console.error(e) }
}

onMounted(() => loadNotifications(1))
</script>
