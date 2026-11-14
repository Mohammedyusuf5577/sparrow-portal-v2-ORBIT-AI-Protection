import React, { useEffect, useState, useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Legend,
} from 'recharts';
import { getProjectStats } from '../api/services';
import type { ProjectStats } from '../types';
import { TrendingUp, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface ProjectAnalyticsStripProps {
    year: number;
    onYearChange: (year: number) => void;
}

export const ProjectAnalyticsStrip: React.FC<ProjectAnalyticsStripProps> = ({
    year,
    onYearChange,
}) => {
    const [stats, setStats] = useState<ProjectStats | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const currentYear = new Date().getFullYear();
    const availableYears = useMemo(
        () => [currentYear - 2, currentYear - 1, currentYear, currentYear + 1],
        [currentYear]
    );

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(null);

        getProjectStats(year, controller.signal)
            .then((res) => {
                if (res.data?.data) {
                    setStats(res.data.data);
                }
            })
            .catch((err) => {
                if (err.name !== 'CanceledError') {
                    setError('Failed to load project analytics.');
                }
            })
            .finally(() => {
                setLoading(false);
            });

        return () => controller.abort();
    }, [year]);

    const chartData = useMemo(() => {
        if (!stats?.monthlyBreakdown) return [];
        return stats.monthlyBreakdown.map((m) => ({
            name: m.monthName,
            Completed: m.completed,
            'In Progress': m.inProgress,
            Delayed: m.delayed,
        }));
    }, [stats]);

    return (
        <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-card space-y-6">
            {/* Header with Title and Year Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-orbit-50 rounded-xl text-orbit-600">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-surface-900">Project Velocity & Trends</h2>
                        <p className="text-xs text-surface-500">Monthly project distribution and completion rates</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <label htmlFor="analytics-year" className="text-xs font-medium text-surface-500">
                        Year:
                    </label>
                    <select
                        id="analytics-year"
                        value={year}
                        onChange={(e) => onYearChange(Number(e.target.value))}
                        className="bg-surface-50 border border-surface-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-surface-800 hover:border-orbit-400 focus:outline-none focus:ring-2 focus:ring-orbit-500/20 cursor-pointer"
                    >
                        {availableYears.map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Metric KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-surface-50 border border-surface-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-surface-500">Total Projects</p>
                        <p className="text-xl font-bold text-surface-900 mt-1">
                            {loading ? '—' : stats?.totalProjects ?? 0}
                        </p>
                    </div>
                    <div className="p-2.5 bg-surface-200/60 rounded-xl text-surface-600">
                        <TrendingUp className="w-4 h-4" />
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-emerald-700">Completed</p>
                        <p className="text-xl font-bold text-emerald-900 mt-1">
                            {loading ? '—' : stats?.totalCompleted ?? 0}
                        </p>
                    </div>
                    <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-600">
                        <CheckCircle className="w-4 h-4" />
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-orbit-50/50 border border-orbit-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-orbit-700">In Progress</p>
                        <p className="text-xl font-bold text-orbit-900 mt-1">
                            {loading ? '—' : stats?.totalInProgress ?? 0}
                        </p>
                    </div>
                    <div className="p-2.5 bg-orbit-100 rounded-xl text-orbit-600">
                        <Clock className="w-4 h-4" />
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-rose-700">Delayed</p>
                        <p className="text-xl font-bold text-rose-900 mt-1">
                            {loading ? '—' : stats?.totalDelayed ?? 0}
                        </p>
                    </div>
                    <div className="p-2.5 bg-rose-100 rounded-xl text-rose-600">
                        <AlertTriangle className="w-4 h-4" />
                    </div>
                </div>
            </div>

            {/* Bar chart */}
            <div className="h-64 w-full">
                {loading ? (
                    <div className="w-full h-full flex items-center justify-center text-xs text-surface-400">
                        Loading charts...
                    </div>
                ) : error ? (
                    <div className="w-full h-full flex items-center justify-center text-xs text-rose-500">
                        {error}
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center text-xs text-surface-400">
                        No project data for {year}.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="name"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: '#71717a', fontSize: 11 }}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                                tick={{ fill: '#71717a', fontSize: 11 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#18181b',
                                    borderRadius: '12px',
                                    border: 'none',
                                    color: '#fff',
                                    fontSize: '12px',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                                }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Legend
                                iconType="circle"
                                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                            />
                            <Bar dataKey="Completed" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
                            <Bar dataKey="In Progress" fill="#5c7cfa" radius={[4, 4, 0, 0]} maxBarSize={30} />
                            <Bar dataKey="Delayed" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={30} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};
