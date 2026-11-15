import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllPayroll, deletePayroll } from '../services/payrollService';
import { EmployeePayroll } from '../types';
import { usePagination } from '../../../hooks/usePagination';
import { PaginatedPanel } from '../../../components/PaginatedPanel';
import {
    DollarSign,
    Search,
    Plus,
    Eye,
    Edit2,
    Trash2,
    Briefcase,
    Building2,
    TrendingUp,
    Download
} from 'lucide-react';

const PayrollListPage: React.FC = () => {
    const navigate = useNavigate();
    const [payrollList, setPayrollList] = useState<EmployeePayroll[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

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
        if (window.confirm(`Are you sure you want to delete payroll record for ${name}?`)) {
            try {
                await deletePayroll(id);
                fetchData();
            } catch (err) {
                console.error('Failed to delete payroll record', err);
            }
        }
    };

    const filtered = payrollList.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase()) ||
        p.department.toLowerCase().includes(search.toLowerCase())
    );

    // Client-side pagination (back to page 1 when the search changes)
    const { pageItems, paginationProps } = usePagination(filtered, { resetKey: search });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2">
                        <DollarSign className="w-8 h-8 text-orbit-600" />
                        Payroll Management
                    </h1>
                    <p className="text-sm text-surface-500 mt-1">Manage employee salaries, bank details, and compliance</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchData()}
                        className="p-2.5 border border-surface-200 rounded-xl text-surface-600 bg-white hover:bg-surface-50 transition-all"
                    >
                        <TrendingUp className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => navigate('/admin/payroll/create')}
                        className="flex items-center gap-2 px-6 py-3 bg-orbit-600 text-white rounded-xl font-bold shadow-glow hover:bg-orbit-700 transition-all transform active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Create Payroll
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-card border border-surface-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-orbit-50 rounded-xl flex items-center justify-center text-orbit-600">
                        <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-surface-500 uppercase">Total Employees</p>
                        <p className="text-2xl font-bold text-surface-900">{payrollList.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-card border border-surface-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-accent-emerald/10 rounded-xl flex items-center justify-center text-accent-emerald">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-surface-500 uppercase">Monthly Payout</p>
                        <p className="text-2xl font-bold text-surface-900">
                            ${payrollList.reduce((acc, curr) => acc + (curr.netSalary || 0), 0).toLocaleString()}
                        </p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-card border border-surface-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-accent-violet/10 rounded-xl flex items-center justify-center text-accent-violet">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-surface-500 uppercase">Departments</p>
                        <p className="text-2xl font-bold text-surface-900">
                            {new Set(payrollList.map(p => p.department)).size}
                        </p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email or department..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orbit-500/30 focus:border-orbit-500 transition-all"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 border border-surface-200 rounded-xl text-surface-600 bg-white hover:bg-surface-50 transition-all">
                    <Download className="w-4 h-4" />
                    <span className="text-sm font-medium">Export</span>
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
                tbodyClassName="divide-y divide-surface-50"
                tableHead={
                    <tr className="bg-surface-50 border-b border-surface-100">
                        <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-4">Employee</th>
                        <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-4">Department</th>
                        <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-4">Position</th>
                        <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-4">Type</th>
                        <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-4">Net Salary</th>
                        <th className="text-right text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-4">Actions</th>
                    </tr>
                }
            >
                {pageItems.map((item, i) => (
                    <tr
                        key={item.id}
                        className="hover:bg-orbit-50/20 transition-colors animate-slide-up"
                        style={{ animationDelay: `${i * 0.05}s` }}
                    >
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-orbit-500 to-orbit-700 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
                                    {item.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-surface-900">{item.name}</p>
                                    <p className="text-xs text-surface-500">{item.email}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span className="text-sm font-medium text-surface-700">{item.department}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-surface-600">
                            {item.designation}
                        </td>
                        <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${item.employmentType === 'FULL_TIME'
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                    : 'bg-amber-50 text-amber-600 border-amber-100'
                                }`}>
                                {item.employmentType}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <span className="text-sm font-bold text-orbit-600">
                                ${item.netSalary?.toLocaleString() || '0'}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                                <button
                                    onClick={() => navigate(`/admin/payroll/details/${item.id}`)}
                                    className="p-2 text-surface-400 hover:text-orbit-600 hover:bg-orbit-50 rounded-xl transition-all"
                                    title="View Details"
                                >
                                    <Eye className="w-4.5 h-4.5" />
                                </button>
                                <button
                                    onClick={() => navigate(`/admin/payroll/edit/${item.id}`)}
                                    className="p-2 text-surface-400 hover:text-accent-violet hover:bg-violet-50 rounded-xl transition-all"
                                    title="Edit"
                                >
                                    <Edit2 className="w-4.5 h-4.5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id, item.name)}
                                    className="p-2 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4.5 h-4.5" />
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
