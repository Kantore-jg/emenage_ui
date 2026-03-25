<template>
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2><i class="fas fa-users-cog"></i> {{ $t('users.title') }}</h2>
    <button v-if="creatableRoles.length" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addUserModal" @click="resetCreateForm">
      <i class="fas fa-plus"></i> {{ $t('users.register') }}
    </button>
  </div>

  <div class="card mb-4">
    <div class="card-body py-3">
      <div class="row g-2 align-items-end">
        <div class="col-md-4">
          <input type="text" class="form-control" v-model="search" :placeholder="$t('users.searchPlaceholder')" @input="loadUsers(1)">
        </div>
        <div class="col-md-3">
          <select class="form-select" v-model="filterRole" @change="loadUsers(1)">
            <option value="">{{ $t('users.allRoles') }}</option>
            <option v-for="r in allRoles" :key="r.value" :value="r.value">{{ $t('roles.' + r.value) }}</option>
          </select>
        </div>
        <div class="col-md-2">
          <span class="badge bg-primary fs-6">{{ pagination.total }} {{ $t('users.count') }}</span>
        </div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-body p-0">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="bg-light">
            <tr>
              <th>{{ $t('common.name') }}</th>
              <th>{{ $t('common.phone') }}</th>
              <th>{{ $t('common.role') }}</th>
              <th>{{ $t('common.zone') }}</th>
              <th>{{ $t('users.createdAt') }}</th>
              <th>{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="text-center py-4">
                <div class="spinner-border spinner-border-sm text-primary"></div> {{ $t('common.loading') }}
              </td>
            </tr>
            <tr v-else-if="users.length === 0">
              <td colspan="6" class="text-center py-4 text-muted">{{ $t('common.noResults') }}</td>
            </tr>
            <tr v-for="u in users" :key="u.id">
              <td>
                <div class="d-flex align-items-center gap-2">
                  <img v-if="u.photo_profil" :src="apiBase + u.photo_profil" class="rounded-circle" style="width: 32px; height: 32px; object-fit: cover;">
                  <div v-else class="rounded-circle bg-secondary d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
                    <i class="fas fa-user text-white" style="font-size: 0.7rem;"></i>
                  </div>
                  <strong>{{ u.nom }}</strong>
                </div>
              </td>
              <td>{{ u.telephone }}</td>
              <td><span class="badge" :class="roleBadge(u.role)">{{ $t('roles.' + u.role) }}</span></td>
              <td><small>{{ u.geographic_area?.name || $t('users.entireCountry') }}</small></td>
              <td><small>{{ formatDate(u.created_at) }}</small></td>
              <td>
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-outline-primary" @click="openEditModal(u)" :title="$t('common.edit')">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-outline-warning" @click="resetPwd(u.id, u.nom)" :title="$t('users.resetPassword')">
                    <i class="fas fa-key"></i>
                  </button>
                  <button v-if="u.role !== 'admin'" class="btn btn-outline-danger" @click="deleteUser(u.id, u.nom)" :title="$t('common.delete')">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <AppPagination :pagination="pagination" @page-change="onPageChange" />
  </div>

  <!-- Modal créer utilisateur -->
  <div class="modal fade" id="addUserModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title"><i class="fas fa-user-plus"></i> {{ $t('users.registerTitle') }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <form @submit.prevent="createUser">
          <div class="modal-body">
            <div v-if="formError" class="alert alert-danger py-2">{{ formError }}</div>
            <div v-if="createdPassword" class="alert alert-success">
              <i class="fas fa-check-circle"></i> {{ $t('users.created') }}<br>
              <strong>{{ $t('users.passwordLabel') }} :</strong> <code class="fs-5">{{ createdPassword }}</code>
              <br><span v-if="createdZone" class="text-muted">{{ $t('common.zone') }} : {{ createdZone }}</span>
              <br><small class="text-muted">{{ $t('users.notePassword') }}</small>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">{{ $t('users.fullName') }} *</label>
                <input type="text" class="form-control" v-model="form.nom" required>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">{{ $t('users.phone') }} *</label>
                <input type="tel" class="form-control" v-model="form.telephone" required>
              </div>
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">{{ $t('common.email') }}</label>
                <input type="email" class="form-control" v-model="form.email" :placeholder="$t('users.emailOptional')">
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">{{ $t('users.roleLabel') }} *</label>
                <select class="form-select" v-model="form.role" required @change="onRoleChange">
                  <option value="" disabled>{{ $t('users.chooseRole') }}</option>
                  <option v-for="r in creatableRoles" :key="r" :value="r">{{ $t('roles.' + r) }}</option>
                </select>
              </div>
            </div>

            <template v-if="form.role && needsGeoArea">
              <hr>
              <p class="text-muted small mb-2">
                <i class="fas fa-map-marker-alt"></i>
                {{ $t('users.mustBeAssigned', { role: $t('roles.' + form.role), level: expectedGeoLevel }) }}
              </p>
              <div class="row">
                <div class="col-md-6 mb-3" v-if="provinces.length">
                  <label class="form-label">{{ $t('users.province') }} *</label>
                  <select class="form-select" v-model="geo.province" @change="onProvinceChange">
                    <option value="">{{ $t('users.selectOption') }}</option>
                    <option v-for="p in provinces" :key="p.id" :value="p.id">{{ p.name }}</option>
                  </select>
                </div>
                <div class="col-md-6 mb-3" v-if="communes.length && needsLevel('commune')">
                  <label class="form-label">{{ $t('users.commune') }} *</label>
                  <select class="form-select" v-model="geo.commune" @change="onCommuneChange">
                    <option value="">{{ $t('users.selectOption') }}</option>
                    <option v-for="c in communes" :key="c.id" :value="c.id">{{ c.name }}</option>
                  </select>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3" v-if="zones.length && needsLevel('zone')">
                  <label class="form-label">{{ $t('users.zoneLabel') }} *</label>
                  <select class="form-select" v-model="geo.zone" @change="onZoneChange">
                    <option value="">{{ $t('users.selectOption') }}</option>
                    <option v-for="z in zones" :key="z.id" :value="z.id">{{ z.name }}</option>
                  </select>
                </div>
                <div class="col-md-6 mb-3" v-if="collines.length && needsLevel('colline')">
                  <label class="form-label">{{ $t('users.hill') }} *</label>
                  <select class="form-select" v-model="geo.colline">
                    <option value="">{{ $t('users.selectOption') }}</option>
                    <option v-for="col in collines" :key="col.id" :value="col.id">{{ col.name }}</option>
                  </select>
                </div>
              </div>
            </template>

            <div v-if="form.role === 'citoyen'" class="mb-3">
              <label class="form-label">{{ $t('users.fullAddress') }} *</label>
              <textarea class="form-control" v-model="form.adresse" rows="2" required></textarea>
            </div>

            <div class="mb-3">
              <label class="form-label">{{ $t('users.profilePhoto') }}</label>
              <input type="file" class="form-control" @change="form.photo = $event.target.files[0]" accept="image/*">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{{ $t('common.close') }}</button>
            <button v-if="!createdPassword" type="submit" class="btn btn-primary" :disabled="formLoading">
              <span v-if="formLoading" class="spinner-border spinner-border-sm me-1"></span>
              {{ $t('users.register') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Modal modifier utilisateur -->
  <div class="modal fade" id="editUserModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title"><i class="fas fa-user-edit"></i> {{ $t('users.editTitle') }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <form @submit.prevent="updateUser">
          <div class="modal-body">
            <div v-if="editError" class="alert alert-danger py-2">{{ editError }}</div>
            <div v-if="editSuccess" class="alert alert-success py-2">
              <i class="fas fa-check-circle"></i> {{ editSuccess }}
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">{{ $t('users.fullName') }} *</label>
                <input type="text" class="form-control" v-model="editForm.nom" required>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">{{ $t('users.phone') }} *</label>
                <input type="tel" class="form-control" v-model="editForm.telephone" required>
              </div>
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">{{ $t('common.email') }}</label>
                <input type="email" class="form-control" v-model="editForm.email" :placeholder="$t('users.emailOptional')">
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">{{ $t('common.role') }}</label>
                <input type="text" class="form-control" :value="$t('roles.' + editForm.role)" disabled>
              </div>
            </div>

            <template v-if="editNeedsGeo">
              <hr>
              <p class="text-muted small mb-2">
                <i class="fas fa-map-marker-alt"></i>
                {{ $t('users.assignedZone') }} ({{ editExpectedGeoLevel }})
              </p>
              <div class="row">
                <div class="col-md-6 mb-3" v-if="editProvinces.length">
                  <label class="form-label">{{ $t('users.province') }} *</label>
                  <select class="form-select" v-model="editGeo.province" @change="onEditProvinceChange">
                    <option value="">{{ $t('users.selectOption') }}</option>
                    <option v-for="p in editProvinces" :key="p.id" :value="p.id">{{ p.name }}</option>
                  </select>
                </div>
                <div class="col-md-6 mb-3" v-if="editCommunes.length && editNeedsLevel('commune')">
                  <label class="form-label">{{ $t('users.commune') }} *</label>
                  <select class="form-select" v-model="editGeo.commune" @change="onEditCommuneChange">
                    <option value="">{{ $t('users.selectOption') }}</option>
                    <option v-for="c in editCommunes" :key="c.id" :value="c.id">{{ c.name }}</option>
                  </select>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3" v-if="editZones.length && editNeedsLevel('zone')">
                  <label class="form-label">{{ $t('users.zoneLabel') }} *</label>
                  <select class="form-select" v-model="editGeo.zone" @change="onEditZoneChange">
                    <option value="">{{ $t('users.selectOption') }}</option>
                    <option v-for="z in editZones" :key="z.id" :value="z.id">{{ z.name }}</option>
                  </select>
                </div>
                <div class="col-md-6 mb-3" v-if="editCollines.length && editNeedsLevel('colline')">
                  <label class="form-label">{{ $t('users.hill') }} *</label>
                  <select class="form-select" v-model="editGeo.colline">
                    <option value="">{{ $t('users.selectOption') }}</option>
                    <option v-for="col in editCollines" :key="col.id" :value="col.id">{{ col.name }}</option>
                  </select>
                </div>
              </div>
            </template>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{{ $t('common.close') }}</button>
            <button type="submit" class="btn btn-primary" :disabled="editLoading">
              <span v-if="editLoading" class="spinner-border spinner-border-sm me-1"></span>
              {{ $t('common.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Modal mot de passe réinitialisé -->
  <div class="modal fade" id="pwdModal" tabindex="-1">
    <div class="modal-dialog modal-sm">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ $t('users.newPassword') }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body text-center">
          <p>{{ $t('users.passwordLabel') }} - <strong>{{ resetUserName }}</strong> :</p>
          <code class="fs-4 d-block p-2 bg-light rounded">{{ resetPwdValue }}</code>
          <small class="text-muted mt-2 d-block">{{ $t('users.notePasswordShort') }}</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../../services/api'
import { Modal } from 'bootstrap'
import AppPagination from '../../components/AppPagination.vue'

const { t } = useI18n()
const apiBase = 'http://localhost:8000'
const users = ref([])
const search = ref('')
const filterRole = ref('')
const loading = ref(false)
const currentPage = ref(1)
const pagination = reactive({ current_page: 1, last_page: 1, per_page: 15, total: 0, from: 0, to: 0 })
const creatableRoles = ref([])
const form = reactive({ nom: '', telephone: '', email: '', role: '', photo: null, adresse: '' })
const geo = reactive({ province: '', commune: '', zone: '', colline: '' })
const provinces = ref([])
const communes = ref([])
const zones = ref([])
const collines = ref([])
const formError = ref('')
const formLoading = ref(false)
const createdPassword = ref('')
const createdZone = ref('')
const resetUserName = ref('')
const resetPwdValue = ref('')

const editForm = reactive({ id: null, nom: '', telephone: '', email: '', role: '' })
const editGeo = reactive({ province: '', commune: '', zone: '', colline: '' })
const editProvinces = ref([])
const editCommunes = ref([])
const editZones = ref([])
const editCollines = ref([])
const editError = ref('')
const editSuccess = ref('')
const editLoading = ref(false)
const editNeedsGeo = computed(() => !!roleGeoMap[editForm.role])
const editExpectedGeoLevel = computed(() => roleGeoMap[editForm.role] || '')

function editNeedsLevel(level) {
  const order = ['province', 'commune', 'zone', 'colline']
  const target = order.indexOf(editExpectedGeoLevel.value)
  const current = order.indexOf(level)
  return current <= target
}

const editSelectedGeoAreaId = computed(() => {
  const level = editExpectedGeoLevel.value
  if (level === 'province') return editGeo.province
  if (level === 'commune') return editGeo.commune
  if (level === 'zone') return editGeo.zone
  if (level === 'colline') return editGeo.colline
  return ''
})

const allRoles = [
  { value: 'admin' }, { value: 'ministere' }, { value: 'provincial' },
  { value: 'communal' }, { value: 'zonal' }, { value: 'collinaire' },
  { value: 'citoyen' }, { value: 'police' }, { value: 'agent_recensement' },
]

const roleGeoMap = {
  provincial: 'province', communal: 'commune', zonal: 'zone',
  collinaire: 'colline', citoyen: 'colline',
}

const needsGeoArea = computed(() => !!roleGeoMap[form.role])
const expectedGeoLevel = computed(() => roleGeoMap[form.role] || '')

function needsLevel(level) {
  const order = ['province', 'commune', 'zone', 'colline']
  const target = order.indexOf(expectedGeoLevel.value)
  const current = order.indexOf(level)
  return current <= target
}

const selectedGeoAreaId = computed(() => {
  const level = expectedGeoLevel.value
  if (level === 'province') return geo.province
  if (level === 'commune') return geo.commune
  if (level === 'zone') return geo.zone
  if (level === 'colline') return geo.colline
  return ''
})

function roleBadge(r) {
  return {
    admin: 'bg-danger', ministere: 'bg-primary', provincial: 'bg-info',
    communal: 'bg-info', zonal: 'bg-info', collinaire: 'bg-info',
    police: 'bg-warning text-dark', citoyen: 'bg-success',
    agent_recensement: 'bg-secondary',
  }[r] || 'bg-secondary'
}

function formatDate(d) { return new Date(d).toLocaleDateString('fr-FR') }

async function loadUsers(page = 1) {
  loading.value = true
  currentPage.value = page
  try {
    const params = { page, per_page: 15 }
    if (search.value) params.search = search.value
    if (filterRole.value) params.role = filterRole.value
    const { data } = await api.get('/users', { params })
    users.value = data.users || []
    creatableRoles.value = data.creatable_roles || []
    if (data.pagination) Object.assign(pagination, data.pagination)
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

function onPageChange(page) { loadUsers(page) }

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

function onRoleChange() {
  geo.province = ''; geo.commune = ''; geo.zone = ''; geo.colline = ''
  communes.value = []; zones.value = []; collines.value = []
  if (needsGeoArea.value && !provinces.value.length) loadProvinces()
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

function resetCreateForm() {
  form.nom = ''; form.telephone = ''; form.email = ''; form.role = ''; form.photo = null; form.adresse = ''
  geo.province = ''; geo.commune = ''; geo.zone = ''; geo.colline = ''
  communes.value = []; zones.value = []; collines.value = []
  formError.value = ''; createdPassword.value = ''; createdZone.value = ''
}

async function createUser() {
  formError.value = ''; formLoading.value = true; createdPassword.value = ''
  const fd = new FormData()
  fd.append('nom', form.nom)
  fd.append('telephone', form.telephone)
  if (form.email) fd.append('email', form.email)
  fd.append('role', form.role)
  if (form.photo) fd.append('photo_profil', form.photo)
  if (form.adresse) fd.append('adresse', form.adresse)
  if (selectedGeoAreaId.value) fd.append('geographic_area_id', selectedGeoAreaId.value)
  try {
    const { data } = await api.post('/users', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    createdPassword.value = data.password
    createdZone.value = data.zone || ''
    await loadUsers(currentPage.value)
  } catch (e) {
    formError.value = e.response?.data?.message || t('errors.generic')
  } finally { formLoading.value = false }
}

async function loadEditChildren(parentId, target) {
  try {
    const { data } = await api.get('/geographic/areas', { params: { parent_id: parentId } })
    if (target === 'communes') editCommunes.value = data.areas || []
    else if (target === 'zones') editZones.value = data.areas || []
    else if (target === 'collines') editCollines.value = data.areas || []
  } catch (e) { console.error(e) }
}

function onEditProvinceChange() {
  editGeo.commune = ''; editGeo.zone = ''; editGeo.colline = ''
  editCommunes.value = []; editZones.value = []; editCollines.value = []
  if (editGeo.province) loadEditChildren(editGeo.province, 'communes')
}

function onEditCommuneChange() {
  editGeo.zone = ''; editGeo.colline = ''
  editZones.value = []; editCollines.value = []
  if (editGeo.commune) loadEditChildren(editGeo.commune, 'zones')
}

function onEditZoneChange() {
  editGeo.colline = ''
  editCollines.value = []
  if (editGeo.zone) loadEditChildren(editGeo.zone, 'collines')
}

async function openEditModal(u) {
  editForm.id = u.id
  editForm.nom = u.nom
  editForm.telephone = u.telephone
  editForm.email = u.email || ''
  editForm.role = u.role
  editError.value = ''
  editSuccess.value = ''
  editGeo.province = ''; editGeo.commune = ''; editGeo.zone = ''; editGeo.colline = ''
  editCommunes.value = []; editZones.value = []; editCollines.value = []

  if (editNeedsGeo.value) {
    try {
      const { data } = await api.get('/geographic/areas')
      editProvinces.value = data.areas || []
    } catch (e) { console.error(e) }

    if (u.geographic_area) {
      try {
        const { data } = await api.get(`/geographic/areas/${u.geographic_area.id}`)
        const area = data.area
        const ancestors = data.ancestors || []
        const chain = [...ancestors, area]

        for (const node of chain) {
          const levelSlug = node.level?.slug
          if (levelSlug === 'province') {
            editGeo.province = node.id
            const children = await api.get('/geographic/areas', { params: { parent_id: node.id } })
            editCommunes.value = children.data.areas || []
          } else if (levelSlug === 'commune') {
            editGeo.commune = node.id
            const children = await api.get('/geographic/areas', { params: { parent_id: node.id } })
            editZones.value = children.data.areas || []
          } else if (levelSlug === 'zone') {
            editGeo.zone = node.id
            const children = await api.get('/geographic/areas', { params: { parent_id: node.id } })
            editCollines.value = children.data.areas || []
          } else if (levelSlug === 'colline') {
            editGeo.colline = node.id
          }
        }
      } catch (e) { console.error(e) }
    }
  }

  const modal = new Modal(document.getElementById('editUserModal'))
  modal.show()
}

async function updateUser() {
  editError.value = ''; editSuccess.value = ''; editLoading.value = true
  const payload = {
    nom: editForm.nom,
    telephone: editForm.telephone,
    email: editForm.email || null,
  }
  if (editNeedsGeo.value && editSelectedGeoAreaId.value) {
    payload.geographic_area_id = editSelectedGeoAreaId.value
  }
  try {
    await api.put(`/users/${editForm.id}`, payload)
    editSuccess.value = t('users.modified')
    await loadUsers(currentPage.value)
  } catch (e) {
    editError.value = e.response?.data?.message || t('errors.generic')
  } finally { editLoading.value = false }
}

async function resetPwd(id, name) {
  if (!confirm(t('users.resetConfirm', { name }))) return
  try {
    const { data } = await api.post(`/users/${id}/reset-password`)
    resetUserName.value = name
    resetPwdValue.value = data.password
    const modal = new Modal(document.getElementById('pwdModal'))
    modal.show()
  } catch (e) { alert(e.response?.data?.message || t('errors.generic')) }
}

async function deleteUser(id, name) {
  if (!confirm(t('users.deleteConfirm', { name }))) return
  try {
    await api.delete(`/users/${id}`)
    await loadUsers(currentPage.value)
  } catch (e) { alert(e.response?.data?.message || t('errors.generic')) }
}

onMounted(() => {
  loadUsers(1)
  loadProvinces()
})
</script>
