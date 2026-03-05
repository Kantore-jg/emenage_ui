import { ref, watchEffect } from 'vue'

const theme = ref(localStorage.getItem('theme') || 'light')

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  localStorage.setItem('theme', theme.value)
}

watchEffect(() => {
  document.documentElement.setAttribute('data-theme', theme.value)
})

export function useTheme() {
  return { theme, toggleTheme }
}
