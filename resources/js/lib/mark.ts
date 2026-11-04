/** Closing ring: a habit loop with the check standing in for the missing arc. */

export const MARK_RING = 'M20.29 45A17.5 17.5 0 1 1 43.71 45';

export const MARK_CHECK = 'M25.88 36.59L32 49.5L41.96 28.74';

export function markSvg(ink: string): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="1.5" y="1.5" width="61" height="61" rx="18" fill="${ink}" fill-opacity="0.16"/><path d="${MARK_RING}" fill="none" stroke="${ink}" stroke-width="6.5" stroke-linecap="round"/><path d="${MARK_CHECK}" fill="none" stroke="${ink}" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
