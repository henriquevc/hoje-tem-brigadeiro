<script setup lang="ts">
import { computed } from 'vue'
import { useCardapioStore, type CardapioItem } from '@/stores/cardapio'

const store = useCardapioStore()
const items = computed(() => store.items)
const count = computed(() => items.value.length)

const isSplitLayout = computed(() => count.value === 3 || count.value === 5)

defineEmits<{
  (e: 'selectPhoto', item: CardapioItem): void
}>()
</script>

<template>
  <div
    class="w-full h-full relative overflow-hidden flex flex-col justify-between p-4 sm:p-5 bg-[#2b170e] text-white font-sans select-none rounded-[32px] border-4 border-[#d4a73a]/40 shadow-2xl subtle-grain"
    style="min-height: 100%; box-sizing: border-box;"
  >
    <!-- Elementos Decorativos de Fundo / Moldura -->
    <div class="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-amber-600/10 blur-3xl pointer-events-none"></div>
    <div class="absolute inset-2 sm:inset-2.5 rounded-[24px] border border-amber-400/25 pointer-events-none"></div>

    <!-- MODO 3 OU 5 ITENS: CABEÇALHO NA ESQUERDA + ITEM 1 NA DIREITA -->
    <div
      v-if="isSplitLayout"
      class="relative z-10 flex-1 flex flex-col my-auto"
      :class="count === 3 ? 'justify-center gap-3.5 sm:gap-4' : 'justify-center gap-2 sm:gap-2.5'"
    >
      <!-- LINHA DO TOPO: CABEÇALHO + ITEM 1 -->
      <div class="grid grid-cols-2 gap-2.5 sm:gap-3 items-center">
        <!-- Lado Esquerdo: Cabeçalho -->
        <div class="flex flex-col justify-center text-center px-1">
          <div class="flex items-center justify-center gap-1.5 text-amber-300/80 mb-0.5">
            <span class="text-sm transform -rotate-12 select-none">♡</span>
            <p class="font-cursive text-2xl sm:text-3xl text-amber-200 tracking-wide leading-none">
              {{ store.subheading }}
            </p>
            <span class="text-sm transform rotate-12 select-none">♡</span>
          </div>

          <h2 class="font-serif-luxury text-xl sm:text-2xl font-extrabold tracking-wider text-[#fdf8f0] uppercase drop-shadow-md leading-tight mt-0.5">
            {{ store.heading }}
          </h2>

          <div class="mt-1.5 flex items-center justify-center">
            <div class="h-[1px] w-6 sm:w-10 bg-gradient-to-r from-transparent to-amber-300/60"></div>
            <span class="mx-2 px-3 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold tracking-widest bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 border border-amber-400/40 text-amber-100 uppercase shadow-inner">
              {{ store.badge }}
            </span>
            <div class="h-[1px] w-6 sm:w-10 bg-gradient-to-l from-transparent to-amber-300/60"></div>
          </div>

          <p v-if="store.phrase" class="text-[10px] sm:text-[11px] text-amber-200/80 font-medium italic mt-1.5 leading-snug">
            {{ store.phrase }}
          </p>
        </div>

        <!-- Lado Direito: Item 1 -->
        <div
          class="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-[#d4a73a]/50 bg-[#1f1008] shadow-xl group cursor-pointer"
          @click="$emit('selectPhoto', items[0])"
        >
          <img
            :src="items[0].image"
            :alt="items[0].name"
            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 block"
            :style="{
              transform: `scale(${items[0].zoom || 1})`,
              objectPosition: `${items[0].positionX ?? 50}% ${items[0].positionY ?? 50}%`,
            }"
          />
          <div class="absolute top-2 right-2 rounded-lg bg-gradient-to-r from-[#eac055] to-[#cca029] text-[#23120c] font-black text-xs sm:text-sm px-2 py-0.5 shadow-lg leading-none flex items-center gap-0.5">
            <span class="text-[9px] uppercase font-bold opacity-90">R$</span>
            {{ items[0].price }}
          </div>

          <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1f1008]/95 via-[#1f1008]/80 to-transparent pt-6 pb-2 px-2 text-center flex flex-col justify-end">
            <span class="font-serif-luxury font-bold text-[#fdf8f0] leading-snug line-clamp-2 text-xs sm:text-sm drop-shadow">
              {{ items[0].name }}
            </span>
          </div>

          <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
            Trocar Foto
          </div>
        </div>
      </div>

      <!-- ITENS EM DUPLAS EMBAIXO (Itens 2, 3 para 3 itens OU Itens 2, 3, 4, 5 para 5 itens) -->
      <div class="grid grid-cols-2 gap-2.5 sm:gap-3 w-full">
        <div
          v-for="item in items.slice(1)"
          :key="item.id"
          class="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-[#d4a73a]/50 bg-[#1f1008] shadow-xl group cursor-pointer"
          @click="$emit('selectPhoto', item)"
        >
          <img
            :src="item.image"
            :alt="item.name"
            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 block"
            :style="{
              transform: `scale(${item.zoom || 1})`,
              objectPosition: `${item.positionX ?? 50}% ${item.positionY ?? 50}%`,
            }"
          />
          <div class="absolute top-2 right-2 rounded-lg bg-gradient-to-r from-[#eac055] to-[#cca029] text-[#23120c] font-black text-xs sm:text-sm px-2 py-0.5 shadow-lg leading-none flex items-center gap-0.5">
            <span class="text-[9px] uppercase font-bold opacity-90">R$</span>
            {{ item.price }}
          </div>

          <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1f1008]/95 via-[#1f1008]/80 to-transparent pt-6 pb-2 px-2 text-center flex flex-col justify-end">
            <span class="font-serif-luxury font-bold text-[#fdf8f0] leading-snug line-clamp-2 text-xs sm:text-sm drop-shadow">
              {{ item.name }}
            </span>
          </div>

          <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
            Trocar Foto
          </div>
        </div>
      </div>
    </div>

    <!-- MODO PADRÃO (1, 2, 4, 6, 7+ ITENS) -->
    <div v-else class="relative z-10 flex-1 flex flex-col justify-between my-1">
      <!-- CABEÇALHO CENTRALIZADO -->
      <div class="text-center mb-2 pt-0.5">
        <div class="flex items-center justify-center gap-2 text-amber-300/80 mb-0.5">
          <span class="text-base transform -rotate-12 select-none">♡</span>
          <p class="font-cursive text-2xl sm:text-3xl text-amber-200 tracking-wide leading-tight">
            {{ store.subheading }}
          </p>
          <span class="text-base transform rotate-12 select-none">♡</span>
        </div>

        <h2 class="font-serif-luxury text-2xl sm:text-3xl font-extrabold tracking-wider text-[#fdf8f0] uppercase drop-shadow-md leading-tight mt-0.5">
          {{ store.heading }}
        </h2>

        <div class="mt-1.5 flex items-center justify-center">
          <div class="h-[1px] w-10 sm:w-16 bg-gradient-to-r from-transparent to-amber-300/60"></div>
          <span class="mx-2.5 px-4 py-0.5 rounded-full text-[10px] sm:text-xs font-bold tracking-widest bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 border border-amber-400/40 text-amber-100 uppercase shadow-inner">
            {{ store.badge }}
          </span>
          <div class="h-[1px] w-10 sm:w-16 bg-gradient-to-l from-transparent to-amber-300/60"></div>
        </div>
      </div>

      <!-- GRADE DE PRODUTOS -->
      <div class="flex-1 flex flex-col justify-center my-1">
        <div
          class="grid gap-2.5 sm:gap-3 w-full"
          :class="
            count === 1
              ? 'grid-cols-1 max-w-[320px] mx-auto'
              : count <= 4
              ? 'grid-cols-2 max-w-[540px] mx-auto'
              : 'grid-cols-2 sm:grid-cols-3 max-w-[540px] mx-auto'
          "
        >
          <div
            v-for="item in items"
            :key="item.id"
            class="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-[#d4a73a]/50 bg-[#1f1008] shadow-xl group cursor-pointer"
            @click="$emit('selectPhoto', item)"
          >
            <img
              :src="item.image"
              :alt="item.name"
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 block"
              :style="{
                transform: `scale(${item.zoom || 1})`,
                objectPosition: `${item.positionX ?? 50}% ${item.positionY ?? 50}%`,
              }"
            />
            <div class="absolute top-2 right-2 rounded-lg bg-gradient-to-r from-[#eac055] to-[#cca029] text-[#23120c] font-black text-xs sm:text-sm px-2.5 py-1 shadow-lg leading-none flex items-center gap-0.5">
              <span class="text-[9px] uppercase font-bold opacity-90">R$</span>
              {{ item.price }}
            </div>

            <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1f1008]/95 via-[#1f1008]/80 to-transparent pt-6 pb-2 px-2 text-center flex flex-col justify-end">
              <span
                class="font-serif-luxury font-bold text-[#fdf8f0] leading-snug line-clamp-2 drop-shadow"
                :class="count <= 4 ? 'text-xs sm:text-sm' : 'text-[11px] sm:text-xs'"
              >
                {{ item.name }}
              </span>
            </div>

            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
              Trocar Foto
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- RODAPÉ -->
    <div class="relative z-10 pt-2 border-t border-amber-400/20 flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
      <div class="flex items-center gap-1.5 text-amber-200 justify-center sm:justify-start">
        <span class="text-xs">📷</span>
        <div class="text-left">
          <span class="text-[8px] uppercase tracking-widest text-stone-400 block font-sans">Siga no Instagram</span>
          <span class="text-xs sm:text-sm font-bold tracking-wide text-amber-100">
            {{ store.instagram }}
          </span>
        </div>
      </div>

      <div class="text-center sm:text-right">
        <span class="inline-flex items-center gap-1 text-[10px] sm:text-xs text-amber-300 font-medium bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-400/30">
          {{ store.whatsapp }}
        </span>
      </div>
    </div>
  </div>
</template>
