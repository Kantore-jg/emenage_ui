<template>
  <template v-if="household">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2><i class="fas fa-home"></i> {{ $t('households.details') }}</h2>
      <router-link to="/households" class="btn btn-secondary"><i class="fas fa-arrow-left"></i> {{ $t('common.back') }}</router-link>
    </div>

    <div class="row">
      <div class="col-md-4">
        <div class="card">
          <div class="card-header"><i class="fas fa-info-circle"></i> {{ $t('households.information') }}</div>
          <div class="card-body">
            <div class="text-center mb-3">
              <img v-if="household.chef?.photo_profil" :src="apiBase + household.chef.photo_profil" class="rounded-circle" style="width: 100px; height: 100px; object-fit: cover;">
              <div v-else class="rounded-circle bg-secondary d-inline-flex align-items-center justify-content-center" style="width: 100px; height: 100px;">
                <i class="fas fa-user fa-3x text-white"></i>
              </div>
              <h5 class="mt-2">{{ household.chef?.nom }}</h5>
              <p class="text-muted">{{ $t('households.headOfFamily') }}</p>
            </div>
            <hr>
            <p><strong><i class="fas fa-map-marker-alt"></i> {{ $t('households.quarter') }}:</strong><br><span class="badge bg-info">{{ household.quartier }}</span></p>
            <p><strong><i class="fas fa-home"></i> {{ $t('households.address') }}:</strong><br>{{ household.adresse }}</p>
            <p><strong><i class="fas fa-phone"></i> {{ $t('common.phone') }}:</strong><br>{{ household.chef?.telephone }}</p>
            <p><strong><i class="fas fa-calendar"></i> {{ $t('common.date') }}:</strong><br>{{ formatDate(household.created_at) }}</p>
          </div>
        </div>

        <div class="card mt-3">
          <div class="card-header"><i class="fas fa-chart-bar"></i> {{ $t('households.statistics') }}</div>
          <div class="card-body">
            <div class="row text-center">
              <div class="col-6 mb-3"><div class="border rounded p-2"><h4 class="text-primary">{{ stats.total_membres }}</h4><small>{{ $t('households.totalMembers') }}</small></div></div>
              <div class="col-6 mb-3"><div class="border rounded p-2"><h4 class="text-success">{{ stats.membres_valides }}</h4><small>{{ $t('households.validated') }}</small></div></div>
              <div class="col-6 mb-3"><div class="border rounded p-2"><h4 class="text-warning">{{ stats.membres_en_attente }}</h4><small>{{ $t('households.pendingLabel') }}</small></div></div>
              <div class="col-6 mb-3"><div class="border rounded p-2"><h4 class="text-success">{{ stats.paiements_valides }}</h4><small>{{ $t('households.validatedPayments') }}</small></div></div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-8">
        <ul class="nav nav-tabs mb-3">
          <li class="nav-item"><button class="nav-link" :class="{ active: tab === 'members' }" @click="tab = 'members'"><i class="fas fa-users me-1"></i> {{ $t('households.totalMembers') }}</button></li>
          <li class="nav-item"><button class="nav-link" :class="{ active: tab === 'payments' }" @click="tab = 'payments'"><i class="fas fa-file-invoice-dollar me-1"></i> {{ $t('home.payments') }}</button></li>
        </ul>

        <div v-if="tab === 'members'">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <span><i class="fas fa-users"></i> {{ $t('households.permanentMembers') }}</span>
              <button class="btn btn-sm btn-light" data-bs-toggle="modal" data-bs-target="#addMemberModal">
                <i class="fas fa-plus"></i> {{ $t('common.add') }}
              </button>
            </div>
            <div class="card-body">
              <table class="table table-hover">
                <thead><tr><th>{{ $t('common.name') }}</th><th>{{ $t('dashboard.age') }}</th><th>{{ $t('common.phone') }}</th><th>{{ $t('dashboard.cni') }}</th><th>{{ $t('dashboard.validation') }}</th><th>{{ $t('common.actions') }}</th></tr></thead>
                <tbody>
                  <tr v-if="members.length === 0">
                    <td colspan="6" class="text-center text-muted">{{ $t('dashboard.noPermanent') }}</td>
                  </tr>
                  <tr v-for="m in members" :key="m.id">
                    <td>{{ m.nom }}</td><td>{{ m.age }} {{ $t('dashboard.years') }}</td><td>{{ m.telephone || '-' }}</td>
                    <td>
                      <a v-if="m.photo_cni" :href="apiBase + m.photo_cni" target="_blank" class="btn btn-sm btn-outline-info">
                        <i class="fas fa-id-card"></i>
                      </a>
                      <span v-else class="text-muted">-</span>
                    </td>
                    <td><span class="badge" :class="{'bg-warning text-dark': m.statut_validation==='en_attente', 'bg-success': m.statut_validation==='valide', 'bg-danger': m.statut_validation==='rejete'}">{{ m.statut_validation }}</span></td>
                    <td>
                      <button class="btn btn-sm btn-danger" @click="deleteMember(m.id)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="card mt-3">
            <div class="card-header d-flex justify-content-between align-items-center">
              <span><i class="fas fa-user-friends"></i> {{ $t('households.guests') }}</span>
              <button class="btn btn-sm btn-light" data-bs-toggle="modal" data-bs-target="#addInviteModal">
                <i class="fas fa-plus"></i> {{ $t('dashboard.addGuest') }}
              </button>
            </div>
            <div class="card-body">
              <table class="table table-hover">
                <thead><tr><th>{{ $t('common.name') }}</th><th>{{ $t('dashboard.age') }}</th><th>{{ $t('common.phone') }}</th><th>{{ $t('common.status') }}</th><th>{{ $t('common.actions') }}</th></tr></thead>
                <tbody>
                  <tr v-if="invitesData.length === 0">
                    <td colspan="5" class="text-center text-muted">{{ $t('dashboard.noGuest') }}</td>
                  </tr>
                  <tr v-for="inv in invitesData" :key="inv.id">
                    <td>{{ inv.nom }}</td><td>{{ inv.age }} {{ $t('dashboard.years') }}</td><td>{{ inv.telephone || '-' }}</td>
                    <td><span class="badge" :class="inv.statut==='present' ? 'bg-success' : 'bg-secondary'">{{ inv.statut }}</span></td>
                    <td>
                      <button v-if="inv.statut === 'present'" class="btn btn-sm btn-warning" @click="markDeparted(inv.id)">
                        <i class="fas fa-sign-out-alt"></i> {{ $t('dashboard.departed') }}
                      </button>
                      <button class="btn btn-sm btn-danger ms-1" @click="deleteMember(inv.id)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div v-if="tab === 'payments'">
          <div class="card">
            <div class="card-header"><i class="fas fa-file-invoice-dollar"></i> {{ $t('households.paymentHistory') }}</div>
            <div class="card-body">
              <table class="table table-hover">
                <thead><tr><th>{{ $t('households.reason') }}</th><th>{{ $t('households.amount') }}</th><th>{{ $t('common.date') }}</th><th>{{ $t('common.status') }}</th><th>{{ $t('households.receipt') }}</th></tr></thead>
                <tbody>
                  <tr v-for="p in payments" :key="p.id">
                    <td>{{ p.motif === 'autre' ? p.motif_autre : p.motif.toUpperCase() }}</td>
                    <td>{{ p.montant }} FBU</td>
                    <td>{{ formatDate(p.date_paiement) }}</td>
                    <td><span class="badge" :class="{'bg-warning text-dark': p.statut_validation==='en_attente', 'bg-success': p.statut_validation==='valide', 'bg-danger': p.statut_validation==='rejete'}">{{ p.statut_validation }}</span></td>
                    <td><a v-if="p.recu_photo" :href="apiBase + p.recu_photo" target="_blank" class="btn btn-sm btn-outline-info"><i class="fas fa-image"></i></a></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>

  <div class="modal fade" id="addMemberModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title"><i class="fas fa-user-plus"></i> {{ $t('dashboard.addMember') }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <form @submit.prevent="addMember">
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">{{ $t('dashboard.fullName') }} *</label>
              <input v-model="memberForm.nom" type="text" class="form-control" required>
            </div>
            <div class="mb-3">
              <label class="form-label">{{ $t('dashboard.age') }} *</label>
              <input v-model="memberForm.age" type="number" class="form-control" min="0" required>
            </div>
            <div class="mb-3">
              <label class="form-label">{{ $t('common.phone') }}</label>
              <input v-model="memberForm.telephone" type="tel" class="form-control">
            </div>
            <div class="mb-3">
              <label class="form-label">{{ $t('dashboard.cniPhoto') }}</label>
              <input type="file" class="form-control" accept="image/*" @change="memberForm.photo_cni = $event.target.files[0]">
              <small class="text-muted">{{ $t('dashboard.cniRequired') }}</small>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{{ $t('common.cancel') }}</button>
            <button type="submit" class="btn btn-primary">{{ $t('common.add') }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <div class="modal fade" id="addInviteModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title"><i class="fas fa-user-friends"></i> {{ $t('dashboard.addGuest') }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <form @submit.prevent="addInvite">
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">{{ $t('dashboard.fullName') }} *</label>
              <input v-model="inviteForm.nom" type="text" class="form-control" required>
            </div>
            <div class="mb-3">
              <label class="form-label">{{ $t('dashboard.age') }} *</label>
              <input v-model="inviteForm.age" type="number" class="form-control" min="0" required>
            </div>
            <div class="mb-3">
              <label class="form-label">{{ $t('common.phone') }}</label>
              <input v-model="inviteForm.telephone" type="tel" class="form-control">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{{ $t('common.cancel') }}</button>
            <button type="submit" class="btn btn-primary">{{ $t('common.add') }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '../../services/api'

const { t } = useI18n()
const route = useRoute()
const apiBase = 'http://localhost:8000'
const household = ref(null)
const members = ref([])
const invitesData = ref([])
const payments = ref([])
const stats = ref({})
const tab = ref('members')
const memberForm = reactive({ nom: '', age: '', telephone: '', photo_cni: null })
const inviteForm = reactive({ nom: '', age: '', telephone: '' })

function formatDate(d) { return new Date(d).toLocaleDateString('fr-FR') }

async function loadData() {
  try {
    const { data } = await api.get(`/households/${route.params.id}`)
    household.value = data.household
    members.value = data.members
    invitesData.value = data.invites
    payments.value = data.payments
    stats.value = data.stats
  } catch (e) { console.error(e) }
}

async function addMember() {
  const fd = new FormData()
  fd.append('household_id', route.params.id)
  fd.append('nom', memberForm.nom)
  fd.append('age', memberForm.age)
  if (memberForm.telephone) fd.append('telephone', memberForm.telephone)
  if (memberForm.photo_cni) fd.append('photo_cni', memberForm.photo_cni)

  try {
    await api.post('/household/members', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    memberForm.nom = ''
    memberForm.age = ''
    memberForm.telephone = ''
    memberForm.photo_cni = null
    document.querySelector('#addMemberModal .btn-close')?.click()
    await loadData()
  } catch (e) {
    alert(e.response?.data?.message || t('errors.generic'))
  }
}

async function addInvite() {
  try {
    await api.post('/household/invites', {
      household_id: route.params.id,
      nom: inviteForm.nom,
      age: inviteForm.age,
      telephone: inviteForm.telephone || null,
    })
    inviteForm.nom = ''
    inviteForm.age = ''
    inviteForm.telephone = ''
    document.querySelector('#addInviteModal .btn-close')?.click()
    await loadData()
  } catch (e) {
    alert(e.response?.data?.message || t('errors.generic'))
  }
}

async function markDeparted(id) {
  try {
    await api.put(`/household/invites/${id}`, { statut: 'parti' })
    await loadData()
  } catch (e) {
    alert(e.response?.data?.message || t('errors.generic'))
  }
}

async function deleteMember(id) {
  if (!window.confirm(t('dashboard.deleteMemberConfirm'))) return

  try {
    await api.delete(`/household/members/${id}`)
    await loadData()
  } catch (e) {
    alert(e.response?.data?.message || t('errors.generic'))
  }
}

onMounted(loadData)
</script>
