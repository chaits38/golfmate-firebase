import { createApp }    from 'vue'
import { createPinia }  from 'pinia'
import App              from './App.vue'
import router           from './router'
import { useAuthStore } from './stores/auth'
import './style.css'

const app   = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Wait for Firebase auth to resolve before mounting.
// This prevents the router-guard flash on hard refresh.
const authStore = useAuthStore()
authStore.init().then(() => {
  app.mount('#app')
})
