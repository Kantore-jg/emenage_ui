<template>
  <div class="dropdown">
    <button class="lang-switch-btn" type="button" data-bs-toggle="dropdown" :title="$t('language.' + locale)">
      <span class="lang-flag">{{ locale === 'fr' ? '🇫🇷' : '🇧🇮' }}</span>
      <span class="lang-code d-none d-md-inline">{{ locale.toUpperCase() }}</span>
    </button>
    <ul class="dropdown-menu dropdown-menu-end">
      <li>
        <button class="dropdown-item" :class="{ active: locale === 'fr' }" @click="switchLocale('fr')">
          🇫🇷 {{ $t('language.fr') }}
        </button>
      </li>
      <li>
        <button class="dropdown-item" :class="{ active: locale === 'rn' }" @click="switchLocale('rn')">
          🇧🇮 {{ $t('language.rn') }}
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

function switchLocale(lang) {
  locale.value = lang
  localStorage.setItem('locale', lang)
}
</script>

<style scoped>
.lang-switch-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: 1px solid var(--input-border);
  border-radius: 6px;
  padding: 4px 8px;
  color: var(--text-color);
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}
.lang-switch-btn:hover {
  background: var(--table-hover);
}
.lang-flag {
  font-size: 1.1rem;
}
.dropdown-item.active {
  background-color: var(--primary-color);
  color: white;
}
</style>
