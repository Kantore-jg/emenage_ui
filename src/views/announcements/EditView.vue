<template>
  <div class="row justify-content-center" v-if="form">
    <div class="col-md-8">
      <div class="card">
        <div class="card-header"><h4><i class="fas fa-edit"></i> {{ $t('announcements.editTitle') }}</h4></div>
        <div class="card-body">
          <div v-if="message" class="alert" :class="messageType === 'success' ? 'alert-success' : 'alert-danger'">{{ message }}</div>
          <form @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label class="form-label">{{ $t('announcements.titleLabel') }} *</label>
              <input type="text" class="form-control" v-model="form.titre" required>
            </div>
            <div class="mb-3">
              <label class="form-label">{{ $t('announcements.authorityLabel') }} *</label>
              <input type="text" class="form-control" v-model="form.autorite" required>
            </div>
            <div class="mb-3">
              <label class="form-label">{{ $t('announcements.dateLabel') }} *</label>
              <input type="date" class="form-control" v-model="form.date" required>
            </div>
            <div class="mb-3">
              <label class="form-label">{{ $t('announcements.contentLabel') }} *</label>
              <textarea class="form-control" v-model="form.contenu" rows="10" required></textarea>
            </div>
            <div class="d-flex justify-content-between">
              <router-link :to="`/announcements/${route.params.id}`" class="btn btn-secondary"><i class="fas fa-times"></i> {{ $t('common.cancel') }}</router-link>
              <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> {{ $t('common.save') }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '../../services/api'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const form = ref(null)
const message = ref('')
const messageType = ref('')

onMounted(async () => {
  try {
    const { data } = await api.get(`/announcements/${route.params.id}`)
    const a = data.announcement
    form.value = reactive({
      titre: a.titre,
      contenu: a.contenu,
      autorite: a.autorite,
      date: new Date(a.date).toISOString().split('T')[0],
    })
  } catch (e) { console.error(e) }
})

async function handleSubmit() {
  try {
    await api.put(`/announcements/${route.params.id}`, form.value)
    message.value = t('announcements.updated')
    messageType.value = 'success'
    setTimeout(() => router.push(`/announcements/${route.params.id}`), 1500)
  } catch (e) {
    message.value = e.response?.data?.message || t('errors.generic')
    messageType.value = 'error'
  }
}
</script>
