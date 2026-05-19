<script setup lang="ts">
import ProductFormDialog from '@/components/products/ProductFormDialog.vue'
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
import { Trash2 } from '@lucide/vue'

const store = useBrigadeiroStore()
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">Produtos</h1>
        <p class="text-muted-foreground">
          Cadastre caixas com preço de venda e custo. Usados automaticamente nas vendas.
        </p>
      </div>
      <ProductFormDialog />
    </div>

    <div class="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow class="bg-secondary hover:bg-secondary">
            <TableHead class="text-secondary-foreground">Produto</TableHead>
            <TableHead class="text-right text-secondary-foreground">Valor de venda</TableHead>
            <TableHead class="text-right text-secondary-foreground">Preço de custo</TableHead>
            <TableHead class="text-right text-secondary-foreground">Margem</TableHead>
            <TableHead class="text-center text-secondary-foreground">Ativo</TableHead>
            <TableHead class="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="store.products.length === 0">
            <TableCell colspan="6" class="h-24 text-center text-muted-foreground">
              Nenhum produto cadastrado.
            </TableCell>
          </TableRow>
          <TableRow v-for="product in store.products" :key="product.id">
            <TableCell class="font-medium">{{ product.nome }}</TableCell>
            <TableCell class="text-right">{{ formatCurrency(product.valor_venda) }}</TableCell>
            <TableCell class="text-right text-muted-foreground">
              {{ formatCurrency(product.preco_custo) }}
            </TableCell>
            <TableCell class="text-right text-emerald-600 dark:text-emerald-400">
              {{ formatCurrency(product.valor_venda - product.preco_custo) }}
            </TableCell>
            <TableCell class="text-center">
              <span
                :class="product.ativo ? 'text-green-600 dark:text-green-400' : 'text-gray-400'"
              >
                {{ product.ativo ? '✓' : '✗' }}
              </span>
            </TableCell>
            <TableCell class="flex justify-end gap-1">
              <ProductFormDialog :product="product" />
              <Button
                variant="ghost"
                size="icon"
                class="text-destructive hover:text-destructive"
                @click="store.removeProduct(product.id)"
              >
                <Trash2 class="size-4" />
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
