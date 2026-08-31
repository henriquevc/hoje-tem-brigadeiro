<script setup lang="ts">
import { ref, watch } from 'vue'
import { Camera, Link, Upload, Check, ZoomIn, Move } from '@lucide/vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CardapioItem } from '@/stores/cardapio'

const props = defineProps<{
  open: boolean
  item: CardapioItem | null
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
  (e: 'save', payload: { id: string; image: string; zoom: number; positionX: number; positionY: number }): void
}>()

const currentImage = ref('')
const currentZoom = ref(1)
const currentPosX = ref(50)
const currentPosY = ref(50)
const urlInput = ref('')

watch(
  () => props.item,
  (newItem) => {
    if (newItem) {
      currentImage.value = newItem.image || ''
      currentZoom.value = newItem.zoom ?? 1
      currentPosX.value = newItem.positionX ?? 50
      currentPosY.value = newItem.positionY ?? 50
      urlInput.value = newItem.image?.startsWith('http') ? newItem.image : ''
    }
  },
  { immediate: true }
)

function handleFileUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        currentImage.value = e.target.result as string
      }
    }
    reader.readAsDataURL(file)
  }
}

function applyUrl() {
  if (urlInput.value.trim()) {
    currentImage.value = urlInput.value.trim()
  }
}

function handleSave() {
  if (!props.item) return
  emit('save', {
    id: props.item.id,
    image: currentImage.value,
    zoom: currentZoom.value,
    positionX: currentPosX.value,
    positionY: currentPosY.value,
  })
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="open" @update:open="(val) => emit('update:open', val)">
    <DialogContent class="sm:max-w-[480px]">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2 text-base font-bold">
          <Camera class="size-5 text-amber-600" />
          Ajustar Foto do Produto
        </DialogTitle>
        <DialogDescription class="text-xs">
          Personalize a foto de "{{ item?.name }}" com upload, zoom e enquadramento.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4 py-2">
        <!-- Pré-visualização da foto com recorte -->
        <div class="flex flex-col items-center">
          <div class="relative size-36 sm:size-44 rounded-2xl overflow-hidden border-2 border-dashed border-amber-500/50 bg-stone-900 shadow-md flex items-center justify-center">
            <img
              v-if="currentImage"
              :src="currentImage"
              :alt="item?.name"
              class="w-full h-full object-cover transition-transform duration-100"
              :style="{
                transform: `scale(${currentZoom})`,
                objectPosition: `${currentPosX}% ${currentPosY}%`,
              }"
            />
            <div v-else class="text-center p-4 text-stone-400 text-xs">
              <Camera class="size-8 mx-auto mb-1 opacity-50" />
              Nenhuma imagem selecionada
            </div>
          </div>
          <span class="text-[11px] text-muted-foreground mt-2">
            Prévia do recorte quadrado no cardápio
          </span>
        </div>

        <!-- Controles de Zoom e Posição -->
        <div class="bg-muted/40 p-3 rounded-xl space-y-3 border border-border/50 text-xs">
          <div>
            <div class="flex justify-between items-center mb-1">
              <Label class="text-xs font-semibold flex items-center gap-1.5">
                <ZoomIn class="size-3.5 text-amber-600" /> Zoom da Foto
              </Label>
              <span class="text-[11px] text-muted-foreground">{{ currentZoom.toFixed(1) }}x</span>
            </div>
            <input
              type="range"
              min="1"
              max="2.5"
              step="0.05"
              v-model.number="currentZoom"
              class="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
          </div>

          <div>
            <div class="flex justify-between items-center mb-1">
              <Label class="text-xs font-semibold flex items-center gap-1.5">
                <Move class="size-3.5 text-amber-600" /> Posição Vertical (Altura)
              </Label>
              <span class="text-[11px] text-muted-foreground">{{ currentPosY }}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              v-model.number="currentPosY"
              class="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
          </div>
        </div>

        <!-- Upload de Arquivo Local -->
        <div>
          <Label class="text-xs font-semibold mb-1.5 block">Escolher do dispositivo:</Label>
          <label class="flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-amber-500 hover:bg-amber-500/5 rounded-xl p-3.5 cursor-pointer transition">
            <Upload class="size-5 text-amber-600 mb-1" />
            <span class="text-xs font-medium">Carregar foto do computador / celular</span>
            <span class="text-[10px] text-muted-foreground">PNG, JPG, WEBP</span>
            <input
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleFileUpload"
            />
          </label>
        </div>

        <!-- Ou Link Web -->
        <div>
          <Label class="text-xs font-semibold mb-1.5 block">Ou colar link da imagem:</Label>
          <div class="flex gap-2">
            <Input
              v-model="urlInput"
              placeholder="https://exemplo.com/foto.jpg"
              class="text-xs h-9"
              @keydown.enter.prevent="applyUrl"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              class="h-9 px-3 text-xs shrink-0"
              @click="applyUrl"
            >
              <Link class="size-3.5 mr-1" />
              Aplicar
            </Button>
          </div>
        </div>
      </div>

      <DialogFooter class="gap-2 sm:gap-0">
        <Button variant="outline" size="sm" @click="emit('update:open', false)">
          Cancelar
        </Button>
        <Button size="sm" class="bg-amber-600 hover:bg-amber-500 text-white gap-1.5" @click="handleSave">
          <Check class="size-4" />
          Salvar Enquadramento
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
