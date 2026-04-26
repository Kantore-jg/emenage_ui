<template>
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2><i class="fas fa-building"></i> {{ $t('apartments.myApartments') }}</h2>
    <router-link to="/apartments/create" class="btn btn-primary">
      <i class="fas fa-plus"></i> {{ $t('apartments.addApartment') }}
    </router-link>
  </div>

  <div v-if="loading" class="text-center py-4">
    <div class="spinner-border spinner-border-sm text-primary"></div> {{ $t('common.loading') }}
  </div>

  <template v-else-if="apartments.length > 0">
    <div class="row">
      <div v-for="apt in apartments" :key="apt.id" class="col-md-6 col-lg-4 mb-4">
        <div class="card h-100">
          <div class="card-header d-flex justify-content-between align-items-center">
            <span><i class="fas fa-building text-primary"></i> N°{{ apt.numero }}</span>
            <div class="dropdown">
              <button class="btn btn-sm btn-light" data-bs-toggle="dropdown">
                <i class="fas fa-ellipsis-v"></i>
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li>
                  <button class="dropdown-item" @click="editApt(apt)">
                    <i class="fas fa-edit"></i> {{ $t('common.edit') }}
                  </button>
                </li>
                <li>
                  <button class="dropdown-item text-danger" @click="deleteApt(apt)">
                    <i class="fas fa-trash"></i> {{ $t('common.delete') }}
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div class="card-body">
            <p><strong><i class="fas fa-road"></i> {{ $t('apartments.avenue') }}:</strong> {{ apt.avenue }}</p>
            <p><strong><i class="fas fa-map-marker-alt"></i> {{ $t('apartments.zone') }}:</strong> {{ apt.geographic_area?.name }}</p>
            <p v-if="apt.description" class="text-muted small">{{ apt.description }}</p>
            <hr>
            <div class="d-flex justify-content-between align-items-center">
              <span class="badge bg-primary"><i class="fas fa-home"></i> {{ apt.households_count || 0 }} {{ $t('nav.households') }}</span>
              <small class="text-muted">{{ formatDate(apt.created_at) }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>

  <div v-else class="alert alert-info">
    <i class="fas fa-info-circle"></i> {{ $t('apartments.noOwnApartment') }}
    <router-link to="/apartments/create" class="alert-link">{{ $t('apartments.addApartment') }}</router-link>
  </div>

  <!-- Modal édition -->
  <div class="modal fade" id="editAptModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title"><i class="fas fa-edit"></i> {{ $t('apartments.editTitle') }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <form @submit.prevent="updateApt">
          <div class="modal-body">
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
            <button type="submit" class="btn btn-primary">{{ $t('common.save') }}</button>
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
const apartments = ref([])
const loading = ref(false)
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
  editForm.id = apt.id
  editForm.avenue = apt.avenue
  editForm.numero = apt.numero
  editForm.description = apt.description || ''
  const modal = new window.bootstrap.Modal(document.getElementById('editAptModal'))
  modal.show()
}

async function updateApt() {
  try {
    await api.put(`/apartments/${editForm.id}`, {
      avenue: editForm.avenue,
      numero: editForm.numero,
      description: editForm.description || null,
    })
    document.querySelector('#editAptModal .btn-close')?.click()
    await loadData()
  } catch (e) {
    alert(e.response?.data?.message || t('errors.generic'))
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
