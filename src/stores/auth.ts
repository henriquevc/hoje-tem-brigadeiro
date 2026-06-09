import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  clearSession,
  createSession,
  hasActiveSession,
  isPasswordRequired,
  verifyPassword,
} from '@/lib/auth'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(hasActiveSession())
  const loginError = ref<string | null>(null)

  function login(password: string): boolean {
    loginError.value = null
    if (!isPasswordRequired) {
      isAuthenticated.value = true
      return true
    }
    if (verifyPassword(password)) {
      createSession()
      isAuthenticated.value = true
      return true
    }
    loginError.value = 'Senha incorreta'
    return false
  }

  function logout() {
    clearSession()
    isAuthenticated.value = false
    loginError.value = null
  }

  return {
    isRequired: isPasswordRequired,
    isAuthenticated,
    loginError,
    login,
    logout,
  }
})
