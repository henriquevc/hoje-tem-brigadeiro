<script setup lang="ts">
import { ref } from 'vue'
import {
  Palette,
  Layers,
  Plus,
  Minus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Camera,
  PenLine,
  Bookmark,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Info,
  AlertCircle,
} from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useCardapioStore, type CardapioItem, type CardapioTemplateId } from '@/stores/cardapio'

import CardapioPreview from '@/components/cardapio/CardapioPreview.vue'
import PhotoEditorDialog from '@/components/cardapio/PhotoEditorDialog.vue'
import PresetManagerDialog from '@/components/cardapio/PresetManagerDialog.vue'

const store = useCardapioStore()

const isPhotoModalOpen = ref(false)
const selectedItemForPhoto = ref<CardapioItem | null>(null)
const isPresetModalOpen = ref(false)

// Sistema de Toast
const toastVisible = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'info' | 'error'>('success')
let toastTimeout: ReturnType<typeof setTimeout> | null = null

function showToast(message: string, type: 'success' | 'info' | 'error' = 'success') {
  toastMessage.value = message
  toastType.value = type
  toastVisible.value = true

  if (toastTimeout) clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => {
    toastVisible.value = false
  }, 3500)
}

function handleOpenPhotoEditor(item: CardapioItem) {
  selectedItemForPhoto.value = item
  isPhotoModalOpen.value = true
}

function handleSavePhoto(payload: { id: string; image: string; zoom: number; positionX: number; positionY: number }) {
  store.updateItem(payload.id, {
    image: payload.image,
    zoom: payload.zoom,
    positionX: payload.positionX,
    positionY: payload.positionY,
  })
  showToast('Foto do produto atualizada!')
}

function handleAddProduct() {
  const success = store.addItem()
  if (success) {
    showToast(`Produto adicionado! Total: ${store.items.length}`)
  } else {
    showToast('Limite máximo de 10 produtos atingido.', 'info')
  }
}

function handleRemoveProduct(id: string) {
  const success = store.removeItem(id)
  if (success) {
    showToast('Produto removido.')
  } else {
    showToast('O cardápio precisa de pelo menos 1 produto.', 'info')
  }
}

const templatesList: { id: CardapioTemplateId; title: string; subtitle: string; colorDot: string }[] = [
  {
    id: 'kraft',
    title: 'Kraft Artesanal',
    subtitle: 'Exemplo 1 (Papel & Selos R$)',
    colorDot: 'bg-[#d9c4aa] border-[#8c5e47]',
  },
  {
    id: 'cacau-nobre',
    title: 'Cacau Nobre',
    subtitle: 'Exemplo 2 (Cards & Moldura)',
    colorDot: 'bg-[#3b1c10] border-[#d8b888]',
  },
  {
    id: 'gourmet-warm',
    title: 'Cacau & Creme',
    subtitle: 'Clássico Dourado e Marrom',
    colorDot: 'bg-[#2b170e] border-[#cca029]',
  },
  {
    id: 'minimal-chic',
    title: 'Pâtisserie Chic',
    subtitle: 'Clean & Minimalista Francês',
    colorDot: 'bg-[#fdfbf7] border-[#8c6b54]',
  },
  {
    id: 'rose-gold',
    title: 'Doce Rosé',
    subtitle: 'Romântico & Delicado Rosé',
    colorDot: 'bg-[#2a171e] border-[#e5a4b7]',
  },
]
</script>

<template>
  <div class="space-y-6 pb-12">
    
    <!-- TOAST NOTIFICATION FLUTUANTE -->
    <transition
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-4 opacity-0 scale-95"
      enter-to-class="translate-y-0 opacity-100 scale-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="toastVisible"
        class="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-sm font-medium backdrop-blur-md"
        :class="
          toastType === 'success'
            ? 'bg-stone-900 text-white border-amber-500/40'
            : toastType === 'error'
            ? 'bg-destructive text-destructive-foreground border-destructive/50'
            : 'bg-stone-900 text-white border-border'
        "
      >
        <CheckCircle2 v-if="toastType === 'success'" class="size-5 text-amber-400 shrink-0" />
        <AlertCircle v-else-if="toastType === 'error'" class="size-5 text-destructive-foreground shrink-0" />
        <Info v-else class="size-5 text-amber-400 shrink-0" />
        <span>{{ toastMessage }}</span>
      </div>
    </transition>

    <!-- CABEÇALHO DA PÁGINA -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Gerador de Cardápio WhatsApp
          </h1>
          <Badge variant="outline" class="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs">
            <Sparkles class="size-3 mr-1" /> Alta Definição
          </Badge>
        </div>
        <p class="text-xs text-muted-foreground mt-0.5">
          Monte o cardápio do dia com fotos e preços, e copie direto para o WhatsApp ou baixe a imagem em HD.
        </p>
      </div>

      <!-- Ações Rápidas de Modelos e Reset -->
      <div class="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          class="text-xs gap-1.5 border-amber-500/30 text-amber-800 dark:text-amber-300 hover:bg-amber-500/10"
          @click="isPresetModalOpen = true"
        >
          <Bookmark class="size-3.5 text-amber-600" />
          Modelos Salvos ({{ store.presets.length }})
        </Button>

        <Button
          variant="ghost"
          size="sm"
          class="text-xs gap-1 text-muted-foreground hover:text-foreground"
          @click="store.resetToDefaults(); showToast('Cardápio restaurado aos padrões!')"
        >
          <RotateCcw class="size-3.5" />
          Restaurar Padrão
        </Button>
      </div>
    </div>

    <!-- CONTEÚDO PRINCIPAL: PAINEL DE CONTROLE + PRÉ-VISUALIZAÇÃO AO VIVO -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      <!-- PAINEL LATERAL DE EDIÇÃO (5 colunas) -->
      <aside class="lg:col-span-5 space-y-6">
        
        <!-- SELETOR DE TEMAS VISUAIS -->
        <div class="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-3.5">
          <div class="flex items-center justify-between">
            <h2 class="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <Palette class="size-4 text-amber-600" />
              Modelo Visual (Design)
            </h2>
            <span class="text-[11px] text-muted-foreground">5 temas</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              v-for="t in templatesList"
              :key="t.id"
              type="button"
              @click="store.setTemplate(t.id); showToast(`Tema alterado para: ${t.title}`)"
              class="p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex items-start gap-2.5"
              :class="
                store.templateId === t.id
                  ? 'border-amber-600 bg-amber-500/10 shadow-sm ring-1 ring-amber-500/30'
                  : 'border-border/80 bg-background hover:bg-accent hover:border-border'
              "
            >
              <div
                class="size-4 rounded-full border shrink-0 mt-0.5 shadow-sm"
                :class="t.colorDot"
              ></div>
              <div class="min-w-0 flex-1">
                <span class="block text-xs font-bold text-foreground leading-tight truncate">
                  {{ t.title }}
                </span>
                <span class="text-[10px] text-muted-foreground leading-tight block mt-0.5 truncate">
                  {{ t.subtitle }}
                </span>
              </div>
            </button>
          </div>
        </div>

        <!-- GERENCIADOR DE PRODUTOS E PREÇOS -->
        <div class="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <Layers class="size-4 text-amber-600" />
              Produtos & Preços
            </h2>
            <Badge variant="secondary" class="text-xs font-bold">
              {{ store.items.length }} {{ store.items.length === 1 ? 'Produto' : 'Produtos' }}
            </Badge>
          </div>

          <!-- Botões de Adicionar / Remover Item -->
          <div class="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              class="flex-1 text-xs gap-1.5 h-9"
              :disabled="store.items.length <= 1"
              @click="store.removeItem(store.items[store.items.length - 1].id); showToast('Último produto removido.')"
            >
              <Minus class="size-3.5" />
              Remover Item
            </Button>
            <Button
              type="button"
              size="sm"
              class="flex-1 text-xs gap-1.5 h-9 bg-amber-600 hover:bg-amber-500 text-white shadow-sm"
              :disabled="store.items.length >= 10"
              @click="handleAddProduct"
            >
              <Plus class="size-3.5" />
              Adicionar Item
            </Button>
          </div>

          <!-- Lista de Itens Editáveis com Foto e Reordenação -->
          <div class="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            <div
              v-for="(item, index) in store.items"
              :key="item.id"
              class="p-3 rounded-2xl border border-border/80 bg-background/80 hover:border-amber-500/40 transition space-y-2 group"
            >
              <!-- Topo do Card do Item -->
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="text-[11px] font-bold text-muted-foreground">#{{ index + 1 }}</span>
                  <span class="text-xs font-bold text-foreground truncate">{{ item.name || 'Sem nome' }}</span>
                </div>

                <div class="flex items-center gap-1">
                  <!-- Mover Cima / Baixo -->
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    class="size-7 text-muted-foreground hover:text-foreground"
                    :disabled="index === 0"
                    title="Subir posição"
                    @click="store.moveItem(index, 'up')"
                  >
                    <ArrowUp class="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    class="size-7 text-muted-foreground hover:text-foreground"
                    :disabled="index === store.items.length - 1"
                    title="Descer posição"
                    @click="store.moveItem(index, 'down')"
                  >
                    <ArrowDown class="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    class="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    :disabled="store.items.length <= 1"
                    title="Excluir item"
                    @click="handleRemoveProduct(item.id)"
                  >
                    <Trash2 class="size-3.5" />
                  </Button>
                </div>
              </div>

              <!-- Inputs e Miniatura da Foto -->
              <div class="flex items-center gap-2.5">
                <!-- Miniatura da Foto com Botão de Ajuste -->
                <button
                  type="button"
                  @click="handleOpenPhotoEditor(item)"
                  class="relative size-11 rounded-xl overflow-hidden border border-border bg-stone-900 shrink-0 group/thumb shadow-sm"
                  title="Trocar ou enquadrar foto"
                >
                  <img
                    :src="item.image"
                    :alt="item.name"
                    class="w-full h-full object-cover"
                    :style="{
                      transform: `scale(${item.zoom || 1})`,
                      objectPosition: `${item.positionX ?? 50}% ${item.positionY ?? 50}%`,
                    }"
                  />
                  <div class="absolute inset-0 bg-black/60 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Camera class="size-3.5 text-amber-300" />
                  </div>
                </button>

                <!-- Nome do Produto -->
                <div class="flex-1 min-w-0">
                  <Input
                    v-model="item.name"
                    placeholder="Nome do produto"
                    class="text-xs h-8 bg-card"
                  />
                </div>

                <!-- Preço do Produto -->
                <div class="w-24 shrink-0 relative">
                  <span class="absolute left-2 top-2 text-[10px] text-muted-foreground font-bold leading-none">R$</span>
                  <Input
                    v-model="item.price"
                    placeholder="0,00"
                    class="text-xs h-8 pl-7 font-bold text-foreground bg-card"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- PERSONALIZAÇÃO DOS TEXTOS DO CARDÁPIO -->
        <div class="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-3.5">
          <h2 class="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
            <PenLine class="size-4 text-amber-600" />
            Informações & Textos do Cardápio
          </h2>

          <div class="space-y-3 text-xs">
            <div class="grid grid-cols-2 gap-2.5">
              <div>
                <Label class="text-[11px] font-semibold text-muted-foreground mb-1 block">
                  Título Cursivo (Topo)
                </Label>
                <Input
                  v-model="store.subheading"
                  placeholder="Hoje tem / Cardápio"
                  class="text-xs h-8 bg-background"
                />
              </div>

              <div>
                <Label class="text-[11px] font-semibold text-muted-foreground mb-1 block">
                  Nome Principal
                </Label>
                <Input
                  v-model="store.heading"
                  placeholder="BRIGADEIRO / do dia"
                  class="text-xs h-8 bg-background uppercase font-bold"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2.5">
              <div>
                <Label class="text-[11px] font-semibold text-muted-foreground mb-1 block">
                  Etiqueta / Badge
                </Label>
                <Input
                  v-model="store.badge"
                  placeholder="CARDÁPIO"
                  class="text-xs h-8 bg-background uppercase"
                />
              </div>

              <div>
                <Label class="text-[11px] font-semibold text-muted-foreground mb-1 block">
                  Instagram (@)
                </Label>
                <Input
                  v-model="store.instagram"
                  placeholder="@hojetembrigadeiro_"
                  class="text-xs h-8 bg-background"
                />
              </div>
            </div>

            <div>
              <Label class="text-[11px] font-semibold text-muted-foreground mb-1 block">
                Frase Afetiva / Subtítulo
              </Label>
              <Input
                v-model="store.phrase"
                placeholder="Feito com carinho para adoçar o seu dia! ♥"
                class="text-xs h-8 bg-background"
              />
            </div>

            <div>
              <Label class="text-[11px] font-semibold text-muted-foreground mb-1 block">
                Aviso de Encomendas / WhatsApp (Rodapé)
              </Label>
              <Input
                v-model="store.whatsapp"
                placeholder="Encomendas pelo Direct ou WhatsApp"
                class="text-xs h-8 bg-background"
              />
            </div>
          </div>
        </div>

      </aside>

      <!-- PAINEL DE PRÉ-VISUALIZAÇÃO AO VIVO DO CARDÁPIO (7 colunas) -->
      <section class="lg:col-span-7">
        <CardapioPreview
          @select-photo="handleOpenPhotoEditor"
          @toast="showToast"
        />
      </section>

    </div>

    <!-- MODAL DE EDIÇÃO DE FOTO DO PRODUTO -->
    <PhotoEditorDialog
      v-model:open="isPhotoModalOpen"
      :item="selectedItemForPhoto"
      @save="handleSavePhoto"
    />

    <!-- MODAL DE MODELOS SALVOS (PRESETS) -->
    <PresetManagerDialog
      v-model:open="isPresetModalOpen"
      @loaded="(title) => showToast(`Modelo '${title}' carregado com sucesso!`)"
    />

  </div>
</template>
