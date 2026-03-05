<template>
  <div class="row justify-content-center">
    <div class="col-md-8 col-lg-6">
      <div class="card">
        <div class="card-header">
          <h4 class="mb-0"><i class="fas fa-user-plus"></i> Inscrire un Citoyen</h4>
        </div>
        <div class="card-body">
          <div v-if="error" class="alert alert-danger py-2">
            <i class="fas fa-exclamation-circle"></i> {{ error }}
          </div>

          <div v-if="createdPassword" class="alert alert-success">
            <h5><i class="fas fa-check-circle"></i> Citoyen inscrit avec succès !</h5>
            <p class="mb-1">Nom : <strong>{{ createdUser }}</strong></p>
            <p class="mb-1">Mot de passe généré : <code class="fs-5">{{ createdPassword }}</code></p>
            <small class="text-muted">Communiquez ces identifiants au citoyen.</small>
            <hr>
            <button class="btn btn-primary btn-sm" @click="resetForm">
              <i class="fas fa-plus"></i> Inscrire un autre citoyen
            </button>
          </div>

          <form v-if="!createdPassword" @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label class="form-label"><i class="fas fa-user"></i> Nom complet *</label>
              <input type="text" class="form-control" v-model="form.nom" required>
            </div>
            <div class="mb-3">
              <label class="form-label"><i class="fas fa-phone"></i> Téléphone *</label>
              <input type="tel" class="form-control" v-model="form.telephone" required>
            </div>
            <div class="mb-3">
              <label class="form-label"><i class="fas fa-envelope"></i> Email</label>
              <input type="email" class="form-control" v-model="form.email" placeholder="optionnel">
            </div>
            <div class="mb-3">
              <label class="form-label"><i class="fas fa-map-marker-alt"></i> Quartier *</label>
              <input type="text" class="form-control" v-model="form.quartier" required>
            </div>
            <div class="mb-3">
              <label class="form-label"><i class="fas fa-home"></i> Adresse complète *</label>
              <textarea class="form-control" v-model="form.adresse" rows="2" required></textarea>
            </div>
            <div class="mb-3">
              <label class="form-label"><i class="fas fa-camera"></i> Photo de profil</label>
              <input type="file" class="form-control" @change="photoFile = $event.target.files[0]" accept="image/*">
            </div>

            <div class="d-flex justify-content-between">
              <router-link to="/dashboard" class="btn btn-secondary">
                <i class="fas fa-arrow-left"></i> Retour
              </router-link>
              <button type="submit" class="btn btn-primary" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                <i v-else class="fas fa-user-plus me-1"></i>
                Inscrire le citoyen
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import api from '../../services/api'

const form = reactive({ nom: '', telephone: '', email: '', quartier: '', adresse: '' })
const photoFile = ref(null)
const error = ref('')
const loading = ref(false)
const createdPassword = ref('')
const createdUser = ref('')

async function handleSubmit() {
  error.value = ''; loading.value = true
  const fd = new FormData()
  fd.append('nom', form.nom)
  fd.append('telephone', form.telephone)
  if (form.email) fd.append('email', form.email)
  fd.append('quartier', form.quartier)
  fd.append('adresse', form.adresse)
  if (photoFile.value) fd.append('photo_profil', photoFile.value)
  try {
    const { data } = await api.post('/chef/citoyens', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    createdPassword.value = data.password
    createdUser.value = form.nom
  } catch (e) {
    error.value = e.response?.data?.message || 'Erreur lors de l\'inscription'
  } finally { loading.value = false }
}

function resetForm() {
  form.nom = ''; form.telephone = ''; form.email = ''; form.quartier = ''; form.adresse = ''
  photoFile.value = null; createdPassword.value = ''; createdUser.value = ''; error.value = ''
}
</script>
