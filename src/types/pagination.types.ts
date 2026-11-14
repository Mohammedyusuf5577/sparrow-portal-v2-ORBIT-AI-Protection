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
