<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { MARK_CHECK, MARK_RING } from '@/lib/mark';

defineOptions({
    inheritAttrs: false,
});

type Props = {
    className?: HTMLAttributes['class'];
};

defineProps<Props>();
</script>

<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
        class="app-mark"
        :class="className"
        v-bind="$attrs"
    >
        <rect
            x="1.5"
            y="1.5"
            width="61"
            height="61"
            rx="18"
            fill="currentColor"
            fill-opacity="0.16"
        />
        <path
            :d="MARK_RING"
            stroke="currentColor"
            stroke-width="6.5"
            stroke-linecap="round"
        />
        <path
            :d="MARK_CHECK"
            stroke="currentColor"
            stroke-width="6.5"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
    </svg>
</template>
