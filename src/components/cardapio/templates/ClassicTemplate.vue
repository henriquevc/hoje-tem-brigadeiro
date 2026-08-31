<script setup lang="ts">
import { computed } from 'vue'
import { useCardapioStore, type CardapioItem } from '@/stores/cardapio'

const store = useCardapioStore()
const items = computed(() => store.items)
const count = computed(() => items.value.length)

defineEmits<{
  (e: 'selectPhoto', item: CardapioItem): void
}>()
</script>

<template>
  <div
    class="w-full h-full relative overflow-hidden flex flex-col justify-between p-6 sm:p-8 bg-[#2b170e] text-white font-sans select-none rounded-[32px] border-4 border-[#d4a73a]/40 shadow-2xl subtle-grain"
    style="min-height: 100%;"
  >
    <!-- Elementos Decorativos de Fundo / Moldura -->
    <div class="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-amber-600/10 blur-3xl pointer-events-none"></div>
    <div class="absolute inset-3 sm:inset-4 rounded-[24px] border border-amber-400/25 pointer-events-none"></div>

    <!-- CABEÇALHO CLÁSSICO -->
    <div class="relative z-10 text-center mb-4 pt-1">
      <div class="flex items-center justify-center gap-3 text-amber-300/80 mb-0.5">
        <span class="text-lg sm:text-xl transform -rotate-12 select-none">♡</span>
        <p class="font-cursive text-3xl sm:text-4xl text-amber-200 tracking-wide leading-tight">
          {{ store.subheading }}
        </p>
        <span class="text-lg sm:text-xl transform rotate-12 select-none">♡</span>
      </div>

      <h2 class="font-serif-luxury text-3xl sm:text-5xl font-extrabold tracking-wider text-[#fdf8f0] uppercase drop-shadow-md leading-tight mt-1">
        {{ store.heading }}
      </h2>

      <div class="mt-2.5 flex items-center justify-center">
        <div class="h-[1px] w-12 sm:w-20 bg-gradient-to-r from-transparent to-amber-300/60"></div>
        <span class="mx-3 px-4 py-0.5 rounded-full text-xs font-bold tracking-widest bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 border border-amber-400/40 text-amber-100 uppercase shadow-inner">
          {{ store.badge }}
        </span>
        <div class="h-[1px] w-12 sm:w-20 bg-gradient-to-l from-transparent to-amber-300/60"></div>
      </div>
    </div>

    <!-- GRADE DE PRODUTOS CLÁSSICA -->
    <div class="relative z-10 flex-1 flex flex-col justify-evenly my-2">
      <div
        class="grid gap-3 sm:gap-4 w-full"
        :class="
          count === 1
            ? 'grid-cols-1 max-w-[420px] mx-auto'
            : count <= 2
            ? 'grid-cols-1 sm:grid-cols-2 max-w-[500px] mx-auto'
            : count <= 6
            ? 'grid-cols-2'
            : 'grid-cols-2 sm:grid-cols-3'
        "
      >
        <div
          v-for="item in items"
          :key="item.id"
          class="bg-[#3d2317]/95 border border-[#d4a73a]/30 rounded-2xl p-3 sm:p-3.5 shadow-lg flex items-center justify-between gap-3 group hover:border-amber-400/70 transition"
          :class="count <= 4 ? 'min-h-[92px] sm:min-h-[108px]' : 'min-h-[80px] sm:min-h-[90px]'"
        >
          <div class="flex items-center gap-3 min-w-0 flex-1 h-full">
            <!-- Foto -->
            <div
              class="relative shrink-0 rounded-xl overflow-hidden bg-stone-950 shadow-md group/img border border-amber-300/30 cursor-pointer"
              :class="count <= 4 ? 'size-18 sm:size-22' : 'size-15 sm:size-18'"
              @click="$emit('selectPhoto', item)"
            >
              <img
                :src="item.image"
                :alt="item.name"
                class="w-full h-full object-cover group-hover/img:scale-105 transition duration-300"
                :style="{
                  transform: `scale(${item.zoom || 1})`,
                  objectPosition: `${item.positionX ?? 50}% ${item.positionY ?? 50}%`,
                }"
              />
              <div class="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-bold">
                Foto
              </div>
            </div>

            <!-- Informações -->
            <div class="flex flex-col justify-between min-w-0 flex-1 h-full py-0.5">
              <h3
                class="font-serif-luxury font-bold text-[#fdf8f0] leading-snug line-clamp-2 break-words"
                :class="count <= 4 ? 'text-xs sm:text-[14px]' : 'text-[11px] sm:text-xs'"
              >
                {{ item.name }}
              </h3>

              <div class="mt-1.5 flex items-center">
                <span class="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg bg-gradient-to-r from-[#eac055] to-[#cca029] text-[#23120c] font-extrabold text-xs sm:text-[13px] shadow-sm leading-none flex items-center gap-1">
                  <span class="text-[9px] uppercase font-bold opacity-80">R$</span>
                  {{ item.price }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- RODAPÉ -->
    <div class="relative z-10 pt-3 border-t border-amber-400/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
      <div class="flex items-center gap-2 text-amber-200 justify-center sm:justify-start">
        <span class="text-sm">📷</span>
        <div class="text-left">
          <span class="text-[9px] uppercase tracking-widest text-stone-400 block font-sans">Siga no Instagram</span>
          <span class="text-xs sm:text-sm font-bold tracking-wide text-amber-100">
            {{ store.instagram }}
          </span>
        </div>
      </div>

      <div class="text-center sm:text-right">
        <span class="inline-flex items-center gap-1 text-[10px] sm:text-xs text-amber-300 font-medium bg-amber-950/80 px-3 py-1 rounded-full border border-amber-400/30">
          {{ store.whatsapp }}
        </span>
      </div>
    </div>
  </div>
</template>
