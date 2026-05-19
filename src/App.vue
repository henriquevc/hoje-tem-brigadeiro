<script setup lang="ts">
import { onMounted } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import { useBrigadeiroStore } from '@/stores/brigadeiro'

const store = useBrigadeiroStore()

onMounted(() => {
  store.init()
})
</script>

<template>
  <AppLayout>
    <div v-if="store.loading && !store.initialized" class="flex min-h-[40vh] items-center justify-center">
      <p class="text-muted-foreground">Carregando...</p>
    </div>
    <div v-else-if="store.error" class="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
      {{ store.error }}
    </div>
    <RouterView v-else />
  </AppLayout>
</template>
