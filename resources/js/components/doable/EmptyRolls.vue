<script setup lang="ts">
withDefaults(
    defineProps<{
        title: string;
        description?: string;
        compact?: boolean;
    }>(),
    { compact: false },
);
</script>

<template>
    <div
        class="flex flex-col items-center justify-center text-center"
        :class="
            compact
                ? 'rounded-2xl border border-dashed border-border px-3 py-8'
                : 'rounded-3xl border border-dashed border-border px-6 py-14'
        "
    >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 128 128"
            fill="none"
            aria-hidden="true"
            class="text-muted-foreground"
            :class="compact ? 'size-28' : 'size-36'"
        >
            <rect
                x="34"
                y="30"
                width="18"
                height="34"
                rx="9"
                fill="currentColor"
                opacity="0.28"
            />
            <ellipse
                cx="43"
                cy="30"
                rx="9"
                ry="4.5"
                fill="currentColor"
                opacity="0.55"
            />
            <path
                d="M38 38h10M38 46h10M38 54h10"
                stroke="currentColor"
                stroke-width="1.4"
                stroke-linecap="round"
                opacity="0.7"
            />
            <rect
                x="72"
                y="18"
                width="20"
                height="42"
                rx="10"
                fill="currentColor"
                opacity="0.18"
            />
            <ellipse
                cx="82"
                cy="18"
                rx="10"
                ry="5"
                stroke="currentColor"
                stroke-width="2"
            />
            <path
                d="M76 28h12M76 36h12M76 44h12"
                stroke="currentColor"
                stroke-width="1.4"
                stroke-linecap="round"
                opacity="0.65"
            />
            <path
                d="M22 62h84l-7 46a10 10 0 0 1-10 8H39a10 10 0 0 1-10-8L22 62Z"
                fill="currentColor"
                fill-opacity="0.08"
                stroke="currentColor"
                stroke-width="3"
                stroke-linejoin="round"
            />
            <path
                d="M34 80h60M37 94h54"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                opacity="0.35"
            />
            <path
                d="M16 58h96"
                stroke="currentColor"
                stroke-width="3.5"
                stroke-linecap="round"
            />
            <path
                d="M48 58V50a16 16 0 0 1 32 0v8"
                stroke="currentColor"
                stroke-width="3.5"
                stroke-linecap="round"
            />
        </svg>
        <p
            class="mt-3 font-medium text-foreground"
            :class="compact ? 'text-sm' : 'font-display text-lg'"
        >
            {{ title }}
        </p>
        <p
            v-if="description"
            class="mt-1 max-w-sm text-sm text-muted-foreground"
        >
            {{ description }}
        </p>
        <div v-if="$slots.default" class="mt-4">
            <slot />
        </div>
    </div>
</template>
