import { computed, type Ref } from 'vue'
import {
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { DashboardStats, Sale, TopProduct } from '@/types'

function saleDate(sale: Sale): Date {
  return parseISO(sale.data)
}

function receita(sale: Sale): number {
  return sale.valor_venda * sale.quantidade
}

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
      const existing = map.get(sale.produto_id)
      const r = receita(sale)
      if (existing) {
        existing.quantidade += sale.quantidade
        existing.receita += r
      } else {
        map.set(sale.produto_id, {
          produto_id: sale.produto_id,
          produto_nome: sale.produto_nome,
          quantidade: sale.quantidade,
          receita: r,
        })
      }
    }

    return [...map.values()].sort((a, b) => b.quantidade - a.quantidade).slice(0, 5)
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

  return { stats, topProducts, salesByDayInMonth }
}
