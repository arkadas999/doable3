<script setup lang="ts">
import { Form, Head, usePage } from '@inertiajs/vue3';
import { Link } from '@inertiajs/vue3';
import { computed } from 'vue';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';

import Heading from '@/components/Heading.vue';
import InputError from '@/components/InputError.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';

defineOptions({
    layout: {
        breadcrumbs: [
            {
                title: 'Profile settings',
                href: edit(),
            },
        ],
    },
});

const page = usePage();
const user = computed(() => page.props.auth.user);

import { router, useForm } from '@inertiajs/vue3';
import { Camera, Trash2 } from '@lucide/vue';
import { ref } from 'vue';

const fileInput = ref(null);

const triggerUpload = () => {
    fileInput.value?.click();
};

const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const form = useForm({
        avatar: file
    });
    
    form.post('/settings/avatar', {
        preserveScroll: true,
        onSuccess: () => {
            if (fileInput.value) fileInput.value.value = '';
        }
    });
};

const removeAvatar = () => {
    router.delete('/settings/avatar', {
        preserveScroll: true
    });
};

</script>

<template>
    <Head title="Profile settings" />

    <h1 class="sr-only">Profile settings</h1>

    <div class="flex flex-col space-y-6">

        <div class="flex items-center gap-6">
            <div class="relative group">
                <div class="h-24 w-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-border flex items-center justify-center">
                    <img v-if="user.avatar" :src="user.avatar" alt="Avatar" class="h-full w-full object-cover" />
                    <span v-else class="text-3xl font-semibold text-gray-400 dark:text-gray-500">{{ user.name.charAt(0).toUpperCase() }}</span>
                </div>
                
                <button type="button" @click="triggerUpload" class="absolute bottom-0 right-0 rounded-full bg-primary text-primary-foreground p-1.5 shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <Camera class="size-4" />
                </button>
                <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleUpload" />
            </div>
            
            <div class="flex flex-col gap-1">
                <h3 class="font-medium text-foreground">Profile Picture</h3>
                <p class="text-sm text-muted-foreground">Upload a new avatar. Max size 2MB.</p>
                <Button v-if="user.avatar" type="button" variant="ghost" size="sm" class="w-fit mt-1 text-destructive hover:bg-destructive/10" @click="removeAvatar">
                    <Trash2 class="size-4 mr-2" />
                    Remove image
                </Button>
            </div>
        </div>

        <Heading
            variant="small"
            title="Profile"
            description="Update your name"
        />

        <Form
            v-bind="ProfileController.update.form()"
            class="space-y-6"
            v-slot="{ errors, processing }"
        >
            <div class="grid gap-2">
                <Label for="name">Name</Label>
                <Input
                    id="name"
                    class="mt-1 block w-full"
                    name="name"
                    :default-value="user.name"
                    required
                    autocomplete="name"
                    placeholder="Full name"
                />
                <InputError class="mt-2" :message="errors.name" />
            </div>

            

            <div class="flex items-center gap-4">
                <Button :disabled="processing" data-test="update-profile-button"
                    >Save</Button
                >
            </div>
        </Form>
    </div>

    
</template>
