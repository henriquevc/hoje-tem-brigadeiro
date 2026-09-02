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
    class="w-full h-full relative overflow-hidden flex flex-col justify-between p-3.5 sm:p-4.5 cardapio-kraft-bg text-[#361b11] font-sans select-none"
    style="min-height: 100%; box-sizing: border-box;"
  >
    <!-- Cantoneiras e detalhes rústicos -->
    <div class="absolute top-1.5 left-2 text-[#8c5e47]/30 text-xs font-caveat select-none">✧ ✦ ✧</div>
    <div class="absolute top-1.5 right-2 text-[#8c5e47]/30 text-xs font-caveat select-none">✧ ✦ ✧</div>
    <div class="absolute bottom-1.5 left-2 text-[#8c5e47]/30 text-xs font-caveat select-none">✧ ✦ ✧</div>
    <div class="absolute bottom-1.5 right-2 text-[#8c5e47]/30 text-xs font-caveat select-none">✧ ✦ ✧</div>

    <!-- MODO 3 OU 5 ITENS: CABEÇALHO NA ESQUERDA + ITEM 1 NA DIREITA -->
    <div
      v-if="isSplitLayout"
      class="relative z-10 flex-1 flex flex-col my-auto justify-center min-h-0"
      :class="count === 3 ? 'gap-2.5 sm:gap-3.5' : 'gap-2 sm:gap-2.5'"
    >
      <!-- LINHA DO TOPO: CABEÇALHO + ITEM 1 -->
      <div class="grid grid-cols-2 gap-2 sm:gap-3 items-center">
        <!-- Lado Esquerdo: Títulos e Pincelada -->
        <div class="flex flex-col justify-center px-1">
          <div class="flex items-center gap-1 text-[10px] text-[#8c5e47] font-caveat">
            <span>♡</span>
            <span>doces artesanais</span>
          </div>

          <h1 class="font-serif-luxury text-xl sm:text-2xl font-extrabold text-[#361b11] leading-tight tracking-tight mt-0.5">
            {{ store.subheading }}
          </h1>

          <div class="flex items-center gap-1.5 -mt-0.5">
            <span class="text-xs text-[#8c5e47]">♥</span>
            <span class="font-caveat text-lg sm:text-xl font-bold text-[#5c301e] tracking-wide">
              {{ store.heading }}
            </span>
            <span class="text-xs text-[#8c5e47]">ミ★</span>
          </div>

          <!-- Pincelada com frase de carinho -->
          <div
            v-if="store.phrase"
            class="mt-1 bg-[#4a2618] text-[#f7efe6] px-2 py-0.5 rounded-lg shadow-sm text-center transform -rotate-1 border border-[#30160d]"
          >
            <p class="font-sans text-[9px] sm:text-[10px] font-medium leading-snug">
              {{ store.phrase }}
            </p>
          </div>
        </div>

        <!-- Lado Direito: Item 1 -->
        <div
          class="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-[#d9c4aa] bg-[#2a160e] shadow-lg group cursor-pointer"
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
          <div class="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 rounded-full size-10 sm:size-11 bg-[#faeee1] border-2 border-[#4a2618] flex flex-col items-center justify-center text-[#361b11] shadow-lg leading-none">
            <span class="text-[7.5px] font-bold uppercase text-[#73432f]">R$</span>
            <span class="font-serif-luxury font-black text-[11px] sm:text-xs -mt-0.5">{{ items[0].price }}</span>
          </div>

          <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#2e160c]/95 via-[#2e160c]/80 to-transparent pt-5 pb-1.5 px-1.5 text-center flex flex-col justify-end">
            <span class="font-serif-luxury text-xs sm:text-sm font-bold text-[#f7efe6] line-clamp-2 leading-snug drop-shadow">
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
          class="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-[#d9c4aa] bg-[#2a160e] shadow-lg group cursor-pointer"
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
          <div class="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 rounded-full size-10 sm:size-11 bg-[#faeee1] border-2 border-[#4a2618] flex flex-col items-center justify-center text-[#361b11] shadow-lg leading-none">
            <span class="text-[7.5px] font-bold uppercase text-[#73432f]">R$</span>
            <span class="font-serif-luxury font-black text-[11px] sm:text-xs -mt-0.5">{{ item.price }}</span>
          </div>

          <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#2e160c]/95 via-[#2e160c]/80 to-transparent pt-5 pb-1.5 px-1.5 text-center flex flex-col justify-end">
            <span class="font-serif-luxury text-xs sm:text-sm font-bold text-[#f7efe6] line-clamp-2 leading-snug drop-shadow">
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
        <div class="flex items-center justify-center gap-1.5 text-[11px] text-[#8c5e47] font-caveat">
          <span>♡</span>
          <span>doces feitos à mão com amor</span>
          <span>♡</span>
        </div>

        <div class="flex items-baseline justify-center gap-1.5 mt-0.5">
          <h1 class="font-serif-luxury text-xl sm:text-2xl font-extrabold text-[#361b11] leading-none tracking-tight">
            {{ store.subheading }}
          </h1>
          <span class="font-caveat text-xl sm:text-2xl font-bold text-[#5c301e]">
            {{ store.heading }}
          </span>
        </div>

        <div
          v-if="store.phrase"
          class="mt-1 inline-block bg-[#4a2618] text-[#f7efe6] px-3 py-0.5 rounded-lg shadow-sm border border-[#30160d]"
        >
          <p class="font-sans text-[9px] sm:text-[10px] font-medium leading-tight">
            {{ store.phrase }}
          </p>
        </div>
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
            class="relative w-full rounded-2xl overflow-hidden border-2 border-[#d9c4aa] bg-[#2a160e] shadow-lg group cursor-pointer"
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
              class="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 rounded-full bg-[#faeee1] border-2 border-[#4a2618] flex flex-col items-center justify-center text-[#361b11] shadow-lg leading-none"
              :class="count === 1 ? 'size-11 sm:size-12' : 'size-10 sm:size-11'"
            >
              <span class="text-[7.5px] font-bold uppercase text-[#73432f]">R$</span>
              <span
                class="font-serif-luxury font-black -mt-0.5"
                :class="count === 1 ? 'text-xs sm:text-sm' : 'text-[11px] sm:text-xs'"
              >{{ item.price }}</span>
            </div>

            <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#2e160c]/95 via-[#2e160c]/80 to-transparent pt-5 pb-1.5 px-1.5 sm:px-2 text-center flex flex-col justify-end">
              <span
                class="font-serif-luxury font-bold text-[#f7efe6] leading-snug line-clamp-2 drop-shadow"
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

    <!-- RODAPÉ KRAFT -->
    <div class="relative z-10 pt-1.5 sm:pt-2 mt-1 border-t border-[#8c5e47]/30 flex flex-row items-center justify-between gap-1 text-[#361b11]">
      <div class="flex items-center gap-1.5">
        <span class="text-xs font-bold">📷</span>
        <span class="font-sans text-[11px] sm:text-xs font-extrabold tracking-wide text-[#361b11]">
          {{ store.instagram }}
        </span>
      </div>

      <div class="text-right">
        <span class="text-[9px] sm:text-[10px] font-caveat font-bold text-[#5c301e] bg-[#faeee1] px-2 py-0.5 rounded-full border border-[#d9c4aa] leading-none">
          {{ store.whatsapp }}
        </span>
      </div>
    </div>
  </div>
</template>
