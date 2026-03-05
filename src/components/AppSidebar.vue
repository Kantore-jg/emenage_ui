<template>
  <aside class="sidebar" :class="{ open: isOpen, collapsed: isCollapsed }">
    <div class="sidebar-brand-wrapper">
      <router-link to="/" class="sidebar-brand" @click="close">
        <i class="fas fa-shield-alt"></i>
        <span class="sidebar-label">Ubuzima Hub</span>
      </router-link>
      <button class="sidebar-collapse-btn d-none d-lg-flex" @click="$emit('toggle-collapse')" :title="isCollapsed ? 'Ouvrir' : 'Réduire'">
        <i :class="isCollapsed ? 'fas fa-angles-right' : 'fas fa-angles-left'"></i>
      </button>
    </div>

    <ul class="sidebar-nav">
      <li class="sidebar-section"><span class="sidebar-label">Navigation</span></li>
      <li>
        <router-link to="/" @click="close" title="Accueil">
          <i class="fas fa-home"></i> <span class="sidebar-label">Accueil</span>
        </router-link>
      </li>
      <li>
        <router-link to="/announcements" @click="close" title="Communiqués">
          <i class="fas fa-bullhorn"></i> <span class="sidebar-label">Communiqués</span>
        </router-link>
      </li>

      <template v-if="isAuthenticated">
        <li>
          <router-link to="/dashboard" @click="close" title="Dashboard">
            <i class="fas fa-tachometer-alt"></i> <span class="sidebar-label">Dashboard</span>
          </router-link>
        </li>

        <template v-if="user?.role === 'citoyen'">
          <li class="sidebar-section"><span class="sidebar-label">Mon espace</span></li>
          <li>
            <router-link to="/reports/create" @click="close" title="Signaler">
              <i class="fas fa-exclamation-triangle"></i> <span class="sidebar-label">Signaler</span>
            </router-link>
          </li>
          <li>
            <router-link to="/identity-card" @click="close" title="Ma Carte">
              <i class="fas fa-id-card"></i> <span class="sidebar-label">Ma Carte</span>
            </router-link>
          </li>
          <li>
            <router-link to="/payments" @click="close" title="Mes Paiements">
              <i class="fas fa-file-invoice-dollar"></i> <span class="sidebar-label">Mes Paiements</span>
            </router-link>
          </li>
        </template>

        <template v-if="user?.role === 'chef_quartier' || user?.role === 'admin'">
          <li class="sidebar-section"><span class="sidebar-label">Gestion</span></li>
          <li>
            <router-link to="/chef/citoyens" @click="close" title="Inscrire un citoyen">
              <i class="fas fa-user-plus"></i> <span class="sidebar-label">Inscrire un citoyen</span>
            </router-link>
          </li>
          <li>
            <router-link to="/households" @click="close" title="Ménages">
              <i class="fas fa-house-user"></i> <span class="sidebar-label">Ménages</span>
            </router-link>
          </li>
        </template>

        <template v-if="['chef_quartier', 'ministere', 'admin'].includes(user?.role)">
          <li>
            <router-link to="/announcements/create" @click="close" title="Publier communiqué">
              <i class="fas fa-plus-circle"></i> <span class="sidebar-label">Publier communiqué</span>
            </router-link>
          </li>
        </template>

        <template v-if="user?.role === 'police' || user?.role === 'admin'">
          <li class="sidebar-section"><span class="sidebar-label">Sécurité</span></li>
          <li>
            <router-link to="/dashboard/securite/scan" @click="close" title="Scanner QR">
              <i class="fas fa-qrcode"></i> <span class="sidebar-label">Scanner QR</span>
            </router-link>
          </li>
        </template>

        <template v-if="user?.role === 'admin'">
          <li class="sidebar-section"><span class="sidebar-label">Administration</span></li>
          <li>
            <router-link to="/admin/users" @click="close" title="Gérer les utilisateurs">
              <i class="fas fa-users-cog"></i> <span class="sidebar-label">Gérer les utilisateurs</span>
            </router-link>
          </li>
        </template>

        <li class="sidebar-section"><span class="sidebar-label">Compte</span></li>
        <li>
          <router-link to="/profile/edit" @click="close" title="Mon profil">
            <i class="fas fa-user-edit"></i> <span class="sidebar-label">Mon profil</span>
          </router-link>
        </li>
      </template>
    </ul>

    <div v-if="isAuthenticated" class="sidebar-user">
      <img
        v-if="user?.photo_profil"
        :src="userPhotoUrl"
        alt=""
        @error="photoError = true"
        :style="{ display: photoError ? 'none' : 'block' }"
      >
      <div v-if="!user?.photo_profil || photoError" class="sidebar-user-avatar">
        <i class="fas fa-user"></i>
      </div>
      <div class="sidebar-user-info sidebar-label">
        <div class="name">{{ user?.nom }}</div>
        <div class="role">{{ roleLabel }}</div>
      </div>
      <button class="sidebar-logout-btn sidebar-label" @click="handleLogout" title="Déconnexion">
        <i class="fas fa-sign-out-alt"></i>
      </button>
    </div>
  </aside>

  <div class="sidebar-overlay" :class="{ show: isOpen }" @click="close"></div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../stores/auth'

defineProps({ isOpen: Boolean, isCollapsed: Boolean })
const emit = defineEmits(['close', 'toggle-collapse'])

const { isAuthenticated, user, logout } = useAuth()
const router = useRouter()
const apiBase = 'http://localhost:8000'
const photoError = ref(false)

const userPhotoUrl = computed(() => {
  const photo = user.value?.photo_profil
  if (!photo) return ''
  if (photo.startsWith('http')) return photo
  return apiBase + photo
})

watch(() => user.value?.photo_profil, () => {
  photoError.value = false
})

const roleLabels = {
  citoyen: 'Citoyen',
  chef_quartier: 'Chef de quartier',
  ministere: 'Ministère',
  admin: 'Administrateur',
  police: 'Police',
}
const roleLabel = computed(() => roleLabels[user.value?.role] || user.value?.role)

function close() { emit('close') }

async function handleLogout() {
  await logout()
  close()
  router.push('/auth/login')
}
</script>
