import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PaginationControls } from '../types';
import {
    DEFAULT_PAGE_SIZE,
    PAGE_SIZE_OPTIONS,
    clampPage,
    getTotalPages,
    normalizePageSize,
    paginateItems,
} from '../utils/pagination';

export interface UsePaginationOptions {
    initialLimit?: number;
    limitOptions?: readonly number[];
    /**
     * Whenever this value changes the list returns to page 1.
     * Pass a string built from the list's search/filter/tab state, e.g. `${tab}|${search}`.
     */
    resetKey?: string | number;
}

/**
 * Client-side pagination for lists that are already fully loaded in memory.
 *
 * - The current page is always valid: it is clamped when the list shrinks
 *   (deleting the last row of the last page, narrowing a search, ...).
 * - `paginationProps` plugs straight into <Pagination /> / <PaginatedPanel />.
 */
export function usePagination<T>(items: readonly T[], options: UsePaginationOptions = {}) {
    const { initialLimit = DEFAULT_PAGE_SIZE, limitOptions = PAGE_SIZE_OPTIONS, resetKey } = options;

    const [limit, setLimit] = useState<number>(() => normalizePageSize(initialLimit, limitOptions));
    const [requestedPage, setRequestedPage] = useState(1);

    const totalItems = items.length;
    const totalPages = getTotalPages(totalItems, limit);
    const page = clampPage(requestedPage, totalPages);

    // Keep the stored page in sync with the clamped one so it cannot "jump back" later.
    useEffect(() => {
        if (requestedPage !== page) setRequestedPage(page);
    }, [requestedPage, page]);

    // Back to page 1 whenever the caller's filters change.
    useEffect(() => {
        setRequestedPage(1);
    }, [resetKey]);

    const onPageChange = useCallback(
        (next: number) => setRequestedPage(clampPage(next, totalPages)),
        [totalPages]
    );

    const onLimitChange = useCallback(
        (next: number) => {
            setLimit(normalizePageSize(next, limitOptions));
            setRequestedPage(1);
        },
        [limitOptions]
    );

    const pageItems = useMemo(() => paginateItems(items, page, limit), [items, page, limit]);

    const paginationProps: PaginationControls = {
        page,
        limit,
        totalItems,
        totalPages,
        limitOptions,
        onPageChange,
        onLimitChange,
    };

    return { pageItems, page, limit, totalItems, totalPages, paginationProps };
}

interface PageOverflowGuardArgs {
    page: number;
    totalPages: number;
    totalItems: number;
    loading: boolean;
    onPageChange: (page: number) => void;
}

/**
 * For server-side lists: if the requested page no longer exists (e.g. the last row of the
 * last page was deleted, or a stale ?page=9 URL) jump to the last valid page instead of
 * leaving the user on an empty page.
 */
export function usePageOverflowGuard({
    page,
    totalPages,
    totalItems,
    loading,
    onPageChange,
}: PageOverflowGuardArgs): void {
    useEffect(() => {
        if (loading) return;
        if (totalItems > 0 && totalPages > 0 && page > totalPages) {
            onPageChange(totalPages);
        }
    }, [loading, page, totalPages, totalItems, onPageChange]);
}
