<template>
  <h2 class="mb-4"><i class="fas fa-tachometer-alt"></i> {{ $t('dashboard.citizenTitle') }}</h2>

  <div v-if="!household" class="alert alert-warning">
    <i class="fas fa-exclamation-triangle"></i> {{ $t('dashboard.createHousehold') }}
  </div>

  <template v-else>
    <div class="row">
      <div class="col-md-4">
        <div class="card">
          <div class="card-header"><i class="fas fa-home"></i> {{ $t('dashboard.myHousehold') }}</div>
          <div class="card-body">
            <p><strong>{{ $t('dashboard.quarter') }}:</strong> {{ household.quartier }}</p>
            <p><strong>{{ $t('dashboard.address') }}:</strong> {{ household.adresse }}</p>
            <hr>
            <router-link to="/identity-card" class="btn btn-primary w-100">
              <i class="fas fa-id-card"></i> {{ $t('dashboard.myIdCard') }}
            </router-link>
          </div>
        </div>
      </div>

      <div class="col-md-8">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <span><i class="fas fa-users"></i> {{ $t('dashboard.permanentMembers') }}</span>
            <button class="btn btn-sm btn-light" data-bs-toggle="modal" data-bs-target="#addMemberModal">
              <i class="fas fa-plus"></i> {{ $t('common.add') }}
            </button>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>{{ $t('common.name') }}</th>
                    <th>{{ $t('dashboard.age') }}</th>
                    <th>{{ $t('common.phone') }}</th>
                    <th>{{ $t('dashboard.cni') }}</th>
                    <th>{{ $t('common.status') }}</th>
                    <th>{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="members.length === 0">
                    <td colspan="6" class="text-center text-muted">{{ $t('dashboard.noPermanent') }}</td>
                  </tr>
                  <tr v-for="m in members" :key="m.id">
                    <td>{{ m.nom }}</td>
                    <td>{{ m.age }} {{ $t('dashboard.years') }}</td>
                    <td>{{ m.telephone || '-' }}</td>
                    <td>
                      <a v-if="m.photo_cni" :href="apiBase + m.photo_cni" target="_blank">
                        <i class="fas fa-id-card text-primary"></i>
                      </a>
                      <span v-else class="text-muted">-</span>
                    </td>
                    <td>
                      <span class="badge" :class="{
                        'bg-warning text-dark': m.statut_validation === 'en_attente',
                        'bg-success': m.statut_validation === 'valide',
                        'bg-danger': m.statut_validation === 'rejete'
                      }">
                        {{ m.statut_validation === 'en_attente' ? $t('dashboard.pending') : m.statut_validation === 'valide' ? $t('dashboard.validated') : $t('dashboard.rejected') }}
                      </span>
                    </td>
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
        </div>
      </div>
    </div>

    <div class="row mt-4">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <span><i class="fas fa-user-friends"></i> {{ $t('dashboard.presentGuests') }}</span>
            <button class="btn btn-sm btn-light" data-bs-toggle="modal" data-bs-target="#addInviteModal">
              <i class="fas fa-plus"></i> {{ $t('dashboard.addGuest') }}
            </button>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>{{ $t('common.name') }}</th>
                    <th>{{ $t('dashboard.age') }}</th>
                    <th>{{ $t('common.phone') }}</th>
                    <th>{{ $t('common.status') }}</th>
                    <th>{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="invites.length === 0">
                    <td colspan="5" class="text-center text-muted">{{ $t('dashboard.noGuest') }}</td>
                  </tr>
                  <tr v-for="inv in invites" :key="inv.id">
                    <td>{{ inv.nom }}</td>
                    <td>{{ inv.age }} {{ $t('dashboard.years') }}</td>
                    <td>{{ inv.telephone || '-' }}</td>
                    <td>
                      <span class="badge" :class="inv.statut === 'present' ? 'bg-success' : 'bg-secondary'">
                        {{ inv.statut === 'present' ? $t('dashboard.present') : $t('dashboard.departed') }}
                      </span>
                    </td>
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
              <input type="text" class="form-control" v-model="memberForm.nom" required>
            </div>
            <div class="mb-3">
              <label class="form-label">{{ $t('dashboard.age') }} *</label>
              <input type="number" class="form-control" v-model="memberForm.age" required min="0">
            </div>
            <div class="mb-3">
              <label class="form-label">{{ $t('common.phone') }}</label>
              <input type="tel" class="form-control" v-model="memberForm.telephone">
            </div>
            <div class="mb-3">
              <label class="form-label">{{ $t('dashboard.cniPhoto') }}</label>
              <input type="file" class="form-control" @change="memberForm.photo_cni = $event.target.files[0]" accept="image/*">
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
              <input type="text" class="form-control" v-model="inviteForm.nom" required>
            </div>
            <div class="mb-3">
              <label class="form-label">{{ $t('dashboard.age') }} *</label>
              <input type="number" class="form-control" v-model="inviteForm.age" required min="0">
            </div>
            <div class="mb-3">
              <label class="form-label">{{ $t('common.phone') }}</label>
              <input type="tel" class="form-control" v-model="inviteForm.telephone">
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
import { useI18n } from 'vue-i18n'
import api from '../../services/api'

const { t } = useI18n()
const apiBase = 'http://localhost:8000'
const household = ref(null)
const members = ref([])
const invites = ref([])
const memberForm = reactive({ nom: '', age: '', telephone: '', photo_cni: null })
const inviteForm = reactive({ nom: '', age: '', telephone: '' })

async function loadData() {
  try {
    const { data } = await api.get('/dashboard/citoyen')
    household.value = data.household
    members.value = data.members
    invites.value = data.invites
  } catch (e) {
    console.error(e)
  }
}

async function addMember() {
  const fd = new FormData()
  fd.append('nom', memberForm.nom)
  fd.append('age', memberForm.age)
  if (memberForm.telephone) fd.append('telephone', memberForm.telephone)
  if (memberForm.photo_cni) fd.append('photo_cni', memberForm.photo_cni)
  try {
    await api.post('/household/members', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    memberForm.nom = ''; memberForm.age = ''; memberForm.telephone = ''; memberForm.photo_cni = null
    document.querySelector('#addMemberModal .btn-close').click()
    await loadData()
  } catch (e) {
    alert(e.response?.data?.message || t('errors.generic'))
  }
}

async function addInvite() {
  try {
    await api.post('/household/invites', { nom: inviteForm.nom, age: inviteForm.age, telephone: inviteForm.telephone || null })
    inviteForm.nom = ''; inviteForm.age = ''; inviteForm.telephone = ''
    document.querySelector('#addInviteModal .btn-close').click()
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
  if (!confirm(t('dashboard.deleteMemberConfirm'))) return
  try {
    await api.delete(`/household/members/${id}`)
    await loadData()
  } catch (e) {
    alert(e.response?.data?.message || t('errors.generic'))
  }
}

onMounted(loadData)
</script>
