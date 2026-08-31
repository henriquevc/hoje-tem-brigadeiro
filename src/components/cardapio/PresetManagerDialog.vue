<script setup lang="ts">
import { ref } from 'vue'
import { Bookmark, Plus, Trash2, FolderOpen, Calendar, Sparkles } from '@lucide/vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCardapioStore } from '@/stores/cardapio'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
  (e: 'loaded', presetTitle: string): void
}>()

const store = useCardapioStore()
const newPresetTitle = ref('')

function handleSaveNewPreset() {
  if (!newPresetTitle.value.trim()) return
  const saved = store.saveCurrentAsPreset(newPresetTitle.value.trim())
  newPresetTitle.value = ''
  emit('loaded', saved.title)
}

function handleLoad(id: string, title: string) {
  const success = store.loadPreset(id)
  if (success) {
    emit('loaded', title)
    emit('update:open', false)
  }
}

function handleDelete(id: string) {
  store.deletePreset(id)
}

function formatDate(isoString: string) {
  try {
    return new Date(isoString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="(val) => emit('update:open', val)">
    <DialogContent class="sm:max-w-[520px]">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2 text-base font-bold">
          <Bookmark class="size-5 text-amber-600" />
          Modelos Salvos (Presets)
        </DialogTitle>
        <DialogDescription class="text-xs">
          Salve combinações de produtos e temas para carregar rapidamente nos dias de venda.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-5 py-2">
        <!-- Salvar Estado Atual -->
        <div class="p-3.5 bg-amber-500/10 rounded-2xl border border-amber-500/20 space-y-2.5">
          <Label class="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Sparkles class="size-3.5 text-amber-600" />
            Salvar cardápio atual como modelo:
          </Label>
          <div class="flex gap-2">
            <Input
              v-model="newPresetTitle"
              placeholder="Ex: Cardápio de Sexta / Fim de Semana"
              class="text-xs h-9 bg-background"
              @keydown.enter.prevent="handleSaveNewPreset"
            />
            <Button
              type="button"
              size="sm"
              class="h-9 px-3.5 text-xs bg-amber-600 hover:bg-amber-500 text-white shrink-0 gap-1"
              :disabled="!newPresetTitle.trim()"
              @click="handleSaveNewPreset"
            >
              <Plus class="size-3.5" />
              Salvar
            </Button>
          </div>
        </div>

        <!-- Lista de Modelos Salvos -->
        <div class="space-y-2">
          <div class="flex items-center justify-between px-1">
            <Label class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Seus Modelos ({{ store.presets.length }})
            </Label>
          </div>

          <div v-if="store.presets.length === 0" class="text-center py-6 border border-dashed rounded-2xl text-muted-foreground text-xs">
            <Bookmark class="size-7 mx-auto mb-1.5 opacity-40 text-amber-600" />
            Nenhum modelo salvo ainda.<br />
            Digite um nome acima e salve seu primeiro modelo!
          </div>

          <div v-else class="max-h-60 overflow-y-auto space-y-2 pr-1">
            <div
              v-for="preset in store.presets"
              :key="preset.id"
              class="p-3 rounded-xl border border-border bg-card hover:border-amber-500/40 transition flex items-center justify-between gap-3 group"
            >
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <h4 class="text-xs font-bold text-foreground truncate">{{ preset.title }}</h4>
                  <span class="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium uppercase">
                    {{ preset.templateId }}
                  </span>
                </div>
                <div class="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                  <span>{{ preset.items.length }} produtos</span>
                  <span>•</span>
                  <span class="flex items-center gap-1">
                    <Calendar class="size-3 opacity-60" />
                    {{ formatDate(preset.createdAt) }}
                  </span>
                </div>
              </div>

              <div class="flex items-center gap-1.5 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  class="h-8 px-2.5 text-xs text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/10 gap-1"
                  @click="handleLoad(preset.id, preset.title)"
                >
                  <FolderOpen class="size-3.5" />
                  Carregar
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  class="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  title="Excluir Modelo"
                  @click="handleDelete(preset.id)"
                >
                  <Trash2 class="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
