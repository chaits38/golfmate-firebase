<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore }        from '@/stores/auth'
import { logOut }              from '@/services/auth'

const router   = useRouter()
const route    = useRoute()
const authStore = useAuthStore()

const navLinks = [
  { to: '/dashboard',   label: 'Dashboard'   },
  { to: '/new-round',   label: 'New Round'   },
  { to: '/history',     label: 'History'     },
  { to: '/stats',       label: 'My Stats'    },
  { to: '/courses',     label: 'Courses'     },
  { to: '/leaderboard', label: 'Leaderboard' }
]

async function handleLogout() {
  await logOut()
  router.push('/login')
}
</script>

<template>
  <div class="app-shell">
    <nav>
      <RouterLink to="/dashboard" class="nav-brand">⛳ GolfMate</RouterLink>
      <div class="nav-links">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          :class="{ active: route.path === link.to }"
        >{{ link.label }}</RouterLink>
        <button class="nav-logout" @click="handleLogout">Logout</button>
      </div>
    </nav>
    <main class="container">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.nav-logout {
  background: none;
  border: none;
  color: rgba(255,255,255,.9);
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 5px;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  transition: background .15s;
}
.nav-logout:hover { background: rgba(255,255,255,.15); color: white; }
</style>
