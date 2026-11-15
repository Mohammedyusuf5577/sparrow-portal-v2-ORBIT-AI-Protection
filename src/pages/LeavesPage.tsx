import React, { useEffect, useState } from 'react';
import { getLeaves, approveLeave, rejectLeave } from '../api/services';
import type { LeaveRequest } from '../types';
import { usePagination } from '../hooks/usePagination';
import { PaginatedGrid } from '../components/PaginatedPanel';
import { CalendarOff, Check, X, Clock, Search, Filter } from 'lucide-react';

const LeavesPage: React.FC = () => {
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchLeaves();
    }, [filter]);

    const fetchLeaves = async () => {
        try {
            const res = await getLeaves(filter || undefined);
            setLeaves(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await approveLeave(id);
            fetchLeaves();
        } catch (err) {
            console.error(err);
        }
    };

    const handleReject = async (id: string) => {
        try {
            await rejectLeave(id);
            fetchLeaves();
        } catch (err) {
            console.error(err);
        }
    };

    const filtered = leaves.filter((l) =>
        l.employeeName.toLowerCase().includes(search.toLowerCase())
    );

    // Client-side pagination (back to page 1 when the status filter or search changes)
    const { pageItems, paginationProps } = usePagination(filtered, { resetKey: `${filter}|${search}` });

    const statusColors: Record<string, string> = {
        PENDING: 'bg-amber-50 text-accent-amber border-amber-200',
        APPROVED: 'bg-green-50 text-accent-emerald border-green-200',
        REJECTED: 'bg-red-50 text-accent-rose border-red-200',
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-medium text-surface-900">Leave Requests</h1>
                <p className="text-sm text-surface-500 mt-1">Review and manage employee leave applications</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input
                        type="text"
                        placeholder="Search by employee name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-200 bg-white text-sm
              focus:outline-none focus:ring-2 focus:ring-orbit-500/30 focus:border-orbit-500 transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    {['', 'PENDING', 'APPROVED', 'REJECTED'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-2.5 rounded-lg text-xs font-medium transition-colors ${filter === s
                                    ? 'bg-orbit-600 text-white shadow-glow'
                                    : 'bg-white text-surface-600 border border-surface-200 hover:border-orbit-300'
                                }`}
                        >
                            {s || 'All'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Leave Cards */}
            <PaginatedGrid
                gridClassName="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
                loading={loading}
                isEmpty={filtered.length === 0}
                empty={{
                    icon: CalendarOff,
                    title: search || filter ? 'No leave requests match your filter' : 'No leave requests found',
                    description: search || filter
                        ? 'Try a different name or status.'
                        : 'Leave applications from employees will appear here.',
                }}
                pagination={paginationProps}
            >
                {pageItems.map((leave, i) => (
                    <div
                        key={leave.id}
                        className="bg-white rounded-xl p-5 shadow-card border border-surface-100 hover:border-surface-300 transition-colors duration-150"
                        style={{ animationDelay: `${i * 0.05}s` }}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orbit-500 to-orbit-700 flex items-center justify-center text-white text-sm font-medium">
                                    {leave.employeeName?.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-surface-900">{leave.employeeName}</p>
                                    <p className="text-xs text-surface-400">
                                        {new Date(leave.startDate).toLocaleDateString()} — {new Date(leave.endDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${statusColors[leave.status]}`}>
                                {leave.status === 'PENDING' && <Clock className="w-3 h-3" />}
                                {leave.status === 'APPROVED' && <Check className="w-3 h-3" />}
                                {leave.status === 'REJECTED' && <X className="w-3 h-3" />}
                                {leave.status}
                            </span>
                        </div>

                        {leave.reason && (
                            <p className="text-xs text-surface-500 mb-4 p-3 rounded-lg bg-surface-50">
                                "{leave.reason}"
                            </p>
                        )}

                        {leave.status === 'PENDING' && (
                            <div className="flex items-center gap-2 pt-3 border-t border-surface-100">
                                <button
                                    onClick={() => handleApprove(leave.id)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-white bg-accent-emerald rounded-lg hover:bg-green-600 transition-colors"
                                >
                                    <Check className="w-3.5 h-3.5" /> Approve
                                </button>
                                <button
                                    onClick={() => handleReject(leave.id)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-white bg-accent-rose rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" /> Reject
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </PaginatedGrid>
        </div>
    );
};

export default LeavesPage;
