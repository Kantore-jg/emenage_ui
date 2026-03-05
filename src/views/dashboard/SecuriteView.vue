<template>
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2><i class="fas fa-shield-alt"></i> Dashboard Sécurité</h2>
    <router-link to="/dashboard/securite/scan" class="btn btn-primary btn-lg">
      <i class="fas fa-qrcode"></i> Scanner un QR Code
    </router-link>
  </div>

  <div class="row">
    <div class="col-md-8">
      <div class="card shadow-sm border-0">
        <div class="card-header bg-white py-3 border-bottom-0">
          <h5 class="mb-0 text-primary"><i class="fas fa-map-marked-alt me-2"></i>Carte des Signalements</h5>
        </div>
        <div class="card-body p-0">
          <div ref="mapContainer" style="height: 600px; width: 100%;"></div>
        </div>
      </div>
    </div>

    <div class="col-md-4">
      <div class="card shadow-sm border-0 h-100">
        <div class="card-header bg-white py-3 border-bottom-0 d-flex justify-content-between align-items-center">
          <h5 class="mb-0 text-primary"><i class="fas fa-list me-2"></i>Signalements</h5>
          <span class="badge bg-primary rounded-pill">{{ reports.length }}</span>
        </div>
        <div class="card-body p-2" style="max-height: 540px; overflow-y: auto;">
          <div v-for="r in reports" :key="r.id" class="card mb-2 border-start border-3" :class="{
            'border-warning': r.statut === 'en_attente',
            'border-info': r.statut === 'en_cours',
            'border-success': r.statut === 'resolu'
          }">
            <div class="card-body p-2">
              <p class="mb-1 small">{{ r.description }}</p>
              <small class="text-muted">
                <i class="fas fa-user"></i> {{ r.citizen_nom }} |
                <i class="fas fa-clock"></i> {{ new Date(r.created_at).toLocaleString('fr-FR') }}
              </small>
              <div class="mt-2">
                <select class="form-select form-select-sm" :value="r.statut" @change="updateStatut(r.id, $event.target.value)">
                  <option value="en_attente">En attente</option>
                  <option value="en_cours">En cours</option>
                  <option value="resolu">Résolu</option>
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
import { ref, onMounted, nextTick } from 'vue'
import api from '../../services/api'

const mapContainer = ref(null)
const reports = ref([])
let map = null

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
    const { data } = await api.get('/dashboard/securite')
    reports.value = data.reports || []
  } catch (e) {
    console.error(e)
  }
}

function initMap() {
  map = window.L.map(mapContainer.value).setView([-3.3822, 29.3644], 13)
  window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map)

  const statusColors = { en_attente: 'orange', en_cours: 'blue', resolu: 'green' }
  reports.value.forEach(r => {
    if (r.latitude && r.longitude) {
      const color = statusColors[r.statut] || 'red'
      const circle = window.L.circleMarker([parseFloat(r.latitude), parseFloat(r.longitude)], {
        radius: 8, fillColor: color, color: '#fff', weight: 2, fillOpacity: 0.8
      }).addTo(map)
      circle.bindPopup(`<strong>${r.citizen_nom}</strong><br>${r.description}<br><em>${r.statut}</em>`)
    }
  })
}

async function updateStatut(id, statut) {
  try {
    await api.put(`/reports/${id}/statut`, { statut })
    await loadData()
    if (map) { map.remove() }
    await nextTick()
    initMap()
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
