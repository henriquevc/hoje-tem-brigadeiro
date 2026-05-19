<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { format } from 'date-fns'
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
import { Plus } from '@lucide/vue'

const store = useBrigadeiroStore()
const open = ref(false)
const data = ref(format(new Date(), 'yyyy-MM-dd'))
const quantidade = ref(1)
const produtoId = ref('')

const selectedProduct = computed(() =>
  store.products.find((p) => p.id === produtoId.value),
)

const previewLucro = computed(() => {
  const p = selectedProduct.value
  if (!p) return 0
  return (p.valor_venda - p.preco_custo) * quantidade.value
})

watch(open, (isOpen) => {
  if (isOpen) {
    data.value = format(new Date(), 'yyyy-MM-dd')
    quantidade.value = 1
    const activeProducts = store.products.filter(p => p.ativo)
    produtoId.value = activeProducts[0]?.id ?? ''
  }
})

async function submit() {
  if (!produtoId.value || quantidade.value < 1) return
  await store.addSale({
    data: data.value,
    quantidade: quantidade.value,
    produto_id: produtoId.value,
  })
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <Button>
        <Plus class="mr-2 size-4" />
        Nova venda
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Registrar venda</DialogTitle>
        <DialogDescription>
          O preço de custo e venda são buscados automaticamente da tabela de produtos.
        </DialogDescription>
      </DialogHeader>

      <form class="grid gap-4 py-2" @submit.prevent="submit">
        <div class="grid gap-2">
          <Label for="data">Data</Label>
          <Input id="data" v-model="data" type="date" required />
        </div>

        <div class="grid gap-2">
          <Label>Produto</Label>
          <Select v-model="produtoId">
            <SelectTrigger>
              <SelectValue placeholder="Selecione o produto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="p in store.products.filter(p => p.ativo)"
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
            @update:model-value="quantidade = Number($event)"
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a quantidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="n in 5"
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
        <Button variant="outline" type="button" @click="open = false">Cancelar</Button>
        <Button
          type="button"
          :disabled="!produtoId || store.products.filter(p => p.ativo).length === 0"
          @click="submit"
        >
          Salvar venda
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
