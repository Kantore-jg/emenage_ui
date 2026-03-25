<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2><i class="fas fa-calendar-alt"></i> {{ $t('calendar.title') }}</h2>
      <button v-if="isAuthority" class="btn btn-primary" @click="openCreateModal">
        <i class="fas fa-plus"></i> {{ $t('calendar.newEvent') }}
      </button>
    </div>

    <div class="card mb-4 shadow-sm border-0">
      <div class="card-body py-3">
        <div class="row g-2 align-items-end">
          <div class="col-md-3">
            <label class="form-label small">{{ $t('calendar.filterType') }}</label>
            <select class="form-select form-select-sm" v-model="filters.type" @change="loadEvents">
              <option value="">{{ $t('calendar.allTypes') }}</option>
              <option v-for="t in eventTypes" :key="t" :value="t">{{ $t('calendar.type_' + t) }}</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label small">{{ $t('calendar.month') }}</label>
            <select class="form-select form-select-sm" v-model="filters.month" @change="loadEvents">
              <option value="">{{ $t('common.all') }}</option>
              <option v-for="m in 12" :key="m" :value="m">{{ monthName(m) }}</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label small">{{ $t('calendar.year') }}</label>
            <select class="form-select form-select-sm" v-model="filters.year" @change="loadEvents">
              <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5"><div class="spinner-border text-primary"></div></div>

    <div v-else-if="events.length === 0" class="text-center py-5 text-muted">
      <i class="fas fa-calendar-times fa-3x mb-3 d-block"></i>
      {{ $t('calendar.noEvent') }}
    </div>

    <div v-else>
      <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
        <div v-for="ev in events" :key="ev.id" class="col">
          <div class="card h-100 shadow-sm border-0">
            <div class="card-header bg-white d-flex justify-content-between align-items-center">
              <span class="badge" :class="typeBadge(ev.type)">
                <i :class="typeIcon(ev.type)"></i> {{ $t('calendar.type_' + ev.type) }}
              </span>
              <small class="text-muted">{{ formatDate(ev.date_debut) }}</small>
            </div>
            <div class="card-body">
              <h6 class="card-title">{{ ev.titre }}</h6>
              <p v-if="ev.description" class="card-text small text-muted">{{ ev.description }}</p>
              <div class="small">
                <p v-if="ev.lieu" class="mb-1"><i class="fas fa-map-marker-alt text-danger"></i> {{ ev.lieu }}</p>
                <p v-if="ev.date_fin" class="mb-1"><i class="fas fa-calendar-check text-success"></i> {{ $t('calendar.until') }} {{ formatDate(ev.date_fin) }}</p>
                <p v-if="ev.geographic_area" class="mb-1"><i class="fas fa-globe-africa text-info"></i> {{ ev.geographic_area.name }}</p>
                <p class="mb-0 text-muted"><i class="fas fa-user"></i> {{ ev.creator?.nom || '-' }}</p>
              </div>
            </div>
            <div v-if="isAuthority && canManage(ev)" class="card-footer bg-white border-top-0 d-flex gap-1">
              <button class="btn btn-sm btn-outline-primary" @click="openEditModal(ev)">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger" @click="deleteEvent(ev.id)">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="eventModal" tabindex="-1" ref="eventModalEl">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-calendar-plus"></i>
              {{ editingEvent ? $t('calendar.editEvent') : $t('calendar.newEvent') }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="submitEvent">
            <div class="modal-body">
              <div v-if="formError" class="alert alert-danger small">{{ formError }}</div>
              <div class="mb-3">
                <label class="form-label">{{ $t('calendar.eventTitle') }} *</label>
                <input type="text" class="form-control" v-model="eventForm.titre" required>
              </div>
              <div class="mb-3">
                <label class="form-label">{{ $t('calendar.description') }}</label>
                <textarea class="form-control" v-model="eventForm.description" rows="3"></textarea>
              </div>
              <div class="row mb-3">
                <div class="col-6">
                  <label class="form-label">{{ $t('calendar.startDate') }} *</label>
                  <input type="date" class="form-control" v-model="eventForm.date_debut" required>
                </div>
                <div class="col-6">
                  <label class="form-label">{{ $t('calendar.endDate') }}</label>
                  <input type="date" class="form-control" v-model="eventForm.date_fin">
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">{{ $t('calendar.eventType') }} *</label>
                <select class="form-select" v-model="eventForm.type" required>
                  <option v-for="t in eventTypes" :key="t" :value="t">{{ $t('calendar.type_' + t) }}</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">{{ $t('calendar.location') }}</label>
                <input type="text" class="form-control" v-model="eventForm.lieu" :placeholder="$t('calendar.locationPlaceholder')">
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{{ $t('common.cancel') }}</button>
              <button type="submit" class="btn btn-primary" :disabled="formLoading">
                <span v-if="formLoading" class="spinner-border spinner-border-sm me-1"></span>
                {{ editingEvent ? $t('common.save') : $t('common.create') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Modal } from 'bootstrap'
import api from '../../services/api'

const { t } = useI18n()
const events = ref([])
const loading = ref(true)
const formError = ref('')
const formLoading = ref(false)
const eventModalEl = ref(null)
const editingEvent = ref(null)
let modal = null

const user = JSON.parse(localStorage.getItem('user') || '{}')
const authorityRoles = ['collinaire', 'zonal', 'communal', 'provincial', 'ministere', 'admin']
const isAuthority = computed(() => authorityRoles.includes(user?.role))

const eventTypes = ['reunion', 'vaccination', 'marche', 'ceremonie', 'sport', 'formation', 'autre']
const currentYear = new Date().getFullYear()
const years = [currentYear - 1, currentYear, currentYear + 1]

const filters = reactive({ type: '', month: '', year: currentYear })
const eventForm = reactive({ titre: '', description: '', date_debut: '', date_fin: '', lieu: '', type: 'autre' })

function monthName(m) {
  return new Date(2026, m - 1).toLocaleString('fr-FR', { month: 'long' })
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function typeBadge(type) {
  const map = { reunion: 'bg-primary', vaccination: 'bg-success', marche: 'bg-info', ceremonie: 'bg-warning text-dark', sport: 'bg-danger', formation: 'bg-secondary', autre: 'bg-dark' }
  return map[type] || 'bg-dark'
}

function typeIcon(type) {
  const map = { reunion: 'fas fa-handshake', vaccination: 'fas fa-syringe', marche: 'fas fa-store', ceremonie: 'fas fa-church', sport: 'fas fa-futbol', formation: 'fas fa-graduation-cap', autre: 'fas fa-calendar-day' }
  return map[type] || 'fas fa-calendar-day'
}

function canManage(ev) {
  return ev.created_by === user?.id || ['admin', 'ministere'].includes(user?.role)
}

async function loadEvents() {
  loading.value = true
  try {
    const params = {}
    if (filters.type) params.type = filters.type
    if (filters.month) params.month = filters.month
    if (filters.year) params.year = filters.year
    const { data } = await api.get('/events', { params })
    events.value = data.events || []
  } catch (e) {
    console.error(e)
  } finally { loading.value = false }
}

function openCreateModal() {
  editingEvent.value = null
  Object.assign(eventForm, { titre: '', description: '', date_debut: '', date_fin: '', lieu: '', type: 'autre' })
  formError.value = ''
  if (!modal) modal = new Modal(eventModalEl.value)
  modal.show()
}

function openEditModal(ev) {
  editingEvent.value = ev
  Object.assign(eventForm, {
    titre: ev.titre,
    description: ev.description || '',
    date_debut: ev.date_debut?.split('T')[0] || '',
    date_fin: ev.date_fin?.split('T')[0] || '',
    lieu: ev.lieu || '',
    type: ev.type,
  })
  formError.value = ''
  if (!modal) modal = new Modal(eventModalEl.value)
  modal.show()
}

async function submitEvent() {
  formError.value = ''
  formLoading.value = true
  try {
    if (editingEvent.value) {
      await api.put(`/events/${editingEvent.value.id}`, eventForm)
    } else {
      await api.post('/events', eventForm)
    }
    modal.hide()
    await loadEvents()
  } catch (e) {
    formError.value = e.response?.data?.message || t('errors.generic')
  } finally { formLoading.value = false }
}

async function deleteEvent(id) {
  if (!confirm(t('calendar.deleteConfirm'))) return
  try {
    await api.delete(`/events/${id}`)
    await loadEvents()
  } catch (e) {
    alert(e.response?.data?.message || t('errors.generic'))
  }
}

onMounted(loadEvents)
</script>
