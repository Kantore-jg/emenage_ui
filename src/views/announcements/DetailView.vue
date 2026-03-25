<template>
  <div class="row justify-content-center" v-if="announcement">
    <div class="col-md-8">
      <div class="card">
        <div class="card-header"><i class="fas fa-stamp"></i> {{ announcement.titre }}</div>
        <div class="card-body">
          <div class="mb-3">
            <span class="badge bg-primary"><i class="fas fa-building"></i> {{ announcement.autorite }}</span>
            <span class="badge bg-secondary ms-2"><i class="fas fa-user"></i> {{ announcement.author_name }}</span>
            <span class="badge bg-info ms-2"><i class="fas fa-calendar"></i> {{ formatDate(announcement.date) }}</span>
          </div>
          <div class="announcement-content" v-html="announcement.contenu.replace(/\n/g, '<br>')"></div>
        </div>
        <div class="card-footer d-flex justify-content-between">
          <router-link to="/announcements" class="btn btn-secondary"><i class="fas fa-arrow-left"></i> {{ $t('common.back') }}</router-link>
          <div v-if="canEdit">
            <router-link :to="`/announcements/${announcement.id}/edit`" class="btn btn-warning me-2"><i class="fas fa-edit"></i> {{ $t('common.edit') }}</router-link>
            <button class="btn btn-danger" @click="deleteAnnouncement"><i class="fas fa-trash"></i> {{ $t('common.delete') }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../../stores/auth'
import { useI18n } from 'vue-i18n'
import api from '../../services/api'

const route = useRoute()
const router = useRouter()
const { user, isAuthenticated } = useAuth()
const { t } = useI18n()
const announcement = ref(null)

const canEdit = computed(() => isAuthenticated.value && announcement.value && (user.value?.id === announcement.value.author_id || user.value?.role === 'admin'))

function formatDate(d) { return new Date(d).toLocaleDateString('fr-FR') }

async function deleteAnnouncement() {
  if (!confirm(t('announcements.deleteConfirm'))) return
  try {
    await api.delete(`/announcements/${route.params.id}`)
    router.push('/announcements')
  } catch (e) { alert(e.response?.data?.message || t('errors.generic')) }
}

onMounted(async () => {
  try {
    const { data } = await api.get(`/announcements/${route.params.id}`)
    announcement.value = data.announcement
  } catch (e) { console.error(e) }
})
</script>
