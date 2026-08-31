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
    class="w-full h-full relative overflow-hidden flex flex-col justify-between p-6 sm:p-8 cardapio-kraft-bg text-[#361b11] font-sans select-none"
    style="min-height: 100%;"
  >
    <!-- Cantoneiras e detalhes rústicos -->
    <div class="absolute top-2 left-2 text-[#8c5e47]/30 text-xs font-caveat select-none">✧ ✦ ✧</div>
    <div class="absolute top-2 right-2 text-[#8c5e47]/30 text-xs font-caveat select-none">✧ ✦ ✧</div>
    <div class="absolute bottom-2 left-2 text-[#8c5e47]/30 text-xs font-caveat select-none">✧ ✦ ✧</div>
    <div class="absolute bottom-2 right-2 text-[#8c5e47]/30 text-xs font-caveat select-none">✧ ✦ ✧</div>

    <!-- CABEÇALHO KRAFT ARTESANAL -->
    <div class="relative z-10 w-full mb-4">
      <!-- Layout especial quando temos 3 itens (Fiel à Imagem 1 do Canva) -->
      <div v-if="count === 3" class="grid grid-cols-2 gap-4 items-center">
        <!-- Lado Esquerdo: Títulos e Pincelada -->
        <div class="flex flex-col justify-center">
          <div class="flex items-center gap-1.5 text-xs text-[#8c5e47] font-caveat">
            <span>♡</span>
            <span>doces artesanais</span>
          </div>

          <h1 class="font-serif-luxury text-3xl sm:text-4xl font-extrabold text-[#361b11] leading-tight tracking-tight mt-0.5">
            {{ store.subheading }}
          </h1>

          <div class="flex items-center gap-2 -mt-1">
            <span class="text-xs text-[#8c5e47]">♥</span>
            <span class="font-caveat text-2xl sm:text-3xl font-bold text-[#5c301e] tracking-wide">
              {{ store.heading }}
            </span>
            <span class="text-xs text-[#8c5e47]">ミ★</span>
          </div>

          <!-- Pincelada / Faixa marrom com frase de carinho -->
          <div
            v-if="store.phrase"
            class="mt-2.5 bg-[#4a2618] text-[#f7efe6] px-3.5 py-1.5 rounded-lg shadow-sm text-center transform -rotate-1 border border-[#30160d]"
          >
            <p class="font-sans text-[11px] sm:text-xs font-medium leading-snug">
              {{ store.phrase }}
            </p>
          </div>
        </div>

        <!-- Lado Direito: Item 1 com Preço Redondo e Faixa -->
        <div class="relative flex flex-col items-center">
          <!-- Card do Produto 1 -->
          <div class="relative w-full max-w-[210px] aspect-square rounded-2xl overflow-hidden border-2 border-[#d9c4aa] bg-[#2a160e] shadow-md group cursor-pointer" @click="$emit('selectPhoto', items[0])">
            <img
              :src="items[0].image"
              :alt="items[0].name"
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              :style="{
                transform: `scale(${items[0].zoom || 1})`,
                objectPosition: `${items[0].positionX ?? 50}% ${items[0].positionY ?? 50}%`,
              }"
            />
            <!-- Selo Redondo de Preço -->
            <div class="absolute top-2 right-2 rounded-full size-11 sm:size-12 bg-[#faeee1] border border-[#4a2618] flex flex-col items-center justify-center text-[#361b11] shadow-md leading-none">
              <span class="text-[8px] font-bold uppercase text-[#73432f]">R$</span>
              <span class="font-serif-luxury font-black text-xs sm:text-sm -mt-0.5">{{ items[0].price }}</span>
            </div>
            <!-- Overlay de clique -->
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
              Trocar Foto
            </div>
          </div>

          <!-- Faixa marrom do nome do produto -->
          <div class="mt-2 bg-[#4a2618] text-[#f7efe6] px-3 py-1.5 rounded-lg shadow-sm text-center max-w-[210px] w-full min-h-[38px] border border-[#30160d] flex items-center justify-center gap-1">
            <span class="font-serif-luxury text-xs sm:text-[13px] font-bold 2 break-words leading-snug">{{ items[0].name }}</span>
            <span class="text-[9px] opacity-70">♡</span>
          </div>
        </div>
      </div>

      <!-- Layout Padrão de Cabeçalho (Para 1, 2, 4+ itens) -->
      <div v-else class="text-center">
        <div class="flex items-center justify-center gap-2 text-xs text-[#8c5e47] font-caveat">
          <span>♡</span>
          <span>doces feitos à mão com amor</span>
          <span>♡</span>
        </div>

        <div class="flex items-baseline justify-center gap-2 mt-1">
          <h1 class="font-serif-luxury text-3xl sm:text-4xl font-extrabold text-[#361b11] leading-none tracking-tight">
            {{ store.subheading }}
          </h1>
          <span class="font-caveat text-3xl sm:text-4xl font-bold text-[#5c301e]">
            {{ store.heading }}
          </span>
        </div>

        <!-- Pincelada / Faixa marrom com frase de carinho -->
        <div
          v-if="store.phrase"
          class="mt-2 inline-block bg-[#4a2618] text-[#f7efe6] px-5 py-1.5 rounded-xl shadow-sm border border-[#30160d]"
        >
          <p class="font-sans text-xs sm:text-sm font-medium leading-tight">
            {{ store.phrase }}
          </p>
        </div>
      </div>
    </div>

    <!-- GRADE DE PRODUTOS KRAFT -->
    <div class="relative z-10 flex-1 flex flex-col justify-evenly my-2">
      <!-- Se temos 3 itens, renderiza apenas os itens 2 e 3 na linha inferior (pois o 1 já está no topo) -->
      <div v-if="count === 3" class="grid grid-cols-2 gap-4 mt-2">
        <div
          v-for="item in items.slice(1)"
          :key="item.id"
          class="relative flex flex-col items-center"
        >
          <!-- Card do Produto -->
          <div
            class="relative w-full max-w-[210px] aspect-square rounded-2xl overflow-hidden border-2 border-[#d9c4aa] bg-[#2a160e] shadow-md group cursor-pointer"
            @click="$emit('selectPhoto', item)"
          >
            <img
              :src="item.image"
              :alt="item.name"
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              :style="{
                transform: `scale(${item.zoom || 1})`,
                objectPosition: `${item.positionX ?? 50}% ${item.positionY ?? 50}%`,
              }"
            />
            <!-- Selo Redondo de Preço -->
            <div class="absolute top-2 right-2 rounded-full size-11 sm:size-12 bg-[#faeee1] border border-[#4a2618] flex flex-col items-center justify-center text-[#361b11] shadow-md leading-none">
              <span class="text-[8px] font-bold uppercase text-[#73432f]">R$</span>
              <span class="font-serif-luxury font-black text-xs sm:text-sm -mt-0.5">{{ item.price }}</span>
            </div>
            <!-- Overlay de clique -->
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
              Trocar Foto
            </div>
          </div>

          <!-- Faixa marrom do nome do produto -->
          <div class="mt-2 bg-[#4a2618] text-[#f7efe6] px-3 py-1.5 rounded-lg shadow-sm text-center max-w-[210px] w-full min-h-[38px] border border-[#30160d] flex items-center justify-center gap-1">
            <span class="font-serif-luxury text-xs sm:text-[13px] font-bold line-clamp-2 break-words leading-snug">{{ item.name }}</span>
            <span class="text-[9px] opacity-70">♡</span>
          </div>
        </div>
      </div>

      <!-- Para outras quantidades (1, 2, 4, 5, 6, etc.) -->
      <div
        v-else
        class="grid gap-3 sm:gap-4 w-full"
        :class="
          count === 1
            ? 'grid-cols-1 max-w-[320px] mx-auto'
            : count <= 4
            ? 'grid-cols-2 max-w-[500px] mx-auto'
            : count <= 6
            ? 'grid-cols-2 max-w-[520px] mx-auto'
            : 'grid-cols-2 sm:grid-cols-3'
        "
      >
        <div
          v-for="item in items"
          :key="item.id"
          class="relative flex flex-col items-center"
        >
          <!-- Card do Produto -->
          <div
            class="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-[#d9c4aa] bg-[#2a160e] shadow-md group cursor-pointer"
            :class="count >= 7 ? 'max-w-[150px]' : count <= 4 ? 'max-w-[220px]' : 'max-w-[190px]'"
            @click="$emit('selectPhoto', item)"
          >
            <img
              :src="item.image"
              :alt="item.name"
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              :style="{
                transform: `scale(${item.zoom || 1})`,
                objectPosition: `${item.positionX ?? 50}% ${item.positionY ?? 50}%`,
              }"
            />
            <!-- Selo Redondo de Preço -->
            <div class="absolute top-1.5 right-1.5 rounded-full size-10 sm:size-11 bg-[#faeee1] border border-[#4a2618] flex flex-col items-center justify-center text-[#361b11] shadow-md leading-none">
              <span class="text-[7px] sm:text-[8px] font-bold uppercase text-[#73432f]">R$</span>
              <span class="font-serif-luxury font-black text-xs sm:text-sm -mt-0.5">{{ item.price }}</span>
            </div>
            <!-- Overlay de clique -->
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
              Trocar Foto
            </div>
          </div>

          <!-- Faixa marrom do nome do produto -->
          <div
            class="mt-1.5 bg-[#4a2618] text-[#f7efe6] px-2.5 py-1 rounded-lg shadow-sm text-center w-full min-h-[38px] border border-[#30160d] flex items-center justify-center gap-1"
            :class="count >= 7 ? 'max-w-[150px]' : count <= 4 ? 'max-w-[220px]' : 'max-w-[190px]'"
          >
            <span class="font-serif-luxury text-xs sm:text-[13px] font-bold line-clamp-2 break-words leading-snug">{{ item.name }}</span>
            <span class="text-[8px] opacity-70">♡</span>
          </div>
        </div>
      </div>
    </div>

    <!-- RODAPÉ KRAFT -->
    <div class="relative z-10 pt-3 mt-2 border-t border-[#8c5e47]/30 flex items-center justify-between gap-2 text-[#361b11]">
      <div class="flex items-center gap-1.5">
        <span class="text-xs font-bold">📷</span>
        <span class="font-sans text-xs font-extrabold tracking-wide text-[#361b11]">
          {{ store.instagram }}
        </span>
      </div>

      <div class="text-right">
        <span class="text-[10px] sm:text-[11px] font-caveat font-bold text-[#5c301e] bg-[#faeee1] px-2.5 py-0.5 rounded-full border border-[#d9c4aa]">
          {{ store.whatsapp }}
        </span>
      </div>
    </div>
  </div>
</template>
