<template>
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2><i class="fas fa-shield-alt"></i> {{ $t('dashboard.secTitle') }}</h2>
  </div>

  <div class="card mb-4 shadow-sm border-0">
    <div class="card-body py-3">
      <form @submit.prevent="applyFilters" class="row g-2 align-items-end">
        <div class="col-md-2">
          <label class="form-label small">{{ $t('dashboard.filterStatus') }}</label>
          <select class="form-select form-select-sm" v-model="filters.statut">
            <option value="">{{ $t('dashboard.allStatuses') }}</option>
            <option value="en_attente">{{ $t('dashboard.enAttente') }}</option>
            <option value="en_cours">{{ $t('dashboard.enCours') }}</option>
            <option value="resolu">{{ $t('dashboard.resolu') }}</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label small">{{ $t('common.search') }}</label>
          <input type="text" class="form-control form-control-sm" v-model="filters.search" :placeholder="$t('dashboard.searchPlaceholder')">
        </div>
        <div class="col-md-2">
          <label class="form-label small">{{ $t('common.from') }}</label>
          <input type="date" class="form-control form-control-sm" v-model="filters.date_from">
        </div>
        <div class="col-md-2">
          <label class="form-label small">{{ $t('common.to') }}</label>
          <input type="date" class="form-control form-control-sm" v-model="filters.date_to">
        </div>
        <div class="col-md-3 d-flex gap-1 align-items-end">
          <button type="submit" class="btn btn-sm btn-primary"><i class="fas fa-search"></i> {{ $t('common.filter') }}</button>
          <button type="button" class="btn btn-sm btn-secondary" @click="resetFilters"><i class="fas fa-times"></i> {{ $t('common.reset') }}</button>
          <span class="badge bg-primary ms-auto">{{ filteredReports.length }} {{ $t('dashboard.reportsList') }}</span>
        </div>
      </form>
    </div>
  </div>

  <div class="row">
    <div class="col-md-8">
      <div class="card shadow-sm border-0">
        <div class="card-header bg-white py-3 border-bottom-0 d-flex justify-content-between align-items-center">
          <h5 class="mb-0 text-primary"><i class="fas fa-map-marked-alt me-2"></i>{{ $t('dashboard.mapTitle') }}</h5>
          <div class="d-flex gap-3 small">
            <span><i class="fas fa-circle text-warning"></i> {{ $t('dashboard.enAttente') }}</span>
            <span><i class="fas fa-circle text-info"></i> {{ $t('dashboard.enCours') }}</span>
            <span><i class="fas fa-circle text-success"></i> {{ $t('dashboard.resolu') }}</span>
          </div>
        </div>
        <div class="card-body p-0">
          <div ref="mapContainer" style="height: 600px; width: 100%;"></div>
        </div>
      </div>
    </div>

    <div class="col-md-4">
      <div class="card shadow-sm border-0 h-100">
        <div class="card-header bg-white py-3 border-bottom-0 d-flex justify-content-between align-items-center">
          <h5 class="mb-0 text-primary"><i class="fas fa-list me-2"></i>{{ $t('dashboard.reportsList') }}</h5>
          <span class="badge bg-primary rounded-pill">{{ filteredReports.length }}</span>
        </div>
        <div class="card-body p-2" style="max-height: 600px; overflow-y: auto;">
          <div v-if="filteredReports.length === 0" class="text-center py-4 text-muted">
            <i class="fas fa-info-circle"></i> {{ $t('dashboard.noReport') }}
          </div>
          <div v-for="r in filteredReports" :key="r.id" class="card mb-2 border-start border-3" :class="{
            'border-warning': r.statut === 'en_attente',
            'border-info': r.statut === 'en_cours',
            'border-success': r.statut === 'resolu'
          }">
            <div class="card-body p-2">
              <p class="mb-1 small">{{ r.description }}</p>

              <div v-if="r.photos && r.photos.length" class="d-flex flex-wrap gap-1 mb-1">
                <a v-for="p in r.photos" :key="p.id" :href="p.url" target="_blank" class="d-inline-block">
                  <img :src="p.url" class="rounded border" style="width: 40px; height: 40px; object-fit: cover;" :title="$t('reports.viewPhoto')">
                </a>
              </div>

              <small class="text-muted">
                <i class="fas fa-user"></i> {{ r.citizen_nom }} |
                <i class="fas fa-clock"></i> {{ new Date(r.created_at).toLocaleString('fr-FR') }}
              </small>

              <div v-if="r.feedback" class="mt-1">
                <span v-for="s in 5" :key="s" class="small" :class="s <= r.feedback.rating ? 'text-warning' : 'text-muted'">
                  <i :class="s <= r.feedback.rating ? 'fas fa-star' : 'far fa-star'"></i>
                </span>
                <small v-if="r.feedback.comment" class="d-block text-muted fst-italic">« {{ r.feedback.comment }} »</small>
              </div>

              <div class="mt-2">
                <select class="form-select form-select-sm" :value="r.statut" @change="updateStatut(r.id, $event.target.value)">
                  <option value="en_attente">{{ $t('dashboard.enAttente') }}</option>
                  <option value="en_cours">{{ $t('dashboard.enCours') }}</option>
                  <option value="resolu">{{ $t('dashboard.resolu') }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import api from '../../services/api'

const mapContainer = ref(null)
const reports = ref([])
const filters = reactive({ statut: '', search: '', date_from: '', date_to: '' })
let map = null
let markersLayer = null

const filteredReports = computed(() => reports.value)

function loadLeaflet() {
  return new Promise((resolve) => {
    if (window.L) { resolve(); return }
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = resolve
    document.head.appendChild(script)
  })
}

async function loadData() {
  try {
    const params = {}
    if (filters.statut) params.statut = filters.statut
    if (filters.search) params.search = filters.search
    if (filters.date_from) params.date_from = filters.date_from
    if (filters.date_to) params.date_to = filters.date_to
    const { data } = await api.get('/dashboard/securite', { params })
    reports.value = data.reports || []
  } catch (e) {
    console.error(e)
  }
}

function initMap() {
  map = window.L.map(mapContainer.value).setView([-3.3822, 29.3644], 13)
  window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)
  markersLayer = window.L.layerGroup().addTo(map)
  renderMarkers()
}

function renderMarkers() {
  if (!markersLayer) return
  markersLayer.clearLayers()
  const statusColors = { en_attente: 'orange', en_cours: '#17a2b8', resolu: 'green' }
  reports.value.forEach(r => {
    if (r.latitude && r.longitude) {
      const color = statusColors[r.statut] || 'red'
      const circle = window.L.circleMarker([parseFloat(r.latitude), parseFloat(r.longitude)], {
        radius: 8, fillColor: color, color: '#fff', weight: 2, fillOpacity: 0.8
      })
      let popupHtml = `<strong>${r.citizen_nom}</strong><br>${r.description}<br><em>${r.statut}</em>`
      if (r.photos && r.photos.length) {
        popupHtml += '<br>'
        r.photos.forEach(p => {
          popupHtml += `<a href="${p.url}" target="_blank"><img src="${p.url}" style="width:50px;height:50px;object-fit:cover;margin:2px;border-radius:4px;"></a>`
        })
      }
      popupHtml += `<br><small>${new Date(r.created_at).toLocaleString('fr-FR')}</small>`
      circle.bindPopup(popupHtml)
      markersLayer.addLayer(circle)
    }
  })
}

async function applyFilters() {
  await loadData()
  renderMarkers()
}

async function resetFilters() {
  filters.statut = ''
  filters.search = ''
  filters.date_from = ''
  filters.date_to = ''
  await loadData()
  renderMarkers()
}

async function updateStatut(id, statut) {
  try {
    await api.put(`/reports/${id}/statut`, { statut })
    await loadData()
    renderMarkers()
  } catch (e) {
    alert(e.response?.data?.message || 'Erreur')
  }
}

onMounted(async () => {
  await loadLeaflet()
  await loadData()
  await nextTick()
  initMap()
})
</script>
