<template>
  <div v-if="errorMsg" class="row justify-content-center">
    <div class="col-md-6">
      <div class="card">
        <div class="card-body text-center">
          <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
          <h4>Carte d'Identité Non Disponible</h4>
          <p class="text-muted">{{ errorMsg }}</p>
          <router-link to="/dashboard" class="btn btn-primary"><i class="fas fa-arrow-left"></i> Retour</router-link>
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="cardData" class="row justify-content-center">
    <div class="col-md-8">
      <div class="card" id="identityCard" style="max-width: 800px; margin: 0 auto; border: 3px solid #2c5f2d;">
        <div class="card-body p-4" style="background: linear-gradient(135deg, #2c5f2d 0%, #97bc62 100%); color: white; border-radius: 10px; position: relative; overflow: hidden;">
          <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
          <div style="position: absolute; bottom: -30px; left: -30px; width: 150px; height: 150px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
          <div style="position: relative; z-index: 1;">
            <div class="text-center mb-3">
              <h4 class="mb-0"><i class="fas fa-id-card"></i> RÉPUBLIQUE DU BURUNDI</h4>
              <p class="mb-0" style="font-size: 0.9rem;">CARTE D'IDENTITÉ BIOMÉTRIQUE</p>
              <p class="mb-0" style="font-size: 0.8rem;">UBUZIMA HUB - BUJUMBURA</p>
            </div>
            <hr style="border-color: rgba(255,255,255,0.3);">
            <div class="row">
              <div class="col-4 text-center">
                <img v-if="cardData.user.photo_profil" :src="apiBase + cardData.user.photo_profil" class="img-fluid border border-white" style="width: 120px; height: 150px; object-fit: cover; border-radius: 5px;">
                <div v-else class="bg-white text-dark p-3" style="width: 120px; height: 150px; border-radius: 5px; display: flex; align-items: center; justify-content: center;">
                  <i class="fas fa-user fa-3x"></i>
                </div>
              </div>
              <div class="col-8">
                <div class="mb-4">
                  <strong style="font-size: 0.9rem; letter-spacing: 1px;">NOM COMPLET:</strong><br>
                  <span style="font-size: 1.5rem; font-weight: bold;">{{ cardData.user.nom.toUpperCase() }}</span>
                </div>
                <div class="mt-5 pt-4" style="border-top: 1px solid rgba(255,255,255,0.3);">
                  <small style="font-size: 0.8rem; opacity: 0.9;">
                    <i class="fas fa-calendar-alt"></i> ÉMISE LE: <strong>{{ cardData.dateEmission }}</strong>
                  </small><br>
                  <small style="font-size: 0.7rem; opacity: 0.8;">
                    <i class="fas fa-shield-alt"></i> DOCUMENT BIOMÉTRIQUE SÉCURISÉ
                  </small>
                </div>
              </div>
            </div>
            <div class="text-center mt-3 pt-2" style="border-top: 1px solid rgba(255,255,255,0.3);">
              <small style="font-size: 0.7rem;">Cette carte est valide uniquement avec présentation de pièce d'identité officielle</small>
            </div>
          </div>
        </div>
      </div>

      <div class="card mt-4">
        <div class="card-body text-center">
          <button @click="printCard" class="btn btn-primary me-2"><i class="fas fa-print"></i> Imprimer</button>
          <router-link to="/dashboard" class="btn btn-secondary"><i class="fas fa-arrow-left"></i> Retour</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../services/api'

const apiBase = 'http://localhost:8000'
const cardData = ref(null)
const errorMsg = ref('')

function printCard() {
  window.print()
}

onMounted(async () => {
  try {
    const { data } = await api.get('/identity-card')
    cardData.value = data
  } catch (e) {
    errorMsg.value = e.response?.data?.message || 'Erreur lors du chargement de la carte'
  }
})
</script>

<style scoped>
@media print {
  :deep(.navbar), :deep(footer), .btn { display: none !important; }
  #identityCard { page-break-inside: avoid; box-shadow: none; border: 2px solid #000; }
}
</style>
