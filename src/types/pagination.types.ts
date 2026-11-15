export interface PageMeta {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

export interface PageResponse<T> {
    items: T[];
    meta: PageMeta;
}

/** Visual theme of the shared list / pagination components. */
export type PanelVariant = 'light' | 'dark';

/**
 * Everything the <Pagination /> bar needs. Produced by usePagination() for client-side
 * lists, or built from the server's PageMeta for server-side lists (e.g. Projects).
 */
export interface PaginationControls {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    limitOptions?: readonly number[];
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
}
