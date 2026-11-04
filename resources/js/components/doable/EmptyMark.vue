<script setup lang="ts">
const props = defineProps<{
    title: string;
    center?: boolean;
}>();

const pick = Math.floor(Math.random() * 15);
</script>

<template>
    <div
        class="text-muted-foreground"
        :class="
            props.center
                ? 'flex flex-col items-center gap-3 px-4 py-8 text-center'
                : 'flex items-center gap-2.5 px-1 py-2'
        "
    >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            fill="none"
            aria-hidden="true"
            class="shrink-0"
            :class="props.center ? 'size-14' : 'size-10'"
        >
            <template v-if="pick === 0">
                <path
                    d="M9 7.5h9.5L23 12v12.5a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-15a2 2 0 0 1 2-2Z"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linejoin="round"
                />
                <path
                    d="M18 7.5V12h5M11 16.5h8M11 20.5h5"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linecap="round"
                />
            </template>
            <template v-else-if="pick === 1">
                <path
                    d="M16 26c0-6 4.5-8.5 8.5-9.5-1 6-4.2 9.5-8.5 9.5Z"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linejoin="round"
                />
                <path
                    d="M16 26C16 18 11 13 7 11c1.2 7 4.5 11 9 15Z"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linejoin="round"
                />
                <path
                    d="M16 26V8"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linecap="round"
                />
            </template>
            <template v-else-if="pick === 2">
                <path
                    d="M20.5 7.5a8.5 8.5 0 1 0 4 12.5 7 7 0 0 1-4-12.5Z"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linejoin="round"
                />
            </template>
            <template v-else-if="pick === 3">
                <path
                    d="M10 12h12v3.2a6 6 0 0 1-12 0V12Z"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linejoin="round"
                />
                <path
                    d="M12 12V9.5A2.5 2.5 0 0 1 14.5 7H16M10 15H8.5A2.5 2.5 0 0 0 8.5 20H10M22 15h1.5a2.5 2.5 0 0 1 0 5H22"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linecap="round"
                />
            </template>
            <template v-else-if="pick === 4">
                <path
                    d="M16 6.5l2.2 5.4 5.8.5-4.4 3.7 1.4 5.6L16 18.8 11 21.7l1.4-5.6L8 12.4l5.8-.5L16 6.5Z"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linejoin="round"
                />
            </template>
            <template v-else-if="pick === 5">
                <path
                    d="M11 21.5h11.5a4.5 4.5 0 0 0 .4-9 6 6 0 0 0-11.5-1.2A3.8 3.8 0 0 0 11 21.5Z"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linejoin="round"
                />
            </template>
            <template v-else-if="pick === 6">
                <path
                    d="M16 25.5V14"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linecap="round"
                />
                <path
                    d="M16 17c-2.2-1.2-5-1-7 .4 1.6.2 3.4 1.2 4.4 2.8M16 14.5c2-1.6 5-1.8 7.2-.2-1.5.4-3.5 1.6-4.6 3.2"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
                <path
                    d="M12 25.5h8"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linecap="round"
                />
            </template>
            <template v-else-if="pick === 7">
                <path
                    d="M11 6.5h10a1 1 0 0 1 1 1V25l-6-3.2L10 25V7.5a1 1 0 0 1 1-1Z"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linejoin="round"
                />
            </template>
            <template v-else-if="pick === 8">
                <circle
                    cx="16"
                    cy="16"
                    r="7.5"
                    stroke="currentColor"
                    stroke-width="1.7"
                />
                <circle cx="16" cy="16" r="2" fill="currentColor" />
            </template>
            <template v-else-if="pick === 9">
                <path
                    d="M10 23.5c4-1 7.5-4.2 9.2-8.6 1.2-3.1 3.4-5.4 6.3-6.6-3.6.2-6.4 1.6-8.2 4.2C15.2 16 12.6 19.6 9 22.2"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
                <path
                    d="M11.5 18.5c1.2.2 2.2 1 2.8 2"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linecap="round"
                />
            </template>
            <template v-else-if="pick === 10">
                <path
                    d="M6.5 16.5 25 8.5l-6.2 16.2-3.2-5.2-9.1-3Z"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linejoin="round"
                />
                <path
                    d="M15.6 19.5 25 8.5"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linejoin="round"
                />
            </template>
            <template v-else-if="pick === 11">
                <path
                    d="M16 6v4.5M16 21.5V26M6 16h4.5M21.5 16H26M9.2 9.2l3.2 3.2M19.6 19.6l3.2 3.2M22.8 9.2l-3.2 3.2M12.4 19.6l-3.2 3.2"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linecap="round"
                />
            </template>
            <template v-else-if="pick === 12">
                <path
                    d="M9 18c0-5 3.1-9 7-9s7 4 7 9c0 3.2-2.2 6.5-7 6.5S9 21.2 9 18Z"
                    stroke="currentColor"
                    stroke-width="1.7"
                />
                <path
                    d="M12 17.5c.8 2 2.2 3.2 4 3.2s3.2-1.2 4-3.2"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linecap="round"
                />
            </template>
            <template v-else-if="pick === 13">
                <path
                    d="M8 20.5 16 7l8 13.5H8Z"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linejoin="round"
                />
                <path
                    d="M16 20.5v5"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linecap="round"
                />
            </template>
            <template v-else>
                <path
                    d="M16 6.5c2.4 3.6 5.5 6.2 5.5 9.6a5.5 5.5 0 0 1-11 0c0-3.4 3.1-6 5.5-9.6Z"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linejoin="round"
                />
            </template>
        </svg>
        <p class="text-sm">{{ title }}</p>
        <div v-if="$slots.default">
            <slot />
        </div>
    </div>
</template>
