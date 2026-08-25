import Dexie, { type Table } from 'dexie'
import type { Client, Product, Sale } from '@/types'

export class BrigadeiroDB extends Dexie {
  products!: Table<Product, string>
  sales!: Table<Sale, string>
  clients!: Table<Client, string>

  constructor() {
    super('BrigadeiroVendasDB')
    this.version(2).stores({
      products: 'id, nome, created_at',
      sales: 'id, data, produto_id, created_at',
    })
    this.version(3).stores({
      products: 'id, nome, created_at',
      sales: 'id, data, produto_id, cliente_id, created_at',
      clients: 'id, nome, apartamento, ativo, created_at',
    })
  }
}

export const db = new BrigadeiroDB()
