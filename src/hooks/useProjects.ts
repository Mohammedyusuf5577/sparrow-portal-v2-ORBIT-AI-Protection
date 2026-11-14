import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProjects } from '../api/services';
import type { Project, PageMeta, ProjectStatusType } from '../types';

export const useProjects = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // Read state strictly from URL query parameters (single source of truth)
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const status = (searchParams.get('status') || '') as ProjectStatusType | '';
    const month = searchParams.get('month') ? Number(searchParams.get('month')) : '';
    const year = searchParams.get('year') ? Number(searchParams.get('year')) : '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'DESC') as 'ASC' | 'DESC';

    const [projects, setProjects] = useState<Project[]>([]);
    const [meta, setMeta] = useState<PageMeta>({
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Keep previous data via ref to prevent flicker/blank flash while loading
    const previousDataRef = useRef<{ projects: Project[]; meta: PageMeta } | null>(null);

    const fetchProjects = useCallback(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(null);

        getProjects(
            {
                page,
                limit,
                search: search.trim() || undefined,
                status: status || undefined,
                month: month !== '' ? Number(month) : undefined,
                year: year !== '' ? Number(year) : undefined,
                sortBy,
                sortOrder,
            },
            controller.signal
        )
            .then((res) => {
                if (res.data?.data) {
                    const { items, meta: pageMeta } = res.data.data;
                    setProjects(items);
                    setMeta(pageMeta);
                    previousDataRef.current = { projects: items, meta: pageMeta };
                }
            })
            .catch((err) => {
                if (err.name !== 'CanceledError') {
                    setError('Failed to fetch projects. Please try again.');
                    // Restore previous data if available
                    if (previousDataRef.current) {
                        setProjects(previousDataRef.current.projects);
                        setMeta(previousDataRef.current.meta);
                    }
                }
            })
            .finally(() => {
                setLoading(false);
            });

        return () => controller.abort();
    }, [page, limit, search, status, month, year, sortBy, sortOrder]);

    useEffect(() => {
        const cancel = fetchProjects();
        return cancel;
    }, [fetchProjects]);

    const updateParams = useCallback(
        (newParams: Record<string, string | number | undefined | null>) => {
            setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                Object.entries(newParams).forEach(([k, v]) => {
                    if (v === undefined || v === null || v === '') {
                        next.delete(k);
                    } else {
                        next.set(k, String(v));
                    }
                });
                return next;
            });
        },
        [setSearchParams]
    );

    return {
        projects,
        meta,
        loading,
        error,
        page,
        limit,
        search,
        status,
        month,
        year,
        sortBy,
        sortOrder,
        updateParams,
        refetch: fetchProjects,
    };
};
