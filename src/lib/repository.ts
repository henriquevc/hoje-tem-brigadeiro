import { db } from '@/lib/db'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Product, ProductInput, Sale, SaleInput } from '@/types'

function newId(): string {
  return crypto.randomUUID()
}

function calcLucro(quantidade: number, valorVenda: number, precoCusto: number): number {
  return (valorVenda - precoCusto) * quantidade
}

const SEED_PRODUCTS: ProductInput[] = [
  { nome: 'Caixa simples (4un)', valor_venda: 12, preco_custo: 4.4 },
  { nome: 'Caixa dupla (8un)', valor_venda: 22, preco_custo: 8.8 },
  { nome: 'Caixa especial', valor_venda: 14, preco_custo: 6 },
  { nome: 'Caixa uva', valor_venda: 16, preco_custo: 4.4 },
]

async function seedIfEmpty(): Promise<void> {
  const count = await repository.listProducts()
  if (count.length === 0) {
    for (const p of SEED_PRODUCTS) {
      await repository.createProduct(p)
    }
  }
}

async function listProductsDexie(): Promise<Product[]> {
  return db.products.orderBy('nome').toArray()
}

async function listProductsSupabase(): Promise<Product[]> {
  const { data, error } = await supabase!.from('products').select('*').order('nome')
  if (error) throw error
  return data as Product[]
}

async function createProductDexie(input: ProductInput): Promise<Product> {
  const product: Product = {
    id: newId(),
    ...input,
    created_at: new Date().toISOString(),
  }
  await db.products.add(product)
  return product
}

async function createProductSupabase(input: ProductInput): Promise<Product> {
  const { data, error } = await supabase!
    .from('products')
    .insert(input)
    .select()
    .single()
  if (error) throw error
  return data as Product
}

async function updateProductDexie(id: string, input: ProductInput): Promise<Product> {
  const existing = await db.products.get(id)
  if (!existing) throw new Error('Produto não encontrado')
  const updated: Product = { ...existing, ...input }
  await db.products.put(updated)
  return updated
}

async function updateProductSupabase(id: string, input: ProductInput): Promise<Product> {
  const { data, error } = await supabase!
    .from('products')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Product
}

async function deleteProductDexie(id: string): Promise<void> {
  await db.products.delete(id)
}

async function deleteProductSupabase(id: string): Promise<void> {
  const { error } = await supabase!.from('products').delete().eq('id', id)
  if (error) throw error
}

async function getProductDexie(id: string): Promise<Product | undefined> {
  return db.products.get(id)
}

async function getProductSupabase(id: string): Promise<Product | undefined> {
  const { data, error } = await supabase!.from('products').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return (data as Product) ?? undefined
}

async function listSalesDexie(): Promise<Sale[]> {
  return db.sales.orderBy('data').reverse().toArray()
}

async function listSalesSupabase(): Promise<Sale[]> {
  const { data, error } = await supabase!.from('sales').select('*').order('data', { ascending: false })
  if (error) throw error
  return data as Sale[]
}

async function createSaleDexie(input: SaleInput): Promise<Sale> {
  const product = await getProductDexie(input.produto_id)
  if (!product) throw new Error('Produto não encontrado')

  const sale: Sale = {
    id: newId(),
    data: input.data,
    quantidade: input.quantidade,
    produto_id: product.id,
    produto_nome: product.nome,
    valor_venda: product.valor_venda,
    preco_custo: product.preco_custo,
    lucro: calcLucro(input.quantidade, product.valor_venda, product.preco_custo),
    created_at: new Date().toISOString(),
  }
  await db.sales.add(sale)
  return sale
}

async function createSaleSupabase(input: SaleInput): Promise<Sale> {
  const product = await getProductSupabase(input.produto_id)
  if (!product) throw new Error('Produto não encontrado')

  const row = {
    data: input.data,
    quantidade: input.quantidade,
    produto_id: product.id,
    produto_nome: product.nome,
    valor_venda: product.valor_venda,
    preco_custo: product.preco_custo,
    lucro: calcLucro(input.quantidade, product.valor_venda, product.preco_custo),
  }

  const { data, error } = await supabase!.from('sales').insert(row).select().single()
  if (error) throw error
  return data as Sale
}

async function deleteSaleDexie(id: string): Promise<void> {
  await db.sales.delete(id)
}

async function deleteSaleSupabase(id: string): Promise<void> {
  const { error } = await supabase!.from('sales').delete().eq('id', id)
  if (error) throw error
}

export const repository = {
  async init(): Promise<void> {
    await seedIfEmpty()
  },

  listProducts(): Promise<Product[]> {
    return isSupabaseConfigured ? listProductsSupabase() : listProductsDexie()
  },

  getProduct(id: string): Promise<Product | undefined> {
    return isSupabaseConfigured ? getProductSupabase(id) : getProductDexie(id)
  },

  createProduct(input: ProductInput): Promise<Product> {
    return isSupabaseConfigured ? createProductSupabase(input) : createProductDexie(input)
  },

  updateProduct(id: string, input: ProductInput): Promise<Product> {
    return isSupabaseConfigured ? updateProductSupabase(id, input) : updateProductDexie(id, input)
  },

  deleteProduct(id: string): Promise<void> {
    return isSupabaseConfigured ? deleteProductSupabase(id) : deleteProductDexie(id)
  },

  listSales(): Promise<Sale[]> {
    return isSupabaseConfigured ? listSalesSupabase() : listSalesDexie()
  },

  createSale(input: SaleInput): Promise<Sale> {
    return isSupabaseConfigured ? createSaleSupabase(input) : createSaleDexie(input)
  },

  deleteSale(id: string): Promise<void> {
    return isSupabaseConfigured ? deleteSaleSupabase(id) : deleteSaleDexie(id)
  },
}
