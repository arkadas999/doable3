<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    priority: number;
}>();

const level = computed(() => {
    if (props.priority >= 3) {
        return 3;
    }

    if (props.priority === 2) {
        return 2;
    }

    if (props.priority === 1) {
        return 1;
    }

    return 0;
});

const label = computed(
    () => ['Normal', 'Medium', 'High', 'Urgent'][level.value],
);
</script>

<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="none"
        class="priority-mark size-4 shrink-0"
        :class="`tone-${level}`"
        :aria-label="label"
        role="img"
    >
        <title>{{ label }}</title>
        <circle
            v-if="level === 0"
            cx="8"
            cy="8"
            r="4.25"
            stroke="currentColor"
            stroke-width="1.6"
        />
        <path
            v-else-if="level === 1"
            d="M3.25 10.25 8 5.5l4.75 4.75"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
        <path
            v-else-if="level === 2"
            d="M3.5 13.25V3.25h6.4L8.2 6.1l1.7 2.85H3.5"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linejoin="round"
        />
        <path
            v-else
            d="M9.1 1.4 3.6 8.2h3.2L6.2 14.6l6.4-7.5H9.3L9.1 1.4Z"
            fill="currentColor"
        />
    </svg>
</template>

<style scoped>
.tone-0 {
    color: color-mix(in oklab, var(--primary) 34%, var(--muted-foreground));
}

.tone-1 {
    color: color-mix(in oklab, var(--primary) 72%, var(--muted-foreground));
}

.tone-2 {
    color: var(--primary);
}

.tone-3 {
    color: color-mix(in oklab, var(--primary) 68%, white);
}
</style>
