<template>
  <div class="row justify-content-center">
    <div class="col-md-8">
      <div class="card">
        <div class="card-header"><h4><i class="fas fa-plus"></i> {{ $t('announcements.createTitle') }}</h4></div>
        <div class="card-body">
          <div v-if="error" class="alert alert-danger"><i class="fas fa-exclamation-circle"></i> {{ error }}</div>
          <form @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label for="titre" class="form-label">{{ $t('announcements.titleLabel') }} *</label>
              <input type="text" class="form-control" v-model="form.titre" required>
            </div>
            <div class="mb-3">
              <label for="autorite" class="form-label">{{ $t('announcements.authorityLabel') }} *</label>
              <input type="text" class="form-control" v-model="form.autorite" required :placeholder="$t('announcements.authorityPlaceholder')">
            </div>
            <div class="mb-3">
              <label for="date" class="form-label">{{ $t('announcements.dateLabel') }} *</label>
              <input type="date" class="form-control" v-model="form.date" required>
            </div>
            <div class="mb-3">
              <label for="contenu" class="form-label">{{ $t('announcements.contentLabel') }} *</label>
              <textarea class="form-control" v-model="form.contenu" rows="10" required></textarea>
            </div>
            <div class="form-check mb-3">
              <input id="sendEmailToAll" v-model="form.send_email_to_all" class="form-check-input" type="checkbox">
              <label class="form-check-label" for="sendEmailToAll">
                {{ $t('announcements.sendEmailToAll') }}
              </label>
              <div class="form-text">{{ $t('announcements.sendEmailToAllHelp') }}</div>
            </div>
            <div class="d-flex justify-content-between">
              <router-link to="/announcements" class="btn btn-secondary"><i class="fas fa-times"></i> {{ $t('common.cancel') }}</router-link>
              <button type="submit" class="btn btn-primary" :disabled="loading"><i class="fas fa-paper-plane"></i> {{ $t('announcements.publishButton') }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '../../services/api'

const router = useRouter()
const { t } = useI18n()
const form = reactive({ titre: '', contenu: '', autorite: '', date: new Date().toISOString().split('T')[0], send_email_to_all: false })
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    await api.post('/announcements', form)
    router.push('/announcements')
  } catch (e) {
    error.value = e.response?.data?.message || t('announcements.publishError')
  } finally { loading.value = false }
}
</script>
