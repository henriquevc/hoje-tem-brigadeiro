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
    class="w-full h-full relative overflow-hidden flex flex-col justify-between p-5 sm:p-7 bg-[#2e160c] text-white font-sans select-none rounded-[28px] border-[3px] border-[#d8b888]/80 shadow-2xl"
    style="min-height: 100%;"
  >
    <!-- Moldura interna fina dourada -->
    <div class="absolute inset-2 sm:inset-3 rounded-[22px] border border-[#d8b888]/40 pointer-events-none"></div>

    <!-- CABEÇALHO CACAU NOBRE -->
    <div class="relative z-10 text-center mb-3 pt-1">
      <div class="flex items-center justify-center gap-3 text-[#f3d9b4] mb-0.5">
        <span class="text-xl transform -rotate-12 select-none">♡</span>
        <h2 class="font-cursive text-3xl sm:text-4xl text-[#f3d9b4] tracking-wide leading-none">
          {{ store.subheading }}
        </h2>
        <span class="text-xl transform rotate-12 select-none">♡</span>
      </div>

      <h1 class="font-serif-luxury text-3xl sm:text-4xl font-extrabold tracking-widest text-[#fffdfa] uppercase drop-shadow mt-1">
        {{ store.heading }}
      </h1>

      <div class="mt-2.5 flex items-center justify-center">
        <div class="h-[1px] w-12 sm:w-16 bg-gradient-to-r from-transparent to-[#d8b888]/80"></div>
        <span class="mx-3 px-5 py-0.5 rounded-full text-xs font-bold tracking-widest bg-[#4a2213] border border-[#d8b888]/60 text-[#fceddb] uppercase shadow-inner">
          {{ store.badge }}
        </span>
        <div class="h-[1px] w-12 sm:w-16 bg-gradient-to-l from-transparent to-[#d8b888]/80"></div>
      </div>
    </div>

    <!-- GRADE DE PRODUTOS CACAU NOBRE -->
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
          class="bg-[#f3e3d3] text-[#33190e] rounded-2xl p-3 sm:p-3.5 shadow-lg flex items-center justify-between gap-3 border border-[#dfc8b2] hover:border-[#b88c63] transition group"
          :class="count <= 4 ? 'min-h-[92px] sm:min-h-[108px]' : 'min-h-[80px] sm:min-h-[90px]'"
        >
          <!-- Lado Esquerdo: Nome e Pílula de Preço -->
          <div class="flex flex-col justify-between min-w-0 flex-1 h-full py-0.5">
            <h3
              class="font-serif-luxury font-bold text-[#2e160c] leading-snug line-clamp-2 break-words"
              :class="count <= 4 ? 'text-xs sm:text-[14px]' : 'text-[11px] sm:text-xs'"
            >
              {{ item.name }}
            </h3>

            <div class="mt-1.5 flex items-center">
              <span class="inline-flex items-center px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg bg-[#3b1c10] text-[#faeee1] text-[11px] sm:text-xs font-black shadow-inner leading-none tracking-tight">
                R$ {{ item.price }}
              </span>
            </div>
          </div>

          <!-- Lado Direito: Foto Quadrada do Produto -->
          <div
            class="relative shrink-0 rounded-xl overflow-hidden border border-[#d4bca4] bg-stone-900 shadow-md group/img cursor-pointer"
            :class="count <= 4 ? 'size-18 sm:size-22' : 'size-15 sm:size-18'"
            @click="$emit('selectPhoto', item)"
          >
            <img
              :src="item.image"
              :alt="item.name"
              class="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
              :style="{
                transform: `scale(${item.zoom || 1})`,
                objectPosition: `${item.positionX ?? 50}% ${item.positionY ?? 50}%`,
              }"
            />
            <!-- Overlay de clique -->
            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-bold text-center p-1">
              Trocar Foto
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- RODAPÉ CACAU NOBRE -->
    <div class="relative z-10 pt-2.5 mt-1 border-t border-[#d8b888]/30 flex items-center justify-center gap-2 text-center text-[#fceddb]">
      <span class="text-sm">📷</span>
      <span class="font-sans text-xs sm:text-sm font-bold tracking-wide text-[#fceddb]">
        {{ store.instagram }}
      </span>
    </div>
  </div>
</template>
