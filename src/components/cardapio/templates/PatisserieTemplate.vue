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
    class="w-full h-full relative overflow-hidden flex flex-col justify-between p-6 sm:p-8 bg-[#fdfbf7] text-[#2c2420] font-sans select-none rounded-[32px] border-[3px] border-[#e4dacf] shadow-xl"
    style="min-height: 100%;"
  >
    <!-- Moldura e detalhes minimalistas -->
    <div class="absolute inset-3 sm:inset-4 rounded-[24px] border border-[#e8ded4] pointer-events-none"></div>

    <!-- CABEÇALHO PATISSERIE CHIC -->
    <div class="relative z-10 text-center mb-4 pt-1">
      <div class="flex items-center justify-center gap-2 text-[#8c6b54] mb-0.5">
        <span class="text-xs uppercase tracking-[0.3em] font-medium">Pâtisserie & Confeitaria</span>
      </div>

      <p class="font-cursive text-2xl sm:text-3xl text-[#966b4d] tracking-wide mt-1">
        {{ store.subheading }}
      </p>

      <h1 class="font-cinzel text-2xl sm:text-4xl font-bold tracking-widest text-[#2c2420] uppercase mt-0.5">
        {{ store.heading }}
      </h1>

      <div class="mt-2 flex items-center justify-center">
        <div class="h-[1px] w-12 sm:w-16 bg-[#d6c7b8]"></div>
        <span class="mx-3 px-4 py-0.5 rounded-full text-[10px] sm:text-xs font-bold tracking-widest bg-[#2c2420] text-[#fdfbf7] uppercase">
          {{ store.badge }}
        </span>
        <div class="h-[1px] w-12 sm:w-16 bg-[#d6c7b8]"></div>
      </div>
    </div>

    <!-- GRADE DE PRODUTOS PATISSERIE -->
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
          class="bg-white border border-[#e8ded4] rounded-2xl p-3 sm:p-3.5 shadow-md flex items-center justify-between gap-3 group hover:border-[#b89f8a] transition"
          :class="count <= 4 ? 'min-h-[92px] sm:min-h-[108px]' : 'min-h-[80px] sm:min-h-[90px]'"
        >
          <div class="flex items-center gap-3 min-w-0 flex-1 h-full">
            <!-- Foto -->
            <div
              class="relative shrink-0 rounded-xl overflow-hidden bg-stone-100 shadow-inner group/img border border-[#e4dacf] cursor-pointer"
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
              <div class="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-bold">
                Foto
              </div>
            </div>

            <!-- Informações -->
            <div class="flex flex-col justify-between min-w-0 flex-1 h-full py-0.5">
              <h3
                class="font-cinzel font-bold text-[#2c2420] leading-snug line-clamp-2 break-words"
                :class="count <= 4 ? 'text-xs sm:text-[14px]' : 'text-[11px] sm:text-xs'"
              >
                {{ item.name }}
              </h3>

              <div class="mt-1.5 flex items-center">
                <span class="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-md bg-[#8c6b54] text-white font-bold text-xs sm:text-[13px] shadow-sm leading-none flex items-center gap-1">
                  <span class="text-[9px] uppercase opacity-80">R$</span>
                  {{ item.price }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- RODAPÉ -->
    <div class="relative z-10 pt-3 border-t border-[#e8ded4] flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left text-[#5c4a3e]">
      <div class="flex items-center gap-2 justify-center sm:justify-start">
        <span class="text-sm">📷</span>
        <span class="text-xs sm:text-sm font-bold tracking-wide text-[#2c2420]">
          {{ store.instagram }}
        </span>
      </div>

      <div class="text-center sm:text-right">
        <span class="inline-flex items-center text-[10px] sm:text-xs text-[#8c6b54] font-medium bg-[#f5ede4] px-3 py-1 rounded-full border border-[#e4dacf]">
          {{ store.whatsapp }}
        </span>
      </div>
    </div>
  </div>
</template>
