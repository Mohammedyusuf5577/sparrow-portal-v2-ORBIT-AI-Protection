import React, { useEffect, useState } from 'react';
import { getEmployees, getInstructors, createEmployee, updateEmployee, deleteEmployee } from '../api/services';
import type { User } from '../types';
import { usePagination } from '../hooks/usePagination';
import { PaginatedPanel } from '../components/PaginatedPanel';
import { PageHeader } from '../components/PageHeader';
import { Avatar } from '../components/Avatar';
import { Segmented } from '../components/Segmented';
import { FormField } from '../components/FormField';
import { Status, formatEnum } from '../components/StatusDot';
import { btn, inputCls, formatDate } from '../components/ui';
import { useConfirm, useToast } from '../components/Feedback';
import { Users, Search, Eye, Pencil, Plus, Trash2, ArrowLeft, AlertCircle } from 'lucide-react';

const EmployeesPage: React.FC = () => {
    const [employees, setEmployees] = useState<User[]>([]);
    const [instructors, setInstructors] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'employees' | 'instructors'>('employees');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'' | 'ACTIVE' | 'INACTIVE'>('');
    const [viewMode, setViewMode] = useState<'list' | 'add' | 'edit' | 'view'>('list');
    const [selectedUser, setSelectedUser] = useState<Partial<User> | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const toast = useToast();
    const confirm = useConfirm();

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
    const query = search.toLowerCase();
    const filtered = currentList.filter(
        (u) =>
            (u.fullName.toLowerCase().includes(query) || u.email.toLowerCase().includes(query)) &&
            (!statusFilter || u.status === statusFilter)
    );

    // Client-side pagination (back to page 1 when the tab or search changes)
    const { pageItems, paginationProps } = usePagination(filtered, { resetKey: `${tab}|${search}|${statusFilter}` });

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
            toast.success(viewMode === 'add' ? 'Member created' : 'Changes saved');
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

    const closeForm = () => {
        setViewMode('list');
        setFormError(null);
    };

    // Inline page view (add, edit, view)
    if (viewMode !== 'list') {
        const readOnly = viewMode === 'view';
        const noun = tab === 'employees' ? 'employee' : 'instructor';
        const title = viewMode === 'add' ? `Add ${noun}` : viewMode === 'edit' ? 'Edit member' : 'Member details';
        const description =
            viewMode === 'add'
                ? 'Set the role and account status for the new member'
                : viewMode === 'edit'
                ? 'Update profile information, role and account status'
                : 'Profile, role and account status';

        return (
            <div className="max-w-2xl space-y-6 pb-16">
                <button
                    type="button"
                    onClick={closeForm}
                    className="inline-flex items-center gap-2 text-sm text-surface-600 hover:text-surface-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                    Back to team members
                </button>

                <PageHeader title={title} description={description} />

                <form onSubmit={handleSubmit} className="space-y-4">
                    {formError && (
                        <div role="alert" className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                            <span>{formError}</span>
                        </div>
                    )}

                    <div className="panel p-6 space-y-5">
                        <h2 className="text-base font-medium text-surface-900">Member information</h2>

                        <FormField label="Full name" htmlFor="member-name" required>
                            <input
                                id="member-name"
                                type="text"
                                required
                                disabled={readOnly}
                                value={selectedUser?.fullName || ''}
                                onChange={(e) => setSelectedUser({ ...selectedUser!, fullName: e.target.value })}
                                className={inputCls}
                                placeholder="John Doe"
                            />
                        </FormField>

                        <FormField label="Email address" htmlFor="member-email" required>
                            <input
                                id="member-email"
                                type="email"
                                required
                                disabled={readOnly}
                                value={selectedUser?.email || ''}
                                onChange={(e) => setSelectedUser({ ...selectedUser!, email: e.target.value })}
                                className={inputCls}
                                placeholder="john@orbit.com"
                            />
                        </FormField>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <FormField label="Role" htmlFor="member-role" required>
                                <select
                                    id="member-role"
                                    disabled={readOnly}
                                    value={selectedUser?.role || (tab === 'employees' ? 'EMPLOYEE' : 'INSTRUCTOR')}
                                    onChange={(e) => setSelectedUser({ ...selectedUser!, role: e.target.value })}
                                    className={`${inputCls} cursor-pointer`}
                                >
                                    <option value="EMPLOYEE">Employee</option>
                                    <option value="INSTRUCTOR">Instructor</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </FormField>
                            <FormField label="Status" htmlFor="member-status" required>
                                <select
                                    id="member-status"
                                    disabled={readOnly}
                                    value={selectedUser?.status || 'ACTIVE'}
                                    onChange={(e) => setSelectedUser({ ...selectedUser!, status: e.target.value })}
                                    className={`${inputCls} cursor-pointer`}
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            </FormField>
                        </div>

                        <div className="pt-5 flex items-center justify-end gap-2 border-t border-surface-200">
                            {readOnly ? (
                                <button type="button" onClick={() => setViewMode('list')} className={btn.secondary}>
                                    Back
                                </button>
                            ) : (
                                <>
                                    <button type="button" onClick={closeForm} className={btn.secondary}>
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={isSubmitting} className={btn.primary}>
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Saving
                                            </>
                                        ) : viewMode === 'add' ? (
                                            'Create member'
                                        ) : (
                                            'Save changes'
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

    const tabs: { key: 'employees' | 'instructors'; label: string; count: number }[] = [
        { key: 'employees', label: 'Employees', count: employees.length },
        { key: 'instructors', label: 'Instructors', count: instructors.length },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Team members"
                description="Manage employees and instructors"
                actions={
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
                        className={btn.primary}
                    >
                        <Plus className="w-4 h-4" strokeWidth={1.5} />
                        Add {tab === 'employees' ? 'employee' : 'instructor'}
                    </button>
                }
            />

            {/* Tabs: the selected one carries the accent underline */}
            <div role="tablist" className="flex items-center gap-6 border-b border-surface-200">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        role="tab"
                        aria-selected={tab === t.key}
                        onClick={() => setTab(t.key)}
                        className={`-mb-px h-10 text-sm border-b-2 transition-colors duration-150 ${
                            tab === t.key
                                ? 'border-orbit-600 text-surface-900 font-medium'
                                : 'border-transparent text-surface-600 hover:text-surface-900'
                        }`}
                    >
                        {t.label}
                        <span className="ml-1.5 text-surface-500 tabular-nums">{t.count}</span>
                    </button>
                ))}
            </div>

            {/* Search & filter */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[16rem] max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" strokeWidth={1.5} />
                    <input
                        type="text"
                        aria-label={`Search ${tab}`}
                        placeholder={`Search ${tab}`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={`${inputCls} h-9 pl-9`}
                    />
                </div>
                <Segmented
                    ariaLabel="Status"
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={[
                        { value: '', label: 'All' },
                        { value: 'ACTIVE', label: 'Active' },
                        { value: 'INACTIVE', label: 'Inactive' },
                    ]}
                />
            </div>

            {/* Table */}
            <PaginatedPanel
                loading={loading}
                isEmpty={filtered.length === 0}
                empty={{
                    icon: Users,
                    title: search || statusFilter ? 'No members match your filter' : 'No members found',
                    description: search || statusFilter
                        ? 'Try a different name, email or status.'
                        : `There are no ${tab} yet. Use the add button to create one.`,
                }}
                pagination={paginationProps}
                tbodyClassName="divide-y divide-surface-100"
                tableHead={
                    <tr className="bg-surface-50 border-b border-surface-200">
                        <th className="th">Name</th>
                        <th className="th">Email</th>
                        <th className="th">Role</th>
                        <th className="th">Status</th>
                        <th className="th">Joined</th>
                        <th className="th text-right">Actions</th>
                    </tr>
                }
            >
                {pageItems.map((user) => (
                    <tr key={user.id} className="hover:bg-surface-50 transition-colors duration-150">
                        <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                                <Avatar name={user.fullName} />
                                <span className="text-sm font-medium text-surface-900 whitespace-nowrap">{user.fullName}</span>
                            </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-surface-600">{user.email}</td>
                        <td className="px-5 py-3 text-sm text-surface-600">{formatEnum(user.role)}</td>
                        <td className="px-5 py-3">
                            <Status tone={user.status === 'ACTIVE' ? 'positive' : 'neutral'}>{formatEnum(user.status)}</Status>
                        </td>
                        <td className="px-5 py-3 text-sm text-surface-600 tabular-nums">{formatDate(user.createdAt)}</td>
                        <td className="px-5 py-3">
                            <div className="flex items-center justify-end gap-1">
                                <button
                                    onClick={() => {
                                        setSelectedUser(user);
                                        setViewMode('view');
                                        setFormError(null);
                                    }}
                                    className={btn.icon}
                                    title="View details"
                                    aria-label={`View ${user.fullName}`}
                                >
                                    <Eye className="w-4 h-4" strokeWidth={1.5} />
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedUser({ ...user });
                                        setViewMode('edit');
                                        setFormError(null);
                                    }}
                                    className={btn.icon}
                                    title="Edit details"
                                    aria-label={`Edit ${user.fullName}`}
                                >
                                    <Pencil className="w-4 h-4" strokeWidth={1.5} />
                                </button>
                                <button
                                    onClick={async () => {
                                        const ok = await confirm({
                                            title: 'Delete member?',
                                            message: `Are you sure you want to delete ${user.fullName}?`,
                                            confirmText: 'Delete',
                                        });
                                        if (!ok) return;
                                        try {
                                            await deleteEmployee(user.id);
                                            toast.success(`${user.fullName} deleted`);
                                            fetchData();
                                        } catch (err) {
                                            console.error(err);
                                            toast.error('Could not delete the member. Please try again.');
                                        }
                                    }}
                                    className={btn.iconDanger}
                                    title="Delete"
                                    aria-label={`Delete ${user.fullName}`}
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

export default EmployeesPage;
