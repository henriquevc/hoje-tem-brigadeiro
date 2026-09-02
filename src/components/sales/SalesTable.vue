<script setup lang="ts">
import { ref } from 'vue'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronDown, ChevronRight, Loader2, Trash2 } from '@lucide/vue'
import SaleFormDialog from '@/components/sales/SaleFormDialog.vue'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'
import { useBrigadeiroStore } from '@/stores/brigadeiro'
import type { Sale } from '@/types'

defineProps<{
  sales: Sale[]
}>()

const store = useBrigadeiroStore()
const saleToDelete = ref<Sale | null>(null)
const deleting = ref(false)

const expandedRows = ref<Set<string>>(new Set())

function toggleExpand(id: string) {
  const newSet = new Set(expandedRows.value)
  if (newSet.has(id)) {
    newSet.delete(id)
  } else {
    newSet.add(id)
  }
  expandedRows.value = newSet
}

function formatDate(iso: string) {
  return format(parseISO(iso), 'dd/MM/yyyy', { locale: ptBR })
}

async function confirmDelete() {
  if (!saleToDelete.value || deleting.value) return

  deleting.value = true
  try {
    await store.removeSale(saleToDelete.value.id)
    saleToDelete.value = null
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <Table>
    <TableHeader>
      <TableRow class="bg-primary hover:bg-primary">
        <TableHead class="w-8"></TableHead>
        <TableHead class="text-primary-foreground">Data</TableHead>
        <TableHead class="text-primary-foreground">Qtde</TableHead>
        <TableHead class="text-primary-foreground">Produto(s)</TableHead>
        <TableHead class="text-primary-foreground">Cliente</TableHead>
        <TableHead class="text-right text-primary-foreground">Total Venda</TableHead>
        <TableHead class="text-right text-primary-foreground">Custo Total</TableHead>
        <TableHead class="text-right text-primary-foreground">Lucro</TableHead>
        <TableHead class="w-24" />
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-if="sales.length === 0">
        <TableCell colspan="9" class="h-24 text-center text-muted-foreground">
          Nenhuma venda registrada. Clique em "Nova venda" para começar.
        </TableCell>
      </TableRow>
      <template v-for="sale in sales" :key="sale.id">
        <TableRow :class="expandedRows.has(sale.id) ? 'border-b-0' : ''">
          <TableCell class="p-2">
            <Button
              v-if="sale.itens && sale.itens.length > 1"
              variant="ghost"
              size="icon"
              class="h-6 w-6"
              @click="toggleExpand(sale.id)"
            >
              <ChevronDown v-if="expandedRows.has(sale.id)" class="size-4" />
              <ChevronRight v-else class="size-4" />
            </Button>
          </TableCell>
          <TableCell>{{ formatDate(sale.data) }}</TableCell>
          <TableCell>
            <Badge v-if="sale.itens && sale.itens.length > 1" variant="secondary" class="mr-1">
              {{ sale.itens.length }} prods
            </Badge>
            {{ sale.quantidade }} un.
          </TableCell>
          <TableCell class="font-medium max-w-[200px] truncate" :title="sale.produto_nome || ''">
            {{ sale.produto_nome }}
          </TableCell>
          <TableCell>
            <span :class="sale.cliente_nome ? 'font-medium text-foreground' : 'text-muted-foreground'">
              {{ sale.cliente_nome || '—' }}
            </span>
          </TableCell>
          <TableCell class="text-right">{{ formatCurrency(sale.valor_venda) }}</TableCell>
          <TableCell class="text-right text-muted-foreground">
            {{ formatCurrency(sale.preco_custo) }}
          </TableCell>
          <TableCell class="text-right font-medium text-emerald-600 dark:text-emerald-400">
            {{ formatCurrency(sale.lucro) }}
          </TableCell>
          <TableCell>
            <div class="flex justify-end gap-1">
              <SaleFormDialog :sale="sale" />
              <Button
                variant="ghost"
                size="icon"
                class="text-destructive hover:bg-destructive/10"
                @click="saleToDelete = sale"
              >
                <Trash2 class="size-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
        
        <!-- Expanded details row -->
        <TableRow v-if="expandedRows.has(sale.id)" class="bg-muted/30">
          <TableCell></TableCell>
          <TableCell colspan="8" class="p-0">
            <div class="px-4 py-3 text-sm">
              <p class="font-semibold mb-2 text-muted-foreground">Detalhes dos itens:</p>
              <ul class="space-y-1">
                <li v-for="(it, idx) in sale.itens" :key="idx" class="flex items-center gap-4 border-b border-border/50 pb-1 last:border-0 last:pb-0">
                  <span class="w-8 text-right font-medium">{{ it.quantidade }}x</span>
                  <span class="flex-1">{{ it.produto_nome }}</span>
                  <span class="w-32 text-right text-muted-foreground">Unidade: {{ formatCurrency(it.valor_venda) }}</span>
                  <span class="w-24 text-right font-medium">{{ formatCurrency(it.subtotal || (it.valor_venda * it.quantidade)) }}</span>
                </li>
              </ul>
            </div>
          </TableCell>
        </TableRow>
      </template>
    </TableBody>
  </Table>

  <Dialog :open="saleToDelete !== null" @update:open="(open) => !open && !deleting && (saleToDelete = null)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Excluir venda?</DialogTitle>
        <DialogDescription>
          <template v-if="saleToDelete">
            Tem certeza que deseja excluir esta venda de
            <strong>{{ saleToDelete.quantidade }} itens</strong>
            ({{ saleToDelete.produto_nome }})
            em {{ formatDate(saleToDelete.data) }}? Esta ação não pode ser desfeita.
          </template>
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" :disabled="deleting" @click="saleToDelete = null">
          Cancelar
        </Button>
        <Button variant="destructive" :disabled="deleting" @click="confirmDelete">
          <Loader2 v-if="deleting" class="mr-2 size-4 animate-spin" />
          {{ deleting ? 'Excluindo...' : 'Excluir' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
