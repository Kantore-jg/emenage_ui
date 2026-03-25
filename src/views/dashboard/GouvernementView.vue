<template>
  <h2 class="mb-4"><i class="fas fa-tachometer-alt"></i> {{ $t('dashboard.govTitle') }}</h2>

  <div class="row">
    <div class="col-12">
      <div class="card">
        <div class="card-header"><i class="fas fa-clock"></i> {{ $t('dashboard.pendingValidations') }}</div>
        <div class="card-body" style="max-height: 500px; overflow-y: auto;">
          <template v-if="nouveauxMembres.length > 0">
            <div v-for="m in nouveauxMembres" :key="m.id" class="card mb-2">
              <div class="card-body">
                <h6>{{ m.nom }} - {{ m.age }} {{ $t('dashboard.years') }}</h6>
                <p class="mb-1">
                  <span class="badge" :class="m.type === 'permanent' ? 'bg-primary' : 'bg-warning'">
                    {{ m.type === 'permanent' ? $t('dashboard.permanentMember') : $t('dashboard.guest') }}
                  </span>
                  <span class="badge bg-warning"><i class="fas fa-clock"></i> {{ $t('dashboard.pending') }}</span>
                </p>
                <small class="text-muted">
                  <i class="fas fa-home"></i> {{ m.quartier }}<br>
                  <i class="fas fa-user"></i> {{ $t('dashboard.chief') }}: {{ m.chef_nom }}<br>
                  <template v-if="m.telephone"><i class="fas fa-phone"></i> {{ m.telephone }}<br></template>
                  <i class="fas fa-clock"></i> {{ new Date(m.created_at).toLocaleString('fr-FR') }}
                </small>
                <div class="mt-2">
                  <button class="btn btn-sm btn-success" @click="validateMember(m.id, 'valider')">
                    <i class="fas fa-check"></i> {{ $t('common.validate') }}
                  </button>
                  <button class="btn btn-sm btn-danger" @click="validateMember(m.id, 'rejeter')">
                    <i class="fas fa-times"></i> {{ $t('common.reject') }}
                  </button>
                  <a v-if="m.photo_cni" :href="apiBase + m.photo_cni" target="_blank" class="btn btn-sm btn-info">
                    <i class="fas fa-id-card"></i> {{ $t('dashboard.viewCni') }}
                  </a>
                </div>
              </div>
            </div>
          </template>
          <p v-else class="text-muted">{{ $t('dashboard.noPendingReg') }}</p>
        </div>
      </div>
    </div>
  </div>

  <div class="row mt-4">
    <div class="col-12">
      <div class="card">
        <div class="card-header"><i class="fas fa-file-invoice-dollar"></i> {{ $t('dashboard.pendingPayments') }}</div>
        <div class="card-body">
          <template v-if="nouveauxPaiements.length > 0">
            <div v-for="p in nouveauxPaiements" :key="p.id" class="card mb-2">
              <div class="card-body d-flex justify-content-between align-items-center">
                <div>
                  <strong>{{ p.motif === 'autre' ? p.motif_autre : p.motif.toUpperCase() }}</strong> - {{ p.montant }} FBU<br>
                  <small class="text-muted">{{ $t('dashboard.chief') }}: {{ p.chef_nom }} | {{ $t('dashboard.quarter') }}: {{ p.quartier }} | {{ new Date(p.date_paiement).toLocaleDateString('fr-FR') }}</small>
                </div>
                <div>
                  <a v-if="p.recu_photo" :href="apiBase + p.recu_photo" target="_blank" class="btn btn-sm btn-info me-1"><i class="fas fa-image"></i></a>
                  <button class="btn btn-sm btn-success me-1" @click="validatePayment(p.id, 'valider')"><i class="fas fa-check"></i></button>
                  <button class="btn btn-sm btn-danger" @click="validatePayment(p.id, 'rejeter')"><i class="fas fa-times"></i></button>
                </div>
              </div>
            </div>
          </template>
          <p v-else class="text-muted">{{ $t('dashboard.noPendingPay') }}</p>
        </div>
      </div>
    </div>
  </div>

  <div class="row mt-4">
    <div class="col-12">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span><i class="fas fa-bullhorn"></i> {{ $t('dashboard.quickActions') }}</span>
          <button class="btn btn-sm btn-outline-success" @click="showPdfModal = true">
            <i class="fas fa-file-pdf"></i> {{ $t('dashboard.exportPdf') }}
          </button>
        </div>
        <div class="card-body">
          <router-link to="/announcements/create" class="btn btn-primary me-2"><i class="fas fa-plus"></i> {{ $t('dashboard.publishAnnouncement') }}</router-link>
          <router-link to="/announcements" class="btn btn-secondary me-2"><i class="fas fa-list"></i> {{ $t('dashboard.viewAllAnnouncements') }}</router-link>
          <router-link to="/households" class="btn btn-info"><i class="fas fa-home"></i> {{ $t('dashboard.viewHouseholds') }}</router-link>
        </div>
      </div>
    </div>
  </div>

  <!-- PDF Export Modal -->
  <div v-if="showPdfModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title"><i class="fas fa-file-pdf"></i> {{ $t('exportPdf.title') }}</h5>
          <button type="button" class="btn-close" @click="showPdfModal = false"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label">{{ $t('dashboard.pdfPeriodFrom') }}</label>
            <input type="date" class="form-control" v-model="pdfDateFrom">
          </div>
          <div class="mb-3">
            <label class="form-label">{{ $t('dashboard.pdfPeriodTo') }}</label>
            <input type="date" class="form-control" v-model="pdfDateTo">
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showPdfModal = false">{{ $t('common.cancel') }}</button>
          <button type="button" class="btn btn-primary" @click="downloadPdf" :disabled="pdfLoading">
            <span v-if="pdfLoading" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="fas fa-download me-1"></i>
            {{ $t('exportPdf.generate') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../services/api'

const apiBase = 'http://localhost:8000'
const nouveauxMembres = ref([])
const nouveauxPaiements = ref([])
const showPdfModal = ref(false)
const pdfDateFrom = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
const pdfDateTo = ref(new Date().toISOString().split('T')[0])
const pdfLoading = ref(false)

async function loadData() {
  try {
    const { data } = await api.get('/dashboard/gouvernement')
    nouveauxMembres.value = data.nouveauxMembres
    nouveauxPaiements.value = data.nouveauxPaiements
  } catch (e) {
    console.error(e)
  }
}

async function validateMember(id, action) {
  try {
    await api.put(`/validation/members/${id}`, { action })
    await loadData()
  } catch (e) {
    alert(e.response?.data?.message || 'Erreur')
  }
}

async function validatePayment(id, action) {
  try {
    await api.put(`/payments/${id}/validate`, { action })
    await loadData()
  } catch (e) {
    alert(e.response?.data?.message || 'Erreur')
  }
}

async function downloadPdf() {
  pdfLoading.value = true
  try {
    const response = await api.get('/export/zone-report', {
      params: { date_from: pdfDateFrom.value, date_to: pdfDateTo.value },
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `rapport-zone-${pdfDateFrom.value}-${pdfDateTo.value}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    showPdfModal.value = false
  } catch (e) {
    alert(e.response?.data?.message || 'Erreur')
  } finally {
    pdfLoading.value = false
  }
}

onMounted(loadData)
</script>
