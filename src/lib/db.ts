import Dexie, { type Table } from 'dexie'
import type { Product, Sale } from '@/types'

export class BrigadeiroDB extends Dexie {
  products!: Table<Product, string>
  sales!: Table<Sale, string>

  constructor() {
    super('BrigadeiroVendasDB')
    this.version(2).stores({
      products: 'id, nome, created_at',
      sales: 'id, data, produto_id, created_at',
    })
  }
}

export const db = new BrigadeiroDB()
