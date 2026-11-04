<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import AppLogoIcon from '@/components/AppLogoIcon.vue';
import PublicStage from '@/components/PublicStage.vue';
import ThemeSwitcher from '@/components/ThemeSwitcher.vue';
import { home, login, register } from '@/routes';

defineProps<{
    title?: string;
    description?: string;
}>();
</script>

<template>
    <PublicStage>
        <template #brand>
            <Link :href="home()" class="flex min-w-0 items-center gap-2 font-medium">
                <AppLogoIcon class="size-9 shrink-0 text-primary" />
                <span
                    class="truncate font-display text-xl leading-none font-semibold tracking-tight lowercase sm:text-2xl"
                    >doable</span
                >
            </Link>
        </template>
        <template #actions>
            <Link
                :href="login()"
                class="rounded-full px-2.5 py-2 text-sm font-medium text-foreground hover:bg-foreground/5 sm:px-3"
            >
                Log in
            </Link>
            <Link
                :href="register()"
                class="rounded-full bg-primary px-3 py-2 text-sm font-medium text-primary-foreground sm:px-4"
            >
                Sign up
            </Link>
            <ThemeSwitcher />
        </template>

        <div
            class="public-frame relative z-10 flex flex-1 items-center justify-center py-6 sm:py-10"
        >
            <div
                class="glass-panel public-rise w-full max-w-md rounded-3xl px-5 py-7 sm:px-8 sm:py-8"
            >
                <div class="mb-6 flex flex-col items-center gap-3 text-center">
                    <AppLogoIcon class="size-11 text-primary" />
                    <div class="space-y-2">
                        <h1 class="font-display text-2xl font-semibold tracking-tight">
                            {{ title }}
                        </h1>
                        <p class="text-sm text-muted-foreground">
                            {{ description }}
                        </p>
                    </div>
                </div>
                <slot />
            </div>
        </div>
    </PublicStage>
</template>
