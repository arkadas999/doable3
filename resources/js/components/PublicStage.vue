<template>
    <div class="public-stage relative flex min-h-svh flex-col text-foreground overflow-x-hidden">
        <div class="public-orb public-orb-a hidden sm:block" aria-hidden="true" />
        <div class="public-orb public-orb-b hidden sm:block" aria-hidden="true" />
        <div class="public-orb public-orb-c hidden sm:block" aria-hidden="true" />

        <header class="public-nav">
            <div class="public-nav-inner public-frame">
                <div class="public-nav-brand">
                    <slot name="brand" />
                </div>
                <nav class="public-nav-actions" aria-label="Account">
                    <slot name="actions" />
                </nav>
            </div>
        </header>

        <div class="relative z-10 flex flex-1 flex-col w-full">
            <slot />
        </div>
    </div>
</template>
