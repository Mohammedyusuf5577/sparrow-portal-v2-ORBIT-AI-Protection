import React, { useEffect, useState } from 'react';
import { getEmployees, getInstructors, createEmployee, updateEmployee, deleteEmployee } from '../api/services';
import type { User } from '../types';
import { Users, UserCheck, Search, Mail, Shield, Clock, Eye, Edit2, Plus, ListFilter, Trash2, ArrowLeft, UserPlus, AlertCircle } from 'lucide-react';

const EmployeesPage: React.FC = () => {
    const [employees, setEmployees] = useState<User[]>([]);
    const [instructors, setInstructors] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'employees' | 'instructors'>('employees');
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'add' | 'edit' | 'view'>('list');
    const [selectedUser, setSelectedUser] = useState<Partial<User> | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [empRes, instRes] = await Promise.all([getEmployees(), getInstructors()]);
            setEmployees(empRes.data.data || []);
            setInstructors(instRes.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const currentList = tab === 'employees' ? employees : instructors;
    const filtered = currentList.filter(
        (u) =>
            u.fullName.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
    );

    const statusColors: Record<string, string> = {
        ACTIVE: 'bg-accent-emerald/10 text-accent-emerald border-emerald-200',
        INACTIVE: 'bg-surface-100 text-surface-500 border-surface-200',
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        setIsSubmitting(true);
        setFormError(null);
        try {
            if (viewMode === 'add') {
                await createEmployee(selectedUser);
            } else if (viewMode === 'edit' && selectedUser.id) {
                await updateEmployee(selectedUser.id, selectedUser);
            }
            setViewMode('list');
            fetchData();
        } catch (err: any) {
            console.error('Failed to save member', err);
            const serverMsg = err.response?.data?.errorMessage || err.response?.data?.message || 'Failed to save member. Please check input.';
            setFormError(serverMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Inline Page View (Add, Edit, View)
    if (viewMode !== 'list') {
        return (
            <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-fade-in">
                {/* Top Navigation */}
                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => {
                            setViewMode('list');
                            setFormError(null);
                        }}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-surface-600 hover:text-surface-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Team Members
                    </button>
                </div>

                {/* Banner Header */}
                <div className="bg-gradient-orbit rounded-3xl p-8 text-white shadow-glow relative overflow-hidden">
                    <div className="relative z-10 max-w-xl">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md mb-3">
                            <UserPlus className="w-3.5 h-3.5" />
                            {viewMode === 'add' ? 'New Team Member' : viewMode === 'edit' ? 'Edit Member' : 'Member Profile'}
                        </span>
                        <h1 className="text-3xl font-extrabold tracking-tight">
                            {viewMode === 'add'
                                ? `Add New ${tab === 'employees' ? 'Employee' : 'Instructor'}`
                                : viewMode === 'edit'
                                ? 'Edit Member Details'
                                : 'Team Member Details'}
                        </h1>
                        <p className="mt-2 text-orbit-100 text-sm leading-relaxed">
                            {viewMode === 'add'
                                ? 'Register and configure a new team member with organizational permissions and account status.'
                                : viewMode === 'edit'
                                ? 'Update profile information, assigned roles, and current operational status.'
                                : 'View organizational profile, role assignments, and account status.'}
                        </p>
                    </div>
                </div>

                {/* Form Card */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {formError && (
                        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700 font-medium flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
                            <span>{formError}</span>
                        </div>
                    )}

                    <div className="bg-white rounded-2xl border border-surface-200 p-6 sm:p-8 shadow-card space-y-6">
                        <div className="flex items-center gap-2 pb-3 border-b border-surface-100">
                            <Users className="w-5 h-5 text-orbit-600" />
                            <h2 className="text-base font-bold text-surface-900">Member Information</h2>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-surface-600 uppercase tracking-wider mb-1.5">
                                    Full Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    disabled={viewMode === 'view'}
                                    value={selectedUser?.fullName || ''}
                                    onChange={(e) => setSelectedUser({ ...selectedUser!, fullName: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-orbit-500/20 focus:border-orbit-500 outline-none transition-all disabled:bg-surface-100 disabled:text-surface-500 text-surface-900 text-sm"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-surface-600 uppercase tracking-wider mb-1.5">
                                    Email Address <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    disabled={viewMode === 'view'}
                                    value={selectedUser?.email || ''}
                                    onChange={(e) => setSelectedUser({ ...selectedUser!, email: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-orbit-500/20 focus:border-orbit-500 outline-none transition-all disabled:bg-surface-100 disabled:text-surface-500 text-surface-900 text-sm"
                                    placeholder="john@orbit.com"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-surface-600 uppercase tracking-wider mb-1.5">
                                        Role <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        disabled={viewMode === 'view'}
                                        value={selectedUser?.role || (tab === 'employees' ? 'EMPLOYEE' : 'INSTRUCTOR')}
                                        onChange={(e) => setSelectedUser({ ...selectedUser!, role: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-orbit-500/20 focus:border-orbit-500 outline-none transition-all disabled:bg-surface-100 disabled:text-surface-500 text-surface-900 text-sm font-medium cursor-pointer"
                                    >
                                        <option value="EMPLOYEE">Employee</option>
                                        <option value="INSTRUCTOR">Instructor</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-surface-600 uppercase tracking-wider mb-1.5">
                                        Status <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        disabled={viewMode === 'view'}
                                        value={selectedUser?.status || 'ACTIVE'}
                                        onChange={(e) => setSelectedUser({ ...selectedUser!, status: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:ring-2 focus:ring-orbit-500/20 focus:border-orbit-500 outline-none transition-all disabled:bg-surface-100 disabled:text-surface-500 text-surface-900 text-sm font-medium cursor-pointer"
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-surface-100">
                            {viewMode === 'view' ? (
                                <button
                                    type="button"
                                    onClick={() => setViewMode('list')}
                                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-surface-100 text-surface-700 font-semibold hover:bg-surface-200 transition-all text-sm"
                                >
                                    Back
                                </button>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setViewMode('list');
                                            setFormError(null);
                                        }}
                                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-surface-200 text-surface-700 font-semibold hover:bg-surface-50 transition-all text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-orbit-600 text-white font-semibold shadow-glow hover:bg-orbit-700 transition-all disabled:opacity-50 text-sm"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            viewMode === 'add' ? 'Save Changes' : 'Update Member'
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">Team Members</h1>
                    <p className="text-sm text-surface-500 mt-1">Manage employees and instructors</p>
                </div>
                <button
                    onClick={() => {
                        setViewMode('add');
                        setSelectedUser({
                            fullName: '',
                            email: '',
                            role: tab === 'employees' ? 'EMPLOYEE' : 'INSTRUCTOR',
                            status: 'ACTIVE',
                        });
                        setFormError(null);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-orbit-600 text-white rounded-xl font-bold shadow-glow hover:bg-orbit-700 transition-all transform active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Add {tab === 'employees' ? 'Employee' : 'Instructor'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => setTab('employees')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === 'employees'
                        ? 'bg-orbit-600 text-white shadow-glow'
                        : 'bg-white text-surface-600 border border-surface-200 hover:border-orbit-300'
                        }`}
                >
                    <Users className="w-4 h-4" /> Employees ({employees.length})
                </button>
                <button
                    onClick={() => setTab('instructors')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === 'instructors'
                        ? 'bg-accent-violet text-white shadow-lg'
                        : 'bg-white text-surface-600 border border-surface-200 hover:border-accent-violet'
                        }`}
                >
                    <UserCheck className="w-4 h-4" /> Instructors ({instructors.length})
                </button>
            </div>

            {/* Search & Filter */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input
                        type="text"
                        placeholder={`Search ${tab}...`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-200 bg-white text-sm
                focus:outline-none focus:ring-2 focus:ring-orbit-500/30 focus:border-orbit-500 transition-all"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 border border-surface-200 rounded-xl text-surface-600 bg-white hover:bg-surface-50 transition-all">
                    <ListFilter className="w-4 h-4" />
                    <span className="text-sm font-medium">Filter</span>
                </button>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <div className="w-8 h-8 border-3 border-orbit-200 border-t-orbit-600 rounded-full animate-spin" />
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-card overflow-hidden border border-surface-100">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-surface-50 border-b border-surface-100">
                                    <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-3.5">Name</th>
                                    <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-3.5">Email</th>
                                    <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-3.5">Role</th>
                                    <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-3.5">Status</th>
                                    <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-3.5">Joined</th>
                                    <th className="text-right text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-3.5">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-50">
                                {filtered.map((user, i) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-orbit-50/30 transition-colors animate-slide-up"
                                        style={{ animationDelay: `${i * 0.03}s` }}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-xl ${tab === 'employees'
                                                    ? 'bg-gradient-to-br from-orbit-500 to-orbit-700'
                                                    : 'bg-gradient-to-br from-accent-violet to-purple-700'
                                                    } flex items-center justify-center text-white text-sm font-bold`}>
                                                    {user.fullName.charAt(0)}
                                                </div>
                                                <span className="text-sm font-semibold text-surface-900">{user.fullName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="flex items-center gap-1.5 text-sm text-surface-500">
                                                <Mail className="w-3.5 h-3.5" /> {user.email}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="flex items-center gap-1.5 text-sm text-surface-600">
                                                <Shield className="w-3.5 h-3.5" /> {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold border ${statusColors[user.status]}`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="flex items-center gap-1.5 text-sm text-surface-400">
                                                <Clock className="w-3.5 h-3.5" />
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setViewMode('view');
                                                        setFormError(null);
                                                    }}
                                                    className="p-1.5 text-surface-400 hover:text-orbit-600 hover:bg-orbit-50 rounded-lg transition-all"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4.5 h-4.5" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser({ ...user });
                                                        setViewMode('edit');
                                                        setFormError(null);
                                                    }}
                                                    className="p-1.5 text-surface-400 hover:text-accent-violet hover:bg-violet-50 rounded-lg transition-all"
                                                    title="Edit Details"
                                                >
                                                    <Edit2 className="w-4.5 h-4.5" />
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        if (confirm(`Are you sure you want to delete ${user.fullName}?`)) {
                                                            try {
                                                                await deleteEmployee(user.id);
                                                                fetchData();
                                                            } catch (err) {
                                                                console.error(err);
                                                            }
                                                        }
                                                    }}
                                                    className="p-1.5 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4.5 h-4.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filtered.length === 0 && (
                        <div className="text-center py-12">
                            <Users className="w-10 h-10 mx-auto text-surface-300 mb-2" />
                            <p className="text-surface-500 text-sm">No members found</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EmployeesPage;
