import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export interface PantryIngredient {
  id: string
  nome: string
  preco: number
  quantidade: number
  unidade: 'g' | 'kg' | 'ml' | 'L' | 'un' | 'pct' | 'cx'
}

export interface RecipeIngredient {
  ingredienteId: string
  quantidade: number
  unidade: 'g' | 'kg' | 'ml' | 'L' | 'un' | 'pct' | 'cx'
}

export interface Recipe {
  id: string
  nome: string
  rendimento: number
  ingredientes: RecipeIngredient[]
  created_at: string
}

export function getUnitCategory(unit: string): 'weight' | 'volume' | 'count' {
  const u = unit.toLowerCase()
  if (u === 'g' || u === 'kg') return 'weight'
  if (u === 'ml' || u === 'l') return 'volume'
  return 'count'
}

export function getBaseQuantity(qty: number, unit: string): number {
  const u = unit.toLowerCase()
  if (u === 'kg' || u === 'l') {
    return qty * 1000
  }
  return qty
}

export function calculateIngredientCost(
  pantryQty: number,
  pantryPrice: number,
  pantryUnit: string,
  usedQty: number,
  usedUnit: string
): number {
  const pCat = getUnitCategory(pantryUnit)
  const uCat = getUnitCategory(usedUnit)

  if (pCat !== uCat) {
    // Caso as categorias sejam incompatíveis, faz cálculo direto 1:1
    return (pantryPrice / pantryQty) * usedQty
  }

  const pQtyBase = getBaseQuantity(pantryQty, pantryUnit)
  const uQtyBase = getBaseQuantity(usedQty, usedUnit)

  if (pQtyBase <= 0) return 0
  return (pantryPrice / pQtyBase) * uQtyBase
}

export const useCalculatorStore = defineStore('calculator', () => {
  const ingredients = ref<PantryIngredient[]>([])
  const recipes = ref<Recipe[]>([])

  // Inicializar do localStorage
  const savedData = localStorage.getItem('hoje-tem-brigadeiro:calculator')
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData)
      ingredients.value = parsed.ingredients || []
      recipes.value = parsed.recipes || []
    } catch (e) {
      console.error('Erro ao carregar dados da calculadora:', e)
    }
  }

  // Preencher com dados iniciais de exemplo se estiver vazio
  if (ingredients.value.length === 0 && recipes.value.length === 0) {
    ingredients.value = [
      { id: '1', nome: 'Leite condensado', preco: 5.99, quantidade: 395, unidade: 'g' },
      { id: '2', nome: 'Farinha de trigo', preco: 10.00, quantidade: 1, unidade: 'kg' },
    ]
  }

  // Salvar mudanças no localStorage
  watch(
    [ingredients, recipes],
    () => {
      localStorage.setItem(
        'hoje-tem-brigadeiro:calculator',
        JSON.stringify({
          ingredients: ingredients.value,
          recipes: recipes.value,
        })
      )
    },
    { deep: true }
  )

  function addIngredient(ingredient: Omit<PantryIngredient, 'id'>) {
    const id = crypto.randomUUID()
    ingredients.value.push({ ...ingredient, id })
  }

  function updateIngredient(id: string, updated: Omit<PantryIngredient, 'id'>) {
    const idx = ingredients.value.findIndex(i => i.id === id)
    if (idx !== -1) {
      ingredients.value[idx] = { ...updated, id }
    }
  }

  function removeIngredient(id: string) {
    ingredients.value = ingredients.value.filter(i => i.id !== id)
    // Remove este ingrediente de qualquer receita para não causar inconsistência
    recipes.value = recipes.value.map(recipe => ({
      ...recipe,
      ingredientes: recipe.ingredientes.filter(ri => ri.ingredienteId !== id)
    }))
  }

  function getIngredientCost(recipeIng: RecipeIngredient): number {
    const pantryIng = ingredients.value.find(i => i.id === recipeIng.ingredienteId)
    if (!pantryIng) return 0
    return calculateIngredientCost(
      pantryIng.quantidade,
      pantryIng.preco,
      pantryIng.unidade,
      recipeIng.quantidade,
      recipeIng.unidade
    )
  }

  function getRecipeTotalCost(recipe: Omit<Recipe, 'id' | 'created_at'>): number {
    return recipe.ingredientes.reduce((sum, ing) => sum + getIngredientCost(ing), 0)
  }

  function addRecipe(recipe: Omit<Recipe, 'id' | 'created_at'>) {
    const newRecipe: Recipe = {
      ...recipe,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    }
    recipes.value.push(newRecipe)
  }

  function removeRecipe(id: string) {
    recipes.value = recipes.value.filter(r => r.id !== id)
  }

  return {
    ingredients,
    recipes,
    addIngredient,
    updateIngredient,
    removeIngredient,
    getIngredientCost,
    getRecipeTotalCost,
    addRecipe,
    removeRecipe,
  }
})
