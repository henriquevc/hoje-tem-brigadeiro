import { computed, type Ref } from 'vue'
import {
  endOfDay,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfDay,
  startOfMonth,
  subDays,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { DashboardStats, Sale, TopProduct } from '@/types'

function saleDate(sale: Sale): Date {
  return parseISO(sale.data)
}

function receita(sale: Sale): number {
  return sale.valor_venda
}

const DAYS_OF_WEEK = [
  { dayIndex: 1, label: 'Segunda' },
  { dayIndex: 2, label: 'Terça' },
  { dayIndex: 3, label: 'Quarta' },
  { dayIndex: 4, label: 'Quinta' },
  { dayIndex: 5, label: 'Sexta' },
  { dayIndex: 6, label: 'Sábado' },
  { dayIndex: 0, label: 'Domingo' },
]

const PALETTE = [
  'oklch(0.50 0.12 52)',
  'oklch(0.75 0.14 355)',
  'oklch(0.68 0.15 75)',
  'oklch(0.62 0.14 150)',
  'oklch(0.58 0.16 280)',
  'oklch(0.65 0.18 30)',
  'oklch(0.55 0.15 200)',
]

export function useDashboard(sales: Ref<Sale[]>) {
  const today = computed(() => new Date())

  const stats = computed<DashboardStats>(() => {
    const now = today.value
    let vendasHoje = 0
    let receitaHoje = 0
    let lucroHoje = 0
    let vendasMes = 0
    let receitaMes = 0
    let lucroMes = 0
    let vendasTotal = 0
    let receitaTotal = 0
    let lucroTotal = 0

    for (const sale of sales.value) {
      const d = saleDate(sale)
      const r = receita(sale)
      vendasTotal += sale.quantidade
      receitaTotal += r
      lucroTotal += sale.lucro

      if (isSameMonth(d, now)) {
        vendasMes += sale.quantidade
        receitaMes += r
        lucroMes += sale.lucro
      }

      if (isSameDay(d, now)) {
        vendasHoje += sale.quantidade
        receitaHoje += r
        lucroHoje += sale.lucro
      }
    }

    return {
      vendasHoje,
      receitaHoje,
      lucroHoje,
      vendasMes,
      receitaMes,
      lucroMes,
      vendasTotal,
      receitaTotal,
      lucroTotal,
    }
  })

  const topProducts = computed<TopProduct[]>(() => {
    const map = new Map<string, TopProduct>()

    for (const sale of sales.value) {
      if (!sale.itens) continue
      for (const item of sale.itens) {
        const existing = map.get(item.produto_id)
        if (existing) {
          existing.quantidade += item.quantidade
          existing.receita += item.subtotal
        } else {
          map.set(item.produto_id, {
            produto_id: item.produto_id,
            produto_nome: item.produto_nome,
            quantidade: item.quantidade,
            receita: item.subtotal,
          })
        }
      }
    }

    return [...map.values()].sort((a, b) => b.quantidade - a.quantidade).slice(0, 5)
  })

  const productsByDayOfWeek = computed(() => {
    const labels = DAYS_OF_WEEK.map((d) => d.label)
    const now = today.value
    const cutoffDate = startOfDay(subDays(now, 30))
    const endToday = endOfDay(now)

    // Filtra somente as vendas ocorridas nos últimos 30 dias
    const salesInPeriod = sales.value.filter((sale) => {
      const d = saleDate(sale)
      return d >= cutoffDate && d <= endToday
    })

    // Agrupa o total do período por produto para ordenar os mais vendidos
    const productMap = new Map<string, { id: string; nome: string; total: number }>()

    for (const sale of salesInPeriod) {
      if (!sale.itens) continue
      for (const item of sale.itens) {
        const existing = productMap.get(item.produto_id) || {
          id: item.produto_id,
          nome: item.produto_nome,
          total: 0,
        }
        existing.total += item.quantidade
        productMap.set(item.produto_id, existing)
      }
    }
    const topList = [...productMap.values()]
      .sort((a, b) => b.total - a.total)
      .slice(0, 7)

    const datasets = topList.map((prod, index) => {
      const data = DAYS_OF_WEEK.map(({ dayIndex }) => {
        let sum = 0
        for (const sale of salesInPeriod) {
          if (!sale.itens) continue
          const d = saleDate(sale)
          if (getDay(d) === dayIndex) {
            for (const item of sale.itens) {
              if (item.produto_id === prod.id) {
                sum += item.quantidade
              }
            }
          }
        }
        return sum
      })

      return {
        label: prod.nome,
        data,
        backgroundColor: PALETTE[index % PALETTE.length],
      }
    })

    const hasSales = salesInPeriod.length > 0 && datasets.some((ds) => ds.data.some((qty) => qty > 0))

    return {
      labels,
      datasets,
      hasSales,
    }
  })


  const salesByDayInMonth = computed(() => {
    const now = today.value
    const start = startOfMonth(now)
    const end = endOfMonth(now)
    const days: { label: string; receita: number; lucro: number }[] = []

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const day = new Date(d)
      let receitaDia = 0
      let lucroDia = 0

      for (const sale of sales.value) {
        if (isSameDay(saleDate(sale), day)) {
          receitaDia += receita(sale)
          lucroDia += sale.lucro
        }
      }

      days.push({
        label: format(day, 'dd/MM', { locale: ptBR }),
        receita: receitaDia,
        lucro: lucroDia,
      })
    }

    return days
  })

  return { stats, topProducts, productsByDayOfWeek, salesByDayInMonth }
}

