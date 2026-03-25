<template>
  <div class="row justify-content-center">
    <div class="col-lg-8">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2><i class="fas fa-plus-circle"></i> {{ $t('census.createTitle') }}</h2>
        <router-link to="/censuses" class="btn btn-outline-secondary btn-sm">
          <i class="fas fa-arrow-left"></i> {{ $t('common.back') }}
        </router-link>
      </div>

      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div v-if="success" class="alert alert-success">
        <i class="fas fa-check-circle"></i> {{ success }}
        <router-link :to="`/censuses/${createdId}`" class="btn btn-success btn-sm ms-2">{{ $t('census.viewCampaign') }}</router-link>
      </div>

      <form v-if="!success" @submit.prevent="submit">
        <!-- Infos générales -->
        <div class="card mb-4">
          <div class="card-header"><h5 class="mb-0">{{ $t('census.generalInfo') }}</h5></div>
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label">{{ $t('census.campaignTitle') }} *</label>
              <input type="text" class="form-control" v-model="form.titre" required :placeholder="$t('census.campaignTitlePlaceholder')">
            </div>
            <div class="mb-3">
              <label class="form-label">{{ $t('census.descriptionLabel') }}</label>
              <textarea class="form-control" v-model="form.description" rows="3" :placeholder="$t('census.descriptionPlaceholder')"></textarea>
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">{{ $t('census.startDate') }}</label>
                <input type="date" class="form-control" v-model="form.date_debut">
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">{{ $t('census.endDate') }}</label>
                <input type="date" class="form-control" v-model="form.date_fin">
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">{{ $t('census.geoZone') }}</label>
              <select class="form-select" v-model="form.geographic_area_id">
                <option value="">{{ $t('census.entireCountry') }}</option>
                <option v-for="p in provinces" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Champs du formulaire -->
        <div class="card mb-4">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0"><i class="fas fa-list-alt"></i> {{ $t('census.formFields') }}</h5>
            <button type="button" class="btn btn-success btn-sm" @click="addField">
              <i class="fas fa-plus"></i> {{ $t('census.addField') }}
            </button>
          </div>
          <div class="card-body">
            <div v-if="!fields.length" class="text-center text-muted py-4">
              <i class="fas fa-clipboard fa-2x mb-2"></i>
              <p>{{ $t('census.addFieldMin') }}</p>
            </div>

            <div v-for="(field, idx) in fields" :key="idx" class="border rounded p-3 mb-3 position-relative">
              <button type="button" class="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-2" @click="removeField(idx)">
                <i class="fas fa-times"></i>
              </button>

              <div class="row">
                <div class="col-md-5 mb-2">
                  <label class="form-label small">{{ $t('census.questionLabel') }} *</label>
                  <input type="text" class="form-control form-control-sm" v-model="field.label" required :placeholder="$t('census.questionPlaceholder')">
                </div>
                <div class="col-md-3 mb-2">
                  <label class="form-label small">{{ $t('census.typeLabel') }} *</label>
                  <select class="form-select form-select-sm" v-model="field.type" required>
                    <option value="text">{{ $t('census.shortText') }}</option>
                    <option value="textarea">{{ $t('census.longText') }}</option>
                    <option value="number">{{ $t('census.number') }}</option>
                    <option value="date">{{ $t('census.dateType') }}</option>
                    <option value="boolean">{{ $t('census.yesNo') }}</option>
                    <option value="select">{{ $t('census.singleChoice') }}</option>
                    <option value="multi_select">{{ $t('census.multiChoice') }}</option>
                  </select>
                </div>
                <div class="col-md-2 mb-2 d-flex align-items-end">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" v-model="field.required" :id="'req-'+idx">
                    <label class="form-check-label small" :for="'req-'+idx">{{ $t('common.required') }}</label>
                  </div>
                </div>
                <div class="col-md-2 mb-2 d-flex align-items-end gap-1">
                  <button type="button" class="btn btn-sm btn-outline-secondary" @click="moveField(idx, -1)" :disabled="idx === 0" :title="$t('census.up')">
                    <i class="fas fa-arrow-up"></i>
                  </button>
                  <button type="button" class="btn btn-sm btn-outline-secondary" @click="moveField(idx, 1)" :disabled="idx === fields.length - 1" :title="$t('census.down')">
                    <i class="fas fa-arrow-down"></i>
                  </button>
                </div>
              </div>

              <!-- Options pour select/multi_select -->
              <div v-if="['select', 'multi_select'].includes(field.type)" class="mt-2">
                <label class="form-label small">{{ $t('census.options') }} *</label>
                <textarea
                  class="form-control form-control-sm"
                  v-model="field.optionsText"
                  rows="3"
                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-end gap-2">
          <button type="submit" class="btn btn-primary btn-lg" :disabled="submitting || !fields.length">
            <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="fas fa-save me-1"></i>
            {{ $t('census.createButton') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../../services/api'

const { t } = useI18n()

const form = reactive({ titre: '', description: '', date_debut: '', date_fin: '', geographic_area_id: '' })
const fields = ref([])
const provinces = ref([])
const error = ref('')
const success = ref('')
const submitting = ref(false)
const createdId = ref(null)

function addField() {
  fields.value.push({ label: '', type: 'text', required: false, optionsText: '' })
}

function removeField(idx) {
  fields.value.splice(idx, 1)
}

function moveField(idx, dir) {
  const target = idx + dir
  if (target < 0 || target >= fields.value.length) return
  const temp = fields.value[idx]
  fields.value[idx] = fields.value[target]
  fields.value[target] = temp
}

async function submit() {
  error.value = ''; submitting.value = true
  const payload = {
    titre: form.titre,
    description: form.description || null,
    date_debut: form.date_debut || null,
    date_fin: form.date_fin || null,
    geographic_area_id: form.geographic_area_id || null,
    fields: fields.value.map(f => ({
      label: f.label,
      type: f.type,
      required: f.required,
      options: ['select', 'multi_select'].includes(f.type)
        ? f.optionsText.split('\n').map(o => o.trim()).filter(Boolean)
        : null,
    })),
  }
  try {
    const { data } = await api.post('/censuses', payload)
    success.value = t('census.created')
    createdId.value = data.census.id
  } catch (e) {
    error.value = e.response?.data?.message || t('errors.generic')
  } finally { submitting.value = false }
}

onMounted(async () => {
  try {
    const { data } = await api.get('/geographic/areas')
    provinces.value = data.areas || []
  } catch (e) { console.error(e) }
})
</script>
