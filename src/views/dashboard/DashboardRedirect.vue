<template>
  <div class="text-center py-5">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Chargement...</span>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../stores/auth'

const { user } = useAuth()
const router = useRouter()

onMounted(() => {
  const role = user.value?.role
  switch (role) {
    case 'citoyen':
      router.replace('/dashboard/citoyen')
      break
    case 'chef_quartier':
    case 'ministere':
    case 'admin':
      router.replace('/dashboard/gouvernement')
      break
    case 'police':
      router.replace('/dashboard/securite')
      break
    default:
      router.replace('/')
  }
})
</script>
