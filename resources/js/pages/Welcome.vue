<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import { CalendarCheck, RotateCcw, Sparkles } from '@lucide/vue';
import AppLogoIcon from '@/components/AppLogoIcon.vue';
import PublicStage from '@/components/PublicStage.vue';
import ThemeSwitcher from '@/components/ThemeSwitcher.vue';
import { dashboard, login, register } from '@/routes';

const habits = [true, true, true, false, false, false, false];

const notes = [
    {
        title: 'Today stays short',
        copy: 'What is due now sits in front. Everything else waits its turn.',
        icon: CalendarCheck,
    },
    {
        title: 'Habits stay quiet',
        copy: 'A small grid for the things you repeat. No second task list.',
        icon: Sparkles,
    },
    {
        title: 'Undo is right there',
        copy: 'Marking done or moving something to the bin can be undone.',
        icon: RotateCcw,
    },
];
</script>

<template>
    <Head title="Welcome" />

    <PublicStage>
        <template #brand>
            <Link href="/" class="flex min-w-0 items-center gap-2">
                <AppLogoIcon class="size-8 sm:size-9 shrink-0 text-primary" />
                <span
                    class="truncate font-display text-lg sm:text-2xl leading-none font-semibold tracking-tight lowercase"
                    >doable</span
                >
            </Link>
        </template>
        <template #actions>
            <Link
                v-if="$page.props.auth.user"
                :href="dashboard()"
                class="rounded-full bg-primary px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white transition-transform active:scale-95"
            >
                Open today
            </Link>
            <ThemeSwitcher v-if="$page.props.auth.user" />
            <template v-else>
                <Link
                    :href="login()"
                    class="rounded-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-foreground hover:bg-foreground/5 transition-colors"
                >
                    Log in
                </Link>
                <Link
                    :href="register()"
                    class="rounded-full bg-primary px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white shadow-sm hover:opacity-95 transition-all active:scale-95"
                >
                    Sign up
                </Link>
                <ThemeSwitcher />
            </template>
        </template>

        <div
            class="public-frame relative z-10 flex w-full flex-1 flex-col justify-center gap-6 sm:gap-10 py-6 sm:py-8 lg:py-12"
        >
            <main
                class="grid w-full min-w-0 items-center gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12"
            >
                <div class="min-w-0 text-left">
                    <p
                        class="public-rise text-xs sm:text-sm font-semibold tracking-[0.16em] text-primary uppercase"
                    >
                        Tasks and habits
                    </p>
                    <h1
                        class="public-title public-rise public-delay-1 mt-2 sm:mt-3 max-w-xl font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.12] font-semibold tracking-tight"
                    >
                        Keep today small, and the rest for later.
                    </h1>
                    <p
                        class="public-rise public-delay-2 mt-3 sm:mt-5 max-w-lg text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed"
                    >
                        Doable holds what needs doing now apart from what can wait,
                        and leaves daily habits visible without a long list taking
                        over the day.
                    </p>
                    <div class="public-rise public-delay-3 mt-6 sm:mt-8 flex flex-wrap items-center gap-3">
                        <Link
                            v-if="$page.props.auth.user"
                            :href="dashboard()"
                            class="inline-flex w-full sm:w-auto items-center justify-center rounded-full bg-primary px-5 py-3 text-sm sm:text-base font-medium text-white shadow-lg shadow-primary/20 active:scale-95 transition-transform"
                        >
                            Open today
                        </Link>
                        <template v-else>
                            <Link
                                :href="register()"
                                class="inline-flex flex-1 sm:flex-initial items-center justify-center rounded-full bg-primary px-5 py-3 text-sm sm:text-base font-medium text-white shadow-lg shadow-primary/20 active:scale-95 transition-transform text-center"
                            >
                                Create account
                            </Link>
                            <Link
                                :href="login()"
                                class="glass-panel inline-flex flex-1 sm:flex-initial items-center justify-center rounded-full px-5 py-3 text-sm sm:text-base font-medium text-center active:scale-95 transition-transform text-foreground"
                            >
                                Log in
                            </Link>
                        </template>
                    </div>
                </div>

                <div class="public-rise public-delay-4 min-w-0 mt-2 sm:mt-0">
                    <div class="sm:public-float glass-panel rounded-2xl sm:rounded-[1.75rem] p-4 sm:p-5" aria-hidden="true">
                        <div class="flex items-center justify-between px-1">
                            <p class="text-xs sm:text-sm font-semibold">Today</p>
                            <span class="text-xs text-muted-foreground font-medium">3 open</span>
                        </div>
                        <ul class="mt-3 space-y-2">
                            <li class="public-row">
                                <span class="public-tick shrink-0">
                                    <svg viewBox="0 0 24 24" class="size-4">
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="8.5"
                                            class="public-tick-ring"
                                        />
                                        <path
                                            d="M7.8 12.4 10.6 15.2 16.4 9"
                                            class="public-tick-mark"
                                        />
                                    </svg>
                                </span>
                                <span class="min-w-0 flex-1 truncate text-xs sm:text-sm font-medium">Write the note</span>
                                <span class="public-chip">Now</span>
                            </li>
                            <li class="public-row">
                                <span class="public-ring shrink-0" />
                                <span class="min-w-0 flex-1 truncate text-xs sm:text-sm font-medium">Walk the block</span>
                                <span class="public-chip">Now</span>
                            </li>
                            <li class="public-row public-row-later">
                                <span class="public-ring shrink-0" />
                                <span class="min-w-0 flex-1 truncate text-xs sm:text-sm font-medium">Reply to Sam</span>
                                <span class="public-chip">Later</span>
                            </li>
                        </ul>

                        <div class="mt-4 border-t border-border/40 px-1 pt-3 sm:pt-4">
                            <p class="text-xs sm:text-sm font-semibold">Habits</p>
                            <div class="mt-2.5 sm:mt-3 flex gap-1 sm:gap-1.5">
                                <span
                                    v-for="(filled, index) in habits"
                                    :key="index"
                                    class="public-dot"
                                    :class="filled ? 'public-dot-on' : undefined"
                                    :style="{ animationDelay: `${index * 0.18}s` }"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <section class="grid w-full min-w-0 gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mt-2 sm:mt-4">
                <article
                    v-for="(note, index) in notes"
                    :key="note.title"
                    class="glass-panel public-rise rounded-2xl sm:rounded-3xl p-4 sm:p-5 transition-transform hover:-translate-y-0.5"
                    :class="`public-delay-${index + 1}`"
                >
                    <component :is="note.icon" class="size-5 text-primary" />
                    <h2 class="mt-2.5 sm:mt-3 font-display text-base sm:text-lg font-semibold">
                        {{ note.title }}
                    </h2>
                    <p class="mt-1 sm:mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">{{ note.copy }}</p>
                </article>
            </section>
        </div>
    </PublicStage>
</template>
