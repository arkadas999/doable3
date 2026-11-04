<script setup lang="ts">
import { Link, router } from '@inertiajs/vue3';
import { LogOut, Settings } from '@lucide/vue';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import UserInfo from '@/components/UserInfo.vue';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import type { User } from '@/types';

type Props = {
    user: User;
};

const emit = defineEmits<{
    navigate: [];
}>();

const handleLogout = () => {
    emit('navigate');
    router.flushAll();
};

defineProps<Props>();
</script>

<template>
    <DropdownMenuLabel class="p-0 font-normal">
        <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <UserInfo :user="user" :show-email="true" />
        </div>
    </DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuGroup>
        <DropdownMenuItem :as-child="true" class="rounded-lg px-2 py-2">
            <Link
                class="flex w-full cursor-pointer items-center gap-3"
                :href="edit()"
                prefetch
                @click="emit('navigate')"
            >
                <span class="flex size-8 items-center justify-center rounded-lg bg-muted text-foreground">
                    <Settings class="size-4 !text-foreground" />
                </span>
                Settings
            </Link>
        </DropdownMenuItem>
    </DropdownMenuGroup>
    <DropdownMenuSeparator />
    <DropdownMenuItem :as-child="true" class="rounded-lg px-2 py-2">
        <Link
            class="flex w-full cursor-pointer items-center gap-3"
            :href="logout()"
            @click="handleLogout"
            as="button"
            data-test="logout-button"
        >
            <span class="flex size-8 items-center justify-center rounded-lg bg-destructive/15 text-destructive">
                <LogOut class="size-4 !text-destructive" />
            </span>
            Log out
        </Link>
    </DropdownMenuItem>
</template>
