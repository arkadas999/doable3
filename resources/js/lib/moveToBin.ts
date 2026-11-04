import { router } from '@inertiajs/vue3';
import { toast } from 'vue-sonner';

export function binToastId(kind: 'tasks' | 'habits', id: number): string {
    return `bin-${kind}-${id}`;
}

export function dismissBinToast(kind: 'tasks' | 'habits', id: number): void {
    toast.dismiss(binToastId(kind, id));
}

export function moveToBin(
    kind: 'tasks' | 'habits',
    id: number,
    label: string,
): void {
    router.delete(`/${kind}/${id}`, {
        preserveScroll: true,
        onSuccess: () => {
            toast('Moved to the bin', {
                id: binToastId(kind, id),
                description: label,
                duration: 5000,
                action: {
                    label: 'Undo',
                    onClick: () => {
                        router.post(
                            `/${kind}/${id}/restore`,
                            {},
                            { preserveScroll: true },
                        );
                        dismissBinToast(kind, id);
                    },
                },
            });
        },
    });
}
