<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { Cake, LayoutDashboard, Package } from '@lucide/vue'
import { Badge } from '@/components/ui/badge'
import { useBrigadeiroStore } from '@/stores/brigadeiro'

const route = useRoute()
const store = useBrigadeiroStore()

const links = [
  { to: '/', label: 'Vendas', icon: LayoutDashboard },
  { to: '/produtos', label: 'Produtos', icon: Package },
]
</script>

<template>
  <div class="min-h-svh bg-background">
    <header class="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-md">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <RouterLink to="/" class="flex items-center gap-2 font-semibold text-foreground">
          <div class="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Cake class="size-5" />
          </div>
          <span class="hidden sm:inline">Hoje tem brigadeiro</span>
        </RouterLink>

        <nav class="flex items-center gap-1">
          <RouterLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
            :class="
              route.path === link.to
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground'
            "
          >
            <component :is="link.icon" class="size-4" />
            {{ link.label }}
          </RouterLink>
        </nav>

        <Badge variant="secondary" class="hidden text-xs sm:inline-flex">
          {{ store.storageMode === 'supabase' ? 'Supabase' : 'IndexedDB' }}
        </Badge>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <slot />
    </main>
  </div>
</template>
