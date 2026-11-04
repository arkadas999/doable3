<template>
  <div class="mb-6">
    <button
      type="button"
      @click="verifyPasskey"
      :disabled="loading"
      class="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
    >
      <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <svg v-else class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
      {{ loading ? (props.loadingLabel || 'Waiting for device...') : (props.label || 'Log in with a passkey') }}
    </button>
    <div v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</div>
    <div class="relative mt-6">
      <div class="absolute inset-0 flex items-center" aria-hidden="true">
        <div class="w-full border-t border-gray-200 dark:border-gray-800"></div>
      </div>
      <div class="relative flex justify-center text-sm font-medium leading-6">
        <span :class="['px-6 text-gray-500', props.separatorClass || 'bg-gray-50 dark:bg-gray-900']">{{ props.separator || 'Or continue with' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { router } from '@inertiajs/vue3';
import { startAuthentication } from '@simplewebauthn/browser';

const props = defineProps<{
    routes?: {
        options: { url: string };
        submit: { url: string };
    };
    label?: string;
    loadingLabel?: string;
    separator?: string;
    separatorClass?: string;
}>();

const loading = ref(false);
const error = ref('');

async function verifyPasskey() {
    loading.value = true;
    error.value = '';
    
    const optionsUrl = props.routes?.options?.url || '/api/passkeys/login';
    const submitUrl = props.routes?.submit?.url || '/api/passkeys/login';
    
    try {
        const resp = await fetch(optionsUrl);
        if (!resp.ok) throw new Error('Failed to fetch authentication options');
        const options = await resp.json();

        const asseResp = await startAuthentication({ optionsJSON: options });

        const verificationResp = await fetch(submitUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(asseResp),
        });

        const verification = await verificationResp.json();

        if (verification.verified || verification.ok) {
            router.visit(verification.redirect || '/dashboard');
        } else {
            error.value = verification.error || 'Authentication failed';
        }
    } catch (e: any) {
        if (e.name === 'NotAllowedError') {
            error.value = 'Passkey authentication was cancelled.';
        } else {
            error.value = e.message || 'An error occurred during authentication';
        }
    } finally {
        loading.value = false;
    }
}
</script>

