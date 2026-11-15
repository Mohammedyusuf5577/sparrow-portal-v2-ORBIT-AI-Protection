import React, { useEffect, useState } from 'react';
import { getLeaves, approveLeave, rejectLeave } from '../api/services';
import type { LeaveRequest } from '../types';
import { usePagination } from '../hooks/usePagination';
import { PaginatedGrid } from '../components/PaginatedPanel';
import { PageHeader } from '../components/PageHeader';
import { Avatar } from '../components/Avatar';
import { Segmented } from '../components/Segmented';
import { Status, formatEnum, type StatusTone } from '../components/StatusDot';
import { btn, inputCls, formatRange } from '../components/ui';
import { CalendarOff, Search } from 'lucide-react';

const STATUS_TONE: Record<string, StatusTone> = {
    PENDING: 'warning',
    APPROVED: 'positive',
    REJECTED: 'negative',
};

const FILTERS = [
    { value: '', label: 'All' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
];

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

    return (
        <div className="space-y-6">
            <PageHeader title="Leave requests" description="Review and manage employee leave applications" />

            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative w-full sm:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" strokeWidth={1.5} />
                    <input
                        type="text"
                        aria-label="Search by employee name"
                        placeholder="Search by employee name"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={`${inputCls} h-9 pl-9`}
                    />
                </div>
                <Segmented ariaLabel="Status" value={filter} onChange={setFilter} options={FILTERS} />
            </div>

            {/* Leave cards */}
            <PaginatedGrid
                gridClassName="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
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
                {pageItems.map((leave) => {
                    const range = formatRange(leave.startDate, leave.endDate);
                    return (
                        <div key={leave.id} className="panel p-5 flex flex-col">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <Avatar name={leave.employeeName} />
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-surface-900 truncate">{leave.employeeName}</p>
                                        <p className="text-xs text-surface-500 tabular-nums">
                                            {range.label}
                                            {range.days !== null && ` · ${range.days} ${range.days === 1 ? 'day' : 'days'}`}
                                        </p>
                                    </div>
                                </div>
                                <Status tone={STATUS_TONE[leave.status] ?? 'neutral'}>{formatEnum(leave.status)}</Status>
                            </div>

                            {leave.reason && <p className="mt-4 text-sm text-surface-600 line-clamp-3">{leave.reason}</p>}

                            {leave.status === 'PENDING' && (
                                <div className="mt-4 pt-4 border-t border-surface-200 flex items-center gap-2">
                                    <button onClick={() => handleApprove(leave.id)} className={`${btn.secondary} flex-1`}>
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(leave.id)}
                                        className={`${btn.secondary} flex-1 !text-accent-rose hover:!bg-red-50 hover:!border-red-200`}
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </PaginatedGrid>
        </div>
    );
};

export default LeavesPage;
