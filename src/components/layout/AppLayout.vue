<script setup lang="ts">
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { LayoutDashboard, LogOut, Package, Calculator, Users } from '@lucide/vue'
import CupcakeIcon from '@/components/icons/CupcakeIcon.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth'
import { useBrigadeiroStore } from '@/stores/brigadeiro'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const store = useBrigadeiroStore()

function logout() {
  auth.logout()
  router.push({ name: 'login' })
}

const links = [
  { to: '/', label: 'Vendas', icon: LayoutDashboard },
  { to: '/produtos', label: 'Produtos', icon: Package },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/calculadora', label: 'Custos', icon: Calculator },
]
</script>

<template>
  <div class="min-h-svh bg-background">
    <header class="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-md">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <RouterLink to="/" class="flex items-center gap-2 font-semibold text-foreground">
          <div class="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <CupcakeIcon class="size-5" />
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

        <div class="flex items-center gap-2">
          <Badge variant="secondary" class="hidden text-xs sm:inline-flex">
            {{ store.storageMode === 'supabase' ? 'Supabase' : 'IndexedDB' }}
          </Badge>
          <Button
            v-if="auth.isRequired"
            variant="ghost"
            size="sm"
            class="text-muted-foreground"
            title="Sair"
            @click="logout"
          >
            <LogOut class="size-4" />
            <span class="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <slot />
    </main>
  </div>
</template>
