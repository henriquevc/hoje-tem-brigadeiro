export interface Client {
  id: string
  nome: string
  apartamento: string
  ativo: boolean
  created_at: string
}

export interface ClientInput {
  nome: string
  apartamento: string
  ativo?: boolean
}

export interface Product {
  id: string
  nome: string
  valor_venda: number
  preco_custo: number
  ativo: boolean
  created_at: string
}

export interface SaleItem {
  produto_id: string
  produto_nome: string
  quantidade: number
  valor_venda: number // unit price
  preco_custo: number // unit cost
  subtotal: number // valor_venda * quantidade
  lucro: number // (valor_venda - preco_custo) * quantidade
}

export interface Sale {
  id: string
  data: string
  quantidade: number
  produto_id?: string | null
  produto_nome?: string | null
  cliente_id?: string | null
  cliente_nome?: string | null
  valor_venda: number
  preco_custo: number
  lucro: number
  itens?: SaleItem[]
  created_at: string
}

export interface SaleItemInput {
  produto_id: string
  quantidade: number
}

export interface SaleInput {
  data: string
  cliente_id?: string | null
  itens: SaleItemInput[]
  // Legacy support for single-item passing in some places
  produto_id?: string
  quantidade?: number
}

export interface ProductInput {
  nome: string
  valor_venda: number
  preco_custo: number
  ativo?: boolean
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
