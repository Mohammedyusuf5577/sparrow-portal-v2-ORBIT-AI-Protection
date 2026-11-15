import { useState, useEffect, useCallback } from 'react';
import { getProjectStats } from '../api/services';
import type { ProjectStats } from '../types';

/** Monthly project counts for one year. Switching the year cancels the request still in flight. */
export const useProjectStats = (year: number) => {
    const [stats, setStats] = useState<ProjectStats | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(null);

        getProjectStats(year, controller.signal)
            .then((res) => {
                setStats(res.data?.data ?? null);
            })
            .catch((err) => {
                if (err.name !== 'CanceledError') {
                    setError('Failed to load project statistics.');
                }
            })
            .finally(() => {
                // A cancelled request must not switch loading off for the newer one.
                if (!controller.signal.aborted) setLoading(false);
            });

        return () => controller.abort();
    }, [year]);

    useEffect(() => {
        const cancel = fetchStats();
        return cancel;
    }, [fetchStats]);

    return { stats, loading, error, refetch: fetchStats };
};
