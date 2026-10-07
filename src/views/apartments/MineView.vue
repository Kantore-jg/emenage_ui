<template>
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2><i class="fas fa-building"></i> {{ $t('apartments.myApartments') }}</h2>
    <router-link to="/apartments/create" class="btn btn-primary">
      <i class="fas fa-plus"></i> {{ $t('apartments.addApartment') }}
    </router-link>
  </div>

  <div class="card">
    <div class="card-header">
      <i class="fas fa-list"></i> {{ $t('apartments.myApartments') }}
      <span class="badge bg-primary ms-1">{{ apartments.length }}</span>
    </div>
    <div class="card-body">
      <div v-if="loading" class="text-center py-4">
        <div class="spinner-border spinner-border-sm text-primary"></div> {{ $t('common.loading') }}
      </div>

      <template v-else-if="apartments.length > 0">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>{{ $t('apartments.avenue') }}</th>
                <th>{{ $t('apartments.number') }}</th>
                <th>{{ $t('apartments.zone') }}</th>
                <th>{{ $t('apartments.description') }}</th>
                <th>{{ $t('apartments.householdsCount') }}</th>
                <th>{{ $t('common.date') }}</th>
                <th>{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="apt in apartments" :key="apt.id">
                <td>
                  <span class="badge bg-info"><i class="fas fa-road"></i> {{ apt.avenue }}</span>
                </td>
                <td>N°{{ apt.numero }}</td>
                <td><small>{{ apt.geographic_area?.name || '—' }}</small></td>
                <td><small class="text-muted">{{ apt.description || '—' }}</small></td>
                <td><span class="badge bg-primary">{{ apt.households_count || 0 }}</span></td>
                <td><small>{{ formatDate(apt.created_at) }}</small></td>
                <td>
                  <div class="d-flex gap-1">
                    <button type="button" class="btn btn-sm btn-outline-primary" @click="editApt(apt)" :title="$t('common.edit')">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-danger" @click="deleteApt(apt)" :title="$t('common.delete')">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <div v-else class="alert alert-info mb-0">
        <i class="fas fa-info-circle"></i> {{ $t('apartments.noOwnApartment') }}
        <router-link to="/apartments/create" class="alert-link">{{ $t('apartments.addApartment') }}</router-link>
      </div>
    </div>
  </div>

  <!-- Modal édition -->
  <div class="modal fade" id="editAptModal" tabindex="-1" ref="editModalEl">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title"><i class="fas fa-edit"></i> {{ $t('apartments.editTitle') }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <form @submit.prevent="updateApt">
          <div class="modal-body">
            <div v-if="editError" class="alert alert-danger py-2">
              <i class="fas fa-exclamation-circle"></i> {{ editError }}
            </div>
            <div class="mb-3">
              <label class="form-label">{{ $t('apartments.avenue') }} *</label>
              <input v-model="editForm.avenue" type="text" class="form-control" required>
            </div>
            <div class="mb-3">
              <label class="form-label">{{ $t('apartments.number') }} *</label>
              <input v-model="editForm.numero" type="text" class="form-control" required>
            </div>
            <div class="mb-3">
              <label class="form-label">{{ $t('apartments.description') }}</label>
              <textarea v-model="editForm.description" class="form-control" rows="2"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{{ $t('common.cancel') }}</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
              {{ $t('common.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Modal } from 'bootstrap'
import { useI18n } from 'vue-i18n'
import api from '../../services/api'

const { t } = useI18n()
const apartments = ref([])
const loading = ref(false)
const saving = ref(false)
const editError = ref('')
const editModalEl = ref(null)
let editModal = null
const editForm = reactive({ id: null, avenue: '', numero: '', description: '' })

function formatDate(d) { return new Date(d).toLocaleDateString('fr-FR') }

async function loadData() {
  loading.value = true
  try {
    const { data } = await api.get('/apartments/mine')
    apartments.value = data.apartments || []
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

function editApt(apt) {
  editError.value = ''
  editForm.id = apt.id
  editForm.avenue = apt.avenue
  editForm.numero = apt.numero
  editForm.description = apt.description || ''
  if (!editModal && editModalEl.value) {
    editModal = new Modal(editModalEl.value)
  }
  editModal?.show()
}

async function updateApt() {
  editError.value = ''
  saving.value = true
  try {
    await api.put(`/apartments/${editForm.id}`, {
      avenue: editForm.avenue,
      numero: editForm.numero,
      description: editForm.description || null,
    })
    editModal?.hide()
    await loadData()
  } catch (e) {
    editError.value = e.response?.data?.message
      || e.response?.data?.errors?.numero?.[0]
      || e.response?.data?.errors?.avenue?.[0]
      || t('errors.generic')
  } finally {
    saving.value = false
  }
}

async function deleteApt(apt) {
  if (!window.confirm(t('apartments.deleteConfirm'))) return
  try {
    await api.delete(`/apartments/${apt.id}`)
    await loadData()
  } catch (e) {
    alert(e.response?.data?.message || t('errors.generic'))
  }
}

onMounted(loadData)
</script>
