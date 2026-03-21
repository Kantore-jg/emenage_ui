<template>
  <div class="login-bg">
    <div class="login-overlay"></div>
    <div class="login-content">
      <div class="text-center mb-4">
        <div class="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
             style="width: 70px; height: 70px; background: linear-gradient(135deg, #2c5f2d, #97bc62);">
          <i class="fas fa-shield-alt fa-2x text-white"></i>
        </div>
        <h3 class="fw-bold text-white">Ubuzima Hub</h3>
      </div>

      <div class="card shadow-lg border-0" style="backdrop-filter: blur(10px); background: rgba(255,255,255,0.92); border-radius: 16px;">
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
                placeholder="email ou phone"
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

            <button type="submit" class="btn w-100 py-2 text-white" :disabled="loading"
                    style="background: linear-gradient(135deg, #2c5f2d, #97bc62); border: none;">
              <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else class="fas fa-sign-in-alt me-1"></i>
              Se connecter
            </button>
          </form>
        </div>
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

<style scoped>
.login-bg {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: url('/bg.jpeg') center/cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 0;
}

.login-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  padding: 1rem;
}
</style>
