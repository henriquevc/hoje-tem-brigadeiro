import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type CardapioTemplateId =
  | 'kraft'
  | 'cacau-nobre'
  | 'gourmet-warm'
  | 'minimal-chic'
  | 'rose-gold'

export type CardapioFormat = 'feed' | 'story'

export interface CardapioItem {
  id: string
  name: string
  price: string
  image: string
  alt?: string
  zoom?: number
  positionX?: number
  positionY?: number
}

export interface CardapioPreset {
  id: string
  title: string
  createdAt: string
  templateId: CardapioTemplateId
  format: CardapioFormat
  subheading: string
  heading: string
  badge: string
  phrase: string
  instagram: string
  whatsapp: string
  notice: string
  items: CardapioItem[]
}

const STORAGE_KEY = 'htb_cardapio_state_v1'
const PRESETS_KEY = 'htb_cardapio_presets_v1'

export const defaultCatalogPool: CardapioItem[] = [
  {
    id: 'prod-1',
    name: 'Mini bolo de Laranja',
    price: '13,00',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=85',
    alt: 'Mini bolo caseiro de laranja com calda brilhante',
    zoom: 1,
    positionX: 50,
    positionY: 50,
  },
  {
    id: 'prod-2',
    name: 'Mini bolo Cocada',
    price: '15,00',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=85',
    alt: 'Mini bolo com cobertura de coco tostado',
    zoom: 1,
    positionX: 50,
    positionY: 50,
  },
  {
    id: 'prod-3',
    name: 'Bolachinhas de Nata (120g)',
    price: '15,00',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=85',
    alt: 'Biscoitinhos delicados de nata amanteigados',
    zoom: 1,
    positionX: 50,
    positionY: 50,
  },
  {
    id: 'prod-4',
    name: 'Caixa 8 Brigadeiros Festa',
    price: '20,00',
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=85',
    alt: 'Caixa de brigadeiros gourmet',
    zoom: 1,
    positionX: 50,
    positionY: 50,
  },
  {
    id: 'prod-5',
    name: 'Bolo de Banana Caramelizada',
    price: '35,00',
    image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=600&q=85',
    alt: 'Bolo invertido de banana fatiada',
    zoom: 1,
    positionX: 50,
    positionY: 50,
  },
  {
    id: 'prod-6',
    name: 'Pudim (1kg)',
    price: '60,00',
    image: 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?auto=format&fit=crop&w=600&q=85',
    alt: 'Pudim de leite com calda caramelizada',
    zoom: 1,
    positionX: 50,
    positionY: 50,
  },
]

export const useCardapioStore = defineStore('cardapio', () => {
  const templateId = ref<CardapioTemplateId>('kraft')
  const format = ref<CardapioFormat>('feed')
  
  const subheading = ref('Cardápio')
  const heading = ref('do dia')
  const badge = ref('CARDÁPIO')
  const phrase = ref('Feito com carinho para adoçar o seu dia! ♥')
  const instagram = ref('@hojetembrigadeiro_')
  const whatsapp = ref('Encomendas pelo Direct ou WhatsApp')
  const notice = ref('Disponibilidade para hoje!')

  const items = ref<CardapioItem[]>(JSON.parse(JSON.stringify(defaultCatalogPool.slice(0, 4))))
  const presets = ref<CardapioPreset[]>([])

  // Carrega estado persistido
  function loadPersistedState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.templateId) templateId.value = parsed.templateId
        if (parsed.format) format.value = parsed.format
        if (parsed.subheading !== undefined) subheading.value = parsed.subheading
        if (parsed.heading !== undefined) heading.value = parsed.heading
        if (parsed.badge !== undefined) badge.value = parsed.badge
        if (parsed.phrase !== undefined) phrase.value = parsed.phrase
        if (parsed.instagram !== undefined) instagram.value = parsed.instagram
        if (parsed.whatsapp !== undefined) whatsapp.value = parsed.whatsapp
        if (parsed.notice !== undefined) notice.value = parsed.notice
        if (Array.isArray(parsed.items) && parsed.items.length > 0) {
          items.value = parsed.items
        }
      }

      const savedPresets = localStorage.getItem(PRESETS_KEY)
      if (savedPresets) {
        presets.value = JSON.parse(savedPresets)
      }
    } catch (e) {
      console.warn('Erro ao carregar cardápio do armazenamento:', e)
    }
  }

  // Persiste estado sempre que alterado
  function persistState() {
    try {
      const stateToSave = {
        templateId: templateId.value,
        format: format.value,
        subheading: subheading.value,
        heading: heading.value,
        badge: badge.value,
        phrase: phrase.value,
        instagram: instagram.value,
        whatsapp: whatsapp.value,
        notice: notice.value,
        items: items.value,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave))
    } catch (e) {
      console.warn('Erro ao persistir cardápio:', e)
    }
  }

  watch([templateId, format, subheading, heading, badge, phrase, instagram, whatsapp, notice, items], persistState, {
    deep: true,
  })

  // Ações de itens
  function addItem(custom?: Partial<CardapioItem>) {
    if (items.value.length >= 10) return false

    const nextIndex = items.value.length
    const fallbackTemplate = defaultCatalogPool[nextIndex % defaultCatalogPool.length] || {
      name: `Doce Especial ${nextIndex + 1}`,
      price: '16,00',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=85',
      alt: 'Doce gourmet',
      zoom: 1,
      positionX: 50,
      positionY: 50,
    }

    const newItem: CardapioItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: custom?.name || fallbackTemplate.name,
      price: custom?.price || fallbackTemplate.price,
      image: custom?.image || fallbackTemplate.image,
      alt: custom?.alt || fallbackTemplate.alt,
      zoom: custom?.zoom ?? 1,
      positionX: custom?.positionX ?? 50,
      positionY: custom?.positionY ?? 50,
    }

    items.value.push(newItem)
    return true
  }

  function removeItem(id: string) {
    if (items.value.length <= 1) return false
    items.value = items.value.filter((i) => i.id !== id)
    return true
  }

  function moveItem(index: number, direction: 'up' | 'down') {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= items.value.length) return
    const temp = items.value[index]
    items.value[index] = items.value[targetIndex]
    items.value[targetIndex] = temp
  }

  function updateItem(id: string, partial: Partial<CardapioItem>) {
    const item = items.value.find((i) => i.id === id)
    if (item) {
      Object.assign(item, partial)
    }
  }

  function setTemplate(newTemplate: CardapioTemplateId) {
    templateId.value = newTemplate

    // Ajusta títulos padrões inteligentes de acordo com o template
    if (newTemplate === 'kraft') {
      if (subheading.value === 'Hoje tem') subheading.value = 'Cardápio'
      if (heading.value === 'BRIGADEIRO') heading.value = 'do dia'
      if (!phrase.value) phrase.value = 'Feito com carinho para adoçar o seu dia! ♥'
    } else if (newTemplate === 'cacau-nobre' || newTemplate === 'gourmet-warm') {
      if (subheading.value === 'Cardápio') subheading.value = 'Hoje tem'
      if (heading.value === 'do dia') heading.value = 'BRIGADEIRO'
    }
  }

  function setFormat(newFormat: CardapioFormat) {
    format.value = newFormat
  }

  // Gestão de Presets
  function saveCurrentAsPreset(title: string) {
    const newPreset: CardapioPreset = {
      id: `preset-${Date.now()}`,
      title: title.trim() || `Cardápio de ${new Date().toLocaleDateString('pt-BR')}`,
      createdAt: new Date().toISOString(),
      templateId: templateId.value,
      format: format.value,
      subheading: subheading.value,
      heading: heading.value,
      badge: badge.value,
      phrase: phrase.value,
      instagram: instagram.value,
      whatsapp: whatsapp.value,
      notice: notice.value,
      items: JSON.parse(JSON.stringify(items.value)),
    }

    presets.value.unshift(newPreset)
    try {
      localStorage.setItem(PRESETS_KEY, JSON.stringify(presets.value))
    } catch (e) {
      console.warn('Erro ao salvar preset:', e)
    }
    return newPreset
  }

  function loadPreset(presetId: string) {
    const preset = presets.value.find((p) => p.id === presetId)
    if (!preset) return false

    templateId.value = preset.templateId
    format.value = preset.format
    subheading.value = preset.subheading
    heading.value = preset.heading
    badge.value = preset.badge
    phrase.value = preset.phrase || ''
    instagram.value = preset.instagram
    whatsapp.value = preset.whatsapp
    notice.value = preset.notice || ''
    items.value = JSON.parse(JSON.stringify(preset.items))
    return true
  }

  function deletePreset(presetId: string) {
    presets.value = presets.value.filter((p) => p.id !== presetId)
    try {
      localStorage.setItem(PRESETS_KEY, JSON.stringify(presets.value))
    } catch (e) {
      console.warn('Erro ao remover preset:', e)
    }
  }

  function resetToDefaults() {
    templateId.value = 'kraft'
    format.value = 'feed'
    subheading.value = 'Cardápio'
    heading.value = 'do dia'
    badge.value = 'CARDÁPIO'
    phrase.value = 'Feito com carinho para adoçar o seu dia! ♥'
    instagram.value = '@hojetembrigadeiro_'
    whatsapp.value = 'Encomendas pelo Direct ou WhatsApp'
    notice.value = 'Disponibilidade para hoje!'
    items.value = JSON.parse(JSON.stringify(defaultCatalogPool.slice(0, 4)))
  }

  loadPersistedState()

  return {
    templateId,
    format,
    subheading,
    heading,
    badge,
    phrase,
    instagram,
    whatsapp,
    notice,
    items,
    presets,
    addItem,
    removeItem,
    moveItem,
    updateItem,
    setTemplate,
    setFormat,
    saveCurrentAsPreset,
    loadPreset,
    deletePreset,
    resetToDefaults,
  }
})
