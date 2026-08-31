<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import {
  LayoutDashboard,
  LogOut,
  Package,
  Calculator,
  Users,
  Image as ImageIcon,
  Menu,
  Sparkles,
} from '@lucide/vue'
import CupcakeIcon from '@/components/icons/CupcakeIcon.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useAuthStore } from '@/stores/auth'
import { useBrigadeiroStore } from '@/stores/brigadeiro'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const store = useBrigadeiroStore()
const isDrawerOpen = ref(false)

function logout() {
  auth.logout()
  router.push({ name: 'login' })
}

const links = [
  {
    to: '/',
    label: 'Vendas & Painel',
    description: 'Gestão de pedidos e faturamento',
    icon: LayoutDashboard,
  },
  {
    to: '/cardapio',
    label: 'Cardápio WhatsApp',
    description: 'Gerador de imagens para redes e status',
    icon: ImageIcon,
    isHighlight: true,
  },
  {
    to: '/produtos',
    label: 'Produtos',
    description: 'Cadastro de itens e precificação',
    icon: Package,
  },
  {
    to: '/clientes',
    label: 'Clientes',
    description: 'Lista de clientes e apartamentos',
    icon: Users,
  },
  {
    to: '/calculadora',
    label: 'Calculadora de Custos',
    description: 'Ficha técnica e custos de receitas',
    icon: Calculator,
  },
]
</script>

<template>
  <div class="min-h-svh bg-background">
    <header class="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-md">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        
        <!-- Lado Esquerdo: Menu Hambúrguer + Logo -->
        <div class="flex items-center gap-3">
          <!-- Drawer Sheet com Menu Hambúrguer -->
          <Sheet v-model:open="isDrawerOpen">
            <SheetTrigger as-child>
              <Button
                variant="outline"
                size="icon"
                class="size-9 rounded-lg border-border/80 bg-background/50 hover:bg-accent hover:text-foreground shadow-sm transition-all"
                title="Abrir Menu de Navegação"
              >
                <Menu class="size-5" />
                <span class="sr-only">Abrir Menu</span>
              </Button>
            </SheetTrigger>

            <SheetContent side="left" class="w-[300px] sm:w-[340px] p-0 flex flex-col justify-between">
              <div>
                <!-- Topo do Drawer -->
                <SheetHeader class="border-b p-5 text-left bg-muted/20">
                  <div class="flex items-center gap-3">
                    <div class="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                      <CupcakeIcon class="size-6" />
                    </div>
                    <div>
                      <SheetTitle class="text-base font-bold text-foreground">
                        Hoje tem Brigadeiro
                      </SheetTitle>
                      <SheetDescription class="text-xs text-muted-foreground">
                        Gestão & Cardápios Gourmet
                      </SheetDescription>
                    </div>
                  </div>
                </SheetHeader>

                <!-- Links de Navegação -->
                <div class="p-4 space-y-1.5">
                  <div class="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Menu Principal
                  </div>

                  <RouterLink
                    v-for="link in links"
                    :key="link.to"
                    :to="link.to"
                    @click="isDrawerOpen = false"
                    class="flex items-center gap-3.5 rounded-xl px-3.5 py-3 transition-all duration-200"
                    :class="
                      route.path === link.to
                        ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                        : link.isHighlight
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/15 border border-amber-500/20'
                        : 'text-foreground/80 hover:bg-accent hover:text-foreground'
                    "
                  >
                    <div
                      class="flex size-8 shrink-0 items-center justify-center rounded-lg"
                      :class="
                        route.path === link.to
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : link.isHighlight
                          ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                          : 'bg-muted text-muted-foreground'
                      "
                    >
                      <component :is="link.icon" class="size-4" />
                    </div>

                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between gap-1">
                        <span class="text-sm font-medium leading-none truncate">
                          {{ link.label }}
                        </span>
                        <span
                          v-if="link.isHighlight && route.path !== link.to"
                          class="inline-flex items-center gap-0.5 rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:text-amber-300"
                        >
                          <Sparkles class="size-2.5" /> Novo
                        </span>
                      </div>
                      <p
                        class="text-[11px] mt-0.5 truncate"
                        :class="route.path === link.to ? 'text-primary-foreground/80' : 'text-muted-foreground'"
                      >
                        {{ link.description }}
                      </p>
                    </div>
                  </RouterLink>
                </div>
              </div>

              <!-- Rodapé do Drawer -->
              <div class="border-t p-4 bg-muted/20 space-y-3">
                <div class="flex items-center justify-between text-xs text-muted-foreground px-1">
                  <span>Modo de Armazenamento:</span>
                  <Badge variant="secondary" class="text-[10px] font-semibold">
                    {{ store.storageMode === 'supabase' ? 'Supabase' : 'IndexedDB' }}
                  </Badge>
                </div>

                <Button
                  v-if="auth.isRequired"
                  variant="outline"
                  size="sm"
                  class="w-full justify-center gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                  @click="logout"
                >
                  <LogOut class="size-4" />
                  <span>Sair do Sistema</span>
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <!-- Logo & Título -->
          <RouterLink to="/" class="flex items-center gap-2.5 font-semibold text-foreground">
            <div class="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <CupcakeIcon class="size-5" />
            </div>
            <div class="flex flex-col">
              <span class="text-sm font-bold leading-none tracking-tight">Hoje tem brigadeiro</span>
              <span class="text-[10px] text-muted-foreground font-normal">Gourmet & Artesanal</span>
            </div>
          </RouterLink>
        </div>

        <!-- Atalho Rápido para a tela de Cardápio WhatsApp e Informações -->
        <div class="flex items-center gap-2">
          <RouterLink
            to="/cardapio"
            class="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border"
            :class="
              route.path === '/cardapio'
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
            "
          >
            <ImageIcon class="size-3.5 text-amber-600 dark:text-amber-400" />
            <span class="hidden sm:inline">Montar Cardápio</span>
            <span class="sm:hidden">Cardápio</span>
            <span class="text-[9px] bg-amber-500 text-white dark:text-stone-900 font-bold px-1.5 py-0.2 rounded-full">HD</span>
          </RouterLink>

          <Badge variant="secondary" class="hidden md:inline-flex text-xs">
            {{ store.storageMode === 'supabase' ? 'Supabase' : 'IndexedDB' }}
          </Badge>

          <Button
            v-if="auth.isRequired"
            variant="ghost"
            size="icon"
            class="size-8 text-muted-foreground hover:text-foreground"
            title="Sair"
            @click="logout"
          >
            <LogOut class="size-4" />
            <span class="sr-only">Sair</span>
          </Button>
        </div>

      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <slot />
    </main>
  </div>
</template>

