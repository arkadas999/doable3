<template>
  <div>
    <button
      type="button"
      @click="registerPasskey"
      :disabled="loading"
      class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
    >
      {{ loading ? 'Waiting for device...' : 'Register a new passkey' }}
    </button>
    <div v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { router } from '@inertiajs/vue3';
import { startRegistration } from '@simplewebauthn/browser';

const emit = defineEmits(['success']);

const loading = ref(false);
const error = ref('');

async function registerPasskey() {
    loading.value = true;
    error.value = '';
    
    try {
        const resp = await fetch('/api/passkeys/register');
        if (!resp.ok) throw new Error('Failed to fetch registration options');
        const options = await resp.json();

        const attResp = await startRegistration({ optionsJSON: options });

        const verificationResp = await fetch('/api/passkeys/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(attResp),
        });

        const verification = await verificationResp.json();

        if (verification.verified) {
            emit('success');
            router.reload({ preserveScroll: true });
        } else {
            error.value = verification.error || 'Registration failed';
        }
    } catch (e: any) {
        if (e.name === 'NotAllowedError') {
            error.value = 'Passkey registration was cancelled.';
        } else {
            error.value = e.message || 'An error occurred during registration';
        }
    } finally {
        loading.value = false;
    }
}
</script>
