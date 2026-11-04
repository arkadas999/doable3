import { router } from '@inertiajs/vue3';
import { computed, ref } from 'vue';
import { markSvg } from '@/lib/mark';

export const DEFAULT_ACCENT = '#2563eb';

export const accentPresets = [
    { id: 'orange', label: 'Orange', hex: '#d97706' },
    { id: 'yellow', label: 'Yellow', hex: '#f5c400' },
    { id: 'green', label: 'Green', hex: '#2f7d50' },
    { id: 'blue', label: 'Blue', hex: DEFAULT_ACCENT },
    { id: 'purple', label: 'Purple', hex: '#7c3aed' },
    { id: 'pink', label: 'Pink', hex: '#db2777' },
] as const;

export type AccentPresetId = (typeof accentPresets)[number]['id'];

const accentHex = ref(DEFAULT_ACCENT);
const accentChoice = ref<string>('blue');

function presetForChoice(choice: string | null | undefined) {
    return accentPresets.find((item) => item.id === choice) ?? null;
}

function forgetBrowserAccent(): void {
    if (typeof window === 'undefined') {
        return;
    }

    localStorage.removeItem('accent-hex');
    localStorage.removeItem('accent-choice');
    localStorage.removeItem('accent-default-version');
}

/** Apply the color saved on the signed-in account. */
export function applyAccountAccent(choice: string | null | undefined): void {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('accent-choice') : null;
    const effectiveChoice = choice || stored || 'blue';
    const preset = presetForChoice(effectiveChoice) ?? presetForChoice('blue');

    if (!preset) {
        return;
    }

    accentHex.value = preset.hex;
    accentChoice.value = preset.id;
    if (typeof window !== 'undefined') {
        localStorage.setItem('accent-hex', preset.hex);
        localStorage.setItem('accent-choice', preset.id);
    }
    paintDocumentAccent();
}

let documentAccentAttached = false;

const DEFAULT_FAVICON = '/favicon.svg';

function paintFavicon(href: string): void {
    document
        .querySelectorAll<HTMLLinkElement>('link[rel="icon"]')
        .forEach((link) => {
            link.href = href;
        });
}

/** Light accents are darkened so the tab icon stays visible on a light chrome. */
function faviconInk(hex: string): string {
    if (!isLightColor(hex)) {
        return hex;
    }

    return mixHex(hex, '#1c1914', 0.38);
}

function mixHex(from: string, to: string, toward: number): string {
    const mix = (start: number, end: number) =>
        Math.round(start + (end - start) * toward)
            .toString(16)
            .padStart(2, '0');

    return `#${mix(Number.parseInt(from.slice(1, 3), 16), Number.parseInt(to.slice(1, 3), 16))}${mix(Number.parseInt(from.slice(3, 5), 16), Number.parseInt(to.slice(3, 5), 16))}${mix(Number.parseInt(from.slice(5, 7), 16), Number.parseInt(to.slice(5, 7), 16))}`;
}

function paintDocumentAccent(): void {
    if (!documentAccentAttached || typeof document === 'undefined') {
        return;
    }

    const root = document.documentElement;
    root.classList.add('accent-scope');
    root.style.setProperty('--accent-color', accentHex.value);

    if (isLightColor(accentHex.value)) {
        root.dataset.accentLight = 'true';
    } else {
        delete root.dataset.accentLight;
    }

    paintFavicon(
        `data:image/svg+xml,${encodeURIComponent(markSvg(faviconInk(accentHex.value)))}`,
    );
}

/** Signed-in pages inherit the accent, including menus that render on document.body. */
export function attachDocumentAccent(): void {
    documentAccentAttached = true;
    paintDocumentAccent();
}

/** Login, sign up, sign out, and home stay on the default blue. */
export function detachDocumentAccent(): void {
    documentAccentAttached = false;

    if (typeof document === 'undefined') {
        return;
    }

    const root = document.documentElement;
    root.classList.remove('accent-scope');
    delete root.dataset.accentLight;
    root.style.removeProperty('--accent-color');
    root.style.removeProperty('--accent-h');
    paintFavicon(DEFAULT_FAVICON);
}

export function clearGlobalAccent(): void {
    if (documentAccentAttached) {
        paintDocumentAccent();

        return;
    }

    detachDocumentAccent();
}

export function readStoredAccent(): { hex: string; choice: string } {
    if (typeof window !== 'undefined') {
        const storedHex = localStorage.getItem('accent-hex');
        const storedChoice = localStorage.getItem('accent-choice');
        if (storedHex && storedChoice) {
            return { hex: storedHex, choice: storedChoice };
        }
    }
    return { hex: accentHex.value, choice: accentChoice.value };
}

export function storeAccent(_hex: string, choice: string): void {
    const preset = presetForChoice(choice);

    if (!preset) {
        return;
    }

    accentHex.value = preset.hex;
    accentChoice.value = preset.id;
    if (typeof window !== 'undefined') {
        localStorage.setItem('accent-hex', preset.hex);
        localStorage.setItem('accent-choice', preset.id);
    }
    paintDocumentAccent();

    router.patch(
        '/preferences/accent',
        { accent: preset.id },
        {
            preserveScroll: true,
            preserveState: false,
            onSuccess: (page: any) => {
                if (page?.props?.auth?.user) {
                    page.props.auth.user.accent = preset.id;
                }
            },
        },
    );
}

export function useAccentScope() {
    const style = computed(() => ({
        '--accent-color': accentHex.value,
    }));
    const light = computed(() => isLightColor(accentHex.value));

    return {
        hex: accentHex,
        choice: accentChoice,
        style,
        light,
    };
}

export function normalizeHex(input: string): string | null {
    const match = input.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);

    if (!match) {
        return null;
    }

    let raw = match[1];

    if (raw.length === 3) {
        raw = raw
            .split('')
            .map((char) => char + char)
            .join('');
    }

    return `#${raw.toLowerCase()}`;
}

export function parseColor(
    input: string,
): { hex: string } | { error: string } {
    const value = input.trim();

    if (!value) {
        return { error: 'Enter a hex color or an RGB value.' };
    }

    const hex = normalizeHex(value);

    if (hex) {
        return { hex };
    }

    const rgb = value.match(
        /^rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})/i,
    ) ?? value.match(/^(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})$/);

    if (!rgb) {
        return {
            error: 'Use a hex color like #2563eb, or RGB like rgb(37, 99, 235).',
        };
    }

    const channels = [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];

    if (channels.some((channel) => channel > 255)) {
        return { error: 'RGB values must be from 0 to 255.' };
    }

    return {
        hex: `#${channels
            .map((channel) => channel.toString(16).padStart(2, '0'))
            .join('')}`,
    };
}

export function presetForHex(hex: string): AccentPresetId | null {
    const normalized = normalizeHex(hex);
    const match = accentPresets.find((preset) => preset.hex === normalized);

    return match?.id ?? null;
}

function isLightColor(hex: string): boolean {
    const normalized = normalizeHex(hex);

    if (!normalized) {
        return false;
    }

    const red = Number.parseInt(normalized.slice(1, 3), 16);
    const green = Number.parseInt(normalized.slice(3, 5), 16);
    const blue = Number.parseInt(normalized.slice(5, 7), 16);
    const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;

    return luminance > 170;
}
