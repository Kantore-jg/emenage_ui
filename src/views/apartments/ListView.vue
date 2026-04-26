<template>
  <h2 class="mb-4"><i class="fas fa-building"></i> {{ $t('apartments.title') }}</h2>

  <div class="card mb-4">
    <div class="card-header"><i class="fas fa-filter"></i> {{ $t('households.searchFilters') }}</div>
    <div class="card-body">
      <form @submit.prevent="loadData(1)">
        <!-- Filtrage géographique hiérarchique -->
        <div class="row g-3 mb-3">
          <div class="col-md-3">
            <label class="form-label">{{ $t('users.province') }}</label>
            <select class="form-select" v-model="geo.province" @change="onProvinceChange" :disabled="geoLocked.province">
              <option value="">{{ $t('common.all') }}</option>
              <option v-for="p in provinces" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">{{ $t('users.commune') }}</label>
            <select class="form-select" v-model="geo.commune" @change="onCommuneChange" :disabled="geoLocked.commune || !communes.length">
              <option value="">{{ $t('common.all') }}</option>
              <option v-for="c in communes" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">{{ $t('users.zoneLabel') }}</label>
            <select class="form-select" v-model="geo.zone" @change="onZoneChange" :disabled="geoLocked.zone || !zones.length">
              <option value="">{{ $t('common.all') }}</option>
              <option v-for="z in zones" :key="z.id" :value="z.id">{{ z.name }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">{{ $t('users.hill') }}</label>
            <select class="form-select" v-model="geo.colline" @change="loadData(1)" :disabled="geoLocked.colline || !collines.length">
              <option value="">{{ $t('common.all') }}</option>
              <option v-for="col in collines" :key="col.id" :value="col.id">{{ col.name }}</option>
            </select>
          </div>
        </div>

        <!-- Recherche texte + avenue -->
        <div class="row g-3">
          <div class="col-md-5">
            <label class="form-label">{{ $t('common.search') }}</label>
            <input type="text" class="form-control" v-model="filters.search" :placeholder="$t('apartments.searchPlaceholder')">
          </div>
          <div class="col-md-4">
            <label class="form-label">{{ $t('apartments.avenue') }}</label>
            <select class="form-select" v-model="filters.avenue">
              <option value="">{{ $t('apartments.allAvenues') }}</option>
              <option v-for="a in avenues" :key="a" :value="a">{{ a }}</option>
            </select>
          </div>
          <div class="col-md-3 d-flex align-items-end gap-2">
            <button type="submit" class="btn btn-primary"><i class="fas fa-search"></i> {{ $t('common.search') }}</button>
            <button type="button" class="btn btn-secondary" @click="resetFilters"><i class="fas fa-times"></i> {{ $t('common.reset') }}</button>
          </div>
        </div>
      </form>
    </div>
  </div>

  <div class="card">
    <div class="card-header d-flex justify-content-between align-items-center">
      <span><i class="fas fa-list"></i> {{ $t('apartments.title') }} <span class="badge bg-primary ms-1">{{ pagination.total }}</span></span>
      <router-link to="/dashboard/gouvernement" class="btn btn-sm btn-secondary"><i class="fas fa-arrow-left"></i> {{ $t('common.back') }}</router-link>
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
                <th>{{ $t('apartments.owner') }}</th>
                <th>{{ $t('apartments.avenue') }}</th>
                <th>{{ $t('apartments.number') }}</th>
                <th>{{ $t('apartments.zone') }}</th>
                <th>{{ $t('apartments.householdsCount') }}</th>
                <th>{{ $t('common.date') }}</th>
                <th>{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="apt in apartments" :key="apt.id">
                <td>
                  <strong>{{ apt.owner_nom }}</strong><br>
                  <small class="text-muted"><i class="fas fa-phone"></i> {{ apt.owner_telephone }}</small>
                </td>
                <td><span class="badge bg-info"><i class="fas fa-road"></i> {{ apt.avenue }}</span></td>
                <td>N°{{ apt.numero }}</td>
                <td>
                  <small>{{ apt.geographic_area?.name }}</small>
                </td>
                <td><span class="badge bg-primary">{{ apt.households_count || 0 }}</span></td>
                <td><small>{{ formatDate(apt.created_at) }}</small></td>
                <td>
                  <router-link :to="`/apartments/${apt.id}`" class="btn btn-sm btn-primary">
                    <i class="fas fa-eye"></i> {{ $t('common.details') }}
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <AppPagination :pagination="pagination" @page-change="loadData" />
      </template>
      <div v-else class="alert alert-info"><i class="fas fa-info-circle"></i> {{ $t('apartments.noApartment') }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import api from '../../services/api'
import { useAuth } from '../../stores/auth'
import AppPagination from '../../components/AppPagination.vue'

const { user } = useAuth()

const apartments = ref([])
const avenues = ref([])
const filters = reactive({ search: '', avenue: '' })
const geo = reactive({ province: '', commune: '', zone: '', colline: '' })
const provinces = ref([])
const communes = ref([])
const zones = ref([])
const collines = ref([])

const geoLocked = reactive({ province: false, commune: false, zone: false, colline: false })

const loading = ref(false)
const pagination = reactive({ current_page: 1, last_page: 1, per_page: 15, total: 0, from: 0, to: 0 })

function formatDate(d) { return new Date(d).toLocaleDateString('fr-FR') }

const selectedGeoAreaId = computed(() => {
  return geo.colline || geo.zone || geo.commune || geo.province || ''
})

// --- Chargement des données géographiques ---

async function loadGeoAreas(parentId) {
  try {
    const params = parentId ? { parent_id: parentId } : {}
    const { data } = await api.get('/geographic/areas', { params })
    return data.areas || []
  } catch (e) {
    console.error(e)
    return []
  }
}

function onProvinceChange() {
  geo.commune = ''; geo.zone = ''; geo.colline = ''
  communes.value = []; zones.value = []; collines.value = []
  if (geo.province) {
    loadGeoAreas(geo.province).then(areas => { communes.value = areas })
  }
  loadData(1)
}

function onCommuneChange() {
  geo.zone = ''; geo.colline = ''
  zones.value = []; collines.value = []
  if (geo.commune) {
    loadGeoAreas(geo.commune).then(areas => { zones.value = areas })
  }
  loadData(1)
}

function onZoneChange() {
  geo.colline = ''
  collines.value = []
  if (geo.zone) {
    loadGeoAreas(geo.zone).then(areas => { collines.value = areas })
  }
  loadData(1)
}

// --- Initialisation selon le rôle/zone de l'utilisateur ---

const ROLE_GEO_LEVEL = {
  admin: null,
  ministere: null,
  provincial: 'province',
  communal: 'commune',
  zonal: 'zone',
  collinaire: 'colline',
}

async function initGeoFromUser() {
  const u = user.value
  if (!u || !u.geographic_area_id) {
    provinces.value = await loadGeoAreas(null)
    return
  }

  try {
    const { data } = await api.get(`/geographic/areas/${u.geographic_area_id}`)
    const area = data.area
    const ancestors = data.ancestors || []
    const levelSlug = area?.level?.slug

    const province = ancestors.find(a => a.level?.slug === 'province')
    const commune = ancestors.find(a => a.level?.slug === 'commune')
    const zone = ancestors.find(a => a.level?.slug === 'zone')

    // Charger les provinces d'abord
    provinces.value = await loadGeoAreas(null)

    if (levelSlug === 'province' || province) {
      const pId = levelSlug === 'province' ? area.id : province.id
      geo.province = pId
      geoLocked.province = true
      communes.value = await loadGeoAreas(pId)
    }

    if (levelSlug === 'commune' || commune) {
      const cId = levelSlug === 'commune' ? area.id : commune.id
      geo.commune = cId
      geoLocked.commune = true
      zones.value = await loadGeoAreas(cId)
    }

    if (levelSlug === 'zone' || zone) {
      const zId = levelSlug === 'zone' ? area.id : zone.id
      geo.zone = zId
      geoLocked.zone = true
      collines.value = await loadGeoAreas(zId)
    }

    if (levelSlug === 'colline') {
      geo.colline = area.id
      geoLocked.colline = true
    }
  } catch (e) {
    console.error(e)
    provinces.value = await loadGeoAreas(null)
  }
}

// --- Chargement des appartements ---

async function loadData(page = 1) {
  loading.value = true
  try {
    const params = { page, per_page: 15 }
    if (filters.search) params.search = filters.search
    if (filters.avenue) params.avenue = filters.avenue
    if (selectedGeoAreaId.value) params.geographic_area_id = selectedGeoAreaId.value
    const { data } = await api.get('/apartments', { params })
    apartments.value = data.apartments || []
    avenues.value = data.avenues || []
    if (data.pagination) Object.assign(pagination, data.pagination)
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

function resetFilters() {
  filters.search = ''
  filters.avenue = ''

  if (!geoLocked.colline) geo.colline = ''
  if (!geoLocked.zone) { geo.zone = ''; collines.value = [] }
  if (!geoLocked.commune) { geo.commune = ''; zones.value = [] }
  if (!geoLocked.province) { geo.province = ''; communes.value = [] }

  loadData(1)
}

onMounted(async () => {
  await initGeoFromUser()
  loadData(1)
})
</script>
