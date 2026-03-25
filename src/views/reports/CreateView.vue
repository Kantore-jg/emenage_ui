<template>
  <div class="row justify-content-center">
    <div class="col-md-8">
      <div class="card">
        <div class="card-header"><h4><i class="fas fa-exclamation-triangle"></i> {{ $t('reports.createTitle') }}</h4></div>
        <div class="card-body">
          <div v-if="error" class="alert alert-danger">{{ error }}</div>
          <div v-if="success" class="alert alert-success"><i class="fas fa-check-circle"></i> {{ $t('reports.sent') }}</div>
          <form v-if="!success" @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label class="form-label">{{ $t('reports.description') }} *</label>
              <textarea class="form-control" v-model="form.description" rows="5" required :placeholder="$t('reports.descriptionPlaceholder')"></textarea>
            </div>

            <div class="mb-3">
              <label class="form-label"><i class="fas fa-camera"></i> {{ $t('reports.photos') }}</label>
              <input type="file" class="form-control" multiple accept="image/jpeg,image/png,image/webp" @change="handleFiles" ref="fileInput">
              <small class="text-muted">{{ $t('reports.photosInfo') }}</small>
              <div v-if="previews.length" class="d-flex flex-wrap gap-2 mt-2">
                <div v-for="(p, i) in previews" :key="i" class="position-relative" style="width: 80px; height: 80px;">
                  <img :src="p" class="rounded border" style="width: 80px; height: 80px; object-fit: cover;">
                  <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 p-0" style="width: 20px; height: 20px; line-height: 20px; font-size: 10px;" @click="removeFile(i)">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">{{ $t('reports.gpsLocation') }}</label>
              <p class="text-muted small">{{ $t('reports.clickMap') }}</p>
              <div ref="mapContainer" style="height: 300px; border-radius: 8px;"></div>
              <p v-if="form.latitude" class="mt-2 small text-muted">
                <i class="fas fa-map-pin"></i> {{ $t('reports.position') }}: {{ form.latitude }}, {{ form.longitude }}
              </p>
            </div>
            <div class="d-flex justify-content-between">
              <router-link to="/dashboard" class="btn btn-secondary"><i class="fas fa-times"></i> {{ $t('common.cancel') }}</router-link>
              <button type="submit" class="btn btn-danger" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                <i v-else class="fas fa-paper-plane"></i> {{ $t('common.submit') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../../services/api'

const { t } = useI18n()
const mapContainer = ref(null)
const fileInput = ref(null)
const form = reactive({ description: '', latitude: null, longitude: null })
const selectedFiles = ref([])
const previews = ref([])
const error = ref('')
const success = ref(false)
const loading = ref(false)
let map = null
let marker = null

function handleFiles(e) {
  const files = Array.from(e.target.files)
  const total = selectedFiles.value.length + files.length
  if (total > 5) {
    error.value = t('reports.maxPhotos')
    return
  }
  error.value = ''
  files.forEach(f => {
    selectedFiles.value.push(f)
    const reader = new FileReader()
    reader.onload = (ev) => previews.value.push(ev.target.result)
    reader.readAsDataURL(f)
  })
}

function removeFile(index) {
  selectedFiles.value.splice(index, 1)
  previews.value.splice(index, 1)
}

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

async function handleSubmit() {
  error.value = ''; loading.value = true
  try {
    const fd = new FormData()
    fd.append('description', form.description)
    if (form.latitude) fd.append('latitude', form.latitude)
    if (form.longitude) fd.append('longitude', form.longitude)
    selectedFiles.value.forEach(f => fd.append('photos[]', f))
    await api.post('/reports', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    success.value = true
  } catch (e) {
    error.value = e.response?.data?.message || t('errors.generic')
  } finally { loading.value = false }
}

onMounted(async () => {
  await loadLeaflet()
  await nextTick()
  map = window.L.map(mapContainer.value).setView([-3.3822, 29.3644], 13)
  window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)
  map.on('click', (e) => {
    form.latitude = e.latlng.lat.toFixed(6)
    form.longitude = e.latlng.lng.toFixed(6)
    if (marker) map.removeLayer(marker)
    marker = window.L.marker(e.latlng).addTo(map)
  })
})
</script>
