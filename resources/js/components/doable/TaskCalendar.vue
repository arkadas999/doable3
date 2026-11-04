<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ChevronLeft, ChevronRight, Plus, Check } from '@lucide/vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PriorityMark from './PriorityMark.vue';

interface TaskItem {
    id: number;
    title: string;
    due_date: string | null;
    priority: number;
    status: string;
}

const props = defineProps<{
    tasks: TaskItem[];
}>();

const emit = defineEmits<{
    (e: 'create', payload: { title: string; due_date: string }): void;
    (e: 'complete', task: TaskItem): void;
    (e: 'edit', task: TaskItem): void;
}>();

const today = new Date();
const currentMonth = ref(today.getMonth());
const currentYear = ref(today.getFullYear());
const selectedDate = ref(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
);

const monthName = computed(() => {
    return new Date(currentYear.value, currentMonth.value).toLocaleString('en', { month: 'long', year: 'numeric' });
});

function prevMonth() {
    if (currentMonth.value === 0) {
        currentMonth.value = 11;
        currentYear.value--;
    } else {
        currentMonth.value--;
    }
}

function nextMonth() {
    if (currentMonth.value === 11) {
        currentMonth.value = 0;
        currentYear.value++;
    } else {
        currentMonth.value++;
    }
}

const calendarDays = computed(() => {
    const days = [];
    const firstDay = new Date(currentYear.value, currentMonth.value, 1).getDay();
    const daysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate();
    
    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
        const d = String(i).padStart(2, '0');
        const m = String(currentMonth.value + 1).padStart(2, '0');
        const ymd = `${currentYear.value}-${m}-${d}`;
        days.push({ day: i, ymd });
    }
    
    return days;
});

function selectDate(ymd: string) {
    selectedDate.value = ymd;
}

const selectedTasks = computed(() => {
    return props.tasks.filter(t => t.due_date === selectedDate.value);
});

const taskCounts = computed(() => {
    const counts: Record<string, number> = {};
    for (const t of props.tasks) {
        if (t.due_date) {
            counts[t.due_date] = (counts[t.due_date] || 0) + 1;
        }
    }
    return counts;
});

const newTaskTitle = ref('');

function submitTask() {
    if (newTaskTitle.value.trim()) {
        emit('create', { title: newTaskTitle.value.trim(), due_date: selectedDate.value });
        newTaskTitle.value = '';
    }
}

function formatDateDisplay(ymd: string) {
    return new Date(`${ymd}T00:00:00`).toLocaleString('en', { weekday: 'short', month: 'short', day: 'numeric' });
}

function goToToday() {
    const d = new Date();
    currentMonth.value = d.getMonth();
    currentYear.value = d.getFullYear();
    const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    selectedDate.value = ymd;
}
</script>

<template>
    <section class="rounded-3xl border border-border/60 bg-card p-3.5 shadow-sm sm:p-5 flex flex-col h-full">
        <div class="mb-3 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <h2 class="font-display text-base font-semibold text-foreground sm:text-lg">
                    Calendar
                </h2>
                <Button variant="secondary" size="sm" class="h-6 text-[11px] px-2 rounded-lg" @click="goToToday">
                    Today
                </Button>
            </div>
        </div>
        <div class="mb-4 flex items-center justify-between px-1">
            <Button variant="ghost" size="icon" class="size-7 shrink-0" @click="prevMonth">
                <ChevronLeft class="size-4" />
            </Button>
            <span class="text-sm font-semibold flex-1 text-center whitespace-nowrap">{{ monthName }}</span>
            <Button variant="ghost" size="icon" class="size-7 shrink-0" @click="nextMonth">
                <ChevronRight class="size-4" />
            </Button>
        </div>

        <div class="grid grid-cols-7 gap-1 mb-2">
            <div v-for="d in ['Su','Mo','Tu','We','Th','Fr','Sa']" :key="d" class="text-center text-[10px] font-semibold text-muted-foreground uppercase">
                {{ d }}
            </div>
        </div>

        <div class="grid grid-cols-7 gap-1 mb-5">
            <div v-for="(day, idx) in calendarDays" :key="idx" class="aspect-square">
                <button
                    v-if="day"
                    type="button"
                    class="relative flex size-full items-center justify-center rounded-xl text-sm transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    :class="[
                        selectedDate === day.ymd ? 'bg-primary text-primary-foreground font-semibold hover:bg-primary/90' : 'text-foreground bg-background/50',
                    ]"
                    @click="selectDate(day.ymd)"
                >
                    {{ day.day }}
                    <span v-if="taskCounts[day.ymd]" class="absolute bottom-1 flex gap-0.5">
                        <span class="size-1 rounded-full bg-current opacity-60"></span>
                    </span>
                </button>
            </div>
        </div>

        <div class="flex-1 flex flex-col border-t border-border/50 pt-4">
            <h3 class="text-sm font-semibold mb-3">{{ formatDateDisplay(selectedDate) }}</h3>
            
            <form class="flex items-center gap-2 mb-4" @submit.prevent="submitTask">
                <Input
                    v-model="newTaskTitle"
                    placeholder="Add task for this date…"
                    class="h-9 rounded-xl bg-background text-sm flex-1"
                />
                <Button
                    type="submit"
                    size="icon"
                    class="size-9 shrink-0 rounded-xl"
                    :disabled="!newTaskTitle.trim()"
                >
                    <Plus class="size-4" />
                </Button>
            </form>

            <div class="flex-1 overflow-y-auto">
                <ul class="flex flex-col gap-1.5">
                    <li
                        v-for="task in selectedTasks"
                        :key="task.id"
                        class="group flex items-center gap-2 rounded-xl border border-border/50 bg-background/60 px-2 py-1.5 transition-colors hover:border-border hover:bg-background"
                    >
                        <button
                            type="button"
                            class="flex size-5 shrink-0 items-center justify-center rounded-full border border-muted-foreground/50 transition-colors hover:border-success hover:bg-success/10"
                            @click="$emit('complete', task)"
                        />
                        <button
                            type="button"
                            class="truncate text-sm font-medium text-foreground flex-1 text-left hover:underline"
                            @click="$emit('edit', task)"
                        >
                            {{ task.title }}
                        </button>
                        <PriorityMark class="shrink-0" :priority="task.priority" />
                    </li>
                </ul>
                <p v-if="!selectedTasks.length" class="text-xs text-muted-foreground text-center py-4">
                    No tasks for this date.
                </p>
            </div>
        </div>
    </section>
</template>
