<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCalculatorStore, type PantryIngredient, type RecipeIngredient } from '@/stores/calculator'
import { useBrigadeiroStore } from '@/stores/brigadeiro'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Trash2, Edit2, Calculator, Save, Coins, Scale, RefreshCw } from '@lucide/vue'

const router = useRouter()
const calculatorStore = useCalculatorStore()
const brigadeiroStore = useBrigadeiroStore()

// --- ESTADO DO FORMULÁRIO DE INGREDIENTES (DESPENSA) ---
const editingIngredientId = ref<string | null>(null)
const ingName = ref('')
const ingPrice = ref<number | undefined>(undefined)
const ingQty = ref<number | undefined>(undefined)
const ingUnit = ref<'g' | 'kg' | 'ml' | 'L' | 'un' | 'pct' | 'cx'>('g')

// --- ESTADO DO MONTADOR DE RECEITA ---
const recipeName = ref('')
const recipeYield = ref(1)
const recipeIngredients = ref<RecipeIngredient[]>([])

const selectedPantryIngId = ref('')
const usedQty = ref<number | undefined>(undefined)
const usedUnit = ref<'g' | 'kg' | 'ml' | 'L' | 'un' | 'pct' | 'cx'>('g')

// --- SIMULADOR DE MARGEM ---
const marginPercent = ref(150) // Margem de lucro sugerida padrão de 150%

// --- EXPORTAR COMO PRODUTO ---
const showExportDialog = ref(false)
const exportProductName = ref('')
const exportCostPrice = ref(0)
const exportSalePrice = ref(0)

// --- ATUALIZAR UNIDADE AO SELECIONAR INGREDIENTE ---
watch(selectedPantryIngId, (id) => {
  const ing = calculatorStore.ingredients.find((i) => i.id === id)
  if (ing) {
    usedUnit.value = ing.unidade
  }
})

// --- LÓGICA DA DESPENSA ---
function handleSaveIngredient() {
  if (!ingName.value || !ingPrice.value || !ingQty.value) return

  const data = {
    nome: ingName.value,
    preco: ingPrice.value,
    quantidade: ingQty.value,
    unidade: ingUnit.value,
  }

  if (editingIngredientId.value) {
    calculatorStore.updateIngredient(editingIngredientId.value, data)
    editingIngredientId.value = null
  } else {
    calculatorStore.addIngredient(data)
  }

  // Resetar formulário
  ingName.value = ''
  ingPrice.value = undefined
  ingQty.value = undefined
  ingUnit.value = 'g'
}

function startEditIngredient(ing: PantryIngredient) {
  editingIngredientId.value = ing.id
  ingName.value = ing.nome
  ingPrice.value = ing.preco
  ingQty.value = ing.quantidade
  ingUnit.value = ing.unidade
}

function cancelEditIngredient() {
  editingIngredientId.value = null
  ingName.value = ''
  ingPrice.value = undefined
  ingQty.value = undefined
  ingUnit.value = 'g'
}

// --- LÓGICA DE INGREDIENTES DA RECEITA ---
function addIngredientToRecipe() {
  if (!selectedPantryIngId.value || !usedQty.value) return

  // Verificar se o ingrediente já está na receita
  const exists = recipeIngredients.value.some(
    (ri) => ri.ingredienteId === selectedPantryIngId.value,
  )
  if (exists) {
    // Apenas atualiza a quantidade somando
    recipeIngredients.value = recipeIngredients.value.map((ri) => {
      if (ri.ingredienteId === selectedPantryIngId.value) {
        return {
          ...ri,
          quantidade: ri.quantidade + (usedQty.value ?? 0),
        }
      }
      return ri
    })
  } else {
    recipeIngredients.value.push({
      ingredienteId: selectedPantryIngId.value,
      quantidade: usedQty.value,
      unidade: usedUnit.value,
    })
  }

  // Resetar campos de adição
  selectedPantryIngId.value = ''
  usedQty.value = undefined
}

function removeIngredientFromRecipe(ingId: string) {
  recipeIngredients.value = recipeIngredients.value.filter(
    (ri) => ri.ingredienteId !== ingId,
  )
}

// --- CÁLCULOS DA RECEITA ATUAL ---
const recipeTotalCost = computed(() => {
  return recipeIngredients.value.reduce((sum, ri) => {
    return sum + calculatorStore.getIngredientCost(ri)
  }, 0)
})

const recipeUnitCost = computed(() => {
  if (recipeYield.value <= 0) return 0
  return recipeTotalCost.value / recipeYield.value
})

const suggestedSalePrice = computed(() => {
  return recipeUnitCost.value * (1 + marginPercent.value / 100)
})

const sortedIngredients = computed(() => {
  return [...calculatorStore.ingredients].sort((a, b) => a.nome.localeCompare(b.nome))
})

// --- AÇÕES COM A RECEITA ---
function handleSaveRecipe() {
  if (!recipeName.value || recipeIngredients.value.length === 0) return

  calculatorStore.addRecipe({
    nome: recipeName.value,
    rendimento: recipeYield.value,
    ingredientes: [...recipeIngredients.value],
  })

  // Limpar formulário de receita
  recipeName.value = ''
  recipeYield.value = 1
  recipeIngredients.value = []
}

function loadSavedRecipe(recipe: any) {
  recipeName.value = recipe.nome
  recipeYield.value = recipe.rendimento
  recipeIngredients.value = [...recipe.ingredientes]
}

// --- LÓGICA DE EXPORTAR COMO PRODUTO ---
function openExportDialog() {
  if (recipeIngredients.value.length === 0) return
  exportProductName.value = recipeName.value || 'Novo Produto da Calculadora'
  exportCostPrice.value = Number(recipeUnitCost.value.toFixed(2))
  exportSalePrice.value = Number(suggestedSalePrice.value.toFixed(2))
  showExportDialog.value = true
}

async function handleExportToProducts() {
  if (!exportProductName.value || exportSalePrice.value < 0) return

  try {
    await brigadeiroStore.addProduct({
      nome: exportProductName.value,
      preco_custo: exportCostPrice.value,
      valor_venda: exportSalePrice.value,
      ativo: true,
    })
    showExportDialog.value = false
    // Navegar para a tela de produtos
    router.push('/produtos')
  } catch (err) {
    console.error('Erro ao salvar produto exportado', err)
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Cabeçalho -->
    <div class="flex flex-col gap-2">
      <h1 class="text-2xl font-bold tracking-tight sm:text-3xl flex items-center gap-2">
        <Calculator class="size-7 text-primary" />
        Calculadora de Custos
      </h1>
      <p class="text-muted-foreground">
        Cadastre seus insumos comprados, monte suas receitas com conversão de unidades automática e gerencie custos por porção.
      </p>
    </div>

    <!-- Grid Principal -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <!-- COLUNA DA DESPENSA (4 COLS) -->
      <div class="space-y-6 lg:col-span-4">
        <!-- Cadastrar Insumo -->
        <Card>
          <CardHeader>
            <CardTitle class="text-lg flex items-center gap-2">
              <Scale class="size-4 text-primary" />
              {{ editingIngredientId ? 'Editar Insumo' : 'Cadastrar Insumo' }}
            </CardTitle>
            <CardDescription>
              Registre quanto pagou pela embalagem fechada do ingrediente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form @submit.prevent="handleSaveIngredient" class="space-y-4">
              <div class="space-y-2">
                <Label for="ing-name">Nome do Insumo</Label>
                <Input
                  id="ing-name"
                  v-model="ingName"
                  placeholder="Ex: Leite condensado, Farinha"
                  required
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="ing-price">Preço Pago (R$)</Label>
                  <Input
                    id="ing-price"
                    v-model="ingPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Ex: 5,99"
                    required
                  />
                </div>
                <div class="space-y-2">
                  <Label for="ing-qty">Qtd. Embalagem</Label>
                  <Input
                    id="ing-qty"
                    v-model="ingQty"
                    type="number"
                    step="any"
                    min="0"
                    placeholder="Ex: 395"
                    required
                  />
                </div>
              </div>

              <div class="space-y-2">
                <Label for="ing-unit">Unidade de Medida</Label>
                <Select v-model="ingUnit">
                  <SelectTrigger id="ing-unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="g">Gramas (g)</SelectItem>
                    <SelectItem value="kg">Quilogramas (kg)</SelectItem>
                    <SelectItem value="ml">Mililitros (ml)</SelectItem>
                    <SelectItem value="L">Litros (L)</SelectItem>
                    <SelectItem value="un">Unidade (un)</SelectItem>
                    <SelectItem value="pct">Pacote (pct)</SelectItem>
                    <SelectItem value="cx">Caixa (cx)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div class="flex gap-2 pt-2">
                <Button type="submit" class="flex-1">
                  {{ editingIngredientId ? 'Salvar Alteração' : 'Adicionar à Despensa' }}
                </Button>
                <Button
                  v-if="editingIngredientId"
                  type="button"
                  variant="outline"
                  @click="cancelEditIngredient"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <!-- Listagem da Despensa -->
        <Card class="flex flex-col max-h-[500px]">
          <CardHeader class="pb-2">
            <CardTitle class="text-base flex items-center justify-between">
              <span>Sua Despensa</span>
              <span class="text-xs font-normal text-muted-foreground">
                {{ calculatorStore.ingredients.length }} itens
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent class="flex-1 overflow-y-auto px-4">
            <div v-if="calculatorStore.ingredients.length === 0" class="text-center py-8 text-muted-foreground text-sm">
              Sua despensa está vazia. Cadastre os insumos acima.
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="ing in sortedIngredients"
                :key="ing.id"
                class="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                :class="{ 'border-primary bg-primary/5': editingIngredientId === ing.id }"
              >
                <div>
                  <h4 class="font-medium text-sm">{{ ing.nome }}</h4>
                  <p class="text-xs text-muted-foreground">
                    {{ formatCurrency(ing.preco) }} por {{ ing.quantidade }}{{ ing.unidade }}
                  </p>
                </div>
                <div class="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    class="h-8 w-8 text-muted-foreground hover:text-foreground"
                    @click="startEditIngredient(ing)"
                  >
                    <Edit2 class="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    @click="calculatorStore.removeIngredient(ing.id)"
                  >
                    <Trash2 class="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- COLUNA DA RECEITA (8 COLS) -->
      <div class="space-y-6 lg:col-span-8">
        <Card>
          <CardHeader class="pb-4">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle class="text-lg">Montar Nova Receita</CardTitle>
                <CardDescription>Adicione ingredientes da despensa e calcule os custos de produção.</CardDescription>
              </div>
              <!-- Nome e Rendimento da Receita -->
              <div class="flex flex-wrap items-center gap-3">
                <div class="w-48">
                  <Input
                    v-model="recipeName"
                    placeholder="Nome da Receita (Ex: Bolo)"
                    class="h-9"
                  />
                </div>
                <div class="flex items-center gap-2">
                  <Label for="yield" class="text-xs text-muted-foreground whitespace-nowrap">Rendimento:</Label>
                  <Input
                    id="yield"
                    v-model="recipeYield"
                    type="number"
                    min="1"
                    class="h-9 w-20 text-center"
                  />
                  <span class="text-xs text-muted-foreground">un.</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent class="space-y-6">
            <!-- Adicionar Ingrediente à Receita -->
            <div class="rounded-lg border bg-muted/30 p-4 space-y-3">
              <h4 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Adicionar Insumo na Receita
              </h4>
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-12 items-end">
                <!-- Seletor do Insumo -->
                <div class="space-y-1 sm:col-span-6">
                  <Label class="text-xs">Insumo da Despensa</Label>
                  <Select v-model="selectedPantryIngId">
                    <SelectTrigger class="bg-card">
                      <SelectValue placeholder="Selecione um insumo..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="ing in sortedIngredients"
                        :key="ing.id"
                        :value="ing.id"
                      >
                        {{ ing.nome }} ({{ ing.quantidade }}{{ ing.unidade }} - {{ formatCurrency(ing.preco) }})
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <!-- Quantidade Usada -->
                <div class="space-y-1 sm:col-span-3">
                  <Label class="text-xs">Qtd. Utilizada</Label>
                  <Input
                    v-model="usedQty"
                    type="number"
                    step="any"
                    min="0"
                    placeholder="Ex: 500"
                    class="bg-card"
                  />
                </div>

                <!-- Unidade Usada -->
                <div class="space-y-1 sm:col-span-2">
                  <Label class="text-xs">Unidade</Label>
                  <Select v-model="usedUnit">
                    <SelectTrigger class="bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="ml">ml</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                      <SelectItem value="un">un</SelectItem>
                      <SelectItem value="pct">pct</SelectItem>
                      <SelectItem value="cx">cx</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <!-- Botão Adicionar -->
                <div class="sm:col-span-1">
                  <Button
                    type="button"
                    size="icon"
                    class="w-full h-9"
                    :disabled="!selectedPantryIngId || !usedQty"
                    @click="addIngredientToRecipe"
                  >
                    <Plus class="size-4" />
                  </Button>
                </div>
              </div>
            </div>

            <!-- Tabela de Ingredientes Adicionados -->
            <div class="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow class="bg-muted/50">
                    <TableHead>Ingrediente</TableHead>
                    <TableHead class="text-right">Qtd. Usada</TableHead>
                    <TableHead class="text-right">Proporção</TableHead>
                    <TableHead class="text-right">Custo</TableHead>
                    <TableHead class="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-if="recipeIngredients.length === 0">
                    <TableCell colspan="5" class="h-24 text-center text-muted-foreground text-sm">
                      Nenhum ingrediente adicionado à receita ainda.
                    </TableCell>
                  </TableRow>
                  <TableRow v-for="ri in recipeIngredients" :key="ri.ingredienteId">
                    <TableCell class="font-medium">
                      {{ calculatorStore.ingredients.find(i => i.id === ri.ingredienteId)?.nome ?? 'Ingrediente removido' }}
                    </TableCell>
                    <TableCell class="text-right">
                      {{ ri.quantidade }} {{ ri.unidade }}
                    </TableCell>
                    <TableCell class="text-right text-xs text-muted-foreground">
                      <!-- Mostrar proporção original cadastrada (ex: 500g de 1kg) -->
                      <span v-if="calculatorStore.ingredients.find(i => i.id === ri.ingredienteId) as PantryIngredient">
                        {{ (ri.quantidade) }}/{{ calculatorStore.ingredients.find(i => i.id === ri.ingredienteId)?.quantidade }}{{ calculatorStore.ingredients.find(i => i.id === ri.ingredienteId)?.unidade }}
                      </span>
                    </TableCell>
                    <TableCell class="text-right font-medium">
                      {{ formatCurrency(calculatorStore.getIngredientCost(ri)) }}
                    </TableCell>
                    <TableCell class="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        class="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        @click="removeIngredientFromRecipe(ri.ingredienteId)"
                      >
                        <Trash2 class="size-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <!-- Resumo de Custos da Receita -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div class="rounded-lg border p-4 bg-muted/20 flex flex-col justify-between">
                <span class="text-xs text-muted-foreground font-medium uppercase">Custo Total Receita</span>
                <span class="text-2xl font-bold text-foreground mt-2">
                  {{ formatCurrency(recipeTotalCost) }}
                </span>
              </div>
              <div class="rounded-lg border p-4 bg-muted/20 flex flex-col justify-between">
                <span class="text-xs text-muted-foreground font-medium uppercase">Custo Unitário (Rend: {{ recipeYield }}un)</span>
                <span class="text-2xl font-bold text-foreground mt-2">
                  {{ formatCurrency(recipeUnitCost) }}
                </span>
              </div>
              <div class="rounded-lg border p-4 bg-primary/5 border-primary/20 flex flex-col justify-between">
                <span class="text-xs text-primary font-medium uppercase flex items-center justify-between">
                  Preço Sugerido Venda
                  <span class="text-[10px] font-normal text-muted-foreground">Margem: {{ marginPercent }}%</span>
                </span>
                <span class="text-2xl font-bold text-primary mt-2">
                  {{ formatCurrency(suggestedSalePrice) }}
                </span>
              </div>
            </div>

            <!-- Simulador de Preço de Venda -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-muted/10 border rounded-lg p-4">
              <div class="flex-1 space-y-1">
                <Label class="text-xs font-semibold">Simulador de Margem de Lucro</Label>
                <p class="text-xs text-muted-foreground">Ajuste a porcentagem para ver a variação do preço sugerido.</p>
              </div>
              <div class="flex items-center gap-3 w-full sm:w-auto">
                <Input
                  v-model="marginPercent"
                  type="number"
                  min="0"
                  class="h-9 w-24 text-center bg-card"
                />
                <span class="text-sm font-semibold">%</span>
              </div>
            </div>

            <!-- Ações da Receita -->
            <div class="flex flex-wrap items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                :disabled="!recipeName || recipeIngredients.length === 0"
                class="flex items-center gap-2"
                @click="handleSaveRecipe"
              >
                <Save class="size-4" />
                Salvar no Histórico
              </Button>
              <Button
                :disabled="recipeIngredients.length === 0"
                class="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/95"
                @click="openExportDialog"
              >
                <Coins class="size-4" />
                Exportar como Produto
              </Button>
            </div>
          </CardContent>
        </Card>

        <!-- Histórico de Receitas Salvas -->
        <Card>
          <CardHeader>
            <CardTitle class="text-lg">Receitas Salvas</CardTitle>
            <CardDescription>Suas receitas cadastradas para carregamento rápido.</CardDescription>
          </CardHeader>
          <CardContent>
            <div v-if="calculatorStore.recipes.length === 0" class="text-center py-8 text-muted-foreground text-sm">
              Nenhuma receita salva ainda. Monte uma receita e clique em "Salvar no Histórico" acima.
            </div>
            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="recipe in calculatorStore.recipes"
                :key="recipe.id"
                class="rounded-lg border p-4 flex flex-col justify-between hover:border-primary/50 transition-colors"
              >
                <div class="space-y-1">
                  <div class="flex items-start justify-between gap-2">
                    <h4 class="font-semibold text-base text-foreground leading-tight">{{ recipe.nome }}</h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 -mt-1 -mr-1"
                      @click="calculatorStore.removeRecipe(recipe.id)"
                    >
                      <Trash2 class="size-3.5" />
                    </Button>
                  </div>
                  <p class="text-xs text-muted-foreground">
                    Rendimento: {{ recipe.rendimento }} {{ recipe.rendimento === 1 ? 'porção' : 'porções' }}
                  </p>
                </div>

                <div class="border-t pt-3 mt-4 flex items-center justify-between gap-2">
                  <div>
                    <p class="text-[10px] text-muted-foreground uppercase leading-none">Custo Unitário</p>
                    <p class="text-base font-bold text-foreground mt-1">
                      {{ formatCurrency(calculatorStore.getRecipeTotalCost(recipe) / recipe.rendimento) }}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    class="h-8 text-xs flex items-center gap-1.5"
                    @click="loadSavedRecipe(recipe)"
                  >
                    <RefreshCw class="size-3" />
                    Carregar no Editor
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- DIÁLOGO PARA EXPORTAR COMO PRODUTO -->
    <Dialog v-model:open="showExportDialog">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Exportar como Produto</DialogTitle>
          <DialogDescription>
            Crie um produto na sua listagem de vendas com base no custo calculado nesta receita.
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <Label for="prod-name">Nome do Produto</Label>
            <Input id="prod-name" v-model="exportProductName" required />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="prod-cost">Preço de Custo (R$)</Label>
              <Input
                id="prod-cost"
                v-model="exportCostPrice"
                type="number"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div class="space-y-2">
              <Label for="prod-sale">Preço de Venda (R$)</Label>
              <Input
                id="prod-sale"
                v-model="exportSalePrice"
                type="number"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showExportDialog = false">Cancelar</Button>
          <Button type="button" @click="handleExportToProducts">Salvar Produto</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
