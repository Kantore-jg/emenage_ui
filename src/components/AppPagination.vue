<template>
  <nav v-if="pagination && pagination.last_page > 1" class="d-flex justify-content-between align-items-center mt-3">
    <small class="text-muted">
      {{ $t('pagination.showing') }} {{ pagination.from }}–{{ pagination.to }} {{ $t('pagination.of') }} {{ pagination.total }} {{ $t('pagination.results') }}
    </small>
    <ul class="pagination pagination-sm mb-0">
      <li class="page-item" :class="{ disabled: pagination.current_page <= 1 }">
        <a class="page-link" href="#" @click.prevent="changePage(pagination.current_page - 1)">
          <i class="fas fa-chevron-left"></i>
        </a>
      </li>
      <li
        v-for="(p, i) in visiblePages"
        :key="i"
        class="page-item"
        :class="{ active: p === pagination.current_page, disabled: p === '...' }"
      >
        <a class="page-link" href="#" @click.prevent="p !== '...' && changePage(p)">{{ p }}</a>
      </li>
      <li class="page-item" :class="{ disabled: pagination.current_page >= pagination.last_page }">
        <a class="page-link" href="#" @click.prevent="changePage(pagination.current_page + 1)">
          <i class="fas fa-chevron-right"></i>
        </a>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  pagination: { type: Object, required: true }
})
const emit = defineEmits(['page-change'])

function changePage(page) {
  if (page >= 1 && page <= props.pagination.last_page && page !== props.pagination.current_page) {
    emit('page-change', page)
  }
}

const visiblePages = computed(() => {
  const { current_page, last_page } = props.pagination
  if (last_page <= 7) return Array.from({ length: last_page }, (_, i) => i + 1)

  const pages = [1]
  if (current_page > 3) pages.push('...')
  const start = Math.max(2, current_page - 1)
  const end = Math.min(last_page - 1, current_page + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  if (current_page < last_page - 2) pages.push('...')
  pages.push(last_page)
  return pages
})
</script>
