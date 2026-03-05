<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-5 col-lg-4">
        <div class="text-center mb-4">
          <div class="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
               style="width: 70px; height: 70px; background: linear-gradient(135deg, #2c5f2d, #97bc62);">
            <i class="fas fa-shield-alt fa-2x text-white"></i>
          </div>
          <h3 class="fw-bold" style="color: #2c5f2d;">Ubuzima Hub</h3>
          <p class="text-muted small">Plateforme Citoyen-Autorité pour Bujumbura</p>
        </div>

        <div class="card shadow-sm">
          <div class="card-body p-4">
            <h5 class="text-center mb-4"><i class="fas fa-sign-in-alt"></i> Connexion</h5>

            <div v-if="error" class="alert alert-danger py-2">
              <i class="fas fa-exclamation-circle"></i> {{ error }}
            </div>

            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label for="identifiant" class="form-label">
                  <i class="fas fa-user"></i> Email ou téléphone
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="identifiant"
                  v-model="identifiant"
                  placeholder="admin@ubuzimahub.bi ou 79000001"
                  required
                  autofocus
                >
              </div>

              <div class="mb-4">
                <label for="password" class="form-label">
                  <i class="fas fa-lock"></i> Mot de passe
                </label>
                <div class="input-group">
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    class="form-control"
                    id="password"
                    v-model="password"
                    required
                  >
                  <button class="btn btn-outline-secondary" type="button" @click="showPassword = !showPassword">
                    <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </button>
                </div>
              </div>

              <button type="submit" class="btn btn-primary w-100 py-2" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                <i v-else class="fas fa-sign-in-alt me-1"></i>
                Se connecter
              </button>
            </form>
          </div>
        </div>

        <p class="text-center text-muted mt-3" style="font-size: 0.8rem;">
          Contactez votre administrateur pour obtenir vos identifiants
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../stores/auth'

const { login } = useAuth()
const router = useRouter()

const identifiant = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await login(identifiant.value, password.value)
    router.push('/dashboard')
  } catch (e) {
    error.value = e.response?.data?.message || 'Identifiant ou mot de passe incorrect'
  } finally {
    loading.value = false
  }
}
</script>
