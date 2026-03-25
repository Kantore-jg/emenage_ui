<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2><i class="fas fa-exclamation-triangle"></i> {{ $t('reports.myTitle') }}</h2>
      <router-link to="/reports/create" class="btn btn-danger">
        <i class="fas fa-plus"></i> {{ $t('reports.newReport') }}
      </router-link>
    </div>

    <div v-if="loading" class="text-center py-5"><div class="spinner-border text-primary"></div></div>

    <div v-else-if="reports.length === 0" class="text-center py-5 text-muted">
      <i class="fas fa-info-circle fa-3x mb-3 d-block"></i>
      {{ $t('reports.noReport') }}
    </div>

    <div v-else class="row g-3">
      <div v-for="r in reports" :key="r.id" class="col-md-6">
        <div class="card h-100 border-start border-3" :class="{
          'border-warning': r.statut === 'en_attente',
          'border-info': r.statut === 'en_cours',
          'border-success': r.statut === 'resolu'
        }">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="badge" :class="{
                'bg-warning text-dark': r.statut === 'en_attente',
                'bg-info': r.statut === 'en_cours',
                'bg-success': r.statut === 'resolu'
              }">
                {{ r.statut === 'en_attente' ? $t('dashboard.enAttente') : r.statut === 'en_cours' ? $t('dashboard.enCours') : $t('dashboard.resolu') }}
              </span>
              <small class="text-muted"><i class="fas fa-clock"></i> {{ formatDate(r.created_at) }}</small>
            </div>
            <p class="mb-2">{{ r.description }}</p>

            <div v-if="r.photos && r.photos.length" class="d-flex flex-wrap gap-1 mb-2">
              <a v-for="p in r.photos" :key="p.id" :href="p.url" target="_blank">
                <img :src="p.url" class="rounded border" style="width: 60px; height: 60px; object-fit: cover;">
              </a>
            </div>

            <div v-if="r.latitude" class="small text-muted mb-2">
              <i class="fas fa-map-marker-alt"></i> {{ r.latitude }}, {{ r.longitude }}
            </div>

            <div v-if="r.feedback" class="alert alert-light p-2 mb-0">
              <div class="mb-1">
                <span v-for="s in 5" :key="s" class="text-warning">
                  <i :class="s <= r.feedback.rating ? 'fas fa-star' : 'far fa-star'"></i>
                </span>
                <small class="ms-1 text-muted">{{ r.feedback.rating }}/5</small>
              </div>
              <small v-if="r.feedback.comment">{{ r.feedback.comment }}</small>
            </div>

            <button v-else-if="r.statut === 'resolu'" class="btn btn-sm btn-outline-success mt-2" @click="openFeedback(r)">
              <i class="fas fa-star"></i> {{ $t('feedback.giveFeedback') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="feedbackModal" tabindex="-1" ref="feedbackModalEl">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="fas fa-star text-warning"></i> {{ $t('feedback.title') }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="submitFeedback">
            <div class="modal-body">
              <div v-if="feedbackError" class="alert alert-danger small">{{ feedbackError }}</div>
              <p class="text-muted small mb-3">{{ $t('feedback.rateResolution') }}</p>

              <div class="text-center mb-4">
                <span v-for="s in 5" :key="s" @click="feedbackForm.rating = s" style="cursor: pointer; font-size: 2rem;" class="mx-1" :class="s <= feedbackForm.rating ? 'text-warning' : 'text-muted'">
                  <i :class="s <= feedbackForm.rating ? 'fas fa-star' : 'far fa-star'"></i>
                </span>
                <div class="small text-muted mt-1">
                  {{ feedbackForm.rating > 0 ? ratingLabels[feedbackForm.rating - 1] : '' }}
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">{{ $t('feedback.comment') }}</label>
                <textarea class="form-control" v-model="feedbackForm.comment" rows="3" :placeholder="$t('feedback.commentPlaceholder')"></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{{ $t('common.cancel') }}</button>
              <button type="submit" class="btn btn-success" :disabled="feedbackForm.rating === 0 || feedbackLoading">
                <span v-if="feedbackLoading" class="spinner-border spinner-border-sm me-1"></span>
                {{ $t('common.submit') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Modal } from 'bootstrap'
import api from '../../services/api'

const { t } = useI18n()
const reports = ref([])
const loading = ref(true)
const feedbackError = ref('')
const feedbackLoading = ref(false)
const feedbackModalEl = ref(null)
let feedbackModal = null
let currentReportId = null

const feedbackForm = reactive({ rating: 0, comment: '' })

const ratingLabels = computed(() => [
  t('feedback.star1'),
  t('feedback.star2'),
  t('feedback.star3'),
  t('feedback.star4'),
  t('feedback.star5'),
])

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

async function loadReports() {
  loading.value = true
  try {
    const { data } = await api.get('/reports/all', { params: { per_page: 100 } })
    reports.value = data.reports || []
  } catch (e) {
    console.error(e)
  } finally { loading.value = false }
}

function openFeedback(report) {
  currentReportId = report.id
  feedbackForm.rating = 0
  feedbackForm.comment = ''
  feedbackError.value = ''
  if (!feedbackModal) {
    feedbackModal = new Modal(feedbackModalEl.value)
  }
  feedbackModal.show()
}

async function submitFeedback() {
  feedbackError.value = ''
  feedbackLoading.value = true
  try {
    await api.post(`/reports/${currentReportId}/feedback`, {
      rating: feedbackForm.rating,
      comment: feedbackForm.comment || null,
    })
    feedbackModal.hide()
    await loadReports()
  } catch (e) {
    feedbackError.value = e.response?.data?.message || t('errors.generic')
  } finally { feedbackLoading.value = false }
}

onMounted(loadReports)
</script>
