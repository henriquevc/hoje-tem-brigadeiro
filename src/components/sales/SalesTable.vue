<script setup lang="ts">
import { ref } from 'vue'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Loader2, Trash2 } from '@lucide/vue'
import SaleFormDialog from '@/components/sales/SaleFormDialog.vue'
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
        <TableHead class="text-primary-foreground">Data</TableHead>
        <TableHead class="text-primary-foreground">Qtde</TableHead>
        <TableHead class="text-primary-foreground">Produto</TableHead>
        <TableHead class="text-right text-primary-foreground">Valor venda</TableHead>
        <TableHead class="text-right text-primary-foreground">Preço custo</TableHead>
        <TableHead class="text-right text-primary-foreground">Lucro</TableHead>
        <TableHead class="w-24" />
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-if="sales.length === 0">
        <TableCell colspan="7" class="h-24 text-center text-muted-foreground">
          Nenhuma venda registrada. Clique em "Nova venda" para começar.
        </TableCell>
      </TableRow>
      <TableRow v-for="sale in sales" :key="sale.id">
        <TableCell>{{ formatDate(sale.data) }}</TableCell>
        <TableCell>{{ sale.quantidade }}</TableCell>
        <TableCell class="font-medium">{{ sale.produto_nome }}</TableCell>
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
              class="text-destructive hover:text-destructive"
              @click="saleToDelete = sale"
            >
              <Trash2 class="size-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>

  <Dialog :open="saleToDelete !== null" @update:open="(open) => !open && !deleting && (saleToDelete = null)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Excluir venda?</DialogTitle>
        <DialogDescription>
          <template v-if="saleToDelete">
            Tem certeza que deseja excluir a venda de
            <strong>{{ saleToDelete.quantidade }}× {{ saleToDelete.produto_nome }}</strong>
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
