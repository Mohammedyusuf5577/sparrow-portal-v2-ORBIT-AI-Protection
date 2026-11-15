import React, { useEffect, useState } from 'react';
import { getAttendance, updateAttendance, deleteAttendance } from '../api/services';
import type { Attendance } from '../types';
import { usePagination } from '../hooks/usePagination';
import { PaginatedPanel } from '../components/PaginatedPanel';
import { PageHeader } from '../components/PageHeader';
import { Avatar } from '../components/Avatar';
import { FormField } from '../components/FormField';
import { Stat } from '../components/Stat';
import { Status, formatEnum, type StatusTone } from '../components/StatusDot';
import { btn, inputCls, formatDate, formatTime } from '../components/ui';
import { CalendarCheck, Search, Eye, Pencil, Trash2, X } from 'lucide-react';

const STATUS_TONE: Record<string, StatusTone> = {
    PRESENT: 'positive',
    ABSENT: 'negative',
    LATE: 'warning',
};

const AttendancePage: React.FC = () => {
    const [records, setRecords] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
    const [selectedRecord, setSelectedRecord] = useState<Attendance | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchAttendance();
    }, []);

    // Escape closes the dialog
    useEffect(() => {
        if (!isModalOpen) return;
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsModalOpen(false);
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isModalOpen]);

    const fetchAttendance = async () => {
        try {
            const res = await getAttendance();
            setRecords(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRecord) return;

        setIsSubmitting(true);
        try {
            await updateAttendance(selectedRecord.id, {
                status: selectedRecord.status,
                checkInTime: selectedRecord.checkInTime,
                checkOutTime: selectedRecord.checkOutTime
            });
            setIsModalOpen(false);
            fetchAttendance();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this record?')) return;
        try {
            await deleteAttendance(id);
            fetchAttendance();
        } catch (err) {
            console.error(err);
        }
    };

    const filtered = records.filter((r) =>
        r.employeeName.toLowerCase().includes(search.toLowerCase())
    );

    // Client-side pagination (back to page 1 when the search changes)
    const { pageItems, paginationProps } = usePagination(filtered, { resetKey: search });

    const count = (status: string) => records.filter((r) => r.status === status).length;

    return (
        <div className="space-y-6">
            <PageHeader title="Attendance" description="Track daily attendance records" />

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Stat label="Present" tone="positive" value={count('PRESENT')} />
                <Stat label="Absent" tone="negative" value={count('ABSENT')} />
                <Stat label="Late" tone="warning" value={count('LATE')} />
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" strokeWidth={1.5} />
                <input
                    type="text"
                    aria-label="Search by employee name"
                    placeholder="Search by name"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={`${inputCls} h-9 pl-9`}
                />
            </div>

            {/* Table */}
            <PaginatedPanel
                loading={loading}
                isEmpty={filtered.length === 0}
                empty={{
                    icon: CalendarCheck,
                    title: search ? 'No attendance records match your search' : 'No attendance records found',
                    description: search
                        ? 'Try a different employee name.'
                        : 'Attendance records will appear here once they are recorded.',
                }}
                pagination={paginationProps}
                tbodyClassName="divide-y divide-surface-100"
                tableHead={
                    <tr className="bg-surface-50 border-b border-surface-200">
                        <th className="th">Employee</th>
                        <th className="th">Date</th>
                        <th className="th">Status</th>
                        <th className="th">Check in</th>
                        <th className="th">Check out</th>
                        <th className="th text-right">Actions</th>
                    </tr>
                }
            >
                {pageItems.map((record) => (
                    <tr key={record.id} className="hover:bg-surface-50 transition-colors duration-150">
                        <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                                <Avatar name={record.employeeName} />
                                <span className="text-sm font-medium text-surface-900 whitespace-nowrap">{record.employeeName}</span>
                            </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-surface-600 tabular-nums">{formatDate(record.date)}</td>
                        <td className="px-5 py-3">
                            <Status tone={STATUS_TONE[record.status] ?? 'neutral'}>{formatEnum(record.status)}</Status>
                        </td>
                        <td className="px-5 py-3 text-sm text-surface-600 tabular-nums">{formatTime(record.checkInTime)}</td>
                        <td className="px-5 py-3 text-sm text-surface-600 tabular-nums">{formatTime(record.checkOutTime)}</td>
                        <td className="px-5 py-3">
                            <div className="flex items-center justify-end gap-1">
                                <button
                                    onClick={() => {
                                        setSelectedRecord(record);
                                        setModalMode('view');
                                        setIsModalOpen(true);
                                    }}
                                    className={btn.icon}
                                    title="View details"
                                    aria-label={`View record for ${record.employeeName}`}
                                >
                                    <Eye className="w-4 h-4" strokeWidth={1.5} />
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedRecord(record);
                                        setModalMode('edit');
                                        setIsModalOpen(true);
                                    }}
                                    className={btn.icon}
                                    title="Edit record"
                                    aria-label={`Edit record for ${record.employeeName}`}
                                >
                                    <Pencil className="w-4 h-4" strokeWidth={1.5} />
                                </button>
                                <button
                                    onClick={() => handleDelete(record.id)}
                                    className={btn.iconDanger}
                                    title="Delete record"
                                    aria-label={`Delete record for ${record.employeeName}`}
                                >
                                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </PaginatedPanel>

            {/* Dialog */}
            {isModalOpen && selectedRecord && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in"
                    onMouseDown={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="attendance-dialog-title"
                        className="bg-white rounded-xl border border-surface-200 shadow-elevated w-full max-w-lg overflow-hidden animate-scale-up"
                    >
                        <div className="px-6 py-4 border-b border-surface-200 flex items-center justify-between">
                            <h2 id="attendance-dialog-title" className="text-base font-medium text-surface-900">
                                {modalMode === 'edit' ? 'Edit attendance record' : 'Attendance details'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className={btn.icon}
                                aria-label="Close dialog"
                            >
                                <X className="w-4 h-4" strokeWidth={1.5} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-surface-700">Employee</p>
                                    <p className="mt-1.5 h-10 flex items-center text-sm text-surface-900">{selectedRecord.employeeName}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-surface-700">Date</p>
                                    <p className="mt-1.5 h-10 flex items-center text-sm text-surface-900 tabular-nums">
                                        {formatDate(selectedRecord.date)}
                                    </p>
                                </div>
                            </div>

                            <FormField label="Status" htmlFor="attendance-status">
                                <select
                                    id="attendance-status"
                                    disabled={modalMode === 'view'}
                                    value={selectedRecord.status}
                                    onChange={(e) => setSelectedRecord({ ...selectedRecord, status: e.target.value })}
                                    className={`${inputCls} cursor-pointer`}
                                >
                                    <option value="PRESENT">Present</option>
                                    <option value="ABSENT">Absent</option>
                                    <option value="LATE">Late</option>
                                </select>
                            </FormField>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Check in" htmlFor="attendance-in">
                                    <input
                                        id="attendance-in"
                                        type="datetime-local"
                                        disabled={modalMode === 'view'}
                                        value={selectedRecord.checkInTime ? selectedRecord.checkInTime.slice(0, 19) : ''}
                                        onChange={(e) => setSelectedRecord({ ...selectedRecord, checkInTime: e.target.value })}
                                        className={inputCls}
                                    />
                                </FormField>
                                <FormField label="Check out" htmlFor="attendance-out">
                                    <input
                                        id="attendance-out"
                                        type="datetime-local"
                                        disabled={modalMode === 'view'}
                                        value={selectedRecord.checkOutTime ? selectedRecord.checkOutTime.slice(0, 19) : ''}
                                        onChange={(e) => setSelectedRecord({ ...selectedRecord, checkOutTime: e.target.value })}
                                        className={inputCls}
                                    />
                                </FormField>
                            </div>

                            {modalMode === 'edit' && (
                                <div className="pt-4 flex items-center justify-end gap-2 border-t border-surface-200">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className={btn.secondary}>
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={isSubmitting} className={btn.primary}>
                                        {isSubmitting ? 'Saving' : 'Save changes'}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendancePage;
