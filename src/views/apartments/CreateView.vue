<template>
  <div class="row justify-content-center">
    <div class="col-md-8 col-lg-6">
      <div class="card">
        <div class="card-header">
          <h4 class="mb-0"><i class="fas fa-building"></i> {{ $t('apartments.createTitle') }}</h4>
        </div>
        <div class="card-body">
          <div v-if="error" class="alert alert-danger py-2">
            <i class="fas fa-exclamation-circle"></i> {{ error }}
          </div>

          <div v-if="success" class="alert alert-success">
            <h5><i class="fas fa-check-circle"></i> {{ $t('apartments.created') }}</h5>
            <p class="mb-1">{{ $t('apartments.avenue') }}: <strong>{{ createdApt.avenue }}</strong></p>
            <p class="mb-1">{{ $t('apartments.number') }}: <strong>N°{{ createdApt.numero }}</strong></p>
            <hr>
            <div class="d-flex gap-2">
              <button class="btn btn-primary btn-sm" @click="resetForm">
                <i class="fas fa-plus"></i> {{ $t('apartments.createAnother') }}
              </button>
              <router-link to="/apartments/mine" class="btn btn-secondary btn-sm">
                <i class="fas fa-list"></i> {{ $t('apartments.myApartments') }}
              </router-link>
            </div>
          </div>

          <form v-if="!success" @submit.prevent="handleSubmit">
            <p class="text-muted small"><i class="fas fa-map-marker-alt"></i> {{ $t('apartments.locationLabel') }}</p>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">{{ $t('users.province') }} *</label>
                <select class="form-select" v-model="geo.province" @change="onProvinceChange" required>
                  <option value="">{{ $t('users.selectOption') }}</option>
                  <option v-for="p in provinces" :key="p.id" :value="p.id">{{ p.name }}</option>
                </select>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">{{ $t('users.commune') }} *</label>
                <select class="form-select" v-model="geo.commune" @change="onCommuneChange" required :disabled="!communes.length">
                  <option value="">{{ $t('users.selectOption') }}</option>
                  <option v-for="c in communes" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
              </div>
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">{{ $t('users.zoneLabel') }} *</label>
                <select class="form-select" v-model="geo.zone" @change="onZoneChange" required :disabled="!zones.length">
                  <option value="">{{ $t('users.selectOption') }}</option>
                  <option v-for="z in zones" :key="z.id" :value="z.id">{{ z.name }}</option>
                </select>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">{{ $t('users.hill') }} ({{ $t('households.quarter') }}) *</label>
                <select class="form-select" v-model="geo.colline" required :disabled="!collines.length">
                  <option value="">{{ $t('users.selectOption') }}</option>
                  <option v-for="col in collines" :key="col.id" :value="col.id">{{ col.name }}</option>
                </select>
              </div>
            </div>

            <hr>
            <div class="mb-3">
              <label class="form-label"><i class="fas fa-road"></i> {{ $t('apartments.avenue') }} *</label>
              <input type="text" class="form-control" v-model="form.avenue" required :placeholder="$t('apartments.avenuePlaceholder')">
            </div>
            <div class="mb-3">
              <label class="form-label"><i class="fas fa-hashtag"></i> {{ $t('apartments.number') }} *</label>
              <input type="text" class="form-control" v-model="form.numero" required :placeholder="$t('apartments.numberPlaceholder')">
            </div>
            <div class="mb-3">
              <label class="form-label"><i class="fas fa-align-left"></i> {{ $t('apartments.description') }}</label>
              <textarea class="form-control" v-model="form.description" rows="2" :placeholder="$t('apartments.descriptionPlaceholder')"></textarea>
            </div>

            <div class="d-flex justify-content-between">
              <router-link to="/dashboard" class="btn btn-secondary">
                <i class="fas fa-arrow-left"></i> {{ $t('common.back') }}
              </router-link>
              <button type="submit" class="btn btn-primary" :disabled="loading || !geo.colline">
                <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                <i v-else class="fas fa-save me-1"></i>
                {{ $t('common.save') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '../../services/api'

const form = reactive({ avenue: '', numero: '', description: '' })
const geo = reactive({ province: '', commune: '', zone: '', colline: '' })
const provinces = ref([])
const communes = ref([])
const zones = ref([])
const collines = ref([])
const error = ref('')
const loading = ref(false)
const success = ref(false)
const createdApt = ref({})

async function loadProvinces() {
  try {
    const { data } = await api.get('/geographic/areas')
    provinces.value = data.areas || []
  } catch (e) { console.error(e) }
}

async function loadChildren(parentId, target) {
  try {
    const { data } = await api.get('/geographic/areas', { params: { parent_id: parentId } })
    if (target === 'communes') communes.value = data.areas || []
    else if (target === 'zones') zones.value = data.areas || []
    else if (target === 'collines') collines.value = data.areas || []
  } catch (e) { console.error(e) }
}

function onProvinceChange() {
  geo.commune = ''; geo.zone = ''; geo.colline = ''
  communes.value = []; zones.value = []; collines.value = []
  if (geo.province) loadChildren(geo.province, 'communes')
}

function onCommuneChange() {
  geo.zone = ''; geo.colline = ''
  zones.value = []; collines.value = []
  if (geo.commune) loadChildren(geo.commune, 'zones')
}

function onZoneChange() {
  geo.colline = ''
  collines.value = []
  if (geo.zone) loadChildren(geo.zone, 'collines')
}

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    const { data } = await api.post('/apartments', {
      geographic_area_id: geo.colline,
      avenue: form.avenue,
      numero: form.numero,
      description: form.description || null,
    })
    success.value = true
    createdApt.value = data.apartment
  } catch (e) {
    error.value = e.response?.data?.message || 'Erreur lors de l\'enregistrement'
  } finally { loading.value = false }
}

function resetForm() {
  form.avenue = ''; form.numero = ''; form.description = ''
  success.value = false; createdApt.value = {}; error.value = ''
}

onMounted(loadProvinces)
</script>
