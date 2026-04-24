<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { logIn, friendlyAuthError } from '@/services/auth'

const router   = useRouter()
const email    = ref('')
const password = ref('')
const error    = ref('')
const loading  = ref(false)

async function handleLogin() {
  error.value = ''
  if (!email.value || !password.value) {
    error.value = 'Please enter your email and password.'
    return
  }
  loading.value = true
  try {
    await logIn(email.value, password.value)
    router.push('/dashboard')
  } catch (e: any) {
    error.value = friendlyAuthError(e.code)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-wrap">
    <div class="auth-logo">
      <h1>⛳ GolfMate</h1>
      <p>Track your game, improve your score</p>
    </div>

    <div class="card">
      <h2 style="margin-bottom:20px">Login</h2>

      <div v-if="error" class="alert alert-error">{{ error }}</div>

      <label>Email
        <input
          v-model="email"
          type="email"
          placeholder="you@example.com"
          autocomplete="email"
          @keyup.enter="handleLogin"
        >
      </label>

      <label>Password
        <input
          v-model="password"
          type="password"
          autocomplete="current-password"
          @keyup.enter="handleLogin"
        >
      </label>

      <button
        class="btn btn-full"
        :disabled="loading"
        @click="handleLogin"
      >
        {{ loading ? 'Logging in…' : 'Login' }}
      </button>

      <p class="auth-footer">
        No account? <RouterLink to="/signup">Sign up free</RouterLink>
      </p>
    </div>
  </div>
</template>
