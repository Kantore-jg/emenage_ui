<template>
  <!-- Login page: no sidebar -->
  <div v-if="isLoginPage">
    <router-view />
  </div>

  <!-- App layout with sidebar -->
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
          <button class="sidebar-desktop-toggle d-none d-lg-inline-flex" @click="sidebarCollapsed = !sidebarCollapsed" title="Toggle sidebar">
            <i :class="sidebarCollapsed ? 'fas fa-angles-right' : 'fas fa-angles-left'"></i>
          </button>
        </div>
        <div class="d-flex align-items-center gap-3">
          <small class="text-muted d-none d-md-inline" v-if="user">
            <i class="fas fa-circle text-success" style="font-size: 0.5rem;"></i>
            {{ user.nom }}
          </small>
          <button class="theme-toggle-btn" @click="toggleTheme" :title="theme === 'dark' ? 'Mode clair' : 'Mode sombre'">
            <i :class="theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'"></i>
          </button>
        </div>
      </div>

      <div class="main-container">
        <router-view />
      </div>

      <footer class="main-footer">
        &copy; 2025 Ubuzima Hub - Made with ❤️ by
        <a href="https://www.linkedin.com/in/kantore-jean-gildas-94b43a345/" target="_blank">Kantox</a>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from './components/AppSidebar.vue'
import { useAuth } from './stores/auth'
import { useTheme } from './stores/theme'

const route = useRoute()
const { user } = useAuth()
const { theme, toggleTheme } = useTheme()
const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)

const isLoginPage = computed(() => route.path === '/auth/login')
</script>
