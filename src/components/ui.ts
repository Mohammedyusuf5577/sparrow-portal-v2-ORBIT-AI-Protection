/**
 * Shared class recipes so every screen uses the same control sizes, radii and states.
 * Controls are 36px tall (h-9) with an 8px radius; inputs are 40px (h-10).
 */
const BTN_BASE =
    'inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg text-sm font-medium whitespace-nowrap transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed';

export const btn = {
    primary: `${BTN_BASE} bg-orbit-600 text-white hover:bg-orbit-700`,
    secondary: `${BTN_BASE} bg-white text-surface-700 border border-surface-200 hover:bg-surface-50 hover:border-surface-300`,
    ghost: `${BTN_BASE} text-surface-600 hover:bg-surface-100 hover:text-surface-900`,
    danger: `${BTN_BASE} bg-accent-rose text-white hover:bg-red-700`,
    /** Square icon-only button, used for row actions. */
    icon: 'inline-flex items-center justify-center h-8 w-8 rounded-lg text-surface-500 hover:bg-surface-100 hover:text-surface-900 transition-colors duration-150 disabled:opacity-50',
    iconDanger:
        'inline-flex items-center justify-center h-8 w-8 rounded-lg text-surface-500 hover:bg-red-50 hover:text-accent-rose transition-colors duration-150 disabled:opacity-50',
} as const;

export const inputCls =
    'w-full h-10 px-3 rounded-lg border border-surface-200 bg-white text-sm text-surface-900 hover:border-surface-300 focus:outline-none focus:ring-2 focus:ring-orbit-600/20 focus:border-orbit-600 transition-colors duration-150 disabled:bg-surface-50 disabled:text-surface-500 disabled:hover:border-surface-200';

/** Compact select for toolbars (36px tall). */
export const selectCls =
    'h-9 pl-3 pr-8 rounded-lg border border-surface-200 bg-white text-sm text-surface-700 hover:border-surface-300 focus:outline-none focus:ring-2 focus:ring-orbit-600/20 focus:border-orbit-600 cursor-pointer transition-colors duration-150';

export const textareaCls =
    'w-full px-3 py-2.5 rounded-lg border border-surface-200 bg-white text-sm text-surface-900 hover:border-surface-300 focus:outline-none focus:ring-2 focus:ring-orbit-600/20 focus:border-orbit-600 transition-colors duration-150 disabled:bg-surface-50 disabled:text-surface-500';

/** Date used in tables and cards: "1 Mar 2024". */
export const formatDate = (value?: string | null): string => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

/** Indian rupee amount with grouping: "₹38,500". Keeps paise only when present. */
export const formatINR = (value?: number | null): string => {
    if (value === undefined || value === null || Number.isNaN(value)) return '—';
    return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};
