<template>
  <h2 class="mb-4"><i class="fas fa-tachometer-alt"></i> Dashboard Citoyen</h2>

  <div v-if="!household" class="alert alert-warning">
    <i class="fas fa-exclamation-triangle"></i> Vous devez créer un ménage pour utiliser cette fonctionnalité.
  </div>

  <template v-else>
    <div class="row">
      <div class="col-md-4">
        <div class="card">
          <div class="card-header"><i class="fas fa-home"></i> Mon Ménage</div>
          <div class="card-body">
            <p><strong>Quartier:</strong> {{ household.quartier }}</p>
            <p><strong>Adresse:</strong> {{ household.adresse }}</p>
            <hr>
            <router-link to="/identity-card" class="btn btn-primary w-100">
              <i class="fas fa-id-card"></i> Ma Carte d'Identité
            </router-link>
          </div>
        </div>
      </div>

      <div class="col-md-8">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <span><i class="fas fa-users"></i> Membres Permanents</span>
            <button class="btn btn-sm btn-light" data-bs-toggle="modal" data-bs-target="#addMemberModal">
              <i class="fas fa-plus"></i> Ajouter
            </button>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Âge</th>
                    <th>Téléphone</th>
                    <th>CNI</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="members.length === 0">
                    <td colspan="6" class="text-center text-muted">Aucun membre permanent</td>
                  </tr>
                  <tr v-for="m in members" :key="m.id">
                    <td>{{ m.nom }}</td>
                    <td>{{ m.age }} ans</td>
                    <td>{{ m.telephone || '-' }}</td>
                    <td>
                      <a v-if="m.photo_cni" :href="apiBase + m.photo_cni" target="_blank">
                        <i class="fas fa-id-card text-primary"></i>
                      </a>
                      <span v-else class="text-muted">-</span>
                    </td>
                    <td>
                      <span class="badge" :class="{
                        'bg-warning text-dark': m.statut_validation === 'en_attente',
                        'bg-success': m.statut_validation === 'valide',
                        'bg-danger': m.statut_validation === 'rejete'
                      }">
                        {{ m.statut_validation === 'en_attente' ? 'En attente' : m.statut_validation === 'valide' ? 'Validé' : 'Rejeté' }}
                      </span>
                    </td>
                    <td>
                      <button class="btn btn-sm btn-danger" @click="deleteMember(m.id)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row mt-4">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <span><i class="fas fa-user-friends"></i> Invités Présents</span>
            <button class="btn btn-sm btn-light" data-bs-toggle="modal" data-bs-target="#addInviteModal">
              <i class="fas fa-plus"></i> Ajouter un invité
            </button>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Âge</th>
                    <th>Téléphone</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="invites.length === 0">
                    <td colspan="5" class="text-center text-muted">Aucun invité présent</td>
                  </tr>
                  <tr v-for="inv in invites" :key="inv.id">
                    <td>{{ inv.nom }}</td>
                    <td>{{ inv.age }} ans</td>
                    <td>{{ inv.telephone || '-' }}</td>
                    <td>
                      <span class="badge" :class="inv.statut === 'present' ? 'bg-success' : 'bg-secondary'">
                        {{ inv.statut === 'present' ? 'Présent' : 'Parti' }}
                      </span>
                    </td>
                    <td>
                      <button v-if="inv.statut === 'present'" class="btn btn-sm btn-warning" @click="markDeparted(inv.id)">
                        <i class="fas fa-sign-out-alt"></i> Parti
                      </button>
                      <button class="btn btn-sm btn-danger ms-1" @click="deleteMember(inv.id)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Notifications -->
    <div v-if="notifications.length > 0" class="row mt-4">
      <div class="col-12">
        <div class="card">
          <div class="card-header"><i class="fas fa-bell"></i> Notifications</div>
          <div class="card-body">
            <div v-for="n in notifications" :key="n.id" class="alert" :class="n.lu ? 'alert-secondary' : 'alert-info'" >
              <div class="d-flex justify-content-between">
                <div>
                  <strong>{{ n.titre }}</strong><br>
                  {{ n.message }}
                  <small class="d-block mt-1">{{ new Date(n.created_at).toLocaleString('fr-FR') }}</small>
                </div>
                <button @click="deleteNotification(n.id)" class="btn-close"></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>

  <!-- Modal Ajouter Membre -->
  <div class="modal fade" id="addMemberModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title"><i class="fas fa-user-plus"></i> Ajouter un Membre</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <form @submit.prevent="addMember">
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Nom complet *</label>
              <input type="text" class="form-control" v-model="memberForm.nom" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Âge *</label>
              <input type="number" class="form-control" v-model="memberForm.age" required min="0">
            </div>
            <div class="mb-3">
              <label class="form-label">Téléphone</label>
              <input type="tel" class="form-control" v-model="memberForm.telephone">
            </div>
            <div class="mb-3">
              <label class="form-label">Photo CNI</label>
              <input type="file" class="form-control" @change="memberForm.photo_cni = $event.target.files[0]" accept="image/*">
              <small class="text-muted">Obligatoire pour les + de 18 ans</small>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
            <button type="submit" class="btn btn-primary">Ajouter</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Modal Ajouter Invité -->
  <div class="modal fade" id="addInviteModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title"><i class="fas fa-user-friends"></i> Ajouter un Invité</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <form @submit.prevent="addInvite">
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Nom complet *</label>
              <input type="text" class="form-control" v-model="inviteForm.nom" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Âge *</label>
              <input type="number" class="form-control" v-model="inviteForm.age" required min="0">
            </div>
            <div class="mb-3">
              <label class="form-label">Téléphone</label>
              <input type="tel" class="form-control" v-model="inviteForm.telephone">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
            <button type="submit" class="btn btn-primary">Ajouter</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '../../services/api'

const apiBase = 'http://localhost:8000'
const household = ref(null)
const members = ref([])
const invites = ref([])
const notifications = ref([])

const memberForm = reactive({ nom: '', age: '', telephone: '', photo_cni: null })
const inviteForm = reactive({ nom: '', age: '', telephone: '' })

async function loadData() {
  try {
    const { data } = await api.get('/dashboard/citoyen')
    household.value = data.household
    members.value = data.members
    invites.value = data.invites
    notifications.value = data.notifications
  } catch (e) {
    console.error(e)
  }
}

async function addMember() {
  const fd = new FormData()
  fd.append('nom', memberForm.nom)
  fd.append('age', memberForm.age)
  if (memberForm.telephone) fd.append('telephone', memberForm.telephone)
  if (memberForm.photo_cni) fd.append('photo_cni', memberForm.photo_cni)
  try {
    await api.post('/household/members', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    memberForm.nom = ''; memberForm.age = ''; memberForm.telephone = ''; memberForm.photo_cni = null
    document.querySelector('#addMemberModal .btn-close').click()
    await loadData()
  } catch (e) {
    alert(e.response?.data?.message || 'Erreur')
  }
}

async function addInvite() {
  try {
    await api.post('/household/invites', { nom: inviteForm.nom, age: inviteForm.age, telephone: inviteForm.telephone || null })
    inviteForm.nom = ''; inviteForm.age = ''; inviteForm.telephone = ''
    document.querySelector('#addInviteModal .btn-close').click()
    await loadData()
  } catch (e) {
    alert(e.response?.data?.message || 'Erreur')
  }
}

async function markDeparted(id) {
  try {
    await api.put(`/household/invites/${id}`, { statut: 'parti' })
    await loadData()
  } catch (e) {
    alert(e.response?.data?.message || 'Erreur')
  }
}

async function deleteMember(id) {
  if (!confirm('Supprimer ce membre ?')) return
  try {
    await api.delete(`/household/members/${id}`)
    await loadData()
  } catch (e) {
    alert(e.response?.data?.message || 'Erreur')
  }
}

async function deleteNotification(id) {
  try {
    await api.delete(`/dashboard/notifications/${id}`)
    notifications.value = notifications.value.filter(n => n.id !== id)
  } catch (e) {
    console.error(e)
  }
}

onMounted(loadData)
</script>
