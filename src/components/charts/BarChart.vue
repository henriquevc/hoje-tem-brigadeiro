<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface DatasetItem {
  label: string
  data: number[]
  backgroundColor?: string
}

const props = withDefaults(
  defineProps<{
    labels: string[]
    datasets: DatasetItem[]
    title?: string
    valueType?: 'currency' | 'number'
    stacked?: boolean
  }>(),
  {
    valueType: 'currency',
    stacked: false,
  },
)

const chartData = computed(() => ({
  labels: props.labels,
  datasets: props.datasets.map((ds) => ({
    ...ds,
    borderRadius: 6,
    borderSkipped: false,
  })),
}))

const options = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' as const },
    title: {
      display: Boolean(props.title),
      text: props.title,
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const label = context.dataset.label || ''
          const val = context.parsed.y ?? context.raw ?? 0
          if (props.valueType === 'number') {
            return ` ${label}: ${val} un`
          }
          return ` ${label}: ${new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(Number(val))}`
        },
      },
    },
  },
  scales: {
    x: {
      stacked: props.stacked,
      grid: { display: false },
    },
    y: {
      stacked: props.stacked,
      beginAtZero: true,
      ticks: {
        precision: props.valueType === 'number' ? 0 : undefined,
        callback: (value: string | number) => {
          if (props.valueType === 'number') {
            return `${value} un`
          }
          return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(Number(value))
        },
      },
    },
  },
}))
</script>

<template>
  <div class="h-64 w-full">
    <Bar :data="chartData" :options="options" />
  </div>
</template>

