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
    class="w-full h-full relative overflow-hidden flex flex-col justify-between p-3.5 sm:p-4.5 bg-[#2e160c] text-white font-sans select-none border-[3px] border-[#d8b888]/80 shadow-2xl"
    style="min-height: 100%; box-sizing: border-box;"
  >
    <!-- Moldura interna fina dourada -->
    <div class="absolute inset-1.5 sm:inset-2 rounded-[20px] border border-[#d8b888]/40 pointer-events-none"></div>

    <!-- MODO 3 OU 5 ITENS: CABEÇALHO NA ESQUERDA + ITEM 1 NA DIREITA -->
    <div
      v-if="isSplitLayout"
      class="relative z-10 flex-1 flex flex-col my-auto justify-center min-h-0"
      :class="count === 3 ? 'gap-2.5 sm:gap-3.5' : 'gap-2 sm:gap-2.5'"
    >
      <!-- LINHA DO TOPO: CABEÇALHO + ITEM 1 -->
      <div class="grid grid-cols-2 gap-2 sm:gap-3 items-center">
        <!-- Lado Esquerdo: Cabeçalho -->
        <div class="flex flex-col justify-center text-center px-1">
          <div class="flex items-center justify-center gap-1 text-[#f3d9b4] mb-0.5">
            <span class="text-xs transform -rotate-12 select-none">♡</span>
            <h2 class="font-cursive text-xl sm:text-2xl text-[#f3d9b4] tracking-wide leading-[1.2]">
              {{ store.subheading }}
            </h2>
            <span class="text-xs transform rotate-12 select-none">♡</span>
          </div>

          <h1 class="font-serif-luxury text-lg sm:text-xl font-extrabold tracking-widest text-[#fffdfa] uppercase drop-shadow leading-snug mt-0.5">
            {{ store.heading }}
          </h1>

          <div class="mt-1 flex items-center justify-center">
            <div class="h-[1px] w-6 sm:w-10 bg-gradient-to-r from-transparent to-[#d8b888]/80"></div>
            <span class="mx-1.5 px-2.5 py-0.5 rounded-full text-[8.5px] sm:text-[9.5px] font-bold tracking-widest bg-[#4a2213] border border-[#d8b888]/60 text-[#fceddb] uppercase shadow-inner">
              {{ store.badge }}
            </span>
            <div class="h-[1px] w-6 sm:w-10 bg-gradient-to-l from-transparent to-[#d8b888]/80"></div>
          </div>

          <p v-if="store.phrase" class="text-[9px] sm:text-[10px] text-[#fceddb]/80 font-medium italic mt-1 leading-snug">
            {{ store.phrase }}
          </p>
        </div>

        <!-- Lado Direito: Item 1 -->
        <div
          class="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-[#d8b888]/70 bg-[#1a0c06] shadow-xl group cursor-pointer"
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
          <div class="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 rounded-lg bg-[#2e160c]/95 text-[#fceddb] border border-[#d8b888] shadow-lg px-2 py-0.5 text-xs font-black tracking-tight leading-none backdrop-blur-sm">
            <span class="text-[8.5px] uppercase font-bold text-[#d8b888] mr-0.5">R$</span>
            {{ items[0].price }}
          </div>

          <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1a0c06]/95 via-[#1a0c06]/80 to-transparent pt-5 pb-1.5 px-1.5 text-center flex flex-col justify-end">
            <span class="font-serif-luxury font-bold text-white leading-snug  text-xs sm:text-sm drop-shadow">
              {{ items[0].name }}
            </span>
          </div>

          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
            Trocar Foto
          </div>
        </div>
      </div>

      <!-- ITENS EM DUPLAS EMBAIXO (Itens 2, 3 para 3 itens OU Itens 2, 3, 4, 5 para 5 itens) -->
      <div class="grid grid-cols-2 gap-2 sm:gap-3 w-full">
        <div
          v-for="item in items.slice(1)"
          :key="item.id"
          class="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-[#d8b888]/70 bg-[#1a0c06] shadow-xl group cursor-pointer"
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
          <div class="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 rounded-lg bg-[#2e160c]/95 text-[#fceddb] border border-[#d8b888] shadow-lg px-2 py-0.5 text-xs font-black tracking-tight leading-none backdrop-blur-sm">
            <span class="text-[8.5px] uppercase font-bold text-[#d8b888] mr-0.5">R$</span>
            {{ item.price }}
          </div>

          <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1a0c06]/95 via-[#1a0c06]/80 to-transparent pt-5 pb-1.5 px-1.5 text-center flex flex-col justify-end">
            <span class="font-serif-luxury font-bold text-white leading-snug  text-xs sm:text-sm drop-shadow">
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
    <div
      v-else
      class="relative z-10 flex-1 flex flex-col min-h-0 gap-1.5 sm:gap-2 justify-center my-auto"
    >
      <!-- CABEÇALHO CENTRALIZADO -->
      <div class="text-center pt-0 mb-0.5 sm:mb-1">
        <div class="flex items-center justify-center gap-1.5 text-[#f3d9b4] mb-0.5">
          <span class="text-xs sm:text-sm transform -rotate-12 select-none">♡</span>
          <h2 class="font-cursive text-xl sm:text-2xl text-[#f3d9b4] tracking-wide leading-none">
            {{ store.subheading }}
          </h2>
          <span class="text-xs sm:text-sm transform rotate-12 select-none">♡</span>
        </div>

        <h1 class="font-serif-luxury text-xl sm:text-2xl font-extrabold tracking-widest text-[#fffdfa] uppercase drop-shadow leading-snug mt-0.5">
          {{ store.heading }}
        </h1>

        <div class="mt-1 flex items-center justify-center">
          <div class="h-[1px] w-8 sm:w-12 bg-gradient-to-r from-transparent to-[#d8b888]/80"></div>
          <span class="mx-2 px-3 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold tracking-widest bg-[#4a2213] border border-[#d8b888]/60 text-[#fceddb] uppercase shadow-inner">
            {{ store.badge }}
          </span>
          <div class="h-[1px] w-8 sm:w-12 bg-gradient-to-l from-transparent to-[#d8b888]/80"></div>
        </div>

        <p v-if="store.phrase" class="text-[9px] sm:text-[10px] text-[#fceddb]/80 font-medium italic mt-1 leading-snug">
          {{ store.phrase }}
        </p>
      </div>

      <!-- GRADE DE PRODUTOS -->
      <div class="my-0.5 sm:my-1 flex flex-col justify-center min-h-0">
        <div
          class="grid gap-2 sm:gap-2.5 w-full"
          :class="
            count === 1
              ? 'grid-cols-1 max-w-[350px] sm:max-w-[360px] mx-auto'
              : count <= 4
              ? 'grid-cols-2 max-w-[480px] mx-auto'
              : 'grid-cols-2 sm:grid-cols-3 max-w-[490px] mx-auto'
          "
        >
          <div
            v-for="item in items"
            :key="item.id"
            class="relative w-full rounded-2xl overflow-hidden border-2 border-[#d8b888]/70 bg-[#1a0c06] shadow-xl group cursor-pointer"
            :class="count === 1 ? 'aspect-[4/3]' : count === 4 ? 'aspect-[1/0.92] sm:aspect-square' : 'aspect-square'"
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
            <div
              class="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 rounded-lg bg-[#2e160c]/95 text-[#fceddb] border border-[#d8b888] shadow-lg px-2 py-0.5 font-black tracking-tight leading-none backdrop-blur-sm"
              :class="count === 1 ? 'text-xs sm:text-sm' : 'text-xs'"
            >
              <span class="text-[8.5px] uppercase font-bold text-[#d8b888] mr-0.5">R$</span>
              {{ item.price }}
            </div>

            <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1a0c06]/95 via-[#1a0c06]/80 to-transparent pt-5 pb-1.5 px-1.5 sm:px-2 text-center flex flex-col justify-end">
              <span
                class="font-serif-luxury font-bold text-white leading-snug  drop-shadow"
                :class="count === 1 ? 'text-sm sm:text-base' : count <= 4 ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-xs'"
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

    <!-- RODAPÉ CACAU NOBRE -->
    <div class="relative z-10 pt-1.5 sm:pt-2 mt-1 border-t border-[#d8b888]/30 flex flex-row items-center justify-between gap-1 text-left text-[#fceddb]">
      <div class="flex items-center gap-1.5">
        <span class="text-xs">📷</span>
        <span class="font-sans text-[11px] sm:text-xs font-bold tracking-wide text-[#fceddb]">
          {{ store.instagram }}
        </span>
      </div>

      <div class="text-right">
        <span class="inline-flex items-center gap-1 text-[9px] sm:text-[10px] text-[#d8b888] font-medium bg-[#4a2213] px-2 py-0.5 rounded-full border border-[#d8b888]/40 leading-none">
          {{ store.whatsapp }}
        </span>
      </div>
    </div>
  </div>
</template>
