export interface Product {
  id: string
  nome: string
  valor_venda: number
  preco_custo: number
  created_at: string
}

export interface Sale {
  id: string
  data: string
  quantidade: number
  produto_id: string
  produto_nome: string
  valor_venda: number
  preco_custo: number
  lucro: number
  created_at: string
}

export interface SaleInput {
  data: string
  quantidade: number
  produto_id: string
}

export interface ProductInput {
  nome: string
  valor_venda: number
  preco_custo: number
}

export interface DashboardStats {
  vendasHoje: number
  receitaHoje: number
  lucroHoje: number
  vendasMes: number
  receitaMes: number
  lucroMes: number
  vendasTotal: number
  receitaTotal: number
  lucroTotal: number
}

export interface TopProduct {
  produto_id: string
  produto_nome: string
  quantidade: number
  receita: number
}
