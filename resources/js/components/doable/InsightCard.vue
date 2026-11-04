<script setup lang="ts">
import {
    CalendarDays,
    Clock,
    Flame,
    Sparkles,
    TriangleAlert,
} from '@lucide/vue';
import { computed } from 'vue';

interface Insight {
    type: string;
    tone: string;
    title: string;
    message: string;
}

const props = defineProps<{ insight: Insight }>();

const tone = computed(() => {
    switch (props.insight.tone) {
        case 'positive':
            return 'var(--primary)';
        case 'warning':
            return 'hsl(16 78% 52%)';
        default:
            return 'hsl(202 48% 46%)';
    }
});

const icon = computed(() => {
    switch (props.insight.type) {
        case 'overdue':
            return Clock;
        case 'streak_at_risk':
            return Flame;
        case 'overloaded_important':
            return TriangleAlert;
        case 'focus':
            return Sparkles;
        default:
            return CalendarDays;
    }
});
</script>

<template>
    <div
        class="flex gap-3 rounded-2xl border p-4"
        :class="insight.type === 'focus' ? 'focus-insight' : undefined"
        :style="{
            '--tone': tone,
            backgroundColor:
                insight.type === 'focus'
                    ? undefined
                    : 'color-mix(in oklab, var(--tone) 9%, var(--card))',
            borderColor:
                insight.type === 'focus'
                    ? undefined
                    : 'color-mix(in oklab, var(--tone) 26%, var(--card))',
        }"
    >
        <div
            class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl"
            :style="{
                backgroundColor:
                    'color-mix(in oklab, var(--tone) 16%, var(--card))',
                color: 'var(--tone)',
            }"
        >
            <component :is="icon" class="size-5" />
        </div>
        <div class="min-w-0">
            <p
                class="font-display text-base leading-tight font-semibold text-foreground"
            >
                {{ insight.title }}
            </p>
            <p class="mt-0.5 text-sm text-muted-foreground">
                {{ insight.message }}
            </p>
        </div>
    </div>
</template>
