<script setup lang="ts">
import DashboardPanel from '@/components/dashboard/DashboardPanel.vue'
import SaleFormDialog from '@/components/sales/SaleFormDialog.vue'
import SalesTable from '@/components/sales/SalesTable.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useBrigadeiroStore } from '@/stores/brigadeiro'

const store = useBrigadeiroStore()
</script>

<template>
  <div class="space-y-8">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">Painel de vendas</h1>
        <p class="text-muted-foreground">
          Relatórios rápidos e listagem de vendas ordenada por data.
        </p>
      </div>
      <SaleFormDialog />
    </div>

    <DashboardPanel />

    <Card>
      <CardHeader>
        <CardTitle class="text-lg">Vendas</CardTitle>
        <CardDescription>Registro ordenado da mais recente para a mais antiga</CardDescription>
      </CardHeader>
      <CardContent class="overflow-x-auto p-0 sm:p-6 sm:pt-0">
        <SalesTable :sales="store.sales" />
      </CardContent>
    </Card>
  </div>
</template>
