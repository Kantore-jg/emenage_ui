<template>
  <aside class="sidebar" :class="{ open: isOpen, collapsed: isCollapsed }">
    <div class="sidebar-brand-wrapper">
      <router-link to="/" class="sidebar-brand" @click="close">
        <i class="fas fa-shield-alt"></i>
        <span class="sidebar-label">{{ $t('nav.brand') }}</span>
      </router-link>
      <button class="sidebar-collapse-btn d-none d-lg-flex" @click="$emit('toggle-collapse')" :title="isCollapsed ? $t('nav.open') : $t('nav.reduce')">
        <i :class="isCollapsed ? 'fas fa-angles-right' : 'fas fa-angles-left'"></i>
      </button>
    </div>

    <nav class="sidebar-nav">
      <router-link to="/" @click="close" title="Accueil" class="sidebar-link">
        <i class="fas fa-home"></i> <span class="sidebar-label">Accueil</span>
      </router-link>
      <router-link to="/announcements" @click="close" :title="$t('nav.announcements')" class="sidebar-link">
        <i class="fas fa-bullhorn"></i> <span class="sidebar-label">{{ $t('nav.announcements') }}</span>
      </router-link>

      <template v-if="isAuthenticated">
        <router-link to="/dashboard" @click="close" :title="$t('nav.dashboard')" class="sidebar-link">
          <i class="fas fa-tachometer-alt"></i> <span class="sidebar-label">{{ $t('nav.dashboard') }}</span>
        </router-link>

        <template v-if="user?.role === 'citoyen'">
          <div class="sidebar-section"><span class="sidebar-label">{{ $t('nav.mySpace') }}</span></div>
          <router-link to="/reports/create" @click="close" :title="$t('nav.report')" class="sidebar-link">
            <i class="fas fa-exclamation-triangle"></i> <span class="sidebar-label">{{ $t('nav.report') }}</span>
          </router-link>
          <router-link to="/reports/mine" @click="close" :title="$t('nav.myReports')" class="sidebar-link">
            <i class="fas fa-clipboard-list"></i> <span class="sidebar-label">{{ $t('nav.myReports') }}</span>
          </router-link>
          <router-link to="/identity-card" @click="close" :title="$t('nav.myCard')" class="sidebar-link">
            <i class="fas fa-id-card"></i> <span class="sidebar-label">{{ $t('nav.myCard') }}</span>
          </router-link>
          <router-link to="/payments" @click="close" :title="$t('nav.myPayments')" class="sidebar-link">
            <i class="fas fa-file-invoice-dollar"></i> <span class="sidebar-label">{{ $t('nav.myPayments') }}</span>
          </router-link>
        </template>

        <template v-if="isAuthority">
          <router-link v-if="canRegisterUsers" to="/users" @click="close" :title="$t('nav.users')" class="sidebar-link">
            <i class="fas fa-users-cog"></i> <span class="sidebar-label">{{ $t('nav.users') }}</span>
          </router-link>
          <router-link to="/households" @click="close" :title="$t('nav.households')" class="sidebar-link">
            <i class="fas fa-house-user"></i> <span class="sidebar-label">{{ $t('nav.households') }}</span>
          </router-link>
          <router-link to="/announcements/create" @click="close" :title="$t('nav.publishAnnouncement')" class="sidebar-link">
            <i class="fas fa-plus-circle"></i> <span class="sidebar-label">{{ $t('nav.publishAnnouncement') }}</span>
          </router-link>
        </template>

        <template v-if="isAuthority || user?.role === 'agent_recensement'">
          <router-link v-if="isAuthority" to="/censuses" @click="close" :title="$t('nav.campaigns')" class="sidebar-link">
            <i class="fas fa-clipboard-list"></i> <span class="sidebar-label">{{ $t('nav.campaigns') }}</span>
          </router-link>
          <router-link v-if="user?.role === 'agent_recensement'" to="/census/collect" @click="close" :title="$t('nav.myCampaigns')" class="sidebar-link">
            <i class="fas fa-clipboard-check"></i> <span class="sidebar-label">{{ $t('nav.myCampaigns') }}</span>
          </router-link>
        </template>

        <router-link to="/calendar" @click="close" :title="$t('nav.calendar')" class="sidebar-link">
          <i class="fas fa-calendar-alt"></i> <span class="sidebar-label">{{ $t('nav.calendar') }}</span>
        </router-link>

      </template>
    </nav>

    <div v-if="isAuthenticated" class="sidebar-user">
      <router-link to="/profile/edit" class="sidebar-user-link" @click="close" :title="$t('nav.myProfile')">
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
          <div class="role">{{ $t('roles.' + (user?.role || 'citoyen')) }}</div>
        </div>
      </router-link>
      <button class="sidebar-logout-btn sidebar-label" @click="handleLogout" :title="$t('nav.logout')">
        <i class="fas fa-sign-out-alt"></i>
      </button>
    </div>
  </aside>

  <div class="sidebar-overlay" :class="{ show: isOpen }" @click="close"></div>
</template>

<script setup>
import { computed, ref, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../stores/auth'
import { useNotifications } from '../stores/notifications'

defineProps({ isOpen: Boolean, isCollapsed: Boolean })
const emit = defineEmits(['close', 'toggle-collapse'])

const { isAuthenticated, user, logout } = useAuth()
const { unreadCount, fetchNotifications } = useNotifications()
const router = useRouter()
const apiBase = 'http://localhost:8000'
const photoError = ref(false)
let pollInterval = null

const authorityRoles = ['collinaire', 'zonal', 'communal', 'provincial', 'ministere', 'admin']
const isAuthority = computed(() => authorityRoles.includes(user.value?.role))
const canRegisterUsers = computed(() => authorityRoles.includes(user.value?.role))

watch(isAuthenticated, (val) => {
  if (val) {
    fetchNotifications()
    pollInterval = setInterval(fetchNotifications, 60000)
  } else {
    clearInterval(pollInterval)
  }
}, { immediate: true })

onUnmounted(() => clearInterval(pollInterval))

const userPhotoUrl = computed(() => {
  const photo = user.value?.photo_profil
  if (!photo) return ''
  if (photo.startsWith('http')) return photo
  return apiBase + photo
})

watch(() => user.value?.photo_profil, () => {
  photoError.value = false
})

function close() { emit('close') }

async function handleLogout() {
  await logout()
  close()
  router.push('/auth/login')
}
</script>
