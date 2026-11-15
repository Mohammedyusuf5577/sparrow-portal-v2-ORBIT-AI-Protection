import React, { useId } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type { PanelVariant, PaginationControls } from '../types';
import { PAGE_SIZE_OPTIONS, getPageItems, getPageRange } from '../utils/pagination';

export interface PaginationProps extends PaginationControls {
    variant?: PanelVariant;
    /** Disables every control (e.g. while a page is loading). */
    disabled?: boolean;
    /** Top border; turn off when the bar already sits inside its own bordered card. */
    bordered?: boolean;
    className?: string;
}

const THEME: Record<
    PanelVariant,
    { root: string; text: string; strong: string; select: string; chevron: string; nav: string; active: string; ellipsis: string }
> = {
    light: {
        root: 'border-surface-100',
        text: 'text-surface-600',
        strong: 'font-semibold text-surface-900',
        select: 'bg-white border-surface-200 text-surface-800 hover:border-orbit-400 focus:ring-orbit-500/20',
        chevron: 'text-surface-400',
        nav: 'bg-surface-100 text-surface-700 hover:bg-surface-200',
        active: 'bg-gradient-orbit text-white shadow-sm',
        ellipsis: 'bg-surface-100 text-surface-500',
    },
    dark: {
        root: 'border-gray-800/60',
        text: 'text-gray-400',
        strong: 'font-semibold text-gray-100',
        select: 'bg-gray-800 border-gray-700 text-gray-200 hover:border-indigo-500 focus:ring-indigo-500/30',
        chevron: 'text-gray-500',
        nav: 'bg-gray-800 text-gray-300 hover:bg-gray-700',
        active: 'bg-indigo-600 text-white shadow-sm',
        ellipsis: 'bg-gray-800 text-gray-500',
    },
};

const BASE_BUTTON =
    'inline-flex items-center justify-center h-10 min-w-[2.5rem] rounded-full text-sm font-semibold transition-colors';

/**
 * Pagination bar: "Rows per page" selector, "Showing X to Y of N results" and page buttons.
 * Always rendered - with zero results it shows "Showing 0 of 0 results" and disabled arrows.
 */
export const Pagination: React.FC<PaginationProps> = ({
    page,
    limit,
    totalItems,
    totalPages,
    onPageChange,
    onLimitChange,
    limitOptions = PAGE_SIZE_OPTIONS,
    variant = 'light',
    disabled = false,
    bordered = true,
    className = '',
}) => {
    const selectId = useId();
    const t = THEME[variant];
    const hasItems = totalItems > 0;
    const { start, end } = getPageRange(page, limit, totalItems);

    // If the current page size isn't one of the options (e.g. a hand-edited URL), still show it.
    const options = limitOptions.includes(limit)
        ? limitOptions
        : [...limitOptions, limit].sort((a, b) => a - b);

    const canGoPrevious = !disabled && hasItems && page > 1;
    const canGoNext = !disabled && hasItems && page < totalPages;

    return (
        <div
            className={`flex flex-col lg:flex-row items-center justify-between gap-4 px-6 py-4 select-none ${
                bordered ? `border-t ${t.root}` : ''
            } ${className}`}
        >
            {/* Left: rows per page + range */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-sm">
                <div className="flex items-center gap-3">
                    <label htmlFor={selectId} className={t.text}>
                        Rows per page
                    </label>
                    <div className="relative">
                        <select
                            id={selectId}
                            value={limit}
                            disabled={disabled}
                            onChange={(e) => onLimitChange(Number(e.target.value))}
                            className={`appearance-none rounded-lg border pl-3 pr-9 py-2 text-sm font-medium cursor-pointer transition-colors focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${t.select}`}
                        >
                            {options.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                        <ChevronDown
                            className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 ${t.chevron}`}
                            aria-hidden="true"
                        />
                    </div>
                </div>

                <p className={t.text} aria-live="polite">
                    {hasItems ? (
                        <>
                            Showing <span className={t.strong}>{start}</span> to <span className={t.strong}>{end}</span> of{' '}
                            <span className={t.strong}>{totalItems}</span> results
                        </>
                    ) : (
                        <>
                            Showing <span className={t.strong}>0</span> of <span className={t.strong}>0</span> results
                        </>
                    )}
                </p>
            </div>

            {/* Right: page navigation */}
            <nav aria-label="Pagination" className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => onPageChange(page - 1)}
                    disabled={!canGoPrevious}
                    aria-label="Previous page"
                    className={`${BASE_BUTTON} w-10 ${t.nav} disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent`}
                >
                    <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                </button>

                {getPageItems(page, totalPages).map((item) =>
                    typeof item === 'string' ? (
                        <span key={item} aria-hidden="true" className={`${BASE_BUTTON} px-3 ${t.ellipsis}`}>
                            …
                        </span>
                    ) : (
                        <button
                            key={item}
                            type="button"
                            onClick={() => onPageChange(item)}
                            disabled={disabled}
                            aria-label={`Page ${item}`}
                            aria-current={item === page ? 'page' : undefined}
                            className={`${BASE_BUTTON} px-3 disabled:cursor-not-allowed ${item === page ? t.active : t.nav}`}
                        >
                            {item}
                        </button>
                    )
                )}

                <button
                    type="button"
                    onClick={() => onPageChange(page + 1)}
                    disabled={!canGoNext}
                    aria-label="Next page"
                    className={`${BASE_BUTTON} w-10 ${t.nav} disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent`}
                >
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
            </nav>
        </div>
    );
};
