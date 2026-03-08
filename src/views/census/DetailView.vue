<template>
  <div v-if="loading" class="text-center py-5">
    <div class="spinner-border text-primary"></div>
  </div>

  <template v-else-if="census">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2>{{ census.titre }}</h2>
        <span class="badge fs-6" :class="statutBadge(census.statut)">{{ census.statut }}</span>
      </div>
      <div class="d-flex gap-2">
        <select class="form-select form-select-sm" style="width: auto;" v-model="census.statut" @change="updateStatut">
          <option value="brouillon">Brouillon</option>
          <option value="actif">Actif</option>
          <option value="termine">Terminé</option>
          <option value="archive">Archivé</option>
        </select>
        <router-link to="/censuses" class="btn btn-outline-secondary btn-sm">
          <i class="fas fa-arrow-left"></i> Retour
        </router-link>
      </div>
    </div>

    <!-- Infos -->
    <div class="row mb-4">
      <div class="col-md-8">
        <div class="card">
          <div class="card-body">
            <p v-if="census.description">{{ census.description }}</p>
            <div class="row text-muted small">
              <div class="col-md-4"><i class="fas fa-calendar"></i> {{ census.date_debut ? formatDate(census.date_debut) : '-' }} → {{ census.date_fin ? formatDate(census.date_fin) : '-' }}</div>
              <div class="col-md-4"><i class="fas fa-map-marker-alt"></i> {{ census.geographic_area?.name || 'Tout le pays' }}</div>
              <div class="col-md-4"><i class="fas fa-user"></i> Créé par {{ census.creator?.nom }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card bg-primary text-white text-center">
          <div class="card-body">
            <div class="fs-1 fw-bold">{{ stats?.total_responses || census.responses_count || 0 }}</div>
            <div>réponses collectées</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <ul class="nav nav-tabs mb-3">
      <li class="nav-item"><a class="nav-link" :class="{ active: tab === 'fields' }" href="#" @click.prevent="tab = 'fields'">Champs ({{ census.fields?.length }})</a></li>
      <li class="nav-item"><a class="nav-link" :class="{ active: tab === 'agents' }" href="#" @click.prevent="tab = 'agents'">Agents ({{ agents.length }})</a></li>
      <li class="nav-item"><a class="nav-link" :class="{ active: tab === 'responses' }" href="#" @click.prevent="tab = 'responses'; loadTable()">Réponses</a></li>
      <li class="nav-item"><a class="nav-link" :class="{ active: tab === 'stats' }" href="#" @click.prevent="tab = 'stats'; loadStats()">Statistiques</a></li>
    </ul>

    <!-- TAB: Champs -->
    <div v-if="tab === 'fields'" class="card">
      <div class="card-body p-0">
        <table class="table mb-0">
          <thead class="bg-light"><tr><th>#</th><th>Label</th><th>Type</th><th>Obligatoire</th><th>Options</th></tr></thead>
          <tbody>
            <tr v-for="(f, i) in census.fields" :key="f.id">
              <td>{{ i + 1 }}</td>
              <td><strong>{{ f.label }}</strong></td>
              <td><span class="badge bg-light text-dark">{{ f.type }}</span></td>
              <td><i :class="f.required ? 'fas fa-check text-success' : 'fas fa-minus text-muted'"></i></td>
              <td><small>{{ f.options ? f.options.join(', ') : '-' }}</small></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB: Agents -->
    <div v-if="tab === 'agents'">
      <div class="card mb-3">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Agents assignés</h5>
          <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#addAgentModal">
            <i class="fas fa-user-plus"></i> Ajouter un agent
          </button>
        </div>
        <div class="card-body p-0">
          <table class="table mb-0">
            <thead class="bg-light"><tr><th>Nom</th><th>Téléphone</th><th>Zone assignée</th><th>Actions</th></tr></thead>
            <tbody>
              <tr v-if="!agents.length"><td colspan="4" class="text-center text-muted py-3">Aucun agent</td></tr>
              <tr v-for="a in agents" :key="a.id">
                <td><strong>{{ a.user?.nom }}</strong></td>
                <td>{{ a.user?.telephone }}</td>
                <td>{{ a.geographic_area?.name || '-' }}</td>
                <td>
                  <button class="btn btn-outline-danger btn-sm" @click="removeAgent(a.id)"><i class="fas fa-times"></i></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB: Réponses -->
    <div v-if="tab === 'responses'">
      <div class="d-flex justify-content-end mb-3">
        <button class="btn btn-success btn-sm" @click="downloadCsv">
          <i class="fas fa-file-csv"></i> Exporter CSV
        </button>
      </div>
      <div class="card">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm mb-0">
              <thead class="bg-light">
                <tr>
                  <th>Date</th><th>Agent</th><th>Zone</th><th>Répondant</th>
                  <th v-for="col in tableColumns" :key="col">{{ col }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!tableData.length"><td :colspan="4 + tableColumns.length" class="text-center text-muted py-3">Aucune réponse</td></tr>
                <tr v-for="row in tableData" :key="row.id">
                  <td><small>{{ row.date }}</small></td>
                  <td>{{ row.agent }}</td>
                  <td>{{ row.zone }}</td>
                  <td>{{ row.respondent }}</td>
                  <td v-for="fid in tableFieldIds" :key="fid">
                    {{ Array.isArray(row.fields[fid]) ? row.fields[fid].join(', ') : row.fields[fid] }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB: Statistiques -->
    <div v-if="tab === 'stats' && stats">
      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="card">
            <div class="card-header"><h6 class="mb-0">Par agent</h6></div>
            <ul class="list-group list-group-flush">
              <li v-for="a in stats.by_agent" :key="a.agent" class="list-group-item d-flex justify-content-between">
                {{ a.agent }} <span class="badge bg-primary">{{ a.total }}</span>
              </li>
            </ul>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card">
            <div class="card-header"><h6 class="mb-0">Par zone</h6></div>
            <ul class="list-group list-group-flush">
              <li v-for="z in stats.by_zone" :key="z.zone" class="list-group-item d-flex justify-content-between">
                {{ z.zone }} <span class="badge bg-info">{{ z.total }}</span>
              </li>
            </ul>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card">
            <div class="card-header"><h6 class="mb-0">Par jour</h6></div>
            <ul class="list-group list-group-flush">
              <li v-for="d in stats.by_day" :key="d.jour" class="list-group-item d-flex justify-content-between">
                {{ d.jour }} <span class="badge bg-success">{{ d.total }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h6 class="mb-0">Statistiques par champ</h6></div>
        <div class="card-body">
          <div v-for="fs in stats.field_stats" :key="fs.field_id" class="mb-4">
            <h6>{{ fs.label }} <small class="text-muted">({{ fs.type }})</small></h6>
            <div v-if="fs.type === 'number'" class="row text-center">
              <div class="col"><div class="border rounded p-2"><div class="fw-bold">{{ fs.count }}</div><small class="text-muted">réponses</small></div></div>
              <div class="col"><div class="border rounded p-2"><div class="fw-bold">{{ fs.avg?.toFixed(1) }}</div><small class="text-muted">moyenne</small></div></div>
              <div class="col"><div class="border rounded p-2"><div class="fw-bold">{{ fs.sum }}</div><small class="text-muted">total</small></div></div>
              <div class="col"><div class="border rounded p-2"><div class="fw-bold">{{ fs.min }}</div><small class="text-muted">min</small></div></div>
              <div class="col"><div class="border rounded p-2"><div class="fw-bold">{{ fs.max }}</div><small class="text-muted">max</small></div></div>
            </div>
            <div v-else-if="fs.distribution">
              <div v-for="(count, val) in fs.distribution" :key="val" class="d-flex align-items-center gap-2 mb-1">
                <span style="min-width: 120px;">{{ val }}</span>
                <div class="progress flex-grow-1" style="height: 20px;">
                  <div class="progress-bar" :style="{ width: (count / stats.total_responses * 100) + '%' }">{{ count }}</div>
                </div>
              </div>
            </div>
            <div v-else class="text-muted small">{{ fs.total_reponses }} réponses, {{ fs.vides }} vides</div>
          </div>
        </div>
      </div>
    </div>
  </template>

  <!-- Modal ajouter agent -->
  <div class="modal fade" id="addAgentModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Ajouter un agent</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <form @submit.prevent="addAgent">
          <div class="modal-body">
            <div v-if="agentError" class="alert alert-danger py-2">{{ agentError }}</div>
            <div v-if="agentPassword" class="alert alert-success py-2">
              Agent créé ! Mot de passe : <code class="fs-5">{{ agentPassword }}</code>
            </div>
            <div class="mb-3">
              <label class="form-label">Nom complet *</label>
              <input type="text" class="form-control" v-model="agentForm.nom" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Téléphone *</label>
              <input type="tel" class="form-control" v-model="agentForm.telephone" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input type="email" class="form-control" v-model="agentForm.email">
            </div>
            <div class="mb-3">
              <label class="form-label">Zone à couvrir *</label>
              <select class="form-select" v-model="agentForm.geoProvince" @change="loadAgentCommunes">
                <option value="">Province</option>
                <option v-for="p in agentProvinces" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </div>
            <div class="mb-3" v-if="agentCommunes.length">
              <select class="form-select" v-model="agentForm.geoCommune" @change="loadAgentZones">
                <option value="">Commune</option>
                <option v-for="c in agentCommunes" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div class="mb-3" v-if="agentZones.length">
              <select class="form-select" v-model="agentForm.geoZone">
                <option value="">Zone</option>
                <option v-for="z in agentZones" :key="z.id" :value="z.id">{{ z.name }}</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
            <button v-if="!agentPassword" type="submit" class="btn btn-primary" :disabled="agentLoading">
              <span v-if="agentLoading" class="spinner-border spinner-border-sm me-1"></span> Créer l'agent
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../../services/api'

const route = useRoute()
const id = route.params.id
const census = ref(null)
const agents = ref([])
const stats = ref(null)
const tableData = ref([])
const tableColumns = ref([])
const tableFieldIds = ref([])
const loading = ref(true)
const tab = ref('fields')

const agentForm = reactive({ nom: '', telephone: '', email: '', geoProvince: '', geoCommune: '', geoZone: '' })
const agentProvinces = ref([])
const agentCommunes = ref([])
const agentZones = ref([])
const agentError = ref('')
const agentPassword = ref('')
const agentLoading = ref(false)

function statutBadge(s) { return { brouillon: 'bg-secondary', actif: 'bg-success', termine: 'bg-info', archive: 'bg-dark' }[s] || 'bg-secondary' }
function formatDate(d) { return new Date(d).toLocaleDateString('fr-FR') }

async function load() {
  loading.value = true
  try {
    const { data } = await api.get(`/censuses/${id}`)
    census.value = data.census
    agents.value = data.census.agents || []
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

async function updateStatut() {
  try {
    await api.put(`/censuses/${id}`, { statut: census.value.statut })
  } catch (e) { console.error(e) }
}

async function loadTable() {
  try {
    const { data } = await api.get(`/censuses/${id}/table`)
    tableData.value = data.data || []
    tableColumns.value = data.columns?.slice(4) || []
    tableFieldIds.value = data.field_ids || []
  } catch (e) { console.error(e) }
}

async function loadStats() {
  try {
    const { data } = await api.get(`/censuses/${id}/stats`)
    stats.value = data
  } catch (e) { console.error(e) }
}

async function loadAgentCommunes() {
  agentCommunes.value = []; agentZones.value = []; agentForm.geoCommune = ''; agentForm.geoZone = ''
  if (agentForm.geoProvince) {
    const { data } = await api.get('/geographic/areas', { params: { parent_id: agentForm.geoProvince } })
    agentCommunes.value = data.areas || []
  }
}

async function loadAgentZones() {
  agentZones.value = []; agentForm.geoZone = ''
  if (agentForm.geoCommune) {
    const { data } = await api.get('/geographic/areas', { params: { parent_id: agentForm.geoCommune } })
    agentZones.value = data.areas || []
  }
}

async function addAgent() {
  agentError.value = ''; agentLoading.value = true; agentPassword.value = ''
  const geoId = agentForm.geoZone || agentForm.geoCommune || agentForm.geoProvince
  if (!geoId) { agentError.value = 'Sélectionnez une zone'; agentLoading.value = false; return }
  try {
    const { data } = await api.post(`/censuses/${id}/agents`, {
      nom: agentForm.nom, telephone: agentForm.telephone, email: agentForm.email || undefined,
      geographic_area_id: geoId,
    })
    agentPassword.value = data.password
    agents.value.push(data.agent)
  } catch (e) {
    agentError.value = e.response?.data?.message || 'Erreur'
  } finally { agentLoading.value = false }
}

async function downloadCsv() {
  try {
    const response = await api.get(`/censuses/${id}/export/csv`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `recensement-${id}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (e) { alert('Erreur lors du téléchargement') }
}

async function removeAgent(agentId) {
  if (!confirm('Retirer cet agent ?')) return
  try {
    await api.delete(`/censuses/${id}/agents/${agentId}`)
    agents.value = agents.value.filter(a => a.id !== agentId)
  } catch (e) { alert(e.response?.data?.message || 'Erreur') }
}

onMounted(async () => {
  await load()
  try {
    const { data } = await api.get('/geographic/areas')
    agentProvinces.value = data.areas || []
  } catch (e) { console.error(e) }
})
</script>
