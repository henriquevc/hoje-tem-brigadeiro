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

// Dimensões do cartão de acordo com o formato escolhido (sempre altura natural)
const cardDimensionsStyle = computed(() => {
  return {
    width: '100%',
    maxWidth: store.format === 'story' ? '440px' : '480px',
    height: 'auto',
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

async function generateImageBlob() {
  if (!renderTargetRef.value) throw new Error('Elemento não encontrado')
  await prepareFonts()

  const node = renderTargetRef.value
  const originalWidth = node.style.width

  // Largura canônica consistente para a exportação HD
  const targetWidth = store.format === 'story' ? 440 : 480
  node.style.width = `${targetWidth}px`

  // Força recalcular tamanhos
  void node.offsetHeight

  try {
    const config = {
      pixelRatio: 2.5,
      cacheBust: true,
      quality: 1.0,
      width: targetWidth,
    }

    // Passada rápida de aquecimento para fontes e imagens
    try {
      await toPng(node, { ...config, pixelRatio: 1 })
      await new Promise((r) => setTimeout(r, 100))
    } catch (e) {
      console.warn('Erro na pré-renderização:', e)
    }

    const blob = await toBlob(node, config)
    if (!blob) {
      throw new Error('Falha ao gerar blob da imagem')
    }
    return blob
  } finally {
    node.style.width = originalWidth
  }
}

async function handleDownload() {
  if (isExporting.value) return
  isExporting.value = true
  emit('toast', 'Processando imagem em Alta Resolução (HD)...', 'info')

  try {
    const blob = await generateImageBlob()
    const filename = `cardapio-hojetembrigadeiro-${store.templateId}-${Date.now()}.png`

    // Tentar usar o Web Share API para mobile (iOS/Android), que funciona
    // muito melhor para salvar na galeria ou compartilhar direto.
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    if (isMobile && navigator.share && navigator.canShare) {
      const file = new File([blob], filename, { type: 'image/png' })
      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: 'Cardápio',
            files: [file]
          })
          emit('toast', 'Ação concluída com sucesso!', 'success')
          return
        } catch (shareErr: any) {
          if (shareErr.name === 'AbortError') {
             // Usuário fechou o menu de share, encerramos por aqui
             return
          }
          console.warn('Share API falhou, tentando fallback de download', shareErr)
        }
      }
    }

    // Fallback padrão: gerar tag <a> e forçar download
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = filename
    link.href = url
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(() => URL.revokeObjectURL(url), 5000)

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
    const blob = await generateImageBlob()

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
      isExporting.value = false // Permite que a função de download execute
      handleDownload()
      return
    }
  } catch (err) {
    console.error('Erro ao copiar imagem:', err)
    emit('toast', 'Não foi possível copiar diretamente. Usando download...', 'info')
    isExporting.value = false // Permite que a função de download execute
    handleDownload()
    return
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
        class="transition-all duration-300 shadow-2xl overflow-hidden flex flex-col rounded-[28px]"
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
