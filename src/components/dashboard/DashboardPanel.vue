<script setup lang="ts">
import { computed, toRef } from 'vue'
import { Calendar, Package, TrendingUp, Wallet } from '@lucide/vue'
import CupcakeIcon from '@/components/icons/CupcakeIcon.vue'
import BarChart from '@/components/charts/BarChart.vue'
import DoughnutChart from '@/components/charts/DoughnutChart.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useDashboard } from '@/composables/useDashboard'
import { formatCurrency } from '@/lib/utils'
import { useBrigadeiroStore } from '@/stores/brigadeiro'

const store = useBrigadeiroStore()
const { stats, topProducts, salesByDayInMonth } = useDashboard(toRef(store, 'sales'))

const monthChart = computed(() => ({
  labels: salesByDayInMonth.value.map((d) => d.label),
  datasets: [
    {
      label: 'Receita',
      data: salesByDayInMonth.value.map((d) => d.receita),
      backgroundColor: 'oklch(0.45 0.09 52 / 0.88)',
    },
    {
      label: 'Lucro',
      data: salesByDayInMonth.value.map((d) => d.lucro),
      backgroundColor: 'oklch(0.78 0.09 355 / 0.88)',
    },
  ],
}))

const topChart = computed(() => ({
  labels: topProducts.value.map((p) => p.produto_nome),
  data: topProducts.value.map((p) => p.quantidade),
}))
</script>

<template>
  <section class="space-y-6">
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Vendas hoje"
        :value="String(stats.vendasHoje)"
        :subtitle="`${formatCurrency(stats.receitaHoje)} · lucro ${formatCurrency(stats.lucroHoje)}`"
        :icon="Calendar"
        accent="revenue"
      />
      <StatCard
        title="Vendas no mês"
        :value="String(stats.vendasMes)"
        :subtitle="`${formatCurrency(stats.receitaMes)} · lucro ${formatCurrency(stats.lucroMes)}`"
        :icon="TrendingUp"
        accent="profit"
      />
      <StatCard
        title="Total geral"
        :value="String(stats.vendasTotal)"
        :subtitle="`${formatCurrency(stats.receitaTotal)} desde o início`"
        :icon="Package"
      />
      <StatCard
        title="Lucro total"
        :value="formatCurrency(stats.lucroTotal)"
        subtitle="Soma de todas as vendas"
        :icon="Wallet"
        accent="profit"
      />
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-lg">
            <TrendingUp class="size-5 text-primary" />
            Receita e lucro no mês
          </CardTitle>
          <CardDescription>Totalizador mensal por dia</CardDescription>
        </CardHeader>
        <CardContent>
          <BarChart
            v-if="monthChart.labels.length"
            :labels="monthChart.labels"
            :datasets="monthChart.datasets"
          />
          <p v-else class="py-12 text-center text-sm text-muted-foreground">
            Sem vendas neste mês ainda.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-lg">
            <CupcakeIcon class="size-5 text-primary" />
            Mais vendidos
          </CardTitle>
          <CardDescription>Ranking por quantidade</CardDescription>
        </CardHeader>
        <CardContent>
          <DoughnutChart
            v-if="topChart.data.length"
            :labels="topChart.labels"
            :data="topChart.data"
          />
          <p v-else class="py-12 text-center text-sm text-muted-foreground">
            Cadastre vendas para ver o ranking.
          </p>
        </CardContent>
      </Card>
    </div>
  </section>
</template>
