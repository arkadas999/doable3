<script setup lang="ts">
import { Form, Head } from '@inertiajs/vue3';
import {
    index as confirmOptions,
    store as confirmStore,
} from '@/actions/Laravel/Passkeys/Http/Controllers/PasskeyConfirmationController';
import InputError from '@/components/InputError.vue';
import PasskeyVerify from '@/components/PasskeyVerify.vue';
import PasswordInput from '@/components/PasswordInput.vue';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/password/confirm';

defineOptions({
    layout: {
        breadcrumbs: [
            {
                title: 'Confirm password',
                href: '/user/confirm-password',
            },
        ],
    },
});
</script>

<template>
    <Head title="Confirm password" />

    <div class="mx-auto w-full max-w-md px-4 py-8 sm:py-12">
        <h1 class="font-display text-2xl font-semibold tracking-tight text-foreground">
            Confirm password
        </h1>
        <p class="mt-1 text-sm text-muted-foreground">
            This is a secure area. Confirm your password before continuing.
        </p>

        <div class="mt-6 space-y-5 rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <PasskeyVerify
                :routes="{
                    options: confirmOptions(),
                    submit: confirmStore(),
                }"
                label="Confirm with passkey"
                loading-label="Confirming..."
                separator="Or confirm with password"
                separator-class="bg-card"
            />

            <Form
                v-bind="store.form()"
                reset-on-success
                v-slot="{ errors, processing }"
            >
                <div class="space-y-6">
                    <div class="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <PasswordInput
                            id="password"
                            name="password"
                            class="mt-1 block w-full"
                            required
                            autocomplete="current-password"
                            autofocus
                        />

                        <InputError :message="errors.password" />
                    </div>

                    <div class="flex items-center">
                        <Button
                            class="w-full"
                            :disabled="processing"
                            data-test="confirm-password-button"
                        >
                            <Spinner v-if="processing" />
                            Confirm password
                        </Button>
                    </div>
                </div>
            </Form>
        </div>
    </div>
</template>
