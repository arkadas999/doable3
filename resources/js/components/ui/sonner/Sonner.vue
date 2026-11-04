<script lang="ts" setup>
import type { ToasterProps } from "vue-sonner"
import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon, XIcon } from "@lucide/vue"
import { onMounted, onUnmounted, ref } from "vue"
import { Toaster as Sonner } from "vue-sonner"
import { cn } from "@/lib/utils"

import 'vue-sonner/style.css';

const props = withDefaults(defineProps<ToasterProps>(), {
    position: 'bottom-center',
    richColors: false,
    closeButton: false,
})
const theme = ref<'light' | 'dark'>('light')
let observer: MutationObserver | null = null

function syncTheme(): void {
    theme.value = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

onMounted(() => {
    syncTheme()
    observer = new MutationObserver(syncTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})

onUnmounted(() => {
    observer?.disconnect()
})
</script>

<template>
  <Sonner
    v-bind="props"
    :theme="theme"
    :class="cn('toaster group', props.class)"
    :style="{
      '--normal-bg': 'var(--card)',
      '--normal-text': 'var(--foreground)',
      '--normal-border': 'var(--border)',
      '--border-radius': '1rem',
      '--action-bg': 'var(--primary)',
      '--action-text': 'var(--primary-foreground)',
    }"
  >
    <template #success-icon>
      <CircleCheckIcon class="size-4 text-emerald-500" />
    </template>
    <template #info-icon>
      <InfoIcon class="size-4 text-blue-500" />
    </template>
    <template #warning-icon>
      <TriangleAlertIcon class="size-4 text-amber-500" />
    </template>
    <template #error-icon>
      <OctagonXIcon class="size-4 text-destructive" />
    </template>
    <template #loading-icon>
      <div>
        <Loader2Icon class="size-4 animate-spin text-primary" />
      </div>
    </template>
    <template #close-icon>
      <XIcon class="size-4 text-muted-foreground hover:text-foreground" />
    </template>
  </Sonner>
</template>
