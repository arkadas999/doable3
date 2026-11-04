<script setup lang="ts">
import { Monitor, Moon, Sun } from '@lucide/vue';
import { computed } from 'vue';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppearance } from '@/composables/useAppearance';
import type { Appearance } from '@/types';

const { appearance, resolvedAppearance, updateAppearance } = useAppearance();

const options: { value: Appearance; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'Auto', icon: Monitor },
];

const currentIcon = computed(() => {
    if (appearance.value === 'system') {
        return Monitor;
    }

    return resolvedAppearance.value === 'dark' ? Moon : Sun;
});

const currentLabel = computed(
    () => options.find((option) => option.value === appearance.value)?.label ?? 'Auto',
);
</script>

<template>
    <DropdownMenu>
        <DropdownMenuTrigger as-child>
            <Button
                variant="ghost"
                size="icon"
                class="size-10 shrink-0"
                :aria-label="`Theme: ${currentLabel}`"
            >
                <component :is="currentIcon" class="size-6" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="min-w-36 rounded-xl">
            <DropdownMenuItem
                v-for="option in options"
                :key="option.value"
                class="gap-2"
                :class="
                    appearance === option.value
                        ? 'bg-accent font-medium text-foreground'
                        : undefined
                "
                @click="updateAppearance(option.value)"
            >
                <component :is="option.icon" class="size-4" />
                {{ option.label }}
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
</template>
