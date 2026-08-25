<script setup lang="ts">
import { toRef } from 'vue'
import { Calendar, Package, TrendingUp, Wallet } from '@lucide/vue'
import BarChart from '@/components/charts/BarChart.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useDashboard } from '@/composables/useDashboard'
import { formatCurrency } from '@/lib/utils'
import { useBrigadeiroStore } from '@/stores/brigadeiro'

const store = useBrigadeiroStore()
const { stats, productsByDayOfWeek } = useDashboard(toRef(store, 'sales'))
</script>

<template>
  <section class="space-y-6">
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <StatCard
        title="Vendas hoje"
        :value="formatCurrency(stats.lucroHoje)"
        :subtitle="`Total vendas: ${formatCurrency(stats.receitaHoje)}`"
        :icon="Calendar"
        accent="profit"
      />
      <StatCard
        title="Mês atual"
        :value="`${formatCurrency(stats.lucroMes)}`"
        :subtitle="`Total vendas: ${formatCurrency(stats.receitaMes)}`"
        :icon="TrendingUp"
        accent="profit"
      />
      <StatCard
        title="Desde o início"
        :value="formatCurrency(stats.lucroTotal)"
        :subtitle="`Total vendas: ${formatCurrency(stats.receitaTotal)}`"
        :icon="Wallet"
        accent="profit"
      />
    </div>

    <div class="grid gap-4 lg:grid-cols-1">
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-lg">
            <Package class="size-5 text-primary" />
            Mais vendidos por dia da semana
          </CardTitle>
          <CardDescription>Quantidade acumulada nos últimos 30 dias (Seg a Dom)</CardDescription>
        </CardHeader>
        <CardContent>
          <BarChart
            v-if="productsByDayOfWeek.hasSales"
            :labels="productsByDayOfWeek.labels"
            :datasets="productsByDayOfWeek.datasets"
            value-type="number"
            :stacked="true"
          />
          <p v-else class="py-12 text-center text-sm text-muted-foreground">
            Sem vendas registradas nos últimos 30 dias.
          </p>
        </CardContent>
      </Card>
    </div>
  </section>
</template>
