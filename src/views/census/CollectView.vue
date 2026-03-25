<template>
  <div v-if="loading" class="text-center py-5">
    <div class="spinner-border text-primary"></div>
  </div>

  <template v-else>
    <!-- Liste des campagnes assignées -->
    <div v-if="!activeCensus">
      <h2 class="mb-4"><i class="fas fa-clipboard-check"></i> {{ $t('census.myCampaigns') }}</h2>

      <div v-if="!campaigns.length" class="text-center py-5 text-muted">
        <i class="fas fa-clipboard fa-3x mb-3"></i>
        <p>{{ $t('census.noCampaignAssigned') }}</p>
      </div>

      <div class="row g-3">
        <div class="col-md-6" v-for="c in campaigns" :key="c.id">
          <div class="card h-100">
            <div class="card-body">
              <h5>{{ c.titre }}</h5>
              <p v-if="c.description" class="text-muted small">{{ c.description }}</p>
              <div class="small text-muted mb-3">
                <div><i class="fas fa-map-marker-alt"></i> Zone : {{ c.assigned_zone?.name || '-' }}</div>
                <div><i class="fas fa-calendar"></i> {{ c.date_debut ? formatDate(c.date_debut) : '-' }} → {{ c.date_fin ? formatDate(c.date_fin) : '-' }}</div>
                <div><i class="fas fa-file-alt"></i> {{ c.my_responses_count || 0 }} {{ $t('census.responses') }}</div>
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-primary btn-sm" @click="startCollect(c)">
                  <i class="fas fa-plus"></i> {{ $t('census.collectFor') }}
                </button>
                <button class="btn btn-outline-secondary btn-sm" @click="viewMyResponses(c)">
                  <i class="fas fa-list"></i> {{ $t('census.myResponses') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Formulaire de collecte -->
    <template v-if="activeCensus && !viewingResponses">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>{{ activeCensus.titre }}</h2>
        <button class="btn btn-outline-secondary btn-sm" @click="activeCensus = null">
          <i class="fas fa-arrow-left"></i> {{ $t('common.back') }}
        </button>
      </div>

      <div v-if="submitSuccess" class="alert alert-success">
        <i class="fas fa-check-circle"></i> {{ $t('census.responseSuccess') }}
        <button class="btn btn-primary btn-sm ms-2" @click="submitSuccess = false">{{ $t('census.collectFor') }}</button>
      </div>

      <div v-if="submitError" class="alert alert-danger">{{ submitError }}</div>

      <form v-if="!submitSuccess" @submit.prevent="submitResponse" class="row justify-content-center">
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header bg-primary text-white">
              <div class="d-flex justify-content-between align-items-center">
                <span><i class="fas fa-clipboard"></i> {{ $t('census.collectTitle') }}</span>
                <span v-if="assignedZone" class="badge bg-light text-dark">
                  {{ assignedZone.name }}
                </span>
              </div>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label fw-bold">{{ $t('census.respondentName') }}</label>
                <input type="text" class="form-control" v-model="response.respondent_name" required :placeholder="$t('census.respondentNamePlaceholder')">
              </div>

              <hr>

              <div v-for="field in formFields" :key="field.id" class="mb-3">
                <label class="form-label">
                  {{ field.label }}
                  <span v-if="field.required" class="text-danger">*</span>
                </label>

                <input v-if="field.type === 'text'" type="text" class="form-control" v-model="response.values[field.id]" :required="field.required">
                <textarea v-else-if="field.type === 'textarea'" class="form-control" v-model="response.values[field.id]" rows="3" :required="field.required"></textarea>
                <input v-else-if="field.type === 'number'" type="number" class="form-control" v-model.number="response.values[field.id]" :required="field.required">
                <input v-else-if="field.type === 'date'" type="date" class="form-control" v-model="response.values[field.id]" :required="field.required">

                <div v-else-if="field.type === 'boolean'" class="d-flex gap-3">
                  <div class="form-check">
                    <input class="form-check-input" type="radio" :name="'f'+field.id" :id="'f'+field.id+'y'" value="1" v-model="response.values[field.id]">
                    <label class="form-check-label" :for="'f'+field.id+'y'">{{ $t('common.yes') }}</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="radio" :name="'f'+field.id" :id="'f'+field.id+'n'" value="0" v-model="response.values[field.id]">
                    <label class="form-check-label" :for="'f'+field.id+'n'">{{ $t('common.no') }}</label>
                  </div>
                </div>

                <select v-else-if="field.type === 'select'" class="form-select" v-model="response.values[field.id]" :required="field.required">
                  <option value="">{{ $t('users.selectOption') }}</option>
                  <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
                </select>

                <template v-else-if="field.type === 'multi_select'">
                  <div v-for="opt in field.options" :key="opt" class="form-check">
                    <input class="form-check-input" type="checkbox" :value="opt" v-model="response.values[field.id]" :id="'f'+field.id+'-'+opt">
                    <label class="form-check-label" :for="'f'+field.id+'-'+opt">{{ opt }}</label>
                  </div>
                </template>
              </div>
            </div>
            <div class="card-footer d-flex justify-content-end">
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
                <i v-else class="fas fa-paper-plane me-1"></i>
                {{ $t('census.submitResponse') }}
              </button>
            </div>
          </div>
        </div>
      </form>
    </template>

    <!-- Mes réponses -->
    <template v-if="viewingResponses">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>{{ $t('census.responsesTitle') }} - {{ activeCensus.titre }}</h2>
        <button class="btn btn-outline-secondary btn-sm" @click="viewingResponses = false; activeCensus = null">
          <i class="fas fa-arrow-left"></i> {{ $t('common.back') }}
        </button>
      </div>
      <div class="card">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm mb-0">
              <thead class="bg-light">
                <tr>
                  <th>{{ $t('common.date') }}</th><th>Répondant</th>
                  <th v-for="f in formFields" :key="f.id">{{ f.label }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!myResponses.length"><td :colspan="2 + formFields.length" class="text-center text-muted py-3">{{ $t('census.noResponse') }}</td></tr>
                <tr v-for="r in myResponses" :key="r.id">
                  <td><small>{{ formatDate(r.created_at) }}</small></td>
                  <td>{{ r.respondent_name }}</td>
                  <td v-for="f in formFields" :key="f.id">
                    {{ getResponseVal(r, f.id) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </template>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../../services/api'

const { t } = useI18n()

const loading = ref(true)
const campaigns = ref([])
const activeCensus = ref(null)
const formFields = ref([])
const assignedZone = ref(null)
const viewingResponses = ref(false)
const myResponses = ref([])

const response = reactive({ respondent_name: '', values: {} })
const submitting = ref(false)
const submitSuccess = ref(false)
const submitError = ref('')

function formatDate(d) { return new Date(d).toLocaleDateString('fr-FR') }

async function load() {
  loading.value = true
  try {
    const { data } = await api.get('/census/my-campaigns')
    campaigns.value = data.censuses || []
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

async function startCollect(campaign) {
  activeCensus.value = campaign
  viewingResponses.value = false
  submitSuccess.value = false
  submitError.value = ''
  try {
    const { data } = await api.get(`/census/${campaign.id}/form`)
    formFields.value = data.census?.fields || []
    assignedZone.value = data.assigned_zone || null
    resetResponse()
  } catch (e) { console.error(e) }
}

function resetResponse() {
  response.respondent_name = ''
  response.values = {}
  formFields.value.forEach(f => {
    response.values[f.id] = f.type === 'multi_select' ? [] : ''
  })
}

async function submitResponse() {
  submitError.value = ''; submitting.value = true
  try {
    await api.post(`/census/${activeCensus.value.id}/responses`, {
      respondent_name: response.respondent_name,
      values: response.values,
    })
    submitSuccess.value = true
    resetResponse()
  } catch (e) {
    submitError.value = e.response?.data?.message || t('errors.generic')
  } finally { submitting.value = false }
}

async function viewMyResponses(campaign) {
  activeCensus.value = campaign
  viewingResponses.value = true
  try {
    const { data: formData } = await api.get(`/census/${campaign.id}/form`)
    formFields.value = formData.census?.fields || []
    const { data } = await api.get(`/census/${campaign.id}/my-responses`)
    myResponses.value = data.responses || []
  } catch (e) { console.error(e) }
}

function getResponseVal(r, fieldId) {
  const v = r.values?.find(x => x.field_id === fieldId)
  if (!v) return '-'
  try {
    const parsed = JSON.parse(v.value)
    if (Array.isArray(parsed)) return parsed.join(', ')
    return v.value
  } catch {
    return v.value
  }
}

onMounted(load)
</script>
