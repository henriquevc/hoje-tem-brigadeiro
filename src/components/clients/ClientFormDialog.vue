<script setup lang="ts">
import { ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useBrigadeiroStore } from '@/stores/brigadeiro'
import type { Client } from '@/types'
import { Loader2, Pencil, Plus } from '@lucide/vue'

const props = defineProps<{
  client?: Client
  open?: boolean
  hideTrigger?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'saved': [client: Client]
}>()

const store = useBrigadeiroStore()
const localOpen = ref(false)
const saving = ref(false)
const errorMessage = ref<string | null>(null)

const nome = ref('')
const apartamento = ref('')
const ativo = ref(true)

const isEdit = () => Boolean(props.client)

watch(
  () => props.open,
  (val) => {
    if (val !== undefined) {
      localOpen.value = val
    }
  },
  { immediate: true },
)

watch(localOpen, (isOpen) => {
  emit('update:open', isOpen)
  if (!isOpen) {
    errorMessage.value = null
    return
  }
  if (props.client) {
    nome.value = props.client.nome
    apartamento.value = props.client.apartamento
    ativo.value = props.client.ativo
  } else {
    nome.value = ''
    apartamento.value = ''
    ativo.value = true
  }
  errorMessage.value = null
})

async function submit() {
  if (!nome.value.trim() || !apartamento.value.trim() || saving.value) return

  saving.value = true
  errorMessage.value = null
  try {
    const input = {
      nome: nome.value.trim(),
      apartamento: apartamento.value.trim(),
      ativo: ativo.value,
    }
    let result: Client
    if (props.client) {
      result = await store.updateClient(props.client.id, input)
    } else {
      result = await store.addClient(input)
    }
    emit('saved', result)
    localOpen.value = false
  } catch (err: any) {
    errorMessage.value = err?.message || 'Erro ao salvar cliente'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="localOpen">
    <DialogTrigger v-if="!hideTrigger" as-child>
      <Button v-if="isEdit()" variant="ghost" size="icon">
        <Pencil class="size-4" />
      </Button>
      <Button v-else>
        <Plus class="mr-2 size-4" />
        Novo cliente
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ isEdit() ? 'Editar cliente' : 'Novo cliente' }}</DialogTitle>
        <DialogDescription>
          Cadastre o nome e o apartamento do cliente para vincular às vendas.
        </DialogDescription>
      </DialogHeader>

      <form class="grid gap-4 py-2" @submit.prevent="submit">
        <div class="grid gap-2">
          <Label for="cliente-nome">Nome</Label>
          <Input
            id="cliente-nome"
            v-model="nome"
            placeholder="Ex: Cristina"
            required
            :disabled="saving"
          />
        </div>

        <div class="grid gap-2">
          <Label for="cliente-apartamento">Apartamento / Local</Label>
          <Input
            id="cliente-apartamento"
            v-model="apartamento"
            placeholder="Ex: 165-2 ou 104 Bloco B"
            required
            :disabled="saving"
          />
        </div>

        <div class="flex items-center gap-2 pt-1">
          <input
            id="cliente-ativo"
            v-model="ativo"
            type="checkbox"
            class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            :disabled="saving"
          />
          <Label for="cliente-ativo" class="cursor-pointer">Cliente ativo</Label>
        </div>

        <div v-if="errorMessage" class="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {{ errorMessage }}
        </div>
      </form>

      <DialogFooter>
        <Button variant="outline" type="button" :disabled="saving" @click="localOpen = false">
          Cancelar
        </Button>
        <Button
          type="button"
          :disabled="!nome.trim() || !apartamento.trim() || saving"
          @click="submit"
        >
          <Loader2 v-if="saving" class="mr-2 size-4 animate-spin" />
          {{ saving ? 'Salvando...' : isEdit() ? 'Salvar alterações' : 'Cadastrar cliente' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
