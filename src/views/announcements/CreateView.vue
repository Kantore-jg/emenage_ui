<template>
  <div class="row justify-content-center">
    <div class="col-md-8">
      <div class="card">
        <div class="card-header"><h4><i class="fas fa-plus"></i> Publier un Communiqué Officiel</h4></div>
        <div class="card-body">
          <div v-if="error" class="alert alert-danger"><i class="fas fa-exclamation-circle"></i> {{ error }}</div>
          <form @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label for="titre" class="form-label">Titre *</label>
              <input type="text" class="form-control" v-model="form.titre" required>
            </div>
            <div class="mb-3">
              <label for="autorite" class="form-label">Autorité émettrice *</label>
              <input type="text" class="form-control" v-model="form.autorite" required placeholder="Ex: Mairie de Bujumbura...">
            </div>
            <div class="mb-3">
              <label for="date" class="form-label">Date *</label>
              <input type="date" class="form-control" v-model="form.date" required>
            </div>
            <div class="mb-3">
              <label for="contenu" class="form-label">Contenu *</label>
              <textarea class="form-control" v-model="form.contenu" rows="10" required></textarea>
            </div>
            <div class="d-flex justify-content-between">
              <router-link to="/announcements" class="btn btn-secondary"><i class="fas fa-times"></i> Annuler</router-link>
              <button type="submit" class="btn btn-primary" :disabled="loading"><i class="fas fa-paper-plane"></i> Publier</button>
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
import api from '../../services/api'

const router = useRouter()
const form = reactive({ titre: '', contenu: '', autorite: '', date: new Date().toISOString().split('T')[0] })
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    await api.post('/announcements', form)
    router.push('/announcements')
  } catch (e) {
    error.value = e.response?.data?.message || 'Erreur lors de la publication'
  } finally { loading.value = false }
}
</script>
