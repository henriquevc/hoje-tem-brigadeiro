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
import type { Product } from '@/types'
import { Pencil, Plus } from '@lucide/vue'

const props = defineProps<{
  product?: Product
}>()

const store = useBrigadeiroStore()
const open = ref(false)
const nome = ref('')
const valorVenda = ref(0)
const precoCusto = ref(0)
const ativo = ref(true)

const isEdit = () => Boolean(props.product)

watch(open, (isOpen) => {
  if (!isOpen) return
  if (props.product) {
    nome.value = props.product.nome
    valorVenda.value = props.product.valor_venda
    precoCusto.value = props.product.preco_custo
    ativo.value = props.product.ativo
  } else {
    nome.value = ''
    valorVenda.value = 12
    precoCusto.value = 4.4
    ativo.value = true
  }
})

async function submit() {
  const input = {
    nome: nome.value.trim(),
    valor_venda: valorVenda.value,
    preco_custo: precoCusto.value,
    ativo: ativo.value,
  }
  if (!input.nome) return

  if (props.product) {
    await store.updateProduct(props.product.id, input)
  } else {
    await store.addProduct(input)
  }
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <Button v-if="isEdit()" variant="ghost" size="icon">
        <Pencil class="size-4" />
      </Button>
      <Button v-else>
        <Plus class="mr-2 size-4" />
        Novo produto
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ isEdit() ? 'Editar produto' : 'Novo produto' }}</DialogTitle>
        <DialogDescription>
          Cadastre caixas (simples 4un, dupla 8un, etc.) com preço de venda e custo.
        </DialogDescription>
      </DialogHeader>

      <form class="grid gap-4 py-2" @submit.prevent="submit">
        <div class="grid gap-2">
          <Label for="nome">Produto</Label>
          <Input
            id="nome"
            v-model="nome"
            placeholder="Ex: Caixa simples (4un)"
            required
          />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="grid gap-2">
            <Label for="venda">Valor de venda (R$)</Label>
            <Input
              id="venda"
              v-model.number="valorVenda"
              type="number"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div class="grid gap-2">
            <Label for="custo">Preço de custo (R$)</Label>
            <Input
              id="custo"
              v-model.number="precoCusto"
              type="number"
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>
        <div class="flex items-center gap-2">
          <input
            id="ativo"
            v-model="ativo"
            type="checkbox"
            class="h-4 w-4 rounded border-gray-300"
          />
          <Label for="ativo" class="cursor-pointer">Ativo</Label>
        </div>
      </form>

      <DialogFooter>
        <Button variant="outline" type="button" @click="open = false">Cancelar</Button>
        <Button type="button" @click="submit">Salvar</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
