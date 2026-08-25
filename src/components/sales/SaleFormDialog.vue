<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { format } from 'date-fns'
import ClientFormDialog from '@/components/clients/ClientFormDialog.vue'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { useBrigadeiroStore } from '@/stores/brigadeiro'
import type { Client, Sale } from '@/types'
import { Loader2, Pencil, Plus, UserPlus } from '@lucide/vue'

const props = defineProps<{
  sale?: Sale
}>()

const store = useBrigadeiroStore()
const open = ref(false)
const saving = ref(false)
const showNewClientDialog = ref(false)

const data = ref(format(new Date(), 'yyyy-MM-dd'))
const quantidade = ref(1)
const produtoId = ref('')
const clienteId = ref('none')

const isEdit = () => Boolean(props.sale)

const productOptions = computed(() => {
  const active = store.products.filter((p) => p.ativo)
  if (!props.sale) return active

  const current = store.products.find((p) => p.id === props.sale!.produto_id)
  if (current && !active.some((p) => p.id === current.id)) {
    return [...active, current]
  }
  return active
})

const clientOptions = computed(() => {
  const active = store.clients.filter((c) => c.ativo)
  if (!props.sale || !props.sale.cliente_id) return active

  const current = store.clients.find((c) => c.id === props.sale!.cliente_id)
  if (current && !active.some((c) => c.id === current.id)) {
    return [...active, current]
  }
  return active
})

const selectedProduct = computed(() =>
  store.products.find((p) => p.id === produtoId.value),
)

const previewLucro = computed(() => {
  const p = selectedProduct.value
  if (!p) return 0
  return (p.valor_venda - p.preco_custo) * quantidade.value
})

watch(open, (isOpen) => {
  if (!isOpen) return
  if (props.sale) {
    data.value = props.sale.data
    quantidade.value = props.sale.quantidade
    produtoId.value = props.sale.produto_id
    clienteId.value = props.sale.cliente_id || 'none'
  } else {
    data.value = format(new Date(), 'yyyy-MM-dd')
    quantidade.value = 1
    produtoId.value = productOptions.value[0]?.id ?? ''
    clienteId.value = 'none'
  }
})

function onClientSaved(created: Client) {
  clienteId.value = created.id
}

async function submit() {
  if (!produtoId.value || quantidade.value < 1 || saving.value) return

  saving.value = true
  try {
    const input = {
      data: data.value,
      quantidade: quantidade.value,
      produto_id: produtoId.value,
      cliente_id: clienteId.value && clienteId.value !== 'none' ? clienteId.value : null,
    }
    if (props.sale) {
      await store.updateSale(props.sale.id, input)
    } else {
      await store.addSale(input)
    }
    open.value = false
  } finally {
    saving.value = false
  }
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
        Nova venda
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ isEdit() ? 'Editar venda' : 'Registrar venda' }}</DialogTitle>
        <DialogDescription>
          O preço de custo e venda são buscados automaticamente da tabela de produtos.
        </DialogDescription>
      </DialogHeader>

      <form class="grid gap-4 py-2" @submit.prevent="submit">
        <div class="grid gap-2">
          <Label for="data">Data</Label>
          <Input id="data" v-model="data" type="date" required :disabled="saving" />
        </div>

        <div class="grid gap-2">
          <div class="flex items-center justify-between">
            <Label>Cliente (opcional)</Label>
            <Button
              variant="link"
              type="button"
              size="sm"
              class="h-auto p-0 text-xs font-normal text-primary hover:underline"
              :disabled="saving"
              @click="showNewClientDialog = true"
            >
              <UserPlus class="mr-1 size-3" />
              Novo cliente
            </Button>
          </div>
          <Select v-model="clienteId" :disabled="saving">
            <SelectTrigger>
              <SelectValue placeholder="Selecione um cliente (opcional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <span class="text-muted-foreground">Venda avulsa (sem cliente)</span>
              </SelectItem>
              <SelectItem
                v-for="c in clientOptions"
                :key="c.id"
                :value="c.id"
              >
                {{ c.nome }} {{ c.apartamento }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="grid gap-2">
          <Label>Produto</Label>
          <Select v-model="produtoId" :disabled="saving">
            <SelectTrigger>
              <SelectValue placeholder="Selecione o produto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="p in productOptions"
                :key="p.id"
                :value="p.id"
              >
                {{ p.nome }} — {{ formatCurrency(p.valor_venda) }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="grid gap-2">
          <Label>Quantidade</Label>
          <Select
            :model-value="quantidade.toString()"
            :disabled="saving"
            @update:model-value="quantidade = Number($event)"
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a quantidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="n in 20"
                :key="n"
                :value="n.toString()"
              >
                {{ n }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div
          v-if="selectedProduct"
          class="rounded-lg border border-secondary bg-secondary/60 p-3 text-sm"
        >
          <p>
            <span class="text-muted-foreground">Venda unitária:</span>
            {{ formatCurrency(selectedProduct.valor_venda) }}
          </p>
          <p>
            <span class="text-muted-foreground">Custo unitário:</span>
            {{ formatCurrency(selectedProduct.preco_custo) }}
          </p>
          <p class="mt-1 font-medium text-emerald-700 dark:text-emerald-400">
            Lucro estimado: {{ formatCurrency(previewLucro) }}
          </p>
        </div>
      </form>

      <DialogFooter>
        <Button variant="outline" type="button" :disabled="saving" @click="open = false">
          Cancelar
        </Button>
        <Button
          type="button"
          :disabled="!produtoId || productOptions.length === 0 || saving"
          @click="submit"
        >
          <Loader2 v-if="saving" class="mr-2 size-4 animate-spin" />
          {{ saving ? 'Salvando...' : isEdit() ? 'Salvar alterações' : 'Salvar venda' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Modal rápido de criação de cliente -->
  <ClientFormDialog
    v-model:open="showNewClientDialog"
    hide-trigger
    @saved="onClientSaved"
  />
</template>

