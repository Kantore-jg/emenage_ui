<template>
  <div>
    <!-- Summary cards -->
    <div class="row g-3 mb-3">
      <div class="col-6 col-lg-3" v-for="card in summaryCards" :key="card.label">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body d-flex align-items-center gap-3 py-3">
            <div class="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                 :style="{ background: card.bg, width: '42px', height: '42px' }">
              <i :class="card.icon" class="text-white" style="font-size: 0.9rem;"></i>
            </div>
            <div>
              <div class="fs-5 fw-bold lh-1 mb-1">{{ card.value }}</div>
              <small class="text-muted" style="font-size: 0.75rem;">{{ card.label }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts row 1 -->
    <div class="row g-3 mb-3">
      <div class="col-lg-8">
        <div class="card">
          <div class="card-header py-2 d-flex justify-content-between align-items-center">
            <small><i class="fas fa-chart-line"></i> Utilisateurs inscrits par mois</small>
          </div>
          <div class="card-body p-2">
            <div class="chart-container" style="height: 220px;">
              <Bar v-if="userChartData" :data="userChartData" :options="barOptions" />
              <div v-else class="d-flex align-items-center justify-content-center h-100 text-muted">
                <span class="spinner-border spinner-border-sm me-2"></span> Chargement...
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-4">
        <div class="card">
          <div class="card-header py-2">
            <small><i class="fas fa-chart-pie"></i> Paiements par type</small>
          </div>
          <div class="card-body p-2 d-flex align-items-center justify-content-center">
            <div style="width: 200px; height: 220px;">
              <Doughnut v-if="paymentChartData" :data="paymentChartData" :options="doughnutOptions" />
              <div v-else class="d-flex align-items-center justify-content-center h-100 text-muted">
                <span class="spinner-border spinner-border-sm me-2"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts row 2 -->
    <div class="row g-3 mb-3">
      <div class="col-12">
        <div class="card">
          <div class="card-header py-2 d-flex justify-content-between align-items-center">
            <small><i class="fas fa-house-user"></i> Membres par ménage (top 15)</small>
            <router-link to="/announcements" class="btn btn-sm btn-light py-0 px-2" style="font-size: 0.8rem;">
              <i class="fas fa-bullhorn"></i> Communiqués
            </router-link>
          </div>
          <div class="card-body p-2">
            <div class="chart-container" style="height: 200px;">
              <Bar v-if="householdChartData" :data="householdChartData" :options="horizontalBarOptions" />
              <div v-else class="d-flex align-items-center justify-content-center h-100 text-muted">
                <span class="spinner-border spinner-border-sm me-2"></span> Chargement...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import api from '../services/api'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

const stats = ref(null)

const summaryCards = computed(() => {
  if (!stats.value?.summary) return []
  const s = stats.value.summary
  return [
    { label: 'Utilisateurs', value: s.total_users, icon: 'fas fa-users', bg: 'linear-gradient(135deg, #2c5f2d, #97bc62)' },
    { label: 'Citoyens', value: s.total_citoyens, icon: 'fas fa-user', bg: 'linear-gradient(135deg, #0d6efd, #6ea8fe)' },
    { label: 'Ménages', value: s.total_households, icon: 'fas fa-house-user', bg: 'linear-gradient(135deg, #f4a261, #e76f51)' },
    { label: 'Paiements', value: s.total_payments, icon: 'fas fa-file-invoice-dollar', bg: 'linear-gradient(135deg, #6f42c1, #b197fc)' },
  ]
})

const userChartData = computed(() => {
  if (!stats.value?.users_by_month) return null
  const d = stats.value.users_by_month
  return {
    labels: d.labels,
    datasets: [{
      label: 'Nouveaux utilisateurs',
      data: d.data,
      backgroundColor: 'rgba(44, 95, 45, 0.7)',
      borderColor: '#2c5f2d',
      borderWidth: 1,
      borderRadius: 4,
    }],
  }
})

const paymentChartData = computed(() => {
  if (!stats.value?.payments_by_type) return null
  const d = stats.value.payments_by_type
  if (!d.labels.length) {
    return {
      labels: ['Aucun paiement'],
      datasets: [{ data: [1], backgroundColor: ['#dee2e6'] }],
    }
  }
  const colors = ['#2c5f2d', '#97bc62', '#f4a261', '#e76f51', '#0d6efd', '#6f42c1', '#20c997', '#fd7e14']
  return {
    labels: d.labels,
    datasets: [{
      data: d.counts,
      backgroundColor: colors.slice(0, d.labels.length),
      borderWidth: 2,
      borderColor: '#fff',
    }],
  }
})

const householdChartData = computed(() => {
  if (!stats.value?.members_by_household) return null
  const d = stats.value.members_by_household
  if (!d.labels.length) {
    return {
      labels: ['Aucun ménage'],
      datasets: [{ data: [0], backgroundColor: ['#dee2e6'] }],
    }
  }
  return {
    labels: d.labels,
    datasets: [{
      label: 'Membres',
      data: d.data,
      backgroundColor: 'rgba(151, 188, 98, 0.7)',
      borderColor: '#97bc62',
      borderWidth: 1,
      borderRadius: 4,
    }],
  }
})

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 600 },
  resizeDelay: 100,
}

const barOptions = {
  ...chartDefaults,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 } } },
    x: { ticks: { font: { size: 10 }, maxRotation: 45 } },
  },
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 600 },
  resizeDelay: 100,
  plugins: {
    legend: { position: 'bottom', labels: { padding: 8, usePointStyle: true, font: { size: 10 } } },
  },
}

const horizontalBarOptions = {
  ...chartDefaults,
  indexAxis: 'y',
  plugins: { legend: { display: false } },
  scales: {
    x: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 } } },
    y: { ticks: { font: { size: 10 } } },
  },
}

onMounted(async () => {
  try {
    const { data } = await api.get('/stats')
    stats.value = data
  } catch (e) {
    console.error('Stats load error:', e)
  }
})
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  overflow: hidden;
}
</style>
