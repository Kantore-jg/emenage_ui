<template>
  <div class="row justify-content-center" v-if="form">
    <div class="col-md-8">
      <div class="card">
        <div class="card-header"><h4><i class="fas fa-edit"></i> Modifier le Communiqué</h4></div>
        <div class="card-body">
          <div v-if="message" class="alert" :class="messageType === 'success' ? 'alert-success' : 'alert-danger'">{{ message }}</div>
          <form @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label class="form-label">Titre *</label>
              <input type="text" class="form-control" v-model="form.titre" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Autorité émettrice *</label>
              <input type="text" class="form-control" v-model="form.autorite" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Date *</label>
              <input type="date" class="form-control" v-model="form.date" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Contenu *</label>
              <textarea class="form-control" v-model="form.contenu" rows="10" required></textarea>
            </div>
            <div class="d-flex justify-content-between">
              <router-link :to="`/announcements/${route.params.id}`" class="btn btn-secondary"><i class="fas fa-times"></i> Annuler</router-link>
              <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Enregistrer</button>
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
import api from '../../services/api'

const route = useRoute()
const router = useRouter()
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
    message.value = 'Communiqué modifié avec succès!'
    messageType.value = 'success'
    setTimeout(() => router.push(`/announcements/${route.params.id}`), 1500)
  } catch (e) {
    message.value = e.response?.data?.message || 'Erreur'
    messageType.value = 'error'
  }
}
</script>
