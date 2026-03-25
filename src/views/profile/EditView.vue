<template>
  <div class="row justify-content-center" v-if="userData">
    <div class="col-md-8">
      <div class="card">
        <div class="card-header"><h4><i class="fas fa-user-edit"></i> {{ $t('profile.title') }}</h4></div>
        <div class="card-body">
          <div v-if="error" class="alert alert-danger"><i class="fas fa-exclamation-circle"></i> {{ error }}</div>
          <div v-if="success" class="alert alert-success"><i class="fas fa-check-circle"></i> {{ $t('profile.updated') }}</div>

          <form @submit.prevent="handleSubmit">
            <div class="text-center mb-4">
              <label class="form-label">{{ $t('profile.currentPhoto') }}</label>
              <div class="mb-3">
                <img v-if="userData.photo_profil" :src="apiBase + userData.photo_profil" class="rounded-circle border" style="width: 150px; height: 150px; object-fit: cover;">
                <div v-else class="rounded-circle bg-secondary d-inline-flex align-items-center justify-content-center border" style="width: 150px; height: 150px;">
                  <i class="fas fa-user fa-4x text-white"></i>
                </div>
              </div>
              <input type="file" class="form-control" @change="photoFile = $event.target.files[0]" accept="image/*">
              <small class="text-muted">{{ $t('profile.keepPhoto') }}</small>
            </div>

            <hr>
            <h5 class="mb-3"><i class="fas fa-info-circle"></i> {{ $t('profile.personalInfo') }}</h5>
            <div class="mb-3">
              <label class="form-label">{{ $t('users.fullName') }} *</label>
              <input type="text" class="form-control" v-model="form.nom" required>
            </div>
            <div class="mb-3">
              <label class="form-label">{{ $t('common.phone') }} *</label>
              <input type="tel" class="form-control" v-model="form.telephone" required>
            </div>
            <div class="mb-3">
              <label class="form-label">{{ $t('common.email') }}</label>
              <input type="email" class="form-control" v-model="form.email" :placeholder="$t('users.emailOptional')">
            </div>

            <template v-if="userData.role === 'citoyen'">
              <hr>
              <h5 class="mb-3"><i class="fas fa-home"></i> {{ $t('profile.householdInfo') }}</h5>
              <div class="mb-3">
                <label class="form-label">{{ $t('households.quarter') }}</label>
                <input type="text" class="form-control" v-model="form.quartier">
              </div>
              <div class="mb-3">
                <label class="form-label">{{ $t('users.fullAddress') }}</label>
                <textarea class="form-control" v-model="form.adresse" rows="2"></textarea>
              </div>
            </template>

            <hr>
            <h5 class="mb-3"><i class="fas fa-lock"></i> {{ $t('profile.changePassword') }}</h5>
            <p class="text-muted small">{{ $t('profile.leaveEmpty') }}</p>
            <div class="mb-3">
              <label class="form-label">{{ $t('profile.oldPassword') }}</label>
              <input type="password" class="form-control" v-model="form.password">
            </div>
            <div class="mb-3">
              <label class="form-label">{{ $t('profile.newPassword') }}</label>
              <input type="password" class="form-control" v-model="form.new_password" minlength="6">
            </div>
            <div class="mb-3">
              <label class="form-label">{{ $t('profile.confirmPassword') }}</label>
              <input type="password" class="form-control" v-model="form.confirm_password" minlength="6">
            </div>

            <div class="d-flex justify-content-between">
              <router-link to="/dashboard" class="btn btn-secondary"><i class="fas fa-times"></i> {{ $t('common.cancel') }}</router-link>
              <button type="submit" class="btn btn-primary" :disabled="loading"><i class="fas fa-save"></i> {{ $t('common.save') }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuth } from '../../stores/auth'
import { useI18n } from 'vue-i18n'
import api from '../../services/api'

const { updateUser } = useAuth()
const { t } = useI18n()
const apiBase = 'http://localhost:8000'
const userData = ref(null)
const form = reactive({ nom: '', telephone: '', email: '', quartier: '', adresse: '', password: '', new_password: '', confirm_password: '' })
const photoFile = ref(null)
const error = ref('')
const success = ref(false)
const loading = ref(false)

onMounted(async () => {
  try {
    const { data } = await api.get('/profile')
    userData.value = data.user
    form.nom = data.user.nom
    form.telephone = data.user.telephone
    form.email = data.user.email || ''
    form.quartier = data.user.quartier || ''
    form.adresse = data.user.adresse || ''
  } catch (e) { console.error(e) }
})

async function handleSubmit() {
  error.value = ''; success.value = false; loading.value = true
  if (form.new_password && form.new_password !== form.confirm_password) {
    error.value = t('profile.passwordMismatch'); loading.value = false; return
  }
  const fd = new FormData()
  fd.append('nom', form.nom)
  fd.append('telephone', form.telephone)
  if (form.email) fd.append('email', form.email)
  if (form.quartier) fd.append('quartier', form.quartier)
  if (form.adresse) fd.append('adresse', form.adresse)
  if (form.password) fd.append('password', form.password)
  if (form.new_password) fd.append('new_password', form.new_password)
  if (form.confirm_password) fd.append('confirm_password', form.confirm_password)
  if (photoFile.value) fd.append('photo_profil', photoFile.value)
  try {
    const { data } = await api.post('/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    success.value = true
    userData.value = data.user || userData.value
    updateUser(data.user)
  } catch (e) {
    error.value = e.response?.data?.message || t('errors.generic')
  } finally { loading.value = false }
}
</script>
