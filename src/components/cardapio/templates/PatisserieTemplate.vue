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
    class="w-full h-full relative overflow-hidden flex flex-col justify-between p-4 sm:p-5 bg-[#fdfbf7] text-[#2c2420] font-sans select-none border-[3px] border-[#e4dacf] shadow-xl"
    style="min-height: 100%; box-sizing: border-box;"
  >
    <!-- Moldura e detalhes minimalistas -->
    <div class="absolute inset-2 sm:inset-2.5 rounded-[24px] border border-[#e8ded4] pointer-events-none"></div>

    <!-- MODO 3 OU 5 ITENS: CABEÇALHO NA ESQUERDA + ITEM 1 NA DIREITA -->
    <div
      v-if="isSplitLayout"
      class="relative z-10 flex-1 flex flex-col my-auto"
      :class="count === 3 ? 'justify-center gap-3.5 sm:gap-4' : 'justify-center gap-2 sm:gap-2.5'"
    >
      <!-- LINHA DO TOPO: CABEÇALHO + ITEM 1 -->
      <div class="grid grid-cols-2 gap-2.5 sm:gap-3 items-center">
        <!-- Lado Esquerdo: Cabeçalho Compacto e Elegante -->
        <div class="flex flex-col justify-center text-center px-1">
          <p class="font-cursive text-2xl sm:text-3xl text-[#966b4d] tracking-wide leading-none">
            {{ store.subheading }}
          </p>

          <h1 class="font-cinzel text-xl sm:text-2xl font-bold tracking-widest text-[#2c2420] uppercase mt-1 leading-tight">
            {{ store.heading }}
          </h1>

          <div class="mt-2 flex items-center justify-center">
            <div class="h-[1px] w-6 sm:w-10 bg-[#d6c7b8]"></div>
            <span class="mx-2 px-3 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold tracking-widest bg-[#2c2420] text-[#fdfbf7] uppercase">
              {{ store.badge }}
            </span>
            <div class="h-[1px] w-6 sm:w-10 bg-[#d6c7b8]"></div>
          </div>

          <p v-if="store.phrase" class="text-[10px] sm:text-[11px] text-[#8c6b54] font-medium italic mt-1.5 leading-snug">
            {{ store.phrase }}
          </p>
        </div>

        <!-- Lado Direito: Item 1 -->
        <div
          class="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-[#e4dacf] bg-stone-100 shadow-lg group cursor-pointer"
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
          <div class="absolute top-2 right-2 rounded-lg bg-[#8c6b54] text-white font-bold text-xs sm:text-sm px-2.5 py-1 shadow-lg leading-none flex items-center gap-0.5">
            <span class="text-[9px] uppercase opacity-80 font-normal">R$</span>
            {{ items[0].price }}
          </div>
          <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#2c2420]/95 via-[#2c2420]/80 to-transparent pt-6 pb-2 px-2 text-center flex flex-col justify-end">
            <span class="font-cinzel font-semibold text-white leading-snug line-clamp-2 text-xs sm:text-sm drop-shadow">
              {{ items[0].name }}
            </span>
          </div>
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
            Trocar Foto
          </div>
        </div>
      </div>

      <!-- ITENS EM DUPLAS EMBAIXO (Itens 2, 3 para 3 itens OU Itens 2, 3, 4, 5 para 5 itens) -->
      <div class="grid grid-cols-2 gap-2.5 sm:gap-3 w-full">
        <div
          v-for="item in items.slice(1)"
          :key="item.id"
          class="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-[#e4dacf] bg-stone-100 shadow-lg group cursor-pointer"
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
          <div class="absolute top-2 right-2 rounded-lg bg-[#8c6b54] text-white font-bold text-xs sm:text-sm px-2.5 py-1 shadow-lg leading-none flex items-center gap-0.5">
            <span class="text-[9px] uppercase opacity-80 font-normal">R$</span>
            {{ item.price }}
          </div>
          <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#2c2420]/95 via-[#2c2420]/80 to-transparent pt-6 pb-2 px-2 text-center flex flex-col justify-end">
            <span class="font-cinzel font-semibold text-white leading-snug line-clamp-2 text-xs sm:text-sm drop-shadow">
              {{ item.name }}
            </span>
          </div>
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
            Trocar Foto
          </div>
        </div>
      </div>
    </div>

    <!-- MODO PADRÃO (1, 2, 4, 6, 7+ ITENS) -->
    <div v-else class="relative z-10 flex-1 flex flex-col justify-between my-1">
      <!-- CABEÇALHO CENTRALIZADO -->
      <div class="text-center mb-2 pt-0.5">
        <p class="font-cursive text-2xl sm:text-3xl text-[#966b4d] tracking-wide mt-0.5">
          {{ store.subheading }}
        </p>

        <h1 class="font-cinzel text-2xl sm:text-3xl font-bold tracking-widest text-[#2c2420] uppercase mt-0.5">
          {{ store.heading }}
        </h1>

        <div class="mt-1.5 flex items-center justify-center">
          <div class="h-[1px] w-10 sm:w-16 bg-[#d6c7b8]"></div>
          <span class="mx-2.5 px-4 py-0.5 rounded-full text-[10px] sm:text-xs font-bold tracking-widest bg-[#2c2420] text-[#fdfbf7] uppercase">
            {{ store.badge }}
          </span>
          <div class="h-[1px] w-10 sm:w-16 bg-[#d6c7b8]"></div>
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
            class="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-[#e4dacf] bg-stone-100 shadow-xl group cursor-pointer"
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
            <div class="absolute top-2 right-2 rounded-lg bg-[#8c6b54] text-white font-bold text-xs sm:text-sm px-2.5 py-1 shadow-lg leading-none flex items-center gap-0.5">
              <span class="text-[9px] uppercase opacity-80 font-normal">R$</span>
              {{ item.price }}
            </div>
            <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#2c2420]/95 via-[#2c2420]/80 to-transparent pt-6 pb-2 px-2 text-center flex flex-col justify-end">
              <span
                class="font-cinzel font-semibold text-white leading-snug line-clamp-2 drop-shadow"
                :class="count <= 4 ? 'text-xs sm:text-sm' : 'text-[11px] sm:text-xs'"
              >
                {{ item.name }}
              </span>
            </div>
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
              Trocar Foto
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- RODAPÉ -->
    <div class="relative z-10 pt-2 border-t border-[#e8ded4] flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left text-[#5c4a3e]">
      <div class="flex items-center gap-1.5 justify-center sm:justify-start">
        <span class="text-xs">📷</span>
        <span class="text-xs sm:text-sm font-bold tracking-wide text-[#2c2420]">
          {{ store.instagram }}
        </span>
      </div>

      <div class="text-center sm:text-right">
        <span class="inline-flex items-center text-[10px] sm:text-xs text-[#8c6b54] font-medium bg-[#f5ede4] px-2.5 py-0.5 rounded-full border border-[#e4dacf]">
          {{ store.whatsapp }}
        </span>
      </div>
    </div>
  </div>
</template>
