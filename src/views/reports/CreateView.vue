<template>
  <div class="row justify-content-center">
    <div class="col-md-8">
      <div class="card">
        <div class="card-header"><h4><i class="fas fa-exclamation-triangle"></i> Signaler un Problème</h4></div>
        <div class="card-body">
          <div v-if="message" class="alert" :class="messageType === 'success' ? 'alert-success' : 'alert-danger'">{{ message }}</div>
          <form @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label class="form-label">Description du problème *</label>
              <textarea class="form-control" v-model="description" rows="5" required placeholder="Décrivez le problème..."></textarea>
            </div>
            <div class="mb-3">
              <label class="form-label">Localisation GPS *</label>
              <div ref="mapContainer" style="height: 300px; width: 100%; margin-bottom: 10px;"></div>
              <small class="text-muted"><i class="fas fa-info-circle"></i> Cliquez sur la carte pour sélectionner l'emplacement.</small>
              <div v-if="lat && lng" class="mt-2">
                <small class="text-success"><i class="fas fa-check-circle"></i> Position: {{ lat.toFixed(6) }}, {{ lng.toFixed(6) }}</small>
              </div>
            </div>
            <div class="d-flex justify-content-between">
              <router-link to="/dashboard" class="btn btn-secondary"><i class="fas fa-times"></i> Annuler</router-link>
              <button type="submit" class="btn btn-primary" :disabled="loading"><i class="fas fa-paper-plane"></i> Envoyer</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../services/api'

const router = useRouter()
const mapContainer = ref(null)
const description = ref('')
const lat = ref(null)
const lng = ref(null)
const message = ref('')
const messageType = ref('')
const loading = ref(false)
let map = null
let marker = null

function loadLeaflet() {
  return new Promise((resolve) => {
    if (window.L) { resolve(); return }
    const link = document.createElement('link')
    link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = resolve
    document.head.appendChild(script)
  })
}

function initMap() {
  map = window.L.map(mapContainer.value).setView([-3.3822, 29.3644], 13)
  window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OSM' }).addTo(map)

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      lat.value = pos.coords.latitude; lng.value = pos.coords.longitude
      map.setView([lat.value, lng.value], 15)
      marker = window.L.marker([lat.value, lng.value]).addTo(map)
    }, () => {}, { enableHighAccuracy: true, timeout: 10000 })
  }

  map.on('click', (e) => {
    lat.value = e.latlng.lat; lng.value = e.latlng.lng
    if (marker) map.removeLayer(marker)
    marker = window.L.marker([lat.value, lng.value]).addTo(map)
  })
}

async function handleSubmit() {
  if (!lat.value || !lng.value) { message.value = 'Sélectionnez un emplacement'; messageType.value = 'error'; return }
  loading.value = true
  try {
    await api.post('/reports', { description: description.value, latitude: lat.value, longitude: lng.value })
    message.value = 'Signalement envoyé!'; messageType.value = 'success'
    setTimeout(() => router.push('/dashboard'), 2000)
  } catch (e) {
    message.value = e.response?.data?.message || 'Erreur'; messageType.value = 'error'
  } finally { loading.value = false }
}

onMounted(async () => { await loadLeaflet(); await nextTick(); initMap() })
</script>
