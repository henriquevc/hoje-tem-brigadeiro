<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps<{
  labels: string[]
  data: number[]
  colors?: string[]
}>()

const palette = [
  'oklch(0.65 0.2 35)',
  'oklch(0.6 0.15 145)',
  'oklch(0.55 0.12 250)',
  'oklch(0.7 0.18 85)',
  'oklch(0.5 0.14 320)',
]

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      data: props.data,
      backgroundColor: props.colors ?? palette.slice(0, props.data.length),
      borderWidth: 0,
    },
  ],
}))

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'right' as const },
  },
}
</script>

<template>
  <div class="h-64 w-full">
    <Doughnut :data="chartData" :options="options" />
  </div>
</template>
