import React, { useEffect, useState } from 'react';
import { getAttendance, updateAttendance, deleteAttendance } from '../api/services';
import type { Attendance } from '../types';
import { usePagination } from '../hooks/usePagination';
import { PaginatedPanel } from '../components/PaginatedPanel';
import { CalendarCheck, UserCheck, UserX, Clock, Search, Eye, Edit2, Trash2, X } from 'lucide-react';

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

    const statusConfig: Record<string, { color: string; bg: string; icon: any }> = {
        PRESENT: { color: 'text-accent-emerald', bg: 'bg-green-50 border-green-200', icon: UserCheck },
        ABSENT: { color: 'text-accent-rose', bg: 'bg-red-50 border-red-200', icon: UserX },
        LATE: { color: 'text-accent-amber', bg: 'bg-amber-50 border-amber-200', icon: Clock },
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-medium text-surface-900">Attendance</h1>
                    <p className="text-sm text-surface-500 mt-1">Track daily attendance records</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Present', count: records.filter((r) => r.status === 'PRESENT').length, color: 'from-accent-emerald to-emerald-700', icon: UserCheck },
                    { label: 'Absent', count: records.filter((r) => r.status === 'ABSENT').length, color: 'from-accent-rose to-rose-700', icon: UserX },
                    { label: 'Late', count: records.filter((r) => r.status === 'LATE').length, color: 'from-accent-amber to-amber-600', icon: Clock },
                ].map((s, i) => (
                    <div key={i} className="bg-white rounded-xl p-5 shadow-card" style={{ animationDelay: `${i * 0.1}s` }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-medium text-surface-900">{s.count}</p>
                                <p className="text-sm text-surface-500">{s.label}</p>
                            </div>
                            <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                                <s.icon className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-200 bg-white text-sm
            focus:outline-none focus:ring-2 focus:ring-orbit-500/30 focus:border-orbit-500 transition-all"
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
                tbodyClassName="divide-y divide-surface-50"
                tableHead={
                    <tr className="bg-surface-50 border-b border-surface-100">
                        <th className="text-left text-xs font-medium text-surface-500 px-6 py-3.5">Employee</th>
                        <th className="text-left text-xs font-medium text-surface-500 px-6 py-3.5">Date</th>
                        <th className="text-left text-xs font-medium text-surface-500 px-6 py-3.5">Status</th>
                        <th className="text-left text-xs font-medium text-surface-500 px-6 py-3.5">Check In</th>
                        <th className="text-left text-xs font-medium text-surface-500 px-6 py-3.5">Check Out</th>
                        <th className="text-right text-xs font-medium text-surface-500 px-6 py-3.5">Actions</th>
                    </tr>
                }
            >
                {pageItems.map((record, i) => {
                const config = statusConfig[record.status] || statusConfig.PRESENT;
                return (
                    <tr key={record.id} className="hover:bg-orbit-50/30 transition-colors" style={{ animationDelay: `${i * 0.03}s` }}>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-orbit-50 flex items-center justify-center text-orbit-600 text-sm font-medium">
                                    {record.employeeName?.charAt(0)}
                                </div>
                                <span className="text-sm font-medium text-surface-800">{record.employeeName}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-surface-600">
                            {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${config.bg} ${config.color}`}>
                                <config.icon className="w-3 h-3" />
                                {record.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-surface-500">
                            {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-surface-500">
                            {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                                <button
                                    onClick={() => {
                                        setSelectedRecord(record);
                                        setModalMode('view');
                                        setIsModalOpen(true);
                                    }}
                                    className="p-1.5 text-surface-400 hover:text-orbit-600 hover:bg-orbit-50 rounded-lg transition-colors"
                                    title="View Details"
                                >
                                    <Eye className="w-4.5 h-4.5" />
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedRecord(record);
                                        setModalMode('edit');
                                        setIsModalOpen(true);
                                    }}
                                    className="p-1.5 text-surface-400 hover:text-orbit-600 hover:bg-orbit-50 rounded-lg transition-colors"
                                    title="Edit Record"
                                >
                                    <Edit2 className="w-4.5 h-4.5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(record.id)}
                                    className="p-1.5 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete Record"
                                >
                                    <Trash2 className="w-4.5 h-4.5" />
                                </button>
                            </div>
                        </td>
                    </tr>
                );
                })}
            </PaginatedPanel>

            {/* Modal */}
            {isModalOpen && selectedRecord && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/50 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-elevated w-full max-w-lg overflow-hidden animate-scale-up">
                        <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between bg-surface-50">
                            <h2 className="text-lg font-medium text-surface-900">
                                {modalMode === 'edit' ? 'Edit Attendance Record' : 'Attendance Details'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-surface-200 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-surface-500" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-surface-500 mb-1">Employee</label>
                                    <div className="px-4 py-2.5 rounded-lg bg-surface-50 border border-surface-200 text-surface-900 text-sm font-medium">
                                        {selectedRecord.employeeName}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-surface-500 mb-1">Date</label>
                                        <div className="px-4 py-2.5 rounded-lg bg-surface-50 border border-surface-200 text-surface-900 text-sm font-medium">
                                            {new Date(selectedRecord.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-surface-500 mb-1">Status</label>
                                        <select
                                            disabled={modalMode === 'view'}
                                            value={selectedRecord.status}
                                            onChange={(e) => setSelectedRecord({ ...selectedRecord, status: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-surface-200 focus:ring-2 focus:ring-orbit-500/20 focus:border-orbit-500 outline-none transition-colors disabled:bg-surface-50 disabled:text-surface-500"
                                        >
                                            <option value="PRESENT">Present</option>
                                            <option value="ABSENT">Absent</option>
                                            <option value="LATE">Late</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-surface-500 mb-1">Check In Time</label>
                                        <input
                                            type="datetime-local"
                                            disabled={modalMode === 'view'}
                                            value={selectedRecord.checkInTime ? selectedRecord.checkInTime.slice(0, 19) : ''}
                                            onChange={(e) => setSelectedRecord({ ...selectedRecord, checkInTime: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-surface-200 focus:ring-2 focus:ring-orbit-500/20 focus:border-orbit-500 outline-none transition-colors disabled:bg-surface-50 disabled:text-surface-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-surface-500 mb-1">Check Out Time</label>
                                        <input
                                            type="datetime-local"
                                            disabled={modalMode === 'view'}
                                            value={selectedRecord.checkOutTime ? selectedRecord.checkOutTime.slice(0, 19) : ''}
                                            onChange={(e) => setSelectedRecord({ ...selectedRecord, checkOutTime: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-surface-200 focus:ring-2 focus:ring-orbit-500/20 focus:border-orbit-500 outline-none transition-colors disabled:bg-surface-50 disabled:text-surface-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {modalMode === 'edit' && (
                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-4 py-3 rounded-lg border border-surface-200 text-surface-700 font-medium hover:bg-surface-50 transition-colors font-premium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 px-4 py-3 rounded-lg bg-orbit-600 text-white font-medium hover:bg-orbit-700 transition-colors disabled:opacity-50 font-premium"
                                    >
                                        {isSubmitting ? 'Saving...' : 'Save Changes'}
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
