import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from 'firebase/auth'
import { onAuthChange, getUserProfile } from '@/services/auth'
import type { UserProfile } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user        = ref<User | null>(null)
  const profile     = ref<UserProfile | null>(null)
  const initialized = ref(false)

  const isLoggedIn = computed(() => !!user.value)

  // Called once from main.ts — waits for Firebase to resolve auth state
  function init(): Promise<void> {
    return new Promise(resolve => {
      onAuthChange(async (firebaseUser) => {
        user.value = firebaseUser
        if (firebaseUser) {
          profile.value = await getUserProfile(firebaseUser.uid)
        } else {
          profile.value = null
        }
        if (!initialized.value) {
          initialized.value = true
          resolve()
        }
      })
    })
  }

  async function refreshProfile(): Promise<void> {
    if (user.value) {
      profile.value = await getUserProfile(user.value.uid)
    }
  }

  return { user, profile, initialized, isLoggedIn, init, refreshProfile }
})
