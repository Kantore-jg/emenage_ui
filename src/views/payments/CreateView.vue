<template>
  <div class="row justify-content-center">
    <div class="col-md-6">
      <div class="card shadow-sm">
        <div class="card-header bg-white py-3">
          <h4 class="mb-0 text-primary"><i class="fas fa-file-invoice-dollar me-2"></i>Enregistrer un Paiement</h4>
        </div>
        <div class="card-body">
          <div v-if="error" class="alert alert-danger">{{ error }}</div>
          <form @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label class="form-label">Motif du Paiement *</label>
              <select class="form-select" v-model="form.motif" required>
                <option value="" disabled>Choisir un motif...</option>
                <option value="poubelle">Poubelles</option>
                <option value="regideso">REGIDESO (Électricité)</option>
                <option value="eau">Eau</option>
                <option value="impot">Impôts Fonciers</option>
                <option value="autre">Autre...</option>
              </select>
            </div>
            <div v-if="form.motif === 'autre'" class="mb-3">
              <label class="form-label">Précisez le motif *</label>
              <input type="text" class="form-control" v-model="form.motif_autre" :required="form.motif === 'autre'">
            </div>
            <div class="mb-3">
              <label class="form-label">Montant (FBU) *</label>
              <input type="number" class="form-control" v-model="form.montant" required min="1">
            </div>
            <div class="mb-3">
              <label class="form-label">Date du Paiement *</label>
              <input type="date" class="form-control" v-model="form.date_paiement" required :max="today">
            </div>
            <div class="mb-4">
              <label class="form-label">Photo du Reçu *</label>
              <input type="file" class="form-control" @change="form.recu_photo = $event.target.files[0]" accept="image/*" required>
              <small class="text-muted"><i class="fas fa-info-circle"></i> JPG, PNG. Max: 5MB.</small>
            </div>
            <div class="d-grid gap-2">
              <button type="submit" class="btn btn-primary btn-lg" :disabled="loading"><i class="fas fa-paper-plane me-1"></i> Envoyer</button>
              <router-link to="/payments" class="btn btn-light border">Annuler</router-link>
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
const today = new Date().toISOString().split('T')[0]
const form = reactive({ motif: '', motif_autre: '', montant: '', date_paiement: '', recu_photo: null })
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = ''; loading.value = true
  const fd = new FormData()
  fd.append('motif', form.motif)
  if (form.motif_autre) fd.append('motif_autre', form.motif_autre)
  fd.append('montant', form.montant)
  fd.append('date_paiement', form.date_paiement)
  if (form.recu_photo) fd.append('recu_photo', form.recu_photo)
  try {
    await api.post('/payments', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    router.push('/payments?success=true')
  } catch (e) {
    error.value = e.response?.data?.message || 'Erreur'
  } finally { loading.value = false }
}
</script>
