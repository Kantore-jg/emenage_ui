<template>
  <template v-if="apartment">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2><i class="fas fa-building"></i> {{ $t('apartments.details') }}</h2>
      <router-link to="/apartments" class="btn btn-secondary"><i class="fas fa-arrow-left"></i> {{ $t('common.back') }}</router-link>
    </div>

    <div class="row">
      <div class="col-md-4">
        <div class="card">
          <div class="card-header"><i class="fas fa-info-circle"></i> {{ $t('apartments.information') }}</div>
          <div class="card-body">
            <p><strong><i class="fas fa-user"></i> {{ $t('apartments.owner') }}:</strong><br>{{ apartment.owner?.nom }}</p>
            <p><strong><i class="fas fa-phone"></i> {{ $t('common.phone') }}:</strong><br>{{ apartment.owner?.telephone }}</p>
            <hr>
            <p><strong><i class="fas fa-road"></i> {{ $t('apartments.avenue') }}:</strong><br>{{ apartment.avenue }}</p>
            <p><strong><i class="fas fa-hashtag"></i> {{ $t('apartments.number') }}:</strong><br>N°{{ apartment.numero }}</p>
            <p v-if="apartment.description"><strong><i class="fas fa-align-left"></i> {{ $t('apartments.description') }}:</strong><br>{{ apartment.description }}</p>
            <hr>
            <p><strong><i class="fas fa-map-marker-alt"></i> {{ $t('apartments.fullAddress') }}:</strong></p>
            <p class="text-muted small">{{ fullAddress }}</p>
            <div v-if="ancestors.length" class="mt-2">
              <span v-for="anc in ancestors" :key="anc.id" class="badge bg-secondary me-1">
                {{ anc.level }}: {{ anc.name }}
              </span>
              <span class="badge bg-primary">{{ apartment.geographic_area?.name }}</span>
            </div>
            <hr>
            <p><strong><i class="fas fa-calendar"></i> {{ $t('common.date') }}:</strong><br>{{ formatDate(apartment.created_at) }}</p>
          </div>
        </div>
      </div>

      <div class="col-md-8">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <span><i class="fas fa-home"></i> {{ $t('apartments.linkedHouseholds') }} <span class="badge bg-primary ms-1">{{ apartment.households?.length || 0 }}</span></span>
          </div>
          <div class="card-body">
            <div v-if="!apartment.households?.length" class="alert alert-info">
              <i class="fas fa-info-circle"></i> {{ $t('apartments.noLinkedHousehold') }}
            </div>
            <div class="table-responsive" v-else>
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>{{ $t('households.headOfFamily') }}</th>
                    <th>{{ $t('households.membersCount') }}</th>
                    <th>{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="h in apartment.households" :key="h.id">
                    <td>
                      <strong>{{ h.chef?.nom }}</strong><br>
                      <small class="text-muted"><i class="fas fa-phone"></i> {{ h.chef?.telephone }}</small>
                    </td>
                    <td><span class="badge bg-primary">{{ h.members?.length || 0 }}</span></td>
                    <td>
                      <router-link :to="`/households/${h.id}`" class="btn btn-sm btn-primary">
                        <i class="fas fa-eye"></i> {{ $t('common.details') }}
                      </router-link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>

  <div v-else-if="loading" class="text-center py-4">
    <div class="spinner-border text-primary"></div>
    <p>{{ $t('common.loading') }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../../services/api'

const route = useRoute()
const apartment = ref(null)
const fullAddress = ref('')
const ancestors = ref([])
const loading = ref(true)

function formatDate(d) { return new Date(d).toLocaleDateString('fr-FR') }

async function loadData() {
  loading.value = true
  try {
    const { data } = await api.get(`/apartments/${route.params.id}`)
    apartment.value = data.apartment
    fullAddress.value = data.full_address || ''
    ancestors.value = data.ancestors || []
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

onMounted(loadData)
</script>
