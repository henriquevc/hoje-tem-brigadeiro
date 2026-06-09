<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CupcakeIcon from '@/components/icons/CupcakeIcon.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const password = ref('')

function submit() {
  if (!password.value.trim()) {
    auth.loginError = 'Informe a senha'
    return
  }
  if (!auth.login(password.value)) return

  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
  router.replace(redirect)
}
</script>

<template>
  <div class="flex min-h-svh items-center justify-center bg-background px-4">
    <Card class="w-full max-w-sm">
      <CardHeader class="text-center">
        <div class="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <CupcakeIcon class="size-7" />
        </div>
        <CardTitle>Hoje tem brigadeiro</CardTitle>
        <p class="text-sm text-muted-foreground">Digite a senha para acessar o sistema</p>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" @submit.prevent="submit">
          <div class="space-y-2">
            <Label for="password">Senha</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              autocomplete="current-password"
              placeholder="Sua senha"
              autofocus
            />
          </div>
          <p v-if="auth.loginError" class="text-sm text-destructive">
            {{ auth.loginError }}
          </p>
          <Button type="submit" class="w-full">
            Entrar
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
