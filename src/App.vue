<script setup lang="ts">
import { onMounted, watch } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { useBrigadeiroStore } from '@/stores/brigadeiro'
import { useCalculatorStore } from '@/stores/calculator'

const auth = useAuthStore()
const store = useBrigadeiroStore()
const calculatorStore = useCalculatorStore()

function initData() {
  if (auth.isAuthenticated || !auth.isRequired) {
    store.init()
    calculatorStore.init()
  }
}

onMounted(initData)

watch(
  () => auth.isAuthenticated,
  (authenticated) => {
    if (authenticated) {
      if (!store.initialized) {
        store.init()
      }
      if (!calculatorStore.initialized) {
        calculatorStore.init()
      }
    }
  },
)
</script>

<template>
  <RouterView v-if="!auth.isRequired || !auth.isAuthenticated" />
  <AppLayout v-else>
    <div v-if="store.loading && !store.initialized" class="flex min-h-[40vh] items-center justify-center">
      <p class="text-muted-foreground">Carregando...</p>
    </div>
    <div v-else-if="store.error" class="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
      {{ store.error }}
    </div>
    <RouterView v-else />
  </AppLayout>
</template>
