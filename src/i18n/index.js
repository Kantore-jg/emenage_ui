import { createI18n } from 'vue-i18n'
import fr from './fr.js'
import rn from './rn.js'

const savedLocale = localStorage.getItem('locale') || 'fr'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'fr',
  messages: { fr, rn },
})

export default i18n
