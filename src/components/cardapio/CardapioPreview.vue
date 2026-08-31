<script setup lang="ts">
import { ref, computed } from 'vue'
import { toPng, toBlob } from 'html-to-image'
import {
  Download,
  Copy,
  Check,
  Share2,
  Sparkles,
  Smartphone,
  Square,
  RefreshCw,
} from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { useCardapioStore, type CardapioItem } from '@/stores/cardapio'

import KraftTemplate from './templates/KraftTemplate.vue'
import CacauNobreTemplate from './templates/CacauNobreTemplate.vue'
import ClassicTemplate from './templates/ClassicTemplate.vue'
import PatisserieTemplate from './templates/PatisserieTemplate.vue'
import RoseTemplate from './templates/RoseTemplate.vue'

const store = useCardapioStore()

const emit = defineEmits<{
  selectPhoto: [item: CardapioItem]
  toast: [message: string, type?: 'success' | 'info' | 'error']
}>()

const renderTargetRef = ref<HTMLElement | null>(null)
const isExporting = ref(false)
const isCopied = ref(false)

const currentTemplateComponent = computed(() => {
  switch (store.templateId) {
    case 'kraft':
      return KraftTemplate
    case 'cacau-nobre':
      return CacauNobreTemplate
    case 'gourmet-warm':
      return ClassicTemplate
    case 'minimal-chic':
      return PatisserieTemplate
    case 'rose-gold':
      return RoseTemplate
    default:
      return KraftTemplate
  }
})

// Dimensões do cartão de acordo com o formato escolhido
const cardDimensionsStyle = computed(() => {
  if (store.format === 'story') {
    return {
      width: '100%',
      maxWidth: '430px',
      minHeight: '764px',
      aspectRatio: '9 / 16',
    }
  }
  return {
    width: '100%',
    maxWidth: '560px',
    minHeight: '700px',
    aspectRatio: '4 / 5',
  }
})

async function prepareFonts() {
  if (document.fonts) {
    try {
      await document.fonts.ready
    } catch {
      // Ignora falha de fontes se houver
    }
  }
}

async function handleDownload() {
  if (isExporting.value) return
  isExporting.value = true
  emit('toast', 'Processando imagem em Alta Resolução (HD)...', 'info')

  try {
    if (!renderTargetRef.value) throw new Error('Elemento não encontrado')
    await prepareFonts()

    const dataUrl = await toPng(renderTargetRef.value, {
      pixelRatio: 3,
      cacheBust: true,
      quality: 1.0,
    })

    const link = document.createElement('a')
    link.download = `cardapio-hojetembrigadeiro-${store.templateId}-${Date.now()}.png`
    link.href = dataUrl
    link.click()

    emit('toast', 'Imagem HD baixada com sucesso!', 'success')
  } catch (err) {
    console.error('Erro ao exportar cardápio:', err)
    emit('toast', 'Erro ao exportar. Tente novamente!', 'error')
  } finally {
    isExporting.value = false
  }
}

async function handleCopyToClipboard() {
  if (isExporting.value) return
  isExporting.value = true
  emit('toast', 'Copiando imagem para a área de transferência...', 'info')

  try {
    if (!renderTargetRef.value) throw new Error('Elemento não encontrado')
    await prepareFonts()

    const blob = await toBlob(renderTargetRef.value, {
      pixelRatio: 3,
      cacheBust: true,
      quality: 1.0,
    })

    if (!blob) {
      throw new Error('Falha ao gerar blob da imagem')
    }

    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ])
      isCopied.value = true
      emit('toast', 'Imagem copiada! Agora basta colar com Ctrl+V no WhatsApp.', 'success')
      setTimeout(() => {
        isCopied.value = false
      }, 3000)
    } catch (clipErr) {
      console.warn('Clipboard API com erro:', clipErr)
      // Fallback: faz download se a permissão do clipboard falhar
      handleDownload()
    }
  } catch (err) {
    console.error('Erro ao copiar imagem:', err)
    emit('toast', 'Não foi possível copiar diretamente. Usando download...', 'info')
    handleDownload()
  } finally {
    isExporting.value = false
  }
}

function handleShareWhatsAppText() {
  let text = `*✨ ${store.subheading} ${store.heading} ✨*\n\n`
  if (store.phrase) {
    text += `_${store.phrase}_\n\n`
  }
  text += `*Cardápio do dia:*\n`
  store.items.forEach((p) => {
    text += `• *${p.name}* - R$ ${p.price}\n`
  })
  text += `\n📲 ${store.whatsapp}\n📸 Siga: ${store.instagram}`

  const encoded = encodeURIComponent(text)
  window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank')
}
</script>

<template>
  <div class="flex flex-col items-center w-full">
    
    <!-- BARRA SUPERIOR DE AÇÕES E FORMATOS -->
    <div class="w-full flex flex-wrap items-center justify-between gap-3 mb-4 p-2 bg-card/60 rounded-2xl border border-border/80 shadow-sm backdrop-blur-sm">
      
      <!-- Seletor de Formato -->
      <div class="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/50">
        <button
          type="button"
          @click="store.setFormat('feed')"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          :class="
            store.format === 'feed'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          "
        >
          <Square class="size-3.5" />
          <span>Feed / WhatsApp (4:5)</span>
        </button>

        <button
          type="button"
          @click="store.setFormat('story')"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          :class="
            store.format === 'story'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          "
        >
          <Smartphone class="size-3.5" />
          <span>Story / Status (9:16)</span>
        </button>
      </div>

      <!-- Botões de Ação de Exportação -->
      <div class="flex items-center gap-2 flex-wrap">
        <!-- Copiar Imagem para o WhatsApp -->
        <Button
          type="button"
          variant="outline"
          size="sm"
          class="h-9 px-3.5 text-xs font-semibold gap-1.5 border-amber-500/40 text-amber-900 dark:text-amber-200 hover:bg-amber-500/10 shadow-sm"
          :disabled="isExporting"
          @click="handleCopyToClipboard"
          title="Copie e cole direto na conversa com Ctrl+V"
        >
          <Check v-if="isCopied" class="size-4 text-emerald-600 animate-bounce" />
          <Copy v-else class="size-4 text-amber-600" />
          <span>{{ isCopied ? 'Copiado!' : 'Copiar Imagem (Ctrl+V)' }}</span>
        </Button>

        <!-- Baixar Imagem HD -->
        <Button
          type="button"
          size="sm"
          class="h-9 px-4 text-xs font-bold gap-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-md hover:shadow-amber-500/20 active:scale-95 transition-all"
          :disabled="isExporting"
          @click="handleDownload"
        >
          <RefreshCw v-if="isExporting" class="size-4 animate-spin" />
          <Download v-else class="size-4" />
          <span>Baixar Imagem HD</span>
        </Button>

        <!-- Compartilhar Texto WhatsApp -->
        <Button
          type="button"
          variant="secondary"
          size="icon"
          class="size-9 rounded-lg text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700"
          title="Enviar resumo em texto no WhatsApp"
          @click="handleShareWhatsAppText"
        >
          <Share2 class="size-4" />
        </Button>
      </div>
    </div>

    <!-- ÁREA DE RENDERIZAÇÃO DO CARDÁPIO COM SOMBRA E ENQUADRAMENTO -->
    <div class="w-full flex justify-center overflow-x-auto py-2 px-1">
      <div
        ref="renderTargetRef"
        class="transition-all duration-300 shadow-2xl overflow-hidden flex flex-col"
        :style="cardDimensionsStyle"
      >
        <component
          :is="currentTemplateComponent"
          @select-photo="(item: CardapioItem) => emit('selectPhoto', item)"
        />
      </div>
    </div>

    <!-- Dica de Uso -->
    <div class="mt-3 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
      <Sparkles class="size-3.5 text-amber-600" />
      <span>Clique na foto de qualquer produto no cardápio para trocar ou ajustar o enquadramento.</span>
    </div>

  </div>
</template>
