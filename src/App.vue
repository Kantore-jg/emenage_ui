<template>
  <div v-if="isLoginPage">
    <router-view />
  </div>

  <div v-else>
    <AppSidebar
      :isOpen="sidebarOpen"
      :isCollapsed="sidebarCollapsed"
      @close="sidebarOpen = false"
      @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
    />

    <div class="main-content" :class="{ 'sidebar-collapsed-margin': sidebarCollapsed }">
      <div class="topbar">
        <div class="d-flex align-items-center gap-2">
          <button class="topbar-toggle" @click="sidebarOpen = !sidebarOpen">
            <i class="fas fa-bars"></i>
          </button>
          <button class="sidebar-desktop-toggle d-none d-lg-inline-flex" @click="sidebarCollapsed = !sidebarCollapsed" :title="sidebarCollapsed ? $t('nav.open') : $t('nav.reduce')">
            <i :class="sidebarCollapsed ? 'fas fa-angles-right' : 'fas fa-angles-left'"></i>
          </button>
          <form v-if="isAuthenticated && isAuthority" class="d-none d-md-flex ms-2" @submit.prevent="goSearch" style="min-width: 200px;">
            <div class="input-group input-group-sm">
              <input type="text" class="form-control" v-model="searchQuery" :placeholder="$t('nav.searchPlaceholder')" style="background: var(--input-bg); border-color: var(--input-border); color: var(--input-text);">
              <button class="btn btn-outline-secondary" type="submit"><i class="fas fa-search"></i></button>
            </div>
          </form>
        </div>
        <div class="d-flex align-items-center gap-2">
          <small class="text-muted d-none d-md-inline" v-if="user">
            <i class="fas fa-circle text-success" style="font-size: 0.5rem;"></i>
            {{ user.nom }}
          </small>
          <router-link v-if="isAuthenticated" to="/notifications" class="topbar-notif-btn position-relative" :title="$t('nav.notifications')">
            <i class="fas fa-bell"></i>
            <span v-if="unreadCount > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="font-size: 0.6rem;">
              {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
          </router-link>
          <LanguageSwitcher />
          <button class="theme-toggle-btn" @click="toggleTheme" :title="theme === 'dark' ? $t('nav.lightMode') : $t('nav.darkMode')">
            <i :class="theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'"></i>
          </button>
        </div>
      </div>

      <div class="main-container">
        <router-view />
      </div>

      <footer class="main-footer">
        &copy; 2025 - {{ $t('footer.madeWith') }}
        <a href="https://www.linkedin.com/in/kantore-jean-gildas-94b43a345/" target="_blank">Kantore</a>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppSidebar from './components/AppSidebar.vue'
import LanguageSwitcher from './components/LanguageSwitcher.vue'
import { useAuth } from './stores/auth'
import { useTheme } from './stores/theme'
import { useNotifications } from './stores/notifications'

const route = useRoute()
const router = useRouter()
const { user, isAuthenticated } = useAuth()
const { theme, toggleTheme } = useTheme()
const { unreadCount } = useNotifications()
const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)
const searchQuery = ref('')

const authorityRoles = ['collinaire', 'zonal', 'communal', 'provincial', 'ministere', 'admin']
const isAuthority = computed(() => authorityRoles.includes(user.value?.role))

const isLoginPage = computed(() => route.path === '/auth/login')

function goSearch() {
  if (searchQuery.value.trim().length >= 2) {
    router.push({ path: '/search', query: { q: searchQuery.value.trim() } })
    searchQuery.value = ''
  }
}
</script>
