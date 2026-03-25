<template>
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2><i class="fas fa-history"></i> {{ $t('payments.title') }}</h2>
    <router-link to="/payments/create" class="btn btn-primary"><i class="fas fa-plus"></i> {{ $t('payments.register') }}</router-link>
  </div>

  <div v-if="$route.query.success" class="alert alert-success alert-dismissible fade show">
    {{ $t('payments.successMessage') }}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  </div>

  <div class="card mb-4">
    <div class="card-body py-3">
      <form @submit.prevent="loadPayments(1)" class="row g-2 align-items-end">
        <div class="col-md-2">
          <label class="form-label small">{{ $t('common.status') }}</label>
          <select class="form-select form-select-sm" v-model="filters.statut_validation">
            <option value="">{{ $t('payments.allStatuses') }}</option>
            <option value="en_attente">{{ $t('payments.statusPending') }}</option>
            <option value="valide">{{ $t('payments.statusValidated') }}</option>
            <option value="rejete">{{ $t('payments.statusRejected') }}</option>
          </select>
        </div>
        <div class="col-md-2">
          <label class="form-label small">{{ $t('payments.reason') }}</label>
          <select class="form-select form-select-sm" v-model="filters.motif">
            <option value="">{{ $t('payments.allReasons') }}</option>
            <option value="poubelles">{{ $t('payments.garbage') }}</option>
            <option value="regideso">Regideso</option>
            <option value="eau">{{ $t('payments.water') }}</option>
            <option value="autre">{{ $t('payments.other') }}</option>
          </select>
        </div>
        <div class="col-md-2">
          <label class="form-label small">{{ $t('common.from') }}</label>
          <input type="date" class="form-control form-control-sm" v-model="filters.date_from">
        </div>
        <div class="col-md-2">
          <label class="form-label small">{{ $t('common.to') }}</label>
          <input type="date" class="form-control form-control-sm" v-model="filters.date_to">
        </div>
        <div class="col-md-2 d-flex gap-1">
          <button type="submit" class="btn btn-sm btn-primary"><i class="fas fa-search"></i></button>
          <button type="button" class="btn btn-sm btn-secondary" @click="resetFilters"><i class="fas fa-times"></i></button>
        </div>
        <div class="col-md-2 text-end">
          <span class="badge bg-primary">{{ pagination.total }} {{ $t('payments.count') }}</span>
        </div>
      </form>
    </div>
  </div>

  <div class="card shadow-sm">
    <div class="card-body p-0">
      <div v-if="loading" class="text-center py-4">
        <div class="spinner-border spinner-border-sm text-primary"></div> {{ $t('common.loading') }}
      </div>
      <div v-else class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="bg-light"><tr><th>{{ $t('payments.reason') }}</th><th>{{ $t('payments.amount') }}</th><th>{{ $t('payments.paymentDate') }}</th><th>{{ $t('payments.registrationDate') }}</th><th>{{ $t('payments.status') }}</th><th>{{ $t('payments.receipt') }}</th></tr></thead>
          <tbody>
            <template v-if="payments.length > 0">
              <tr v-for="p in payments" :key="p.id">
                <td><strong>{{ p.motif === 'autre' ? p.motif_autre : p.motif.toUpperCase() }}</strong></td>
                <td>{{ p.montant }} FBU</td>
                <td>{{ formatDate(p.date_paiement) }}</td>
                <td>{{ new Date(p.created_at).toLocaleString('fr-FR') }}</td>
                <td>
                  <span class="badge rounded-pill" :class="{'bg-warning text-dark': p.statut_validation==='en_attente', 'bg-success': p.statut_validation==='valide', 'bg-danger': p.statut_validation==='rejete'}">
                    {{ p.statut_validation === 'en_attente' ? $t('payments.statusPending') : p.statut_validation === 'valide' ? $t('payments.statusValidated') : $t('payments.statusRejected') }}
                  </span>
                </td>
                <td><a :href="apiBase + p.recu_photo" target="_blank" class="btn btn-sm btn-outline-info"><i class="fas fa-image"></i> {{ $t('common.view') }}</a></td>
              </tr>
            </template>
            <tr v-else><td colspan="6" class="text-center py-4 text-muted"><i class="fas fa-info-circle me-1"></i> {{ $t('payments.noPayment') }}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="card-footer bg-white border-top-0">
      <AppPagination :pagination="pagination" @page-change="loadPayments" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../../services/api'
import AppPagination from '../../components/AppPagination.vue'

const route = useRoute()
const apiBase = 'http://localhost:8000'
const payments = ref([])
const loading = ref(false)
const filters = reactive({ statut_validation: '', motif: '', date_from: '', date_to: '' })
const pagination = reactive({ current_page: 1, last_page: 1, per_page: 15, total: 0, from: 0, to: 0 })

function formatDate(d) { return new Date(d).toLocaleDateString('fr-FR') }

async function loadPayments(page = 1) {
  loading.value = true
  try {
    const params = { page, per_page: 15 }
    if (filters.statut_validation) params.statut_validation = filters.statut_validation
    if (filters.motif) params.motif = filters.motif
    if (filters.date_from) params.date_from = filters.date_from
    if (filters.date_to) params.date_to = filters.date_to
    const { data } = await api.get('/payments', { params })
    payments.value = data.payments || []
    if (data.pagination) Object.assign(pagination, data.pagination)
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

function resetFilters() {
  filters.statut_validation = ''
  filters.motif = ''
  filters.date_from = ''
  filters.date_to = ''
  loadPayments(1)
}

onMounted(() => loadPayments(1))
</script>
