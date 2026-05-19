<script setup lang="ts">
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Trash2 } from '@lucide/vue'
import { Button } from '@/components/ui/button'
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

function formatDate(iso: string) {
  return format(parseISO(iso), 'dd/MM/yyyy', { locale: ptBR })
}
</script>

<template>
  <Table>
    <TableHeader>
      <TableRow class="bg-orange-500/90 hover:bg-orange-500/90">
        <TableHead class="text-white">Data</TableHead>
        <TableHead class="text-white">Qtde</TableHead>
        <TableHead class="text-white">Produto</TableHead>
        <TableHead class="text-right text-white">Valor venda</TableHead>
        <TableHead class="text-right text-white">Preço custo</TableHead>
        <TableHead class="text-right text-white">Lucro</TableHead>
        <TableHead class="w-12" />
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
          <Button
            variant="ghost"
            size="icon"
            class="text-destructive hover:text-destructive"
            @click="store.removeSale(sale.id)"
          >
            <Trash2 class="size-4" />
          </Button>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
