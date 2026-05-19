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
  'oklch(0.45 0.09 52)',
  'oklch(0.78 0.09 355)',
  'oklch(0.58 0.08 52)',
  'oklch(0.88 0.06 355)',
  'oklch(0.65 0.07 40)',
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
