import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

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
  const initialized = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Salvar mudanças no localStorage como backup local offline
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

  async function init() {
    if (initialized.value) return
    loading.value = true
    error.value = null
    try {
      // 1. Carregar local de qualquer forma como estado inicial
      const savedData = localStorage.getItem('hoje-tem-brigadeiro:calculator')
      let localIngredients: PantryIngredient[] = []
      let localRecipes: Recipe[] = []
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData)
          localIngredients = parsed.ingredients || []
          localRecipes = parsed.recipes || []
        } catch (e) {
          console.error('Erro ao carregar dados locais:', e)
        }
      }

      // Se Supabase estiver configurado, carregamos da nuvem e sincronizamos se necessário
      if (isSupabaseConfigured) {
        try {
          const { data: dbIngredients, error: ingError } = await supabase!.from('pantry_ingredients').select('*')
          if (ingError) throw ingError

          const { data: dbRecipes, error: recError } = await supabase!.from('recipes').select('*')
          if (recError) throw recError

          const sIngredients = (dbIngredients || []) as PantryIngredient[]
          const sRecipes = (dbRecipes || []) as Recipe[]

          // Sincronizar dados locais com Supabase se ainda não feito
          const isSynced = localStorage.getItem('hoje-tem-brigadeiro:calculator-synced') === 'true'
          if (!isSynced && (localIngredients.length > 0 || localRecipes.length > 0)) {
            // Subir ingredientes locais que não estejam no Supabase
            const ingredientsToUpload = localIngredients.filter(
              li => !sIngredients.some(si => si.id === li.id || si.nome.toLowerCase() === li.nome.toLowerCase())
            )

            for (const ing of ingredientsToUpload) {
              const { error: insertError } = await supabase!.from('pantry_ingredients').insert(ing)
              if (insertError) {
                console.error('Erro ao subir ingrediente:', ing.nome, insertError)
              } else {
                sIngredients.push(ing)
              }
            }

            // Subir receitas locais que não estejam no Supabase
            const recipesToUpload = localRecipes.filter(
              lr => !sRecipes.some(sr => sr.id === lr.id || sr.nome.toLowerCase() === lr.nome.toLowerCase())
            )

            for (const rec of recipesToUpload) {
              const { error: insertError } = await supabase!.from('recipes').insert(rec)
              if (insertError) {
                console.error('Erro ao subir receita:', rec.nome, insertError)
              } else {
                sRecipes.push(rec)
              }
            }

            localStorage.setItem('hoje-tem-brigadeiro:calculator-synced', 'true')
          }

          // Se estiver totalmente vazio, inicializa com alguns itens padrão no Supabase
          if (sIngredients.length === 0 && sRecipes.length === 0) {
            const defaultIngredients = [
              { id: '1', nome: 'Leite condensado', preco: 5.99, quantidade: 395, unidade: 'g' },
              { id: '2', nome: 'Farinha de trigo', preco: 10.00, quantidade: 1, unidade: 'kg' },
            ] as PantryIngredient[]
            for (const ing of defaultIngredients) {
              await supabase!.from('pantry_ingredients').insert(ing)
              sIngredients.push(ing)
            }
          }

          ingredients.value = sIngredients
          recipes.value = sRecipes
        } catch (e) {
          console.error('Erro ao conectar ou ler dados do Supabase. Usando backup local:', e)
          ingredients.value = localIngredients.length > 0 ? localIngredients : [
            { id: '1', nome: 'Leite condensado', preco: 5.99, quantidade: 395, unidade: 'g' },
            { id: '2', nome: 'Farinha de trigo', preco: 10.00, quantidade: 1, unidade: 'kg' },
          ]
          recipes.value = localRecipes
        }
      } else {
        // Sem Supabase, usa local de forma transparente
        if (localIngredients.length === 0 && localRecipes.length === 0) {
          ingredients.value = [
            { id: '1', nome: 'Leite condensado', preco: 5.99, quantidade: 395, unidade: 'g' },
            { id: '2', nome: 'Farinha de trigo', preco: 10.00, quantidade: 1, unidade: 'kg' },
          ]
        } else {
          ingredients.value = localIngredients
          recipes.value = localRecipes
        }
      }
      initialized.value = true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erro ao inicializar calculadora'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function addIngredient(ingredient: Omit<PantryIngredient, 'id'>) {
    const id = crypto.randomUUID()
    const newIngredient = { ...ingredient, id }
    if (isSupabaseConfigured) {
      try {
        const { error: insertError } = await supabase!.from('pantry_ingredients').insert(newIngredient)
        if (insertError) throw insertError
      } catch (e) {
        console.error('Erro ao salvar ingrediente no Supabase:', e)
      }
    }
    ingredients.value.push(newIngredient)
  }

  async function updateIngredient(id: string, updated: Omit<PantryIngredient, 'id'>) {
    if (isSupabaseConfigured) {
      try {
        const { error: updateError } = await supabase!
          .from('pantry_ingredients')
          .update(updated)
          .eq('id', id)
        if (updateError) throw updateError
      } catch (e) {
        console.error('Erro ao atualizar ingrediente no Supabase:', e)
      }
    }
    const idx = ingredients.value.findIndex(i => i.id === id)
    if (idx !== -1) {
      ingredients.value[idx] = { ...updated, id }
    }
  }

  async function removeIngredient(id: string) {
    if (isSupabaseConfigured) {
      try {
        const { error: deleteError } = await supabase!
          .from('pantry_ingredients')
          .delete()
          .eq('id', id)
        if (deleteError) throw deleteError
      } catch (e) {
        console.error('Erro ao remover ingrediente no Supabase:', e)
      }
    }
    ingredients.value = ingredients.value.filter(i => i.id !== id)
    // Remove este ingrediente de qualquer receita para não causar inconsistência
    recipes.value = recipes.value.map(recipe => ({
      ...recipe,
      ingredientes: recipe.ingredientes.filter(ri => ri.ingredienteId !== id)
    }))
    
    // Se alguma receita foi modificada, atualiza no Supabase
    if (isSupabaseConfigured) {
      for (const recipe of recipes.value) {
        try {
          const { error: updateError } = await supabase!
            .from('recipes')
            .update({ ingredientes: recipe.ingredientes })
            .eq('id', recipe.id)
          if (updateError) throw updateError
        } catch (e) {
          console.error('Erro ao atualizar receita afetada no Supabase:', e)
        }
      }
    }
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

  async function addRecipe(recipe: Omit<Recipe, 'id' | 'created_at'>) {
    const newRecipe: Recipe = {
      ...recipe,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    }
    if (isSupabaseConfigured) {
      try {
        const { error: insertError } = await supabase!.from('recipes').insert(newRecipe)
        if (insertError) throw insertError
      } catch (e) {
        console.error('Erro ao salvar receita no Supabase:', e)
      }
    }
    recipes.value.push(newRecipe)
  }

  async function removeRecipe(id: string) {
    if (isSupabaseConfigured) {
      try {
        const { error: deleteError } = await supabase!
          .from('recipes')
          .delete()
          .eq('id', id)
        if (deleteError) throw deleteError
      } catch (e) {
        console.error('Erro ao deletar receita no Supabase:', e)
      }
    }
    recipes.value = recipes.value.filter(r => r.id !== id)
  }

  return {
    ingredients,
    recipes,
    initialized,
    loading,
    error,
    init,
    addIngredient,
    updateIngredient,
    removeIngredient,
    getIngredientCost,
    getRecipeTotalCost,
    addRecipe,
    removeRecipe,
  }
})
