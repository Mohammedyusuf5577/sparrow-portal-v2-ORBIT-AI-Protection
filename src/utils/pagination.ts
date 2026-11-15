/**
 * Generic pagination logic (framework-free, pure functions).
 *
 * Single source of truth for page maths used by:
 *  - hooks/usePagination.ts   (client-side lists)
 *  - hooks/useProjects.ts     (server-side lists: sanitising URL params)
 *  - components/Pagination.tsx (range text and page buttons)
 */

/** Allowed page sizes. Must match the backend's PageValidator (10, 25, 50, 100). */
export const PAGE_SIZE_OPTIONS: readonly number[] = [10, 25, 50, 100];
export const DEFAULT_PAGE_SIZE = 10;

export type PageItem = number | 'ellipsis-start' | 'ellipsis-end';

/** Parses a positive integer, returning `fallback` for anything else (NaN, 0, negatives, decimals, null...). */
export const toPositiveInt = (value: unknown, fallback: number): number => {
    const n = typeof value === 'number' ? value : Number(value);
    return Number.isInteger(n) && n > 0 ? n : fallback;
};

/** Returns `value` if it is an allowed page size, otherwise `fallback`. */
export const normalizePageSize = (
    value: unknown,
    options: readonly number[] = PAGE_SIZE_OPTIONS,
    fallback: number = DEFAULT_PAGE_SIZE
): number => {
    const n = toPositiveInt(value, fallback);
    return options.includes(n) ? n : fallback;
};

/** 0 when there are no items, otherwise ceil(totalItems / pageSize). */
export const getTotalPages = (totalItems: number, pageSize: number): number =>
    totalItems > 0 && pageSize > 0 ? Math.ceil(totalItems / pageSize) : 0;

/** Keeps `page` inside 1..totalPages (always 1 when the list is empty). */
export const clampPage = (page: number, totalPages: number): number =>
    totalPages <= 0 ? 1 : Math.min(Math.max(1, Math.trunc(page) || 1), totalPages);

/** 1-based inclusive range of the items on `page`; {0, 0} for an empty list. */
export const getPageRange = (
    page: number,
    pageSize: number,
    totalItems: number
): { start: number; end: number } => {
    if (totalItems <= 0) return { start: 0, end: 0 };
    return {
        start: Math.min((page - 1) * pageSize + 1, totalItems),
        end: Math.min(page * pageSize, totalItems),
    };
};

/**
 * Page buttons to render, e.g. [1, 2, 'ellipsis-end', 8] or [1, 'ellipsis-start', 4, 5, 6, 'ellipsis-end', 12].
 * Shows every page when there are 7 or fewer.
 */
export const getPageItems = (page: number, totalPages: number): PageItem[] => {
    if (totalPages <= 0) return [];
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

    const items: PageItem[] = [1];
    if (page > 3) items.push('ellipsis-start');
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) items.push(i);
    if (page < totalPages - 2) items.push('ellipsis-end');
    items.push(totalPages);
    return items;
};

/** Slice of `items` that belongs to `page` (page is clamped, so it never returns a phantom empty page). */
export const paginateItems = <T>(items: readonly T[], page: number, pageSize: number): T[] => {
    const safePage = clampPage(page, getTotalPages(items.length, pageSize));
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
};
