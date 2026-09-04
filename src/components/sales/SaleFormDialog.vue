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
import type { Client, Sale, SaleItemInput } from '@/types'
import { Loader2, Pencil, Plus, Trash2, UserPlus } from '@lucide/vue'

const props = defineProps<{
  sale?: Sale
}>()

const store = useBrigadeiroStore()
const open = ref(false)
const saving = ref(false)
const showNewClientDialog = ref(false)

const data = ref(format(new Date(), 'yyyy-MM-dd'))
const clienteId = ref('none')

const itens = ref<SaleItemInput[]>([])

const isEdit = () => Boolean(props.sale)

// Helper to keep track of products actually involved in this sale
// so they still appear in dropdowns even if they became inactive
const productOptions = computed(() => {
  const active = store.products.filter((p) => p.ativo)
  if (!props.sale || !props.sale.itens) return active

  const allOpts = [...active]
  for (const item of props.sale.itens) {
    if (!allOpts.some(p => p.id === item.produto_id)) {
      const p = store.products.find(x => x.id === item.produto_id)
      if (p) allOpts.push(p)
    }
  }
  return allOpts
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

function addItem() {
  const defaultProd = productOptions.value[0]?.id ?? ''
  itens.value.push({ produto_id: defaultProd, quantidade: 1 })
}

function removeItem(index: number) {
  itens.value.splice(index, 1)
}

// Totals calculation for the summary
const totalQuantidade = computed(() => itens.value.reduce((sum, it) => sum + (it.quantidade || 0), 0))
const totalVenda = computed(() => {
  return itens.value.reduce((sum, it) => {
    const p = store.products.find(x => x.id === it.produto_id)
    return sum + (p ? p.valor_venda * (it.quantidade || 0) : 0)
  }, 0)
})
const totalCusto = computed(() => {
  return itens.value.reduce((sum, it) => {
    const p = store.products.find(x => x.id === it.produto_id)
    return sum + (p ? p.preco_custo * (it.quantidade || 0) : 0)
  }, 0)
})
const totalLucro = computed(() => totalVenda.value - totalCusto.value)

const isValid = computed(() => {
  if (itens.value.length === 0) return false
  return itens.value.every(it => it.produto_id && it.quantidade >= 1)
})

watch(open, (isOpen) => {
  if (!isOpen) return
  if (props.sale) {
    data.value = props.sale.data
    clienteId.value = props.sale.cliente_id || 'none'
    if (props.sale.itens && props.sale.itens.length > 0) {
      itens.value = props.sale.itens.map(it => ({ produto_id: it.produto_id, quantidade: it.quantidade }))
    } else if (props.sale.produto_id) {
      itens.value = [{ produto_id: props.sale.produto_id, quantidade: props.sale.quantidade }]
    } else {
      itens.value = []
    }
  } else {
    data.value = format(new Date(), 'yyyy-MM-dd')
    clienteId.value = 'none'
    itens.value = []
    addItem()
  }
})

function onClientSaved(created: Client) {
  clienteId.value = created.id
}

async function submit() {
  if (!isValid.value || saving.value) return

  saving.value = true
  try {
    const input = {
      data: data.value,
      cliente_id: clienteId.value && clienteId.value !== 'none' ? clienteId.value : null,
      itens: itens.value.map(it => ({ ...it })) // ensure fresh copies
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
    <DialogContent class="sm:max-w-xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{{ isEdit() ? 'Editar venda' : 'Registrar venda' }}</DialogTitle>
        <DialogDescription>
          Adicione um ou mais produtos a esta venda.
        </DialogDescription>
      </DialogHeader>

      <form class="grid gap-5 py-2" @submit.prevent="submit">
        <div class="grid gap-4 sm:grid-cols-2">
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
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <span class="text-muted-foreground">Venda avulsa</span>
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
        </div>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <Label class="text-base font-semibold">Itens da Venda</Label>
          </div>

          <div class="space-y-3">
            <div
              v-for="(item, index) in itens"
              :key="index"
              class="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-2 p-3 rounded-md border bg-secondary/20"
            >
              <div class="grid gap-2 w-full sm:flex-1">
                <Label class="text-xs text-muted-foreground">Produto</Label>
                <Select v-model="item.produto_id" :disabled="saving">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
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

              <div class="flex items-end gap-2 w-full sm:w-auto">
                <div class="grid gap-2 flex-1 sm:w-24">
                  <Label class="text-xs text-muted-foreground">Qtd</Label>
                  <Input 
                    v-model.number="item.quantidade" 
                    type="number" 
                    min="1" 
                    required 
                    :disabled="saving"
                    class="text-center"
                  />
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  class="text-destructive hover:bg-destructive/10 shrink-0"
                  :disabled="itens.length <= 1 || saving"
                  @click="removeItem(index)"
                >
                  <Trash2 class="size-4" />
                </Button>
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            class="w-full border-dashed"
            :disabled="saving"
            @click="addItem"
          >
            <Plus class="mr-2 size-4" />
            Adicionar outro produto
          </Button>
        </div>

        <div class="rounded-lg border bg-muted/40 p-4 space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Total de itens:</span>
            <span class="font-medium">{{ totalQuantidade }} unidades</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Custo total:</span>
            <span class="font-medium">{{ formatCurrency(totalCusto) }}</span>
          </div>
          <div class="flex justify-between text-base font-semibold pt-2 border-t mt-2">
            <span>Total da Venda:</span>
            <span>{{ formatCurrency(totalVenda) }}</span>
          </div>
          <div class="flex justify-between text-sm font-medium text-emerald-600 dark:text-emerald-400">
            <span>Lucro estimado:</span>
            <span>{{ formatCurrency(totalLucro) }}</span>
          </div>
        </div>
      </form>

      <DialogFooter>
        <Button variant="outline" type="button" :disabled="saving" @click="open = false">
          Cancelar
        </Button>
        <Button
          type="button"
          :disabled="!isValid || saving"
          @click="submit"
        >
          <Loader2 v-if="saving" class="mr-2 size-4 animate-spin" />
          {{ saving ? 'Salvando...' : isEdit() ? 'Salvar alterações' : 'Salvar venda' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <ClientFormDialog
    v-model:open="showNewClientDialog"
    hide-trigger
    @saved="onClientSaved"
  />
</template>
