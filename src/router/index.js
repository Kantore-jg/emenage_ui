import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
    meta: { auth: true },
  },
  { path: '/auth/login', name: 'login', component: () => import('../views/auth/LoginView.vue') },
  { path: '/dashboard', name: 'dashboard', component: () => import('../views/dashboard/DashboardRedirect.vue'), meta: { auth: true } },
  { path: '/dashboard/citoyen', name: 'dashboard-citoyen', component: () => import('../views/dashboard/CitoyenView.vue'), meta: { auth: true } },
  { path: '/dashboard/gouvernement', name: 'dashboard-gouvernement', component: () => import('../views/dashboard/GouvernementView.vue'), meta: { auth: true } },
  { path: '/dashboard/securite', name: 'dashboard-securite', component: () => import('../views/dashboard/SecuriteView.vue'), meta: { auth: true } },
  { path: '/dashboard/securite/scan', name: 'scanner', component: () => import('../views/dashboard/ScannerView.vue'), meta: { auth: true } },
  { path: '/announcements', name: 'announcements', component: () => import('../views/announcements/ListView.vue'), meta: { auth: true } },
  { path: '/announcements/create', name: 'announcement-create', component: () => import('../views/announcements/CreateView.vue'), meta: { auth: true } },
  { path: '/announcements/:id', name: 'announcement-detail', component: () => import('../views/announcements/DetailView.vue'), meta: { auth: true } },
  { path: '/announcements/:id/edit', name: 'announcement-edit', component: () => import('../views/announcements/EditView.vue'), meta: { auth: true } },
  { path: '/households', name: 'households', component: () => import('../views/households/ListView.vue'), meta: { auth: true } },
  { path: '/households/:id', name: 'household-detail', component: () => import('../views/households/DetailView.vue'), meta: { auth: true } },
  { path: '/reports/create', name: 'report-create', component: () => import('../views/reports/CreateView.vue'), meta: { auth: true } },
  { path: '/identity-card', name: 'identity-card', component: () => import('../views/identity-card/ViewCard.vue'), meta: { auth: true } },
  { path: '/payments', name: 'payments', component: () => import('../views/payments/IndexView.vue'), meta: { auth: true } },
  { path: '/payments/create', name: 'payment-create', component: () => import('../views/payments/CreateView.vue'), meta: { auth: true } },
  { path: '/profile/edit', name: 'profile-edit', component: () => import('../views/profile/EditView.vue'), meta: { auth: true } },
  { path: '/users', name: 'users', component: () => import('../views/admin/UsersView.vue'), meta: { auth: true } },
  { path: '/chef/citoyens', name: 'chef-citoyens', component: () => import('../views/chef/RegisterCitoyenView.vue'), meta: { auth: true } },
  { path: '/censuses', name: 'censuses', component: () => import('../views/census/ListView.vue'), meta: { auth: true } },
  { path: '/censuses/create', name: 'census-create', component: () => import('../views/census/CreateView.vue'), meta: { auth: true } },
  { path: '/censuses/:id', name: 'census-detail', component: () => import('../views/census/DetailView.vue'), meta: { auth: true } },
  { path: '/census/collect', name: 'census-collect', component: () => import('../views/census/CollectView.vue'), meta: { auth: true } },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../views/ErrorView.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.auth && !token) {
    next({ name: 'login' })
  } else if (to.name === 'login' && token) {
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router
