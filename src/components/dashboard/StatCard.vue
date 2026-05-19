<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Component } from 'vue'

defineProps<{
  title: string
  value: string
  subtitle?: string
  icon?: Component
  accent?: 'default' | 'revenue' | 'profit'
}>()
</script>

<template>
  <Card class="overflow-hidden">
    <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle class="text-sm font-medium text-muted-foreground">{{ title }}</CardTitle>
      <component
        :is="icon"
        v-if="icon"
        class="size-4 text-muted-foreground"
      />
    </CardHeader>
    <CardContent>
      <div
        class="text-2xl font-bold tracking-tight"
        :class="{
          'text-primary': accent === 'revenue',
          'text-emerald-600 dark:text-emerald-400': accent === 'profit',
        }"
      >
        {{ value }}
      </div>
      <p v-if="subtitle" class="mt-1 text-xs text-muted-foreground">{{ subtitle }}</p>
    </CardContent>
  </Card>
</template>
