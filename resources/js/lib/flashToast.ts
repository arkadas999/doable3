import { router } from '@inertiajs/vue3';
import { toast } from 'vue-sonner';
import type { FlashToast } from '@/types/ui';

let lastFlashMessage = '';
let lastFlashTime = 0;

function handleFlash(flash: any) {
    if (!flash || typeof flash !== 'object') return;

    let message = '';
    let type: 'success' | 'error' | 'info' | 'warning' = 'success';

    if (flash.toast && typeof flash.toast === 'object') {
        const data = flash.toast as FlashToast;
        message = data.message;
        type = data.type || 'success';
    } else if (flash.success) {
        message = String(flash.success);
        type = 'success';
    } else if (flash.error) {
        message = String(flash.error);
        type = 'error';
    } else if (flash.warning) {
        message = String(flash.warning);
        type = 'warning';
    } else if (flash.info) {
        message = String(flash.info);
        type = 'info';
    } else if (flash.message) {
        message = String(flash.message);
        type = 'success';
    }

    if (!message) return;

    // Deduplicate identical flash messages within 500ms
    const now = Date.now();
    if (message === lastFlashMessage && now - lastFlashTime < 500) {
        return;
    }
    lastFlashMessage = message;
    lastFlashTime = now;

    if (type === 'success') {
        toast.success(message);
    } else if (type === 'error') {
        toast.error(message);
    } else if (type === 'warning') {
        toast.warning(message);
    } else if (type === 'info') {
        toast.info(message);
    } else {
        toast(message);
    }
}

export function initializeFlashToast(): void {
    router.on('navigate', (event) => {
        const page = (event as any).detail?.page;
        handleFlash(page?.props?.flash);
    });

    router.on('success', (event) => {
        const page = (event as any).detail?.page;
        handleFlash(page?.props?.flash);
    });
}

