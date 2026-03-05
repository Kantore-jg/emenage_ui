<template>
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2><i class="fas fa-history"></i> Historique de mes Paiements</h2>
    <router-link to="/payments/create" class="btn btn-primary"><i class="fas fa-plus"></i> Enregistrer un Paiement</router-link>
  </div>

  <div v-if="$route.query.success" class="alert alert-success alert-dismissible fade show">
    Votre paiement a été enregistré avec succès et est en attente de validation.
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  </div>

  <div class="card shadow-sm">
    <div class="card-body p-0">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="bg-light"><tr><th>Motif</th><th>Montant</th><th>Date Paiement</th><th>Date Enregistrement</th><th>Statut</th><th>Reçu</th></tr></thead>
          <tbody>
            <template v-if="payments.length > 0">
              <tr v-for="p in payments" :key="p.id">
                <td><strong>{{ p.motif === 'autre' ? p.motif_autre : p.motif.toUpperCase() }}</strong></td>
                <td>{{ p.montant }} FBU</td>
                <td>{{ formatDate(p.date_paiement) }}</td>
                <td>{{ new Date(p.created_at).toLocaleString('fr-FR') }}</td>
                <td>
                  <span class="badge rounded-pill" :class="{'bg-warning text-dark': p.statut_validation==='en_attente', 'bg-success': p.statut_validation==='valide', 'bg-danger': p.statut_validation==='rejete'}">
                    {{ p.statut_validation === 'en_attente' ? 'En attente' : p.statut_validation === 'valide' ? 'Validé' : 'Rejeté' }}
                  </span>
                </td>
                <td><a :href="apiBase + p.recu_photo" target="_blank" class="btn btn-sm btn-outline-info"><i class="fas fa-image"></i> Voir</a></td>
              </tr>
            </template>
            <tr v-else><td colspan="6" class="text-center py-4 text-muted"><i class="fas fa-info-circle me-1"></i> Aucun paiement.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../../services/api'

const route = useRoute()
const apiBase = 'http://localhost:8000'
const payments = ref([])

function formatDate(d) { return new Date(d).toLocaleDateString('fr-FR') }

onMounted(async () => {
  try {
    const { data } = await api.get('/payments')
    payments.value = data.payments || []
  } catch (e) { console.error(e) }
})
</script>
