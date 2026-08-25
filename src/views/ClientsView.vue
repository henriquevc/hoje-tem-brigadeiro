<script setup lang="ts">
import { computed, ref } from 'vue'
import ClientFormDialog from '@/components/clients/ClientFormDialog.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useBrigadeiroStore } from '@/stores/brigadeiro'
import type { Client } from '@/types'
import { AlertCircle, Loader2, Search, Trash2, Users } from '@lucide/vue'

const store = useBrigadeiroStore()
const searchQuery = ref('')
const clientToDelete = ref<Client | null>(null)
const deleting = ref(false)
const deleteError = ref<string | null>(null)

const filteredClients = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return store.clients
  return store.clients.filter(
    (c) =>
      c.nome.toLowerCase().includes(q) ||
      c.apartamento.toLowerCase().includes(q),
  )
})

function openDelete(client: Client) {
  clientToDelete.value = client
  deleteError.value = null
}

async function confirmDelete() {
  if (!clientToDelete.value || deleting.value) return

  deleting.value = true
  deleteError.value = null
  try {
    await store.removeClient(clientToDelete.value.id)
    clientToDelete.value = null
  } catch (err: any) {
    deleteError.value =
      err?.message ||
      'Não foi possível excluir o cliente. Verifique se existem vendas vinculadas.'
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">Clientes</h1>
        <p class="text-muted-foreground">
          Cadastre clientes com nome e apartamento para vincular rapidamente ao registrar vendas.
        </p>
      </div>
      <ClientFormDialog />
    </div>

    <div class="flex items-center gap-2 max-w-sm">
      <div class="relative w-full">
        <Search class="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          v-model="searchQuery"
          type="search"
          placeholder="Buscar por nome ou apartamento..."
          class="pl-8"
        />
      </div>
    </div>

    <div class="overflow-hidden rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow class="bg-secondary hover:bg-secondary">
            <TableHead class="text-secondary-foreground">Nome</TableHead>
            <TableHead class="text-secondary-foreground">Apartamento / Local</TableHead>
            <TableHead class="text-center text-secondary-foreground">Status</TableHead>
            <TableHead class="w-24 text-right text-secondary-foreground">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="filteredClients.length === 0">
            <TableCell colspan="4" class="h-28 text-center text-muted-foreground">
              <div class="flex flex-col items-center justify-center gap-1">
                <Users class="size-6 text-muted-foreground/60" />
                <p v-if="searchQuery">Nenhum cliente encontrado para "{{ searchQuery }}".</p>
                <p v-else>Nenhum cliente cadastrado. Clique em "Novo cliente" para começar.</p>
              </div>
            </TableCell>
          </TableRow>
          <TableRow v-for="client in filteredClients" :key="client.id">
            <TableCell class="font-medium text-foreground">{{ client.nome }}</TableCell>
            <TableCell class="text-muted-foreground">{{ client.apartamento }}</TableCell>
            <TableCell class="text-center">
              <Badge :variant="client.ativo ? 'default' : 'secondary'">
                {{ client.ativo ? 'Ativo' : 'Inativo' }}
              </Badge>
            </TableCell>
            <TableCell class="text-right">
              <div class="flex justify-end gap-1">
                <ClientFormDialog :client="client" />
                <Button
                  variant="ghost"
                  size="icon"
                  class="text-destructive hover:text-destructive"
                  title="Excluir cliente"
                  @click="openDelete(client)"
                >
                  <Trash2 class="size-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <Dialog
      :open="clientToDelete !== null"
      @update:open="(open) => !open && !deleting && (clientToDelete = null)"
    >
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Excluir cliente?</DialogTitle>
          <DialogDescription>
            <template v-if="clientToDelete">
              Tem certeza que deseja excluir o cliente
              <strong>{{ clientToDelete.nome }} ({{ clientToDelete.apartamento }})</strong>?
            </template>
          </DialogDescription>
        </DialogHeader>

        <div
          v-if="deleteError"
          class="flex items-start gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive"
        >
          <AlertCircle class="size-5 shrink-0" />
          <span>{{ deleteError }}</span>
        </div>

        <DialogFooter>
          <Button variant="outline" :disabled="deleting" @click="clientToDelete = null">
            Cancelar
          </Button>
          <Button variant="destructive" :disabled="deleting" @click="confirmDelete">
            <Loader2 v-if="deleting" class="mr-2 size-4 animate-spin" />
            {{ deleting ? 'Excluindo...' : 'Excluir' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
