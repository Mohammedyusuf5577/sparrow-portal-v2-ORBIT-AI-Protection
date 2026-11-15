import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllPayroll, deletePayroll } from '../services/payrollService';
import { EmployeePayroll } from '../types';
import { usePagination } from '../../../hooks/usePagination';
import { PaginatedPanel } from '../../../components/PaginatedPanel';
import { PageHeader } from '../../../components/PageHeader';
import { Avatar } from '../../../components/Avatar';
import { Stat } from '../../../components/Stat';
import { formatEnum } from '../../../components/StatusDot';
import { btn, inputCls, formatINR } from '../../../components/ui';
import { downloadCsv, toCsv } from '../../../utils/csv';
import { useConfirm, useToast } from '../../../components/Feedback';
import { Search, Plus, Eye, Pencil, Trash2, Download, RefreshCw } from 'lucide-react';

const PayrollListPage: React.FC = () => {
    const navigate = useNavigate();
    const [payrollList, setPayrollList] = useState<EmployeePayroll[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const toast = useToast();
    const confirm = useConfirm();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await getAllPayroll();
            setPayrollList(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch payroll list', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        const ok = await confirm({
            title: 'Delete payroll record?',
            message: `Are you sure you want to delete payroll record for ${name}?`,
            confirmText: 'Delete',
        });
        if (!ok) return;
        try {
            await deletePayroll(id);
            toast.success(`Payroll record for ${name} deleted`);
            fetchData();
        } catch (err) {
            console.error('Failed to delete payroll record', err);
            toast.error('Could not delete the payroll record. Please try again.');
        }
    };

    const filtered = payrollList.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase()) ||
        p.department.toLowerCase().includes(search.toLowerCase())
    );

    // Client-side pagination (back to page 1 when the search changes)
    const { pageItems, paginationProps } = usePagination(filtered, { resetKey: search });

    // Exports exactly what the search currently shows. Bank and tax details are deliberately left out.
    const handleExport = () => {
        const csv = toCsv(
            ['Employee ID', 'Name', 'Email', 'Mobile', 'Department', 'Designation', 'Employment type', 'Join date', 'Net salary (INR)'],
            filtered.map((p) => [p.employeeId, p.name, p.email, p.mobile, p.department, p.designation, p.employmentType, p.joinDate, p.netSalary ?? 0])
        );
        downloadCsv(`orbit-payroll-${new Date().toISOString().slice(0, 10)}.csv`, csv);
        toast.success(`Exported ${filtered.length} payroll ${filtered.length === 1 ? 'record' : 'records'}`);
    };

    const monthlyPayout = payrollList.reduce((acc, curr) => acc + (curr.netSalary || 0), 0);

    return (
        <div className="space-y-6 pb-12">
            <PageHeader
                title="Payroll"
                description="Manage employee salaries, bank details and compliance"
                actions={
                    <>
                        <button
                            onClick={() => fetchData()}
                            className={`${btn.secondary} !px-0 w-9`}
                            title="Refresh"
                            aria-label="Refresh payroll list"
                        >
                            <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                        <button onClick={() => navigate('/admin/payroll/create')} className={btn.primary}>
                            <Plus className="w-4 h-4" strokeWidth={1.5} />
                            Create payroll
                        </button>
                    </>
                }
            />

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Stat label="Employees" value={payrollList.length} />
                <Stat label="Monthly payout" value={formatINR(monthlyPayout)} />
                <Stat label="Departments" value={new Set(payrollList.map(p => p.department)).size} />
            </div>

            {/* Search */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" strokeWidth={1.5} />
                    <input
                        type="text"
                        aria-label="Search payroll records"
                        placeholder="Search by name, email or department"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={`${inputCls} h-9 pl-9`}
                    />
                </div>
                <button
                    type="button"
                    onClick={handleExport}
                    disabled={filtered.length === 0}
                    className={btn.secondary}
                    title={filtered.length === 0 ? 'Nothing to export' : 'Download the rows shown as CSV'}
                >
                    <Download className="w-4 h-4" strokeWidth={1.5} />
                    Export
                </button>
            </div>

            {/* Table */}
            <PaginatedPanel
                loading={loading}
                isEmpty={filtered.length === 0}
                empty={{
                    icon: Search,
                    title: 'No payroll records found',
                    description: 'Try adjusting your search or add a new employee payroll record.',
                }}
                pagination={paginationProps}
                tbodyClassName="divide-y divide-surface-100"
                tableHead={
                    <tr className="bg-surface-50 border-b border-surface-200">
                        <th className="th">Employee</th>
                        <th className="th">Department</th>
                        <th className="th">Position</th>
                        <th className="th">Type</th>
                        <th className="th text-right">Net salary</th>
                        <th className="th text-right">Actions</th>
                    </tr>
                }
            >
                {pageItems.map((item) => (
                    <tr key={item.id} className="hover:bg-surface-50 transition-colors duration-150">
                        <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                                <Avatar name={item.name} />
                                <div>
                                    <p className="text-sm font-medium text-surface-900 whitespace-nowrap">{item.name}</p>
                                    <p className="text-xs text-surface-500">{item.email}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-surface-700">{item.department}</td>
                        <td className="px-5 py-3 text-sm text-surface-600">{item.designation}</td>
                        <td className="px-5 py-3 text-sm text-surface-600">{formatEnum(item.employmentType)}</td>
                        <td className="px-5 py-3 text-right text-sm font-medium text-surface-900 tabular-nums">
                            {formatINR(item.netSalary || 0)}
                        </td>
                        <td className="px-5 py-3">
                            <div className="flex items-center justify-end gap-1">
                                <button
                                    onClick={() => navigate(`/admin/payroll/details/${item.id}`)}
                                    className={btn.icon}
                                    title="View details"
                                    aria-label={`View payroll for ${item.name}`}
                                >
                                    <Eye className="w-4 h-4" strokeWidth={1.5} />
                                </button>
                                <button
                                    onClick={() => navigate(`/admin/payroll/edit/${item.id}`)}
                                    className={btn.icon}
                                    title="Edit"
                                    aria-label={`Edit payroll for ${item.name}`}
                                >
                                    <Pencil className="w-4 h-4" strokeWidth={1.5} />
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id, item.name)}
                                    className={btn.iconDanger}
                                    title="Delete"
                                    aria-label={`Delete payroll for ${item.name}`}
                                >
                                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </PaginatedPanel>
        </div>
    );
};

export default PayrollListPage;
