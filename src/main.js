import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './assets/style.css'
import { useTheme } from './stores/theme'

useTheme()

const app = createApp(App)
app.use(router)
app.use(i18n)
app.mount('#app')
