<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signUp, friendlyAuthError } from '@/services/auth'

const router   = useRouter()
const name     = ref('')
const email    = ref('')
const password = ref('')
const confirm  = ref('')
const error    = ref('')
const loading  = ref(false)

async function handleSignup() {
  error.value = ''

  if (!name.value || !email.value || !password.value) {
    error.value = 'All fields are required.'; return
  }
  if (password.value !== confirm.value) {
    error.value = 'Passwords do not match.'; return
  }
  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters.'; return
  }

  loading.value = true
  try {
    await signUp(name.value, email.value, password.value)
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
      <p>Create your free account</p>
    </div>

    <div class="card">
      <h2 style="margin-bottom:20px">Sign Up</h2>

      <div v-if="error" class="alert alert-error">{{ error }}</div>

      <label>Full Name
        <input v-model="name" type="text" placeholder="John Smith" autocomplete="name" @keyup.enter="handleSignup">
      </label>
      <label>Email
        <input v-model="email" type="email" placeholder="you@example.com" autocomplete="email" @keyup.enter="handleSignup">
      </label>
      <label>
        Password <span style="color:#888; font-size:12px; font-weight:400">(min 6 characters)</span>
        <input v-model="password" type="password" autocomplete="new-password" @keyup.enter="handleSignup">
      </label>
      <label>Confirm Password
        <input v-model="confirm" type="password" autocomplete="new-password" @keyup.enter="handleSignup">
      </label>

      <button class="btn btn-full" :disabled="loading" @click="handleSignup">
        {{ loading ? 'Creating account…' : 'Create Account' }}
      </button>

      <p class="auth-footer">
        Already have an account? <RouterLink to="/login">Login</RouterLink>
      </p>
    </div>
  </div>
</template>
