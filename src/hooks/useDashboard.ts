import { useState, useEffect, useCallback } from 'react';
import { getDashboardSummary } from '../api/services';
import type { DashboardSummary } from '../types';

export const useDashboard = () => {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSummary = useCallback(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(null);

        getDashboardSummary(controller.signal)
            .then((res) => {
                if (res.data?.data) {
                    setSummary(res.data.data);
                }
            })
            .catch((err) => {
                if (err.name !== 'CanceledError') {
                    setError('Failed to load dashboard summary data.');
                }
            })
            .finally(() => {
                setLoading(false);
            });

        return () => controller.abort();
    }, []);

    useEffect(() => {
        const cancel = fetchSummary();
        return cancel;
    }, [fetchSummary]);

    return {
        summary,
        loading,
        error,
        refetch: fetchSummary,
    };
};
