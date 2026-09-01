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
    class="w-full h-full relative overflow-hidden flex flex-col justify-between p-4 sm:p-5 bg-[#2e160c] text-white font-sans select-none rounded-[28px] border-[3px] border-[#d8b888]/80 shadow-2xl"
    style="min-height: 100%; box-sizing: border-box;"
  >
    <!-- Moldura interna fina dourada -->
    <div class="absolute inset-2 sm:inset-2.5 rounded-[22px] border border-[#d8b888]/40 pointer-events-none"></div>

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
          <div class="flex items-center justify-center gap-1.5 text-[#f3d9b4] mb-0.5">
            <span class="text-sm transform -rotate-12 select-none">♡</span>
            <h2 class="font-cursive text-2xl sm:text-3xl text-[#f3d9b4] tracking-wide leading-none">
              {{ store.subheading }}
            </h2>
            <span class="text-sm transform rotate-12 select-none">♡</span>
          </div>

          <h1 class="font-serif-luxury text-xl sm:text-2xl font-extrabold tracking-widest text-[#fffdfa] uppercase drop-shadow leading-tight mt-0.5">
            {{ store.heading }}
          </h1>

          <div class="mt-1.5 flex items-center justify-center">
            <div class="h-[1px] w-6 sm:w-10 bg-gradient-to-r from-transparent to-[#d8b888]/80"></div>
            <span class="mx-2 px-3 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold tracking-widest bg-[#4a2213] border border-[#d8b888]/60 text-[#fceddb] uppercase shadow-inner">
              {{ store.badge }}
            </span>
            <div class="h-[1px] w-6 sm:w-10 bg-gradient-to-l from-transparent to-[#d8b888]/80"></div>
          </div>

          <p v-if="store.phrase" class="text-[10px] sm:text-[11px] text-[#fceddb]/80 font-medium italic mt-1.5 leading-snug">
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
          <div class="absolute top-2 right-2 rounded-lg bg-[#2e160c]/95 text-[#fceddb] border border-[#d8b888] shadow-lg px-2 py-0.5 text-xs font-black tracking-tight leading-none backdrop-blur-sm">
            <span class="text-[9px] uppercase font-bold text-[#d8b888] mr-0.5">R$</span>
            {{ items[0].price }}
          </div>

          <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1a0c06]/95 via-[#1a0c06]/80 to-transparent pt-6 pb-2 px-2 text-center flex flex-col justify-end">
            <span class="font-serif-luxury font-bold text-white leading-snug line-clamp-2 text-xs sm:text-sm drop-shadow">
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
          <div class="absolute top-2 right-2 rounded-lg bg-[#2e160c]/95 text-[#fceddb] border border-[#d8b888] shadow-lg px-2 py-0.5 text-xs font-black tracking-tight leading-none backdrop-blur-sm">
            <span class="text-[9px] uppercase font-bold text-[#d8b888] mr-0.5">R$</span>
            {{ item.price }}
          </div>

          <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1a0c06]/95 via-[#1a0c06]/80 to-transparent pt-6 pb-2 px-2 text-center flex flex-col justify-end">
            <span class="font-serif-luxury font-bold text-white leading-snug line-clamp-2 text-xs sm:text-sm drop-shadow">
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
        <div class="flex items-center justify-center gap-2 text-[#f3d9b4] mb-0.5">
          <span class="text-base transform -rotate-12 select-none">♡</span>
          <h2 class="font-cursive text-2xl sm:text-3xl text-[#f3d9b4] tracking-wide leading-none">
            {{ store.subheading }}
          </h2>
          <span class="text-base transform rotate-12 select-none">♡</span>
        </div>

        <h1 class="font-serif-luxury text-2xl sm:text-3xl font-extrabold tracking-widest text-[#fffdfa] uppercase drop-shadow leading-tight mt-0.5">
          {{ store.heading }}
        </h1>

        <div class="mt-1.5 flex items-center justify-center">
          <div class="h-[1px] w-10 sm:w-14 bg-gradient-to-r from-transparent to-[#d8b888]/80"></div>
          <span class="mx-2.5 px-4 py-0.5 rounded-full text-[10px] sm:text-xs font-bold tracking-widest bg-[#4a2213] border border-[#d8b888]/60 text-[#fceddb] uppercase shadow-inner">
            {{ store.badge }}
          </span>
          <div class="h-[1px] w-10 sm:w-14 bg-gradient-to-l from-transparent to-[#d8b888]/80"></div>
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
            <div class="absolute top-2 right-2 rounded-lg bg-[#2e160c]/95 text-[#fceddb] border border-[#d8b888] shadow-lg px-2 py-0.5 text-xs font-black tracking-tight leading-none backdrop-blur-sm">
              <span class="text-[9px] uppercase font-bold text-[#d8b888] mr-0.5">R$</span>
              {{ item.price }}
            </div>

            <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1a0c06]/95 via-[#1a0c06]/80 to-transparent pt-6 pb-2 px-2 text-center flex flex-col justify-end">
              <span
                class="font-serif-luxury font-bold text-white leading-snug line-clamp-2 drop-shadow"
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

    <!-- RODAPÉ CACAU NOBRE -->
    <div class="relative z-10 pt-2 border-t border-[#d8b888]/30 flex items-center justify-center gap-2 text-center text-[#fceddb]">
      <span class="text-xs">📷</span>
      <span class="font-sans text-xs sm:text-sm font-bold tracking-wide text-[#fceddb]">
        {{ store.instagram }}
      </span>
    </div>
  </div>
</template>
