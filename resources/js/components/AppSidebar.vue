<script setup lang="ts">
import { Link, usePage } from '@inertiajs/vue3';
import { CreditCard, ListTodo, Sprout, Sun } from '@lucide/vue';
import { computed } from 'vue';
import AppLogo from '@/components/AppLogo.vue';
import NavMain from '@/components/NavMain.vue';
import NavUser from '@/components/NavUser.vue';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';

const page = usePage();

const mainNavItems = computed<NavItem[]>(() => {
    const items: NavItem[] = [
        {
            title: 'Today',
            href: '/dashboard',
            icon: Sun,
        },
        {
            title: 'Tasks',
            href: '/tasks',
            icon: ListTodo,
        },
        {
            title: 'Habits',
            href: '/habits',
            icon: Sprout,
        },
    ];

    if (page.props.billingEnabled) {
        items.push({
            title: 'Billing',
            href: '/billing',
            icon: CreditCard,
        });
    }

    return items;
});
</script>

<template>
    <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        size="lg"
                        as-child
                        class="group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:size-10! [&>svg]:!size-9 group-data-[collapsible=icon]:[&>svg]:!size-8"
                    >
                        <Link href="/dashboard">
                            <AppLogo />
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
            <NavMain :items="mainNavItems" />
        </SidebarContent>

        <SidebarFooter>
            <NavUser />
        </SidebarFooter>
    </Sidebar>
    <slot />
</template>
