<template>
  <template v-if="household">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2><i class="fas fa-home"></i> Détails du Ménage</h2>
      <router-link to="/households" class="btn btn-secondary"><i class="fas fa-arrow-left"></i> Retour</router-link>
    </div>

    <div class="row">
      <div class="col-md-4">
        <div class="card">
          <div class="card-header"><i class="fas fa-info-circle"></i> Informations</div>
          <div class="card-body">
            <div class="text-center mb-3">
              <img v-if="household.chef?.photo_profil" :src="apiBase + household.chef.photo_profil" class="rounded-circle" style="width: 100px; height: 100px; object-fit: cover;">
              <div v-else class="rounded-circle bg-secondary d-inline-flex align-items-center justify-content-center" style="width: 100px; height: 100px;">
                <i class="fas fa-user fa-3x text-white"></i>
              </div>
              <h5 class="mt-2">{{ household.chef?.nom }}</h5>
              <p class="text-muted">Chef de Famille</p>
            </div>
            <hr>
            <p><strong><i class="fas fa-map-marker-alt"></i> Quartier:</strong><br><span class="badge bg-info">{{ household.quartier }}</span></p>
            <p><strong><i class="fas fa-home"></i> Adresse:</strong><br>{{ household.adresse }}</p>
            <p><strong><i class="fas fa-phone"></i> Téléphone:</strong><br>{{ household.chef?.telephone }}</p>
            <p><strong><i class="fas fa-calendar"></i> Date:</strong><br>{{ formatDate(household.created_at) }}</p>
          </div>
        </div>

        <div class="card mt-3">
          <div class="card-header"><i class="fas fa-chart-bar"></i> Statistiques</div>
          <div class="card-body">
            <div class="row text-center">
              <div class="col-6 mb-3"><div class="border rounded p-2"><h4 class="text-primary">{{ stats.total_membres }}</h4><small>Membres</small></div></div>
              <div class="col-6 mb-3"><div class="border rounded p-2"><h4 class="text-success">{{ stats.membres_valides }}</h4><small>Validés</small></div></div>
              <div class="col-6 mb-3"><div class="border rounded p-2"><h4 class="text-warning">{{ stats.membres_en_attente }}</h4><small>En attente</small></div></div>
              <div class="col-6 mb-3"><div class="border rounded p-2"><h4 class="text-success">{{ stats.paiements_valides }}</h4><small>Paiements validés</small></div></div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-8">
        <ul class="nav nav-tabs mb-3">
          <li class="nav-item"><button class="nav-link" :class="{ active: tab === 'members' }" @click="tab = 'members'"><i class="fas fa-users me-1"></i> Membres</button></li>
          <li class="nav-item"><button class="nav-link" :class="{ active: tab === 'payments' }" @click="tab = 'payments'"><i class="fas fa-file-invoice-dollar me-1"></i> Paiements</button></li>
        </ul>

        <div v-if="tab === 'members'">
          <div class="card">
            <div class="card-header"><i class="fas fa-users"></i> Membres Permanents</div>
            <div class="card-body">
              <table class="table table-hover">
                <thead><tr><th>Nom</th><th>Âge</th><th>Téléphone</th><th>Validation</th></tr></thead>
                <tbody>
                  <tr v-for="m in members" :key="m.id">
                    <td>{{ m.nom }}</td><td>{{ m.age }} ans</td><td>{{ m.telephone || '-' }}</td>
                    <td><span class="badge" :class="{'bg-warning text-dark': m.statut_validation==='en_attente', 'bg-success': m.statut_validation==='valide', 'bg-danger': m.statut_validation==='rejete'}">{{ m.statut_validation }}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="card mt-3">
            <div class="card-header"><i class="fas fa-user-friends"></i> Invités</div>
            <div class="card-body">
              <table class="table table-hover">
                <thead><tr><th>Nom</th><th>Âge</th><th>Statut</th></tr></thead>
                <tbody>
                  <tr v-for="inv in invitesData" :key="inv.id">
                    <td>{{ inv.nom }}</td><td>{{ inv.age }} ans</td>
                    <td><span class="badge" :class="inv.statut==='present' ? 'bg-success' : 'bg-secondary'">{{ inv.statut }}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div v-if="tab === 'payments'">
          <div class="card">
            <div class="card-header"><i class="fas fa-file-invoice-dollar"></i> Historique des Paiements</div>
            <div class="card-body">
              <table class="table table-hover">
                <thead><tr><th>Motif</th><th>Montant</th><th>Date</th><th>Statut</th><th>Reçu</th></tr></thead>
                <tbody>
                  <tr v-for="p in payments" :key="p.id">
                    <td>{{ p.motif === 'autre' ? p.motif_autre : p.motif.toUpperCase() }}</td>
                    <td>{{ p.montant }} FBU</td>
                    <td>{{ formatDate(p.date_paiement) }}</td>
                    <td><span class="badge" :class="{'bg-warning text-dark': p.statut_validation==='en_attente', 'bg-success': p.statut_validation==='valide', 'bg-danger': p.statut_validation==='rejete'}">{{ p.statut_validation }}</span></td>
                    <td><a v-if="p.recu_photo" :href="apiBase + p.recu_photo" target="_blank" class="btn btn-sm btn-outline-info"><i class="fas fa-image"></i></a></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../../services/api'

const route = useRoute()
const apiBase = 'http://localhost:8000'
const household = ref(null)
const members = ref([])
const invitesData = ref([])
const payments = ref([])
const stats = ref({})
const tab = ref('members')

function formatDate(d) { return new Date(d).toLocaleDateString('fr-FR') }

onMounted(async () => {
  try {
    const { data } = await api.get(`/households/${route.params.id}`)
    household.value = data.household
    members.value = data.members
    invitesData.value = data.invites
    payments.value = data.payments
    stats.value = data.stats
  } catch (e) { console.error(e) }
})
</script>
