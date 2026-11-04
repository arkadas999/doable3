<script setup lang="ts">
import { Head, router } from '@inertiajs/vue3';
import { Flame, Pencil, Plus, RotateCcw, Trash2 } from '@lucide/vue';
import { reactive, ref } from 'vue';
import EmptyMark from '@/components/doable/EmptyMark.vue';
import HabitGrid from '@/components/doable/HabitGrid.vue';
import HabitToggle from '@/components/doable/HabitToggle.vue';
import { Button } from '@/components/ui/button';
import { dismissBinToast, moveToBin } from '@/lib/moveToBin';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BinnedHabit {
    id: number;
    name: string;
    color: string;
    deleted_at: string | null;
}

interface HabitItem {
    id: number;
    name: string;
    cadence: string;
    target_per_period: number;
    color: string;
    icon: string | null;
    position: number;
    current_streak: number;
    longest_streak: number;
    done_today: boolean;
    entries: string[];
}

const props = defineProps<{
    habits: HabitItem[];
    today: string;
    bin: BinnedHabit[];
}>();

defineOptions({
    layout: {
        breadcrumbs: [{ title: 'Habits', href: '/habits' }],
    },
});

const palette = [
    '#e2563b',
    '#e0892f',
    '#caa43a',
    '#5fa63d',
    '#2f9e8f',
    '#3f7fb0',
    '#7b5cd6',
    '#c0518f',
];

const open = ref(false);
const showBin = ref(false);
const editingId = ref<number | null>(null);
const form = reactive({
    name: '',
    cadence: 'daily',
    target_per_period: 1,
    color: palette[0],
});

function openCreate() {
    editingId.value = null;
    form.name = '';
    form.cadence = 'daily';
    form.target_per_period = 1;
    form.color = palette[0];
    open.value = true;
}

function openEdit(habit: HabitItem) {
    editingId.value = habit.id;
    form.name = habit.name;
    form.cadence = habit.cadence;
    form.target_per_period = habit.target_per_period;
    form.color = habit.color;
    open.value = true;
}

function submit() {
    if (!form.name.trim()) {
        return;
    }

    const payload = {
        name: form.name,
        cadence: form.cadence,
        target_per_period: form.target_per_period,
        color: form.color,
    };
    const options = {
        preserveScroll: true,
        onSuccess: () => {
            open.value = false;
        },
    };

    if (editingId.value) {
        router.patch(`/habits/${editingId.value}`, payload, options);
    } else {
        router.post('/habits', payload, options);
    }
}

function destroy(habit: HabitItem) {
    moveToBin('habits', habit.id, habit.name);
}

function restoreHabit(habit: BinnedHabit) {
    dismissBinToast('habits', habit.id);
    router.post(`/habits/${habit.id}/restore`, {}, { preserveScroll: true });
}

function emptyHabit(habit: BinnedHabit) {
    dismissBinToast('habits', habit.id);
    router.delete(`/habits/${habit.id}/force`, { preserveScroll: true });
}

function toggle(habit: HabitItem) {
    router.post(`/habits/${habit.id}/toggle`, {}, { preserveScroll: true });
}
</script>

<template>
    <Head title="Habits" />

    <div class="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        <header class="mb-6">
            <div class="flex items-center justify-between gap-3">
                <h1
                    class="font-display text-3xl font-semibold tracking-tight text-foreground"
                >
                    Habits
                </h1>
                <div class="flex shrink-0 flex-wrap justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        class="rounded-xl"
                        :aria-expanded="showBin"
                        @click="showBin = !showBin"
                    >
                        <Trash2 class="size-4" />
                        Bin
                        <span
                            class="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                            >{{ props.bin.length }}</span
                        >
                    </Button>
                    <Button
                        v-if="props.habits.length"
                        class="rounded-xl"
                        @click="openCreate"
                    >
                        <Plus class="size-4" />
                        New habit
                    </Button>
                </div>
            </div>
            <p class="mt-2 text-sm leading-6 text-muted-foreground">
                Small things, done often. Tap the ring to check in.
            </p>
        </header>

        <section
            v-if="showBin"
            class="mb-5 rounded-3xl border border-border/60 bg-card p-4 shadow-sm sm:p-5"
        >
            <h2 class="font-display text-lg font-semibold text-foreground">
                Bin
            </h2>
            <p class="mt-1 text-sm text-muted-foreground">
                Restore puts a habit back. Delete removes it for good.
            </p>
            <ul v-if="props.bin.length" class="mt-4 flex flex-col gap-1.5">
                <li
                    v-for="habit in props.bin"
                    :key="habit.id"
                    class="flex flex-col gap-2 rounded-2xl border border-border/50 bg-background/60 px-3 py-2.5 sm:flex-row sm:items-center"
                >
                    <div class="flex min-w-0 flex-1 items-center gap-2">
                        <span
                            class="size-3 shrink-0 rounded-full"
                            :style="{ backgroundColor: habit.color }"
                        />
                        <p class="truncate text-foreground">{{ habit.name }}</p>
                    </div>
                    <div class="flex shrink-0 gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            class="rounded-lg"
                            @click="restoreHabit(habit)"
                        >
                            <RotateCcw class="size-3.5" />
                            Restore
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            class="rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
                            @click="emptyHabit(habit)"
                        >
                            <Trash2 class="size-3.5" />
                            Delete
                        </Button>
                    </div>
                </li>
            </ul>
            <EmptyMark v-else class="mt-3" title="The bin is empty." />
        </section>

        <div v-if="props.habits.length" class="flex flex-col gap-4">
            <article
                v-for="habit in habits"
                :key="habit.id"
                class="rounded-3xl border border-border/60 bg-card p-5 shadow-sm sm:p-6"
            >
                <div class="flex items-start gap-4">
                    <HabitToggle
                        :done="habit.done_today"
                        :color="habit.color"
                        @toggle="toggle(habit)"
                    />

                    <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-2">
                            <h2
                                class="truncate font-display text-lg font-semibold text-foreground"
                            >
                                {{ habit.name }}
                            </h2>
                            <span
                                class="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground capitalize"
                                >{{ habit.cadence }}</span
                            >
                        </div>
                        <div
                            class="mt-1 flex items-center gap-4 text-sm text-muted-foreground"
                        >
                            <span class="inline-flex items-center gap-1">
                                <Flame
                                    class="size-4"
                                    :style="{ color: habit.color }"
                                />
                                <span class="font-semibold text-foreground">{{
                                    habit.current_streak
                                }}</span>
                                {{
                                    habit.cadence === 'weekly' ? 'week' : 'day'
                                }}
                                streak
                            </span>
                            <span>best {{ habit.longest_streak }}</span>
                        </div>
                    </div>

                    <div class="flex shrink-0 items-center">
                        <button
                            type="button"
                            class="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            :title="`Edit ${habit.name}`"
                            :aria-label="`Edit ${habit.name}`"
                            @click="openEdit(habit)"
                        >
                            <Pencil class="size-4" />
                        </button>
                        <button
                            type="button"
                            class="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            :title="`Delete ${habit.name}`"
                            :aria-label="`Delete ${habit.name}`"
                            @click="destroy(habit)"
                        >
                            <Trash2 class="size-4" />
                        </button>
                    </div>
                </div>

                <div class="mt-5 overflow-x-auto pb-1">
                    <HabitGrid
                        :entries="habit.entries"
                        :color="habit.color"
                        :today="today"
                    />
                </div>
            </article>
        </div>

        <div v-else class="flex min-h-[50vh] items-center justify-center">
            <EmptyMark center title="No habits yet.">
                <Button class="rounded-xl" @click="openCreate">
                    <Plus class="size-4" />
                    Add your first habit
                </Button>
            </EmptyMark>
        </div>
    </div>

    <!-- Add / edit dialog -->
    <Dialog v-model:open="open">
        <DialogContent class="rounded-3xl sm:max-w-md">
            <DialogHeader>
                <DialogTitle class="font-display">{{
                    editingId ? 'Edit habit' : 'New habit'
                }}</DialogTitle>
            </DialogHeader>

            <form class="space-y-4" @submit.prevent="submit">
                <div class="space-y-1.5">
                    <Label for="h-name">Name</Label>
                    <Input
                        id="h-name"
                        v-model="form.name"
                        placeholder="e.g. Morning walk"
                        required
                    />
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div class="space-y-1.5">
                        <Label for="h-cadence">Cadence</Label>
                        <select
                            id="h-cadence"
                            v-model="form.cadence"
                            class="h-9 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                        </select>
                    </div>
                    <div v-if="form.cadence === 'weekly'" class="space-y-1.5">
                        <Label for="h-target">Times / week</Label>
                        <Input
                            id="h-target"
                            v-model.number="form.target_per_period"
                            type="number"
                            min="1"
                            max="50"
                        />
                    </div>
                </div>

                <div class="space-y-1.5">
                    <Label>Colour</Label>
                    <div class="flex flex-wrap gap-2">
                        <button
                            v-for="c in palette"
                            :key="c"
                            type="button"
                            class="size-8 rounded-full ring-2 ring-offset-2 ring-offset-card transition-transform hover:scale-110"
                            :style="{
                                backgroundColor: c,
                                '--tw-ring-color':
                                    form.color === c ? c : 'transparent',
                            }"
                            :aria-label="`Colour ${c}`"
                            @click="form.color = c"
                        />
                    </div>
                </div>

                <DialogFooter class="gap-2">
                    <Button type="button" variant="ghost" @click="open = false"
                        >Cancel</Button
                    >
                    <Button type="submit">{{
                        editingId ? 'Save changes' : 'Create habit'
                    }}</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
</template>
