<script setup lang="ts">
import { router, usePage } from '@inertiajs/vue3';
import { onBeforeUnmount, onMounted, watch } from 'vue';
import AppContent from '@/components/AppContent.vue';
import AppShell from '@/components/AppShell.vue';
import AppSidebar from '@/components/AppSidebar.vue';
import AppSidebarHeader from '@/components/AppSidebarHeader.vue';
import { Toaster } from '@/components/ui/sonner';
import {
    applyAccountAccent,
    attachDocumentAccent,
    detachDocumentAccent,
    useAccentScope,
} from '@/lib/accent';
import type { BreadcrumbItem } from '@/types';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

withDefaults(defineProps<Props>(), {
    breadcrumbs: () => [],
});

const page = usePage();
const accent = useAccentScope();

watch(
    () => page.props.auth?.user?.accent,
    (choice) => {
        applyAccountAccent(choice);
    },
    { immediate: true },
);

attachDocumentAccent();
onBeforeUnmount(() => {
    detachDocumentAccent();
});

// Detect the browser timezone once and persist it so streaks / "today" /
// overdue are evaluated in the user's local day rather than server UTC.
onMounted(() => {
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (browserTimezone && page.props.auth.user.timezone !== browserTimezone) {
        router.patch(
            '/preferences/timezone',
            { timezone: browserTimezone },
            { preserveScroll: true, preserveState: true },
        );
    }
});
</script>

<template>
    <div
        class="accent-scope flex min-h-svh w-full flex-col bg-background"
        :data-accent-light="accent.light.value ? 'true' : undefined"
        :style="accent.style.value"
    >
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" class="overflow-x-hidden">
                <AppSidebarHeader :breadcrumbs="breadcrumbs" />
                <slot />
            </AppContent>
            <Toaster position="bottom-center" />
        </AppShell>
    </div>
</template>
