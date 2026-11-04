<script setup lang="ts">
import { Head, router } from '@inertiajs/vue3';
import {
    Calendar,
    Check,
    GripVertical,
    MoveRight,
    Pencil,
    Plus,
    RotateCcw,
    Trash2,
} from '@lucide/vue';
import { reactive, ref, watch, computed } from 'vue';
import EmptyMark from '@/components/doable/EmptyMark.vue';
import PriorityMark from '@/components/doable/PriorityMark.vue';
import { Button } from '@/components/ui/button';
import { markTaskDone } from '@/lib/markTaskDone';
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
import TaskCalendar from '@/components/doable/TaskCalendar.vue';

interface TaskItem {
    id: number;
    title: string;
    notes: string | null;
    bucket: string;
    status: string;
    priority: number;
    due_date: string | null;
    completed_at: string | null;
    deleted_at?: string | null;
    position: number;
}

const props = defineProps<{
    today: string;
    important: TaskItem[];
    eventual: TaskItem[];
    completed: TaskItem[];
    bin: TaskItem[];
}>();

defineOptions({
    layout: {
        breadcrumbs: [{ title: 'Tasks', href: '/tasks' }],
    },
});

type LaneKey = 'important' | 'eventual';

const laneMeta: {
    key: LaneKey;
    title: string;
    subtitle: string;
    accent: string;
}[] = [
    {
        key: 'important',
        title: 'Important',
        subtitle: 'Do these now',
        accent: 'var(--primary)',
    },
    {
        key: 'eventual',
        title: 'Eventual',
        subtitle: 'Later, not forgotten',
        accent: 'var(--primary)',
    },
];

const lanes = reactive<Record<LaneKey, TaskItem[]>>({
    important: [...props.important],
    eventual: [...props.eventual],
});

watch(
    () => props.important,
    (v) => (lanes.important = [...v]),
);
watch(
    () => props.eventual,
    (v) => (lanes.eventual = [...v]),
);

const draft = reactive<Record<LaneKey, string>>({
    important: '',
    eventual: '',
});

function addTask(bucket: LaneKey) {
    const title = draft[bucket].trim();

    if (!title) {
        return;
    }

    router.post(
        '/tasks',
        { title, bucket },
        {
            preserveScroll: true,
            onSuccess: () => {
                draft[bucket] = '';
            },
        },
    );
}

const allOpenTasks = computed(() => {
    return [...lanes.important, ...lanes.eventual];
});

function createScheduledTask(payload: { title: string; due_date: string }) {
    router.post(
        '/tasks',
        { title: payload.title, bucket: 'important', due_date: payload.due_date },
        { preserveScroll: true }
    );
}

function completeTask(task: TaskItem) {
    const bucket = task.bucket as LaneKey;
    if (lanes[bucket]) {
        lanes[bucket] = lanes[bucket].filter((t) => t.id !== task.id);
    }
    markTaskDone(task.id, task.title);
}

function restoreTask(task: TaskItem) {
    router.patch(
        `/tasks/${task.id}`,
        { status: 'open' },
        { preserveScroll: true },
    );
}

function deleteTask(task: TaskItem) {
    const bucket = task.bucket as LaneKey;
    if (lanes[bucket]) {
        lanes[bucket] = lanes[bucket].filter((t) => t.id !== task.id);
    }
    moveToBin('tasks', task.id, task.title);
}

function restoreFromBin(task: TaskItem) {
    dismissBinToast('tasks', task.id);
    router.post(`/tasks/${task.id}/restore`, {}, { preserveScroll: true });
}

function emptyFromBin(task: TaskItem) {
    dismissBinToast('tasks', task.id);
    router.delete(`/tasks/${task.id}/force`, { preserveScroll: true });
}

function moveLane(task: TaskItem) {
    const from = task.bucket as LaneKey;
    const to = (task.bucket === 'important' ? 'eventual' : 'important') as LaneKey;
    if (lanes[from] && lanes[to]) {
        lanes[from] = lanes[from].filter((t) => t.id !== task.id);
        const movedTask = { ...task, bucket: to };
        lanes[to].unshift(movedTask);
    }
    router.patch(`/tasks/${task.id}`, { bucket: to }, { preserveScroll: true });
}

// --- drag to reorder within a lane ---
const drag = ref<{ bucket: LaneKey; index: number } | null>(null);

function onDragStart(bucket: LaneKey, index: number) {
    drag.value = { bucket, index };
}

function onDragEnter(bucket: LaneKey, index: number) {
    const current = drag.value;

    if (!current || current.bucket !== bucket || current.index === index) {
        return;
    }

    const list = lanes[bucket];
    const [moved] = list.splice(current.index, 1);
    list.splice(index, 0, moved);
    current.index = index;
}

function onDrop(bucket: LaneKey) {
    if (!drag.value || drag.value.bucket !== bucket) {
        drag.value = null;

        return;
    }

    router.post(
        '/tasks/reorder',
        { ids: lanes[bucket].map((t) => t.id) },
        { preserveScroll: true, preserveState: true },
    );
    drag.value = null;
}

// --- edit dialog ---
const editing = ref<TaskItem | null>(null);
const form = reactive({
    title: '',
    notes: '',
    due_date: '',
    priority: 0,
    bucket: 'important' as LaneKey,
});

function openEdit(task: TaskItem) {
    editing.value = task;
    form.title = task.title;
    form.notes = task.notes ?? '';
    form.due_date = task.due_date ?? '';
    form.priority = task.priority;
    form.bucket = task.bucket as LaneKey;
}

function onEditOpenChange(value: boolean) {
    if (!value) {
        editing.value = null;
    }
}

function saveEdit() {
    if (!editing.value) {
        return;
    }

    router.patch(
        `/tasks/${editing.value.id}`,
        {
            title: form.title,
            notes: form.notes || null,
            due_date: form.due_date || null,
            priority: form.priority,
            bucket: form.bucket,
        },
        {
            preserveScroll: true,
            onSuccess: () => {
                editing.value = null;
            },
        },
    );
}

function isOverdue(date: string | null): boolean {
    if (!date) {
        return false;
    }

    return date < props.today;
}

function formatDue(date: string): string {
    return new Date(`${date}T00:00:00`).toLocaleDateString('en', {
        month: 'short',
        day: 'numeric',
    });
}

const showCompleted = ref(false);
const showBin = ref(false);

function formatCompleted(iso: string | null): string {
    if (!iso) {
        return '';
    }

    return new Date(iso).toLocaleString('en', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

function laneLabel(bucket: string): string {
    return bucket === 'important' ? 'Important' : 'Eventual';
}
</script>

<<template>
    <Head title="Tasks" />

    <div class="mx-auto w-full max-w-5xl px-3 py-4 sm:px-6 sm:py-8">
        <header class="mb-5 sm:mb-6">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1
                        class="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
                    >
                        Tasks
                    </h1>
                    <p class="mt-1 text-xs text-muted-foreground sm:text-sm">
                        Keep the
                        <span class="font-medium text-foreground">Important</span>
                        lane short. Everything else can wait in
                        <span class="font-medium text-foreground">Eventual</span>.
                    </p>
                </div>

                <div class="flex flex-wrap items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        class="rounded-xl text-xs sm:text-sm"
                        :aria-expanded="showCompleted"
                        @click="showCompleted = !showCompleted"
                    >
                        <Check class="size-3.5 sm:size-4" />
                        Completed
                        <span
                            class="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:text-xs"
                            >{{ props.completed.length }}</span
                        >
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        class="rounded-xl text-xs sm:text-sm"
                        :aria-expanded="showBin"
                        @click="showBin = !showBin"
                    >
                        <Trash2 class="size-3.5 sm:size-4" />
                        Bin
                        <span
                            class="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:text-xs"
                            >{{ props.bin.length }}</span
                        >
                    </Button>
                </div>
            </div>
        </header>

        <section
            v-if="showCompleted"
            class="mb-5 rounded-3xl border border-border/60 bg-card p-3.5 shadow-sm sm:p-5"
        >
            <h2 class="font-display text-base font-semibold text-foreground sm:text-lg">
                Completed
            </h2>
            <p class="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                Restore puts a task back in its lane. Delete removes it.
            </p>

            <ul
                v-if="props.completed.length"
                class="mt-3 flex flex-col gap-1.5"
            >
                <li
                    v-for="task in props.completed"
                    :key="task.id"
                    class="flex flex-col gap-2 rounded-2xl bg-background/60 p-2.5 sm:flex-row sm:items-center sm:px-3 sm:py-2.5"
                >
                    <div class="flex min-w-0 flex-1 items-center gap-2">
                        <span
                            class="flex size-6 shrink-0 items-center justify-center rounded-full bg-success/15 text-success"
                        >
                            <Check class="size-3.5" />
                        </span>
                        <div class="min-w-0 flex-1">
                            <p class="truncate text-sm font-medium text-foreground sm:text-base">
                                {{ task.title }}
                            </p>
                            <p class="text-xs text-muted-foreground">
                                {{ laneLabel(task.bucket) }}
                                <template v-if="task.completed_at">
                                    · {{ formatCompleted(task.completed_at) }}
                                </template>
                            </p>
                        </div>
                    </div>
                    <div class="flex shrink-0 items-center justify-end gap-2 pl-8 sm:pl-0">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            class="rounded-lg text-xs"
                            @click="restoreTask(task)"
                        >
                            <RotateCcw class="size-3.5" />
                            Restore
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            class="rounded-lg text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                            @click="deleteTask(task)"
                        >
                            <Trash2 class="size-3.5" />
                            Delete
                        </Button>
                    </div>
                </li>
            </ul>

            <EmptyMark v-else class="mt-3" title="No completed tasks yet." />
        </section>

        <section
            v-if="showBin"
            class="mb-5 rounded-3xl border border-border/60 bg-card p-3.5 shadow-sm sm:p-5"
        >
            <h2 class="font-display text-base font-semibold text-foreground sm:text-lg">
                Bin
            </h2>
            <p class="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                Restore puts a task back. Delete removes it for good.
            </p>

            <ul v-if="props.bin.length" class="mt-3 flex flex-col gap-1.5">
                <li
                    v-for="task in props.bin"
                    :key="task.id"
                    class="flex flex-col gap-2 rounded-2xl border border-border/50 bg-background/60 p-2.5 sm:flex-row sm:items-center sm:px-3 sm:py-2.5"
                >
                    <div class="min-w-0 flex-1">
                        <p class="truncate text-sm font-medium text-foreground sm:text-base">{{ task.title }}</p>
                        <p class="text-xs text-muted-foreground">
                            {{ laneLabel(task.bucket) }}
                        </p>
                    </div>
                    <div class="flex shrink-0 items-center justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            class="rounded-lg text-xs"
                            @click="restoreFromBin(task)"
                        >
                            <RotateCcw class="size-3.5" />
                            Restore
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            class="rounded-lg text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                            @click="emptyFromBin(task)"
                        >
                            <Trash2 class="size-3.5" />
                            Delete
                        </Button>
                    </div>
                </li>
            </ul>

            <EmptyMark v-else class="mt-3" title="The bin is empty." />
        </section>

        <div class="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
            <section
                v-for="meta in laneMeta"
                :key="meta.key"
                class="rounded-3xl border border-border/60 bg-card p-3.5 shadow-sm sm:p-5 flex flex-col"
                @dragover.prevent
                @drop="onDrop(meta.key)"
            >
                <div class="mb-3 flex items-center gap-2 px-1">
                    <span
                        class="size-2.5 rounded-full"
                        :style="{ backgroundColor: meta.accent }"
                    />
                    <h2
                        class="font-display text-base font-semibold text-foreground sm:text-lg"
                    >
                        {{ meta.title }}
                    </h2>
                    <span
                        class="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                        >{{ lanes[meta.key].length }}</span
                    >
                    <span class="ml-auto text-xs text-muted-foreground">{{
                        meta.subtitle
                    }}</span>
                </div>

                <!-- quick add -->
                <form
                    class="mb-3 flex items-center gap-2"
                    @submit.prevent="addTask(meta.key)"
                >
                    <Input
                        v-model="draft[meta.key]"
                        :placeholder="`Add to ${meta.title}…`"
                        class="h-10 rounded-xl bg-background text-sm"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        class="size-10 shrink-0 rounded-xl"
                        :disabled="!draft[meta.key].trim()"
                    >
                        <Plus class="size-5" />
                    </Button>
                </form>

                <ul class="flex flex-col gap-1.5 flex-1">
                    <li
                        v-for="(task, index) in lanes[meta.key]"
                        :key="task.id"
                        draggable="true"
                        class="group flex flex-col gap-2 rounded-2xl border border-border/50 bg-background/60 p-2.5 transition-colors hover:border-border hover:bg-background sm:flex-row sm:items-center sm:gap-2.5 sm:px-2.5 sm:py-2"
                        :class="{
                            'opacity-40':
                                drag &&
                                drag.bucket === meta.key &&
                                drag.index === index,
                        }"
                        @dragstart="onDragStart(meta.key, index)"
                        @dragenter="onDragEnter(meta.key, index)"
                        @dragend="drag = null"
                    >
                        <!-- Top / Main row on mobile: Grip, Checkbox, Title, Priority -->
                        <div class="flex min-w-0 flex-1 items-center gap-2">
                            <GripVertical
                                class="hidden size-4 shrink-0 cursor-grab text-muted-foreground/40 sm:block sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100"
                            />
                            <button
                                type="button"
                                class="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-muted-foreground/70 transition-colors hover:border-success hover:bg-success/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95"
                                aria-label="Complete task"
                                @click="completeTask(task)"
                            />
                            <button
                                type="button"
                                class="min-w-0 flex-1 truncate text-left text-sm font-medium text-foreground hover:underline sm:text-base"
                                @click="openEdit(task)"
                            >
                                {{ task.title }}
                            </button>
                            <PriorityMark class="shrink-0 sm:hidden" :priority="task.priority" />
                        </div>

                        <!-- Sub-bar on mobile, inline controls on desktop -->
                        <div class="flex items-center justify-between gap-2 pl-8 sm:shrink-0 sm:justify-end sm:pl-0">
                            <div class="flex items-center gap-2">
                                <PriorityMark class="hidden shrink-0 sm:inline-flex" :priority="task.priority" />
                                <span
                                    v-if="task.due_date"
                                    class="inline-flex shrink-0 items-center gap-1 rounded-md bg-muted/60 px-1.5 py-0.5 text-[11px] font-medium sm:bg-transparent sm:px-0 sm:py-0 sm:text-xs"
                                    :class="
                                        isOverdue(task.due_date)
                                            ? 'text-destructive font-semibold'
                                            : 'text-muted-foreground'
                                    "
                                >
                                    <Calendar class="size-3" />
                                    {{ formatDue(task.due_date) }}
                                </span>
                            </div>

                            <div
                                class="flex shrink-0 items-center gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                            >
                                <button
                                    type="button"
                                    class="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                    :title="
                                        meta.key === 'important'
                                            ? 'Move to Eventual'
                                            : 'Move to Important'
                                    "
                                    :aria-label="
                                        meta.key === 'important'
                                            ? 'Move to Eventual'
                                            : 'Move to Important'
                                    "
                                    @click="moveLane(task)"
                                >
                                    <MoveRight class="size-4" />
                                </button>
                                <button
                                    type="button"
                                    class="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                    title="Edit task"
                                    aria-label="Edit task"
                                    @click="openEdit(task)"
                                >
                                    <Pencil class="size-4" />
                                </button>
                                <button
                                    type="button"
                                    class="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                    title="Delete task"
                                    aria-label="Delete task"
                                    @click="deleteTask(task)"
                                >
                                    <Trash2 class="size-4" />
                                </button>
                            </div>
                        </div>
                    </li>
                </ul>

                <EmptyMark
                    v-if="!lanes[meta.key].length"
                    class="mt-3"
                    title="Nothing here yet."
                />
            </section>

            <!-- Calendar Section -->
            <TaskCalendar
                :tasks="allOpenTasks"
                @create="createScheduledTask"
                @complete="completeTask"
                @edit="openEdit"
            />
        </div>
    </div>

    <!-- Edit dialog -->
    <Dialog :open="editing !== null" @update:open="onEditOpenChange">
        <DialogContent class="w-[calc(100vw-2rem)] max-w-md rounded-3xl p-5 sm:p-6">
            <DialogHeader>
                <DialogTitle class="font-display text-lg sm:text-xl">Edit task</DialogTitle>
            </DialogHeader>

            <form class="space-y-4" @submit.prevent="saveEdit">
                <div class="space-y-1.5">
                    <Label for="t-title">Title</Label>
                    <Input id="t-title" v-model="form.title" class="rounded-xl text-base sm:text-sm" required />
                </div>
                <div class="space-y-1.5">
                    <Label for="t-notes">Notes</Label>
                    <textarea
                        id="t-notes"
                        v-model="form.notes"
                        rows="3"
                        class="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-base sm:text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                </div>
                <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div class="space-y-1.5">
                        <Label for="t-due">Due date</Label>
                        <Input id="t-due" v-model="form.due_date" type="date" class="rounded-xl" />
                    </div>
                    <div class="space-y-1.5">
                        <Label for="t-priority">Priority</Label>
                        <div class="flex items-center gap-2">
                            <select
                                id="t-priority"
                                v-model.number="form.priority"
                                class="h-9 w-full rounded-xl border border-input bg-background px-3 text-base sm:text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option :value="0">Normal</option>
                                <option :value="1">Medium</option>
                                <option :value="2">High</option>
                                <option :value="3">Urgent</option>
                            </select>
                            <PriorityMark :priority="form.priority" />
                        </div>
                    </div>
                </div>
                <div class="space-y-1.5">
                    <Label for="t-bucket">Lane</Label>
                    <select
                        id="t-bucket"
                        v-model="form.bucket"
                        class="h-9 w-full rounded-xl border border-input bg-background px-3 text-base sm:text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <option value="important">Important</option>
                        <option value="eventual">Eventual</option>
                    </select>
                </div>

                <DialogFooter class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button
                        type="button"
                        variant="ghost"
                        class="rounded-xl"
                        @click="editing = null"
                        >Cancel</Button
                    >
                    <Button type="submit" class="rounded-xl">Save changes</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
</template>
