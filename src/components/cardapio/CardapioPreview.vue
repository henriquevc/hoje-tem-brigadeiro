<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { toPng } from 'html-to-image'
import {
  Download,
  Copy,
  Check,
  Share2,
  Sparkles,
  Square,
  RefreshCw,
  ExternalLink,
  Smartphone,
} from '@lucide/vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCardapioStore, type CardapioItem } from '@/stores/cardapio'

import KraftTemplate from './templates/KraftTemplate.vue'
import CacauNobreTemplate from './templates/CacauNobreTemplate.vue'
import ClassicTemplate from './templates/ClassicTemplate.vue'
import PatisserieTemplate from './templates/PatisserieTemplate.vue'
import RoseTemplate from './templates/RoseTemplate.vue'
import { FALLBACK_IMAGE_DATA_URL } from '@/utils/imageFallback'

const store = useCardapioStore()

onMounted(() => {
  if (store.format !== 'feed') {
    store.setFormat('feed')
  }
})

const emit = defineEmits<{
  selectPhoto: [item: CardapioItem]
  toast: [message: string, type?: 'success' | 'info' | 'error']
}>()

const renderTargetRef = ref<HTMLElement | null>(null)

// Estados de loading independentes para evitar travamento de botões
const isDownloading = ref(false)
const isCopying = ref(false)
const isExporting = computed(() => isDownloading.value || isCopying.value)
const isCopied = ref(false)

// Estado do modal de exportação móvel (iPhone / Safari / Chrome iOS)
const isExportModalOpen = ref(false)
const exportPreviewUrl = ref<string>('')
const exportBlob = ref<Blob | null>(null)
const exportFilename = ref<string>('')

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

// Dimensões do cartão de acordo com o formato Feed / WhatsApp (4:5)
const cardDimensionsStyle = computed(() => {
  return {
    width: '100%',
    maxWidth: '480px',
    height: 'auto',
  }
})

function isIosDevice(): boolean {
  if (typeof window === 'undefined') return false
  return (
    /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',')
  const mimeMatch = parts[0].match(/:(.*?);/)
  const mime = mimeMatch ? mimeMatch[1] : 'image/png'
  const bstr = atob(parts[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = filename
  link.href = url
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

async function prepareFonts() {
  if (document.fonts) {
    try {
      await document.fonts.ready
    } catch {
      // Ignora falha de fontes se houver
    }
  }
}

async function preloadAllImages(node: HTMLElement) {
  const imgs = Array.from(node.querySelectorAll('img'))
  await Promise.all(
    imgs.map((img) => {
      return new Promise<void>((resolve) => {
        if (img.complete && img.naturalWidth > 0) {
          resolve()
          return
        }
        img.onload = () => resolve()
        img.onerror = () => {
          img.src = FALLBACK_IMAGE_DATA_URL
          resolve()
        }
        setTimeout(resolve, 600)
      })
    })
  )
}

async function generateImageDataUrl(): Promise<string> {
  if (!renderTargetRef.value) throw new Error('Elemento não encontrado')
  await prepareFonts()

  const node = renderTargetRef.value
  await preloadAllImages(node)

  const originalWidth = node.style.width
  const originalMinWidth = node.style.minWidth
  const originalMaxWidth = node.style.maxWidth
  const originalBoxShadow = node.style.boxShadow
  const originalTransition = node.style.transition

  // Desativa transições durante captura para evitar layout intermediário animado
  node.style.transition = 'none'

  // Largura canônica consistente para a exportação HD
  const targetWidth = 480

  // Força 480px exatos sem encolher pelo flexbox do mobile e remove sombra externa
  node.style.width = `${targetWidth}px`
  node.style.minWidth = `${targetWidth}px`
  node.style.maxWidth = `${targetWidth}px`
  node.style.boxShadow = 'none'

  // Força recálculo imediato de layout síncrono
  void node.offsetHeight
  const targetHeight = node.offsetHeight

  try {
    const config = {
      pixelRatio: 2, // 480 * 2 = 960px, extremamente nítido e seguro na memória do iOS WebKit
      quality: 0.95,
      width: targetWidth,
      height: targetHeight,
      style: {
        boxShadow: 'none',
        transition: 'none',
        margin: '0',
      },
      imagePlaceholder: FALLBACK_IMAGE_DATA_URL,
      cacheBust: false,
    }

    // No WebKit (Safari & Chrome no iPhone), a primeira passada força o motor gráfico
    // a carregar e decodificar texturas das imagens antes de gravar no canvas final.
    try {
      await toPng(node, { ...config, pixelRatio: 1 })
    } catch (warmErr) {
      console.warn('Aquecimento inicial ignorado:', warmErr)
    }
    await new Promise((r) => setTimeout(r, 180))

    // Segunda passada: imagens decodificadas, gravando exatamente targetWidth x targetHeight
    const dataUrl = await toPng(node, config)

    if (!dataUrl || dataUrl === 'data:,') {
      throw new Error('Falha ao gerar dados da imagem do cardápio')
    }
    return dataUrl
  } finally {
    node.style.width = originalWidth
    node.style.minWidth = originalMinWidth
    node.style.maxWidth = originalMaxWidth
    node.style.boxShadow = originalBoxShadow
    node.style.transition = originalTransition
  }
}

async function handleDownload() {
  if (isExporting.value) return
  isDownloading.value = true
  emit('toast', 'Gerando cardápio em Alta Resolução (HD)...', 'info')

  const isIos = isIosDevice()
  const filename = `cardapio-hojetembrigadeiro-${store.templateId}-${Date.now()}.png`
  exportFilename.value = filename

  try {
    const dataUrl = await generateImageDataUrl()
    const blob = dataUrlToBlob(dataUrl)
    exportPreviewUrl.value = dataUrl
    exportBlob.value = blob

    // No iPhone/iPad (iOS Safari ou Chrome iOS):
    // <a download> não é suportado pelo WebKit da Apple.
    // Tentamos navigator.share primeiro se ainda houver gesto de toque.
    // Se falhar (por exemplo, tempo limite do gesto expirou no Safari ou Chrome no iOS),
    // abrimos o modal com a imagem pronta onde o clique no botão tem ativação 100% fresca!
    if (isIos) {
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], filename, { type: 'image/png' })
        if (navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: 'Cardápio Hoje Tem Brigadeiro',
              text: 'Cardápio do dia - Hoje Tem Brigadeiro',
              files: [file],
            })
            emit('toast', 'Cardápio compartilhado com sucesso!', 'success')
            return
          } catch (shareErr: any) {
            if (shareErr?.name === 'AbortError') {
              // Usuário fechou o menu nativo de compartilhamento
              return
            }
            console.warn('Share automático não aceito no iOS, abrindo modal:', shareErr)
          }
        }
      }

      // Se não abriu o share direto, abre o modal interativo com opções de toque
      isExportModalOpen.value = true
      emit('toast', 'Cardápio pronto! Toque para Salvar ou Compartilhar.', 'info')
      return
    }

    // Android: preferir Web Share se disponível
    const isMobile = /Android/i.test(navigator.userAgent)
    if (isMobile && navigator.share && navigator.canShare) {
      const file = new File([blob], filename, { type: 'image/png' })
      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: 'Cardápio Hoje Tem Brigadeiro',
            files: [file],
          })
          emit('toast', 'Cardápio compartilhado com sucesso!', 'success')
          return
        } catch (shareErr: any) {
          if (shareErr?.name === 'AbortError') return
        }
      }
    }

    // Desktop / Fallback padrão via link de download
    triggerDownload(blob, filename)
    emit('toast', 'Imagem HD baixada com sucesso!', 'success')
  } catch (err) {
    console.error('Erro ao baixar cardápio:', err)
    emit('toast', 'Erro ao exportar cardápio. Tente novamente!', 'error')
  } finally {
    isDownloading.value = false
  }
}

async function handleCopyToClipboard() {
  if (isExporting.value) return
  isCopying.value = true
  emit('toast', 'Preparando imagem do cardápio...', 'info')

  try {
    const isIos = isIosDevice()

    // No Safari (iOS e macOS), a chamada do ClipboardItem precisa ser disparada
    // com uma Promise síncrona dentro do evento de clique, preservando a ativação transitória do usuário
    if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
      try {
        const blobPromise = (async () => {
          const dataUrl = await generateImageDataUrl()
          const blob = dataUrlToBlob(dataUrl)
          exportPreviewUrl.value = dataUrl
          exportBlob.value = blob
          exportFilename.value = `cardapio-hojetembrigadeiro-${store.templateId}-${Date.now()}.png`
          return blob
        })()

        const item = new ClipboardItem({
          'image/png': blobPromise,
        })

        await navigator.clipboard.write([item])
        isCopied.value = true
        emit('toast', 'Imagem copiada! Agora basta colar (Ctrl+V) no WhatsApp.', 'success')
        setTimeout(() => {
          isCopied.value = false
        }, 3500)
        return
      } catch (clipErr) {
        console.warn('Cópia direta no clipboard falhou:', clipErr)
      }
    }

    // Fallback: se não conseguiu copiar direto (ex: Chrome no iPhone que bloqueia clipboard de imagens)
    if (!exportPreviewUrl.value) {
      const dataUrl = await generateImageDataUrl()
      exportPreviewUrl.value = dataUrl
      exportBlob.value = dataUrlToBlob(dataUrl)
      exportFilename.value = `cardapio-hojetembrigadeiro-${store.templateId}-${Date.now()}.png`
    }

    if (isIos) {
      isExportModalOpen.value = true
      emit('toast', 'No iPhone: toque e segure na foto para Copiar ou Salvar!', 'info')
    } else {
      emit('toast', 'Não foi possível copiar diretamente. Baixando imagem...', 'info')
      if (exportBlob.value) {
        triggerDownload(exportBlob.value, exportFilename.value)
      }
    }
  } catch (err) {
    console.error('Erro ao processar imagem:', err)
    emit('toast', 'Erro ao processar cardápio. Tente novamente!', 'error')
  } finally {
    isCopying.value = false
  }
}

async function handleModalShare() {
  if (!exportBlob.value) return
  const file = new File([exportBlob.value], exportFilename.value || 'cardapio.png', { type: 'image/png' })

  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: 'Cardápio Hoje Tem Brigadeiro',
        text: 'Cardápio do dia',
        files: [file],
      })
      emit('toast', 'Compartilhado com sucesso!', 'success')
      isExportModalOpen.value = false
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        console.warn('Erro ao compartilhar pelo modal:', e)
      }
    }
  } else {
    openImageInNewTab()
  }
}

async function handleModalCopy() {
  if (!exportBlob.value) return
  if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': exportBlob.value }),
      ])
      emit('toast', 'Imagem copiada para a área de transferência!', 'success')
      return
    } catch (e) {
      console.warn('Erro ao copiar no modal:', e)
    }
  }
  emit('toast', 'No iPhone, toque e segure na imagem acima e escolha "Copiar".', 'info')
}

function openImageInNewTab() {
  if (!exportPreviewUrl.value) return
  const win = window.open('')
  if (win) {
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cardápio Hoje Tem Brigadeiro</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { margin: 0; background: #1c1917; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, sans-serif; color: white; padding: 16px; box-sizing: border-box; }
            img { max-width: 100%; height: auto; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
            p { margin-top: 14px; font-size: 14px; color: #d6d3d1; text-align: center; }
          </style>
        </head>
        <body>
          <img src="${exportPreviewUrl.value}" alt="Cardápio" />
          <p>📲 Toque e segure na imagem acima para <strong>Salvar em Fotos</strong> ou <strong>Copiar</strong>.</p>
        </body>
      </html>
    `)
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
      
      <!-- Formato Fixo Feed / WhatsApp -->
      <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 border border-border/50 text-xs font-semibold text-foreground">
        <Square class="size-3.5 text-amber-600" />
        <span>Feed / WhatsApp (4:5)</span>
      </div>

      <!-- Botões de Ação de Exportação -->
      <div class="flex items-center gap-2 flex-wrap">
        <!-- Copiar Imagem para o WhatsApp -->
        <Button
          type="button"
          variant="outline"
          size="sm"
          class="h-9 px-3.5 text-xs font-semibold gap-1.5 border-amber-500/40 text-amber-900 dark:text-amber-200 hover:bg-amber-500/10 shadow-sm cursor-pointer"
          :disabled="isExporting"
          @click="handleCopyToClipboard"
          title="Copie e cole direto na conversa com Ctrl+V"
        >
          <RefreshCw v-if="isCopying" class="size-4 animate-spin text-amber-600" />
          <Check v-else-if="isCopied" class="size-4 text-emerald-600 animate-bounce" />
          <Copy v-else class="size-4 text-amber-600" />
          <span>{{ isCopying ? 'Copiando...' : (isCopied ? 'Copiado!' : 'Copiar Imagem (Ctrl+V)') }}</span>
        </Button>

        <!-- Baixar Imagem HD -->
        <Button
          type="button"
          size="sm"
          class="h-9 px-4 text-xs font-bold gap-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-md hover:shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
          :disabled="isExporting"
          @click="handleDownload"
        >
          <RefreshCw v-if="isDownloading" class="size-4 animate-spin" />
          <Download v-else class="size-4" />
          <span>{{ isDownloading ? 'Gerando HD...' : 'Baixar Imagem HD' }}</span>
        </Button>

        <!-- Compartilhar Texto WhatsApp -->
        <Button
          type="button"
          variant="secondary"
          size="icon"
          class="size-9 rounded-lg text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 cursor-pointer"
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

    <!-- MODAL DE EXPORTAÇÃO HD / SALVAR NO IPHONE (SAFARI & CHROME) -->
    <Dialog :open="isExportModalOpen" @update:open="(val: boolean) => (isExportModalOpen = val)">
      <DialogContent class="sm:max-w-[460px] max-h-[92vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader class="text-left space-y-1">
          <DialogTitle class="flex items-center gap-2 text-base sm:text-lg font-bold">
            <Smartphone class="size-5 text-amber-600 shrink-0" />
            <span>Cardápio em Alta Resolução</span>
          </DialogTitle>
          <DialogDescription class="text-xs text-muted-foreground">
            Imagem renderizada e pronta para salvar na galeria ou compartilhar no WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <!-- Preview da Imagem Gerada com Suporte a Toque Longo -->
        <div class="my-2 flex flex-col items-center">
          <div class="relative w-full max-w-[320px] rounded-2xl overflow-hidden border-2 border-border shadow-xl bg-stone-900">
            <img
              v-if="exportPreviewUrl"
              :src="exportPreviewUrl"
              alt="Cardápio Pronto"
              class="w-full h-auto block"
              style="-webkit-touch-callout: default; -webkit-user-select: auto; user-select: auto;"
            />
          </div>

          <!-- Dica Específica para Usuários de iPhone -->
          <div class="w-full mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-950 dark:text-amber-200 text-xs flex items-start gap-2.5">
            <Sparkles class="size-4 text-amber-600 shrink-0 mt-0.5" />
            <div class="leading-relaxed">
              <strong class="font-semibold">Dica para iPhone (Safari & Chrome):</strong>
              <p class="mt-0.5 text-[11px] opacity-90">
                Você pode <strong>tocar e segurar (pressionar)</strong> na imagem acima para escolher <strong>"Salvar em Fotos"</strong> ou <strong>"Copiar"</strong>, ou tocar no botão abaixo:
              </p>
            </div>
          </div>
        </div>

        <DialogFooter class="flex flex-col sm:flex-row gap-2 mt-2">
          <!-- Botão Principal: Salvar nas Fotos / Compartilhar (com ativação de gesto direta e fresca) -->
          <Button
            type="button"
            class="w-full sm:flex-1 h-10 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            @click="handleModalShare"
          >
            <Share2 class="size-4" />
            <span>Salvar nas Fotos / Compartilhar</span>
          </Button>

          <!-- Botão Secundário: Copiar -->
          <Button
            type="button"
            variant="outline"
            class="w-full sm:w-auto h-10 text-xs font-semibold gap-1.5 border-border hover:bg-muted cursor-pointer"
            @click="handleModalCopy"
          >
            <Copy class="size-4 text-amber-600" />
            <span>Copiar</span>
          </Button>

          <!-- Botão Auxiliar: Abrir Imagem -->
          <Button
            type="button"
            variant="ghost"
            size="icon"
            class="hidden sm:inline-flex size-10 shrink-0 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
            title="Abrir imagem em nova aba"
            @click="openImageInNewTab"
          >
            <ExternalLink class="size-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

  </div>
</template>
