<template>
  <div class="text-center py-5">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">{{ $t('common.loading') }}</span>
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
  const authorityRoles = ['collinaire', 'zonal', 'communal', 'provincial', 'ministere', 'admin']

  if (role === 'citoyen') {
    router.replace('/dashboard/citoyen')
  } else if (authorityRoles.includes(role)) {
    router.replace('/dashboard/gouvernement')
  } else if (role === 'police') {
    router.replace('/dashboard/securite')
  } else if (role === 'agent_recensement') {
    router.replace('/census/collect')
  } else {
    router.replace('/')
  }
})
</script>
