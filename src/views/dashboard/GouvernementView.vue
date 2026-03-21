<template>
  <h2 class="mb-4"><i class="fas fa-tachometer-alt"></i> Dashboard Gouvernement</h2>

  <div class="row">
    <div class="col-12">
      <div class="card">
        <div class="card-header"><i class="fas fa-clock"></i> Enregistrements en Attente de Validation</div>
        <div class="card-body" style="max-height: 500px; overflow-y: auto;">
          <template v-if="nouveauxMembres.length > 0">
            <div v-for="m in nouveauxMembres" :key="m.id" class="card mb-2">
              <div class="card-body">
                <h6>{{ m.nom }} - {{ m.age }} ans</h6>
                <p class="mb-1">
                  <span class="badge" :class="m.type === 'permanent' ? 'bg-primary' : 'bg-warning'">
                    {{ m.type === 'permanent' ? 'Membre Permanent' : 'Invité' }}
                  </span>
                  <span class="badge bg-warning"><i class="fas fa-clock"></i> En attente</span>
                </p>
                <small class="text-muted">
                  <i class="fas fa-home"></i> {{ m.quartier }}<br>
                  <i class="fas fa-user"></i> Chef: {{ m.chef_nom }}<br>
                  <template v-if="m.telephone"><i class="fas fa-phone"></i> {{ m.telephone }}<br></template>
                  <i class="fas fa-clock"></i> {{ new Date(m.created_at).toLocaleString('fr-FR') }}
                </small>
                <div class="mt-2">
                  <button class="btn btn-sm btn-success" @click="validateMember(m.id, 'valider')">
                    <i class="fas fa-check"></i> Valider
                  </button>
                  <button class="btn btn-sm btn-danger" @click="validateMember(m.id, 'rejeter')">
                    <i class="fas fa-times"></i> Rejeter
                  </button>
                  <a v-if="m.photo_cni" :href="apiBase + m.photo_cni" target="_blank" class="btn btn-sm btn-info">
                    <i class="fas fa-id-card"></i> Voir CNI
                  </a>
                </div>
              </div>
            </div>
          </template>
          <p v-else class="text-muted">Aucun enregistrement en attente</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Paiements en attente -->
  <div class="row mt-4">
    <div class="col-12">
      <div class="card">
        <div class="card-header"><i class="fas fa-file-invoice-dollar"></i> Paiements en Attente de Validation</div>
        <div class="card-body">
          <template v-if="nouveauxPaiements.length > 0">
            <div v-for="p in nouveauxPaiements" :key="p.id" class="card mb-2">
              <div class="card-body d-flex justify-content-between align-items-center">
                <div>
                  <strong>{{ p.motif === 'autre' ? p.motif_autre : p.motif.toUpperCase() }}</strong> - {{ p.montant }} FBU<br>
                  <small class="text-muted">Chef: {{ p.chef_nom }} | Quartier: {{ p.quartier }} | {{ new Date(p.date_paiement).toLocaleDateString('fr-FR') }}</small>
                </div>
                <div>
                  <a v-if="p.recu_photo" :href="apiBase + p.recu_photo" target="_blank" class="btn btn-sm btn-info me-1"><i class="fas fa-image"></i></a>
                  <button class="btn btn-sm btn-success me-1" @click="validatePayment(p.id, 'valider')"><i class="fas fa-check"></i></button>
                  <button class="btn btn-sm btn-danger" @click="validatePayment(p.id, 'rejeter')"><i class="fas fa-times"></i></button>
                </div>
              </div>
            </div>
          </template>
          <p v-else class="text-muted">Aucun paiement en attente</p>
        </div>
      </div>
    </div>
  </div>

  <div class="row mt-4">
    <div class="col-12">
      <div class="card">
        <div class="card-header"><i class="fas fa-bullhorn"></i> Actions Rapides</div>
        <div class="card-body">
          <router-link to="/announcements/create" class="btn btn-primary me-2"><i class="fas fa-plus"></i> Publier un communiqué</router-link>
          <router-link to="/announcements" class="btn btn-secondary me-2"><i class="fas fa-list"></i> Voir tous les communiqués</router-link>
          <router-link to="/households" class="btn btn-info"><i class="fas fa-home"></i> Voir les ménages</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../services/api'

const apiBase = 'http://localhost:8000'
const nouveauxMembres = ref([])
const nouveauxPaiements = ref([])

async function loadData() {
  try {
    const { data } = await api.get('/dashboard/gouvernement')
    nouveauxMembres.value = data.nouveauxMembres
    nouveauxPaiements.value = data.nouveauxPaiements
  } catch (e) {
    console.error(e)
  }
}

async function validateMember(id, action) {
  try {
    await api.put(`/validation/members/${id}`, { action })
    await loadData()
  } catch (e) {
    alert(e.response?.data?.message || 'Erreur')
  }
}

async function validatePayment(id, action) {
  try {
    await api.put(`/payments/${id}/validate`, { action })
    await loadData()
  } catch (e) {
    alert(e.response?.data?.message || 'Erreur')
  }
}

onMounted(loadData)
</script>
