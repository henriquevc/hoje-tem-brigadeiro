import { defineStore } from 'pinia'
import { ref } from 'vue'
import { repository } from '@/lib/repository'
import { isSupabaseConfigured } from '@/lib/supabase'
import type { Client, ClientInput, Product, ProductInput, Sale, SaleInput } from '@/types'

export const useBrigadeiroStore = defineStore('brigadeiro', () => {
  const products = ref<Product[]>([])
  const sales = ref<Sale[]>([])
  const clients = ref<Client[]>([])
  const loading = ref(false)
  const initialized = ref(false)
  const error = ref<string | null>(null)

  const storageMode = isSupabaseConfigured ? 'supabase' : 'indexeddb'

  async function init() {
    if (initialized.value) return
    loading.value = true
    error.value = null
    try {
      await repository.init()
      await refresh()
      initialized.value = true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erro ao carregar dados'
    } finally {
      loading.value = false
    }
  }

  async function refresh() {
    const [p, s, c] = await Promise.all([
      repository.listProducts(),
      repository.listSales(),
      repository.listClients(),
    ])
    products.value = p
    sales.value = s
    clients.value = c
  }

  async function addProduct(input: ProductInput) {
    await repository.createProduct(input)
    await refresh()
  }

  async function updateProduct(id: string, input: ProductInput) {
    await repository.updateProduct(id, input)
    await refresh()
  }

  async function removeProduct(id: string) {
    await repository.deleteProduct(id)
    await refresh()
  }

  async function addClient(input: ClientInput) {
    const created = await repository.createClient(input)
    await refresh()
    return created
  }

  async function updateClient(id: string, input: ClientInput) {
    const updated = await repository.updateClient(id, input)
    await refresh()
    return updated
  }

  async function removeClient(id: string) {
    await repository.deleteClient(id)
    await refresh()
  }

  async function addSale(input: SaleInput) {
    await repository.createSale(input)
    await refresh()
  }

  async function updateSale(id: string, input: SaleInput) {
    await repository.updateSale(id, input)
    await refresh()
  }

  async function removeSale(id: string) {
    await repository.deleteSale(id)
    await refresh()
  }

  return {
    products,
    sales,
    clients,
    loading,
    initialized,
    error,
    storageMode,
    init,
    refresh,
    addProduct,
    updateProduct,
    removeProduct,
    addClient,
    updateClient,
    removeClient,
    addSale,
    updateSale,
    removeSale,
  }
})
