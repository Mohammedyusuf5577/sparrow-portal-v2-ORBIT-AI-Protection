import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { usePageOverflowGuard } from '../hooks/usePagination';
import { softDeleteProject } from '../api/services';
import type { Project, ProjectStatusType, PaginationControls } from '../types';
import { StatusChip } from '../components/StatusChip';
import { PaginatedGrid, PaginatedPanel } from '../components/PaginatedPanel';
import type { EmptyStateProps } from '../components/EmptyState';
import { SkeletonCard } from '../components/SkeletonCard';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
    Plus,
    Search,
    LayoutGrid,
    List,
    FolderKanban,
    Calendar,
    Users,
    Edit2,
    Trash2,
    ArrowUpDown,
    RotateCcw,
    X,
} from 'lucide-react';

export const ProjectsPage: React.FC = () => {
    const navigate = useNavigate();
    const {
        projects,
        meta,
        loading,
        error,
        page,
        limit,
        search,
        status,
        month,
        year,
        sortBy,
        sortOrder,
        updateParams,
        refetch,
    } = useProjects();

    // If the requested page no longer exists (last row deleted, stale ?page=... in the URL),
    // move to the last valid page instead of leaving the user on an empty one.
    const goToPage = useCallback((p: number) => updateParams({ page: p }), [updateParams]);
    usePageOverflowGuard({
        page,
        totalPages: meta.totalPages,
        totalItems: meta.totalItems,
        loading,
        onPageChange: goToPage,
    });

    // View mode stored in localStorage
    const [viewMode, setViewMode] = useState<'grid' | 'table'>(() => {
        return (localStorage.getItem('orbit_projects_view_mode') as 'grid' | 'table') || 'grid';
    });

    // Local search input state for debouncing
    const [searchInput, setSearchInput] = useState(search);

    // Delete dialog state
    const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Sync search input if URL changes
    useEffect(() => {
        setSearchInput(search);
    }, [search]);

    // Debounce search update to URL
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== search) {
                updateParams({ search: searchInput, page: 1 });
            }
        }, 350);
        return () => clearTimeout(timer);
    }, [searchInput, search, updateParams]);

    const handleViewModeToggle = (mode: 'grid' | 'table') => {
        setViewMode(mode);
        localStorage.setItem('orbit_projects_view_mode', mode);
    };

    const handleStatusFilter = (newStatus: string) => {
        updateParams({ status: newStatus || undefined, page: 1 });
    };

    const handleMonthFilter = (newMonth: string) => {
        updateParams({ month: newMonth || undefined, page: 1 });
    };

    const handleYearFilter = (newYear: string) => {
        updateParams({ year: newYear || undefined, page: 1 });
    };

    const handleSortFieldChange = (newSortBy: string) => {
        updateParams({ sortBy: newSortBy, page: 1 });
    };

    const handleSortOrderToggle = () => {
        updateParams({ sortOrder: sortOrder === 'ASC' ? 'DESC' : 'ASC', page: 1 });
    };

    const handleResetFilters = () => {
        setSearchInput('');
        updateParams({
            search: undefined,
            status: undefined,
            month: undefined,
            year: undefined,
            sortBy: 'createdAt',
            sortOrder: 'DESC',
            page: 1,
        });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await softDeleteProject(deleteTarget.id);
            setDeleteTarget(null);
            refetch();
        } catch (err) {
            console.error('Failed to soft delete project', err);
            alert('Failed to delete project. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    const hasActiveFilters = Boolean(search || status || month || year);
    const currentYear = new Date().getFullYear();

    // Year filter options: next year back to 5 years ago (+ the selected year if it is outside that range)
    const yearOptions = Array.from({ length: 7 }, (_, i) => currentYear + 1 - i);
    if (year !== '' && !yearOptions.includes(Number(year))) {
        yearOptions.push(Number(year));
        yearOptions.sort((a, b) => b - a);
    }

    const paginationProps: PaginationControls = {
        page,
        limit,
        totalItems: meta.totalItems,
        totalPages: meta.totalPages,
        onPageChange: goToPage,
        onLimitChange: (l) => updateParams({ limit: l, page: 1 }),
    };

    const emptyState: EmptyStateProps = {
        icon: FolderKanban,
        title: hasActiveFilters ? 'No projects match your filter' : 'No projects created yet',
        description: hasActiveFilters
            ? 'Try adjusting your search query, status, or date range to find what you are looking for.'
            : 'Get started by creating your first organizational project and assign employees.',
        action: hasActiveFilters ? (
            <button
                onClick={handleResetFilters}
                className="px-4 py-2 border border-surface-200 rounded-xl text-xs font-semibold text-surface-700 hover:bg-surface-50"
            >
                Clear all filters
            </button>
        ) : (
            <button
                onClick={() => navigate('/admin/projects/new')}
                className="px-5 py-2.5 bg-gradient-orbit text-white text-xs font-semibold rounded-xl shadow-sm"
            >
                + Create First Project
            </button>
        ),
    };

    return (
        <div className="space-y-6 pb-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Project Management</h1>
                    <p className="text-sm text-surface-500 mt-1">
                        Track, assign, and manage enterprise project lifecycles
                    </p>
                </div>

                <button
                    id="create-project-btn"
                    onClick={() => navigate('/admin/projects/new')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-orbit text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow-glow hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                    <Plus className="w-4 h-4" />
                    New Project
                </button>
            </div>

            {/* Filter & Controls Toolbar */}
            <div className="bg-white rounded-2xl border border-surface-200 p-4 shadow-card space-y-4">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                    {/* Search Bar */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search by project name or client..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-orbit-500/20 focus:border-orbit-500 focus:bg-white transition-all"
                        />
                        {searchInput && (
                            <button
                                type="button"
                                onClick={() => setSearchInput('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 p-1"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* View Switcher & Sort Controls */}
                    <div className="flex items-center gap-2 self-end lg:self-auto">
                        {/* Sort Selector */}
                        <div className="flex items-center gap-1.5 bg-surface-50 border border-surface-200 rounded-xl px-2.5 py-1.5">
                            <ArrowUpDown className="w-3.5 h-3.5 text-surface-500" />
                            <select
                                value={sortBy}
                                onChange={(e) => handleSortFieldChange(e.target.value)}
                                className="bg-transparent text-xs font-semibold text-surface-700 focus:outline-none cursor-pointer"
                            >
                                <option value="createdAt">Created Date</option>
                                <option value="name">Project Name</option>
                                <option value="clientName">Client Name</option>
                                <option value="startDate">Start Date</option>
                                <option value="endDate">End Date</option>
                                <option value="status">Status</option>
                            </select>
                            <button
                                type="button"
                                onClick={handleSortOrderToggle}
                                title={`Sort ${sortOrder === 'ASC' ? 'Ascending' : 'Descending'}`}
                                className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-white text-surface-700 border border-surface-200 hover:bg-surface-100"
                            >
                                {sortOrder}
                            </button>
                        </div>

                        {/* Grid / Table Toggle */}
                        <div className="flex items-center bg-surface-100 p-1 rounded-xl border border-surface-200">
                            <button
                                type="button"
                                onClick={() => handleViewModeToggle('grid')}
                                className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                                    viewMode === 'grid'
                                        ? 'bg-white text-surface-900 shadow-sm'
                                        : 'text-surface-500 hover:text-surface-800'
                                }`}
                                title="Grid View"
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => handleViewModeToggle('table')}
                                className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                                    viewMode === 'table'
                                        ? 'bg-white text-surface-900 shadow-sm'
                                        : 'text-surface-500 hover:text-surface-800'
                                }`}
                                title="Table View"
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Secondary Filter Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-surface-100 text-xs">
                    {/* Status Tabs */}
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold text-surface-500 mr-1">Status:</span>
                        {[
                            { label: 'All', value: '' },
                            { label: 'In Progress', value: 'IN_PROGRESS' },
                            { label: 'Completed', value: 'COMPLETED' },
                            { label: 'Delayed', value: 'DELAYED' },
                        ].map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => handleStatusFilter(tab.value)}
                                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                                    status === tab.value
                                        ? 'bg-orbit-600 text-white shadow-sm'
                                        : 'bg-surface-50 text-surface-600 hover:bg-surface-100 border border-surface-200'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Month and Reset Filters */}
                    <div className="flex items-center gap-2">
                        <select
                            value={year}
                            onChange={(e) => handleYearFilter(e.target.value)}
                            aria-label="Filter by year"
                            className="bg-surface-50 border border-surface-200 rounded-lg px-2.5 py-1.5 text-xs text-surface-700 font-medium focus:outline-none focus:ring-2 focus:ring-orbit-500/20 cursor-pointer"
                        >
                            <option value="">All Years</option>
                            {yearOptions.map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </select>

                        <select
                            value={month}
                            onChange={(e) => handleMonthFilter(e.target.value)}
                            className="bg-surface-50 border border-surface-200 rounded-lg px-2.5 py-1.5 text-xs text-surface-700 font-medium focus:outline-none focus:ring-2 focus:ring-orbit-500/20 cursor-pointer"
                        >
                            <option value="">All Months</option>
                            {[
                                { m: 1, name: 'January' },
                                { m: 2, name: 'February' },
                                { m: 3, name: 'March' },
                                { m: 4, name: 'April' },
                                { m: 5, name: 'May' },
                                { m: 6, name: 'June' },
                                { m: 7, name: 'July' },
                                { m: 8, name: 'August' },
                                { m: 9, name: 'September' },
                                { m: 10, name: 'October' },
                                { m: 11, name: 'November' },
                                { m: 12, name: 'December' },
                            ].map((item) => (
                                <option key={item.m} value={item.m}>
                                    {item.name}
                                </option>
                            ))}
                        </select>

                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
                            >
                                <RotateCcw className="w-3 h-3" />
                                Reset
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            {error && projects.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-rose-200 shadow-card">
                    <p className="text-sm font-semibold text-rose-600">{error}</p>
                    <button
                        onClick={refetch}
                        className="mt-4 px-4 py-2 bg-gradient-orbit text-white text-xs font-semibold rounded-xl"
                    >
                        Try Again
                    </button>
                </div>
            ) : viewMode === 'grid' ? (
                /* Grid View */
                <PaginatedGrid
                    gridClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    loading={loading}
                    isEmpty={projects.length === 0}
                    loadingFallback={<SkeletonCard variant="grid" count={6} />}
                    empty={emptyState}
                    pagination={paginationProps}
                >
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="bg-white rounded-2xl border border-surface-200 p-6 shadow-card hover:shadow-elevated transition-all duration-300 flex flex-col justify-between group"
                        >
                            <div className="space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h3 className="text-base font-bold text-surface-900 truncate group-hover:text-orbit-600 transition-colors">
                                            {project.name}
                                        </h3>
                                        <p className="text-xs font-medium text-surface-500 mt-0.5 truncate">
                                            Client: <span className="text-surface-700 font-semibold">{project.clientName || 'Internal'}</span>
                                        </p>
                                    </div>
                                    <StatusChip status={project.status} />
                                </div>

                                <p className="text-xs text-surface-600 line-clamp-2 leading-relaxed min-h-[2rem]">
                                    {project.description || 'No description provided.'}
                                </p>
                            </div>

                            <div className="pt-4 mt-4 border-t border-surface-100 space-y-3">
                                <div className="flex items-center justify-between text-xs text-surface-500">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-surface-400" />
                                        <span>
                                            {project.startDate
                                                ? new Date(project.startDate).toLocaleDateString()
                                                : 'TBD'}{' '}
                                            –{' '}
                                            {project.endDate
                                                ? new Date(project.endDate).toLocaleDateString()
                                                : 'TBD'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1.5 font-medium text-surface-700">
                                        <Users className="w-3.5 h-3.5 text-orbit-500" />
                                        <span>{project.assignedUserCount} assigned</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/admin/projects/${project.id}/edit`)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-surface-200 text-xs font-semibold text-surface-700 hover:bg-surface-50 transition-colors"
                                    >
                                        <Edit2 className="w-3.5 h-3.5 text-surface-500" />
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDeleteTarget(project)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </PaginatedGrid>
            ) : (
                /* Table View */
                <PaginatedPanel
                    loading={loading}
                    isEmpty={projects.length === 0}
                    empty={emptyState}
                    pagination={paginationProps}
                    tableClassName="w-full text-left border-collapse"
                    tbodyClassName="divide-y divide-surface-100 text-sm"
                    tableHead={
                        <tr className="bg-surface-50 border-b border-surface-200 text-surface-600 text-xs font-bold uppercase tracking-wider">
                            <th className="py-3.5 px-4">Project & Client</th>
                            <th className="py-3.5 px-4">Status</th>
                            <th className="py-3.5 px-4">Timeline</th>
                            <th className="py-3.5 px-4">Team</th>
                            <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                    }
                >
                    {projects.map((project) => (
                        <tr
                            key={project.id}
                            className="hover:bg-surface-50/80 transition-colors"
                        >
                            <td className="py-3.5 px-4">
                                <p className="font-bold text-surface-900">{project.name}</p>
                                <p className="text-xs text-surface-500">
                                    Client: {project.clientName || 'Internal'}
                                </p>
                            </td>
                            <td className="py-3.5 px-4">
                                <StatusChip status={project.status} />
                            </td>
                            <td className="py-3.5 px-4 text-xs text-surface-600">
                                {project.startDate
                                    ? new Date(project.startDate).toLocaleDateString()
                                    : '—'}{' '}
                                –{' '}
                                {project.endDate
                                    ? new Date(project.endDate).toLocaleDateString()
                                    : '—'}
                            </td>
                            <td className="py-3.5 px-4">
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-surface-700 bg-surface-100 px-2.5 py-1 rounded-full">
                                    <Users className="w-3 h-3 text-orbit-500" />
                                    {project.assignedUserCount}
                                </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                                <div className="inline-flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/admin/projects/${project.id}/edit`)}
                                        className="p-1.5 text-surface-500 hover:text-orbit-600 hover:bg-orbit-50 rounded-lg transition-colors"
                                        title="Edit project"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDeleteTarget(project)}
                                        className="p-1.5 text-surface-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                        title="Delete project"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </PaginatedPanel>
            )}

            {/* Confirm Soft-Delete Dialog */}
            <ConfirmDialog
                isOpen={Boolean(deleteTarget)}
                title="Delete Project?"
                message={`Are you sure you want to delete "${deleteTarget?.name}"? It will be removed from active listings but preserved in audit history.`}
                confirmText="Yes, Delete"
                cancelText="Cancel"
                isDestructive={true}
                isLoading={isDeleting}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
};

export default ProjectsPage;
