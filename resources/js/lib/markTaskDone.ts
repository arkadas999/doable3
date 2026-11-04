import { router } from '@inertiajs/vue3';
import { toast } from 'vue-sonner';

export function markTaskDone(id: number, title: string): void {
    router.patch(
        `/tasks/${id}`,
        { status: 'done' },
        {
            preserveScroll: true,
            onSuccess: () => {
                toast('Marked done', {
                    description: title,
                    duration: 5000,
                    action: {
                        label: 'Undo',
                        onClick: () => {
                            router.patch(
                                `/tasks/${id}`,
                                { status: 'open' },
                                { preserveScroll: true },
                            );
                        },
                    },
                });
            },
        },
    );
}
