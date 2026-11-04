<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import AppearanceTabs from '@/components/AppearanceTabs.vue';
import Heading from '@/components/Heading.vue';
import { accentPresets, storeAccent, useAccentScope, type AccentPresetId } from '@/lib/accent';
import { edit } from '@/routes/appearance';

defineOptions({
    layout: {
        breadcrumbs: [
            {
                title: 'Appearance settings',
                href: edit(),
            },
        ],
    },
});

const accent = useAccentScope();

function selectPreset(id: AccentPresetId, hex: string) {
    storeAccent(hex, id);
}
</script>

<template>
    <Head title="Appearance settings" />

    <h1 class="sr-only">Appearance settings</h1>

    <div class="space-y-6">
        <Heading
            variant="small"
            title="Appearance settings"
            description="Update the appearance settings for your account"
        />
        <AppearanceTabs />

        <div class="space-y-3">
            <div>
                <h2 class="text-sm font-medium text-foreground">Accent color</h2>
                <p class="text-sm text-muted-foreground">
                    Used across your account. Home, log in, sign up, and sign
                    out stay blue.
                </p>
            </div>

            <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <button
                    v-for="preset in accentPresets"
                    :key="preset.id"
                    type="button"
                    class="flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-colors"
                    :class="
                        accent.choice.value === preset.id
                            ? 'border-primary bg-primary/10 font-medium text-foreground ring-2 ring-primary'
                            : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground'
                    "
                    :aria-pressed="accent.choice.value === preset.id"
                    @click="selectPreset(preset.id, preset.hex)"
                >
                    <span
                        class="size-5 shrink-0 rounded-full ring-1 ring-black/10"
                        :style="{ backgroundColor: preset.hex }"
                    />
                    {{ preset.label }}
                </button>
            </div>
        </div>
    </div>
</template>
