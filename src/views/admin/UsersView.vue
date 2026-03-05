<template>
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2><i class="fas fa-users-cog"></i> Gestion des Utilisateurs</h2>
    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addUserModal">
      <i class="fas fa-plus"></i> Créer un utilisateur
    </button>
  </div>

  <!-- Filtres -->
  <div class="card mb-4">
    <div class="card-body py-3">
      <div class="row g-2 align-items-end">
        <div class="col-md-4">
          <input type="text" class="form-control" v-model="search" placeholder="Rechercher par nom, tél, email..." @input="loadUsers">
        </div>
        <div class="col-md-3">
          <select class="form-select" v-model="filterRole" @change="loadUsers">
            <option value="">Tous les rôles</option>
            <option value="admin">Administrateur</option>
            <option value="chef_quartier">Chef de quartier</option>
            <option value="ministere">Ministère</option>
            <option value="police">Police</option>
            <option value="citoyen">Citoyen</option>
          </select>
        </div>
        <div class="col-md-2">
          <span class="badge bg-primary fs-6">{{ users.length }} utilisateurs</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Table -->
  <div class="card">
    <div class="card-body p-0">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="bg-light">
            <tr>
              <th>Nom</th>
              <th>Téléphone</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Créé le</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="users.length === 0">
              <td colspan="6" class="text-center py-4 text-muted">Aucun utilisateur trouvé</td>
            </tr>
            <tr v-for="u in users" :key="u.id">
              <td>
                <div class="d-flex align-items-center gap-2">
                  <img v-if="u.photo_profil" :src="apiBase + u.photo_profil" class="rounded-circle" style="width: 32px; height: 32px; object-fit: cover;">
                  <div v-else class="rounded-circle bg-secondary d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
                    <i class="fas fa-user text-white" style="font-size: 0.7rem;"></i>
                  </div>
                  <strong>{{ u.nom }}</strong>
                </div>
              </td>
              <td>{{ u.telephone }}</td>
              <td>{{ u.email || '-' }}</td>
              <td>
                <span class="badge" :class="roleBadge(u.role)">{{ roleLabel(u.role) }}</span>
              </td>
              <td><small>{{ formatDate(u.created_at) }}</small></td>
              <td>
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-outline-warning" @click="resetPwd(u.id, u.nom)" title="Réinitialiser mot de passe">
                    <i class="fas fa-key"></i>
                  </button>
                  <button v-if="u.role !== 'admin'" class="btn btn-outline-danger" @click="deleteUser(u.id, u.nom)" title="Supprimer">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Modal créer utilisateur -->
  <div class="modal fade" id="addUserModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title"><i class="fas fa-user-plus"></i> Créer un utilisateur</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <form @submit.prevent="createUser">
          <div class="modal-body">
            <div v-if="formError" class="alert alert-danger py-2">{{ formError }}</div>
            <div v-if="createdPassword" class="alert alert-success py-2">
              <i class="fas fa-check-circle"></i> Utilisateur créé !<br>
              <strong>Mot de passe généré :</strong> <code class="fs-5">{{ createdPassword }}</code>
              <br><small class="text-muted">Notez ce mot de passe, il ne sera plus affiché.</small>
            </div>

            <div class="mb-3">
              <label class="form-label">Nom complet *</label>
              <input type="text" class="form-control" v-model="form.nom" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Téléphone *</label>
              <input type="tel" class="form-control" v-model="form.telephone" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input type="email" class="form-control" v-model="form.email" placeholder="optionnel">
            </div>
            <div class="mb-3">
              <label class="form-label">Rôle *</label>
              <select class="form-select" v-model="form.role" required>
                <option value="" disabled>Choisir un rôle</option>
                <option value="chef_quartier">Chef de quartier</option>
                <option value="ministere">Ministère</option>
                <option value="police">Police</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Photo de profil</label>
              <input type="file" class="form-control" @change="form.photo = $event.target.files[0]" accept="image/*">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
            <button v-if="!createdPassword" type="submit" class="btn btn-primary" :disabled="formLoading">
              <span v-if="formLoading" class="spinner-border spinner-border-sm me-1"></span>
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Modal mot de passe réinitialisé -->
  <div class="modal fade" id="pwdModal" tabindex="-1">
    <div class="modal-dialog modal-sm">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Nouveau mot de passe</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body text-center">
          <p>Mot de passe pour <strong>{{ resetUserName }}</strong> :</p>
          <code class="fs-4 d-block p-2 bg-light rounded">{{ resetPwdValue }}</code>
          <small class="text-muted mt-2 d-block">Notez ce mot de passe.</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '../../services/api'
import { Modal } from 'bootstrap'

const apiBase = 'http://localhost:8000'
const users = ref([])
const search = ref('')
const filterRole = ref('')
const form = reactive({ nom: '', telephone: '', email: '', role: '', photo: null })
const formError = ref('')
const formLoading = ref(false)
const createdPassword = ref('')
const resetUserName = ref('')
const resetPwdValue = ref('')

const roleLabels = { citoyen: 'Citoyen', chef_quartier: 'Chef de quartier', ministere: 'Ministère', admin: 'Administrateur', police: 'Police' }
function roleLabel(r) { return roleLabels[r] || r }
function roleBadge(r) {
  return { admin: 'bg-danger', chef_quartier: 'bg-info', ministere: 'bg-primary', police: 'bg-warning text-dark', citoyen: 'bg-success' }[r] || 'bg-secondary'
}
function formatDate(d) { return new Date(d).toLocaleDateString('fr-FR') }

async function loadUsers() {
  try {
    const params = {}
    if (search.value) params.search = search.value
    if (filterRole.value) params.role = filterRole.value
    const { data } = await api.get('/admin/users', { params })
    users.value = data.users || []
  } catch (e) { console.error(e) }
}

async function createUser() {
  formError.value = ''; formLoading.value = true; createdPassword.value = ''
  const fd = new FormData()
  fd.append('nom', form.nom)
  fd.append('telephone', form.telephone)
  if (form.email) fd.append('email', form.email)
  fd.append('role', form.role)
  if (form.photo) fd.append('photo_profil', form.photo)
  try {
    const { data } = await api.post('/admin/users', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    createdPassword.value = data.password
    await loadUsers()
  } catch (e) {
    formError.value = e.response?.data?.message || 'Erreur lors de la création'
  } finally { formLoading.value = false }
}

async function resetPwd(id, name) {
  if (!confirm(`Réinitialiser le mot de passe de ${name} ?`)) return
  try {
    const { data } = await api.post(`/admin/users/${id}/reset-password`)
    resetUserName.value = name
    resetPwdValue.value = data.password
    const modal = new Modal(document.getElementById('pwdModal'))
    modal.show()
  } catch (e) { alert(e.response?.data?.message || 'Erreur') }
}

async function deleteUser(id, name) {
  if (!confirm(`Supprimer l'utilisateur ${name} ? Cette action est irréversible.`)) return
  try {
    await api.delete(`/admin/users/${id}`)
    await loadUsers()
  } catch (e) { alert(e.response?.data?.message || 'Erreur') }
}

onMounted(loadUsers)
</script>
