import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { usePageOverflowGuard } from '../hooks/usePagination';
import { softDeleteProject } from '../api/services';
import type { Project, PaginationControls } from '../types';
import { StatusChip } from '../components/StatusChip';
import { PaginatedGrid, PaginatedPanel } from '../components/PaginatedPanel';
import type { EmptyStateProps } from '../components/EmptyState';
import { SkeletonCard } from '../components/SkeletonCard';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PageHeader } from '../components/PageHeader';
import { Segmented } from '../components/Segmented';
import { btn, inputCls, selectCls, formatDate } from '../components/ui';
import { useToast } from '../components/Feedback';
import { Plus, Search, LayoutGrid, List, FolderKanban, Pencil, Trash2, ArrowDown, ArrowUp, RotateCcw, X } from 'lucide-react';

const STATUS_OPTIONS = [
    { value: '', label: 'All' },
    { value: 'IN_PROGRESS', label: 'In progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'DELAYED', label: 'Delayed' },
];

const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

/** "5 Jan 2025 – 20 Feb 2026". A missing end is "TBD" so an open project never looks broken. */
const timeline = (start?: string, end?: string) =>
    !start && !end ? '—' : `${start ? formatDate(start) : 'TBD'} – ${end ? formatDate(end) : 'TBD'}`;

export const ProjectsPage: React.FC = () => {
    const navigate = useNavigate();
    const toast = useToast();
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
            toast.success('Project deleted');
            refetch();
        } catch (err) {
            console.error('Failed to soft delete project', err);
            toast.error('Could not delete the project. Please try again.');
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
        title: hasActiveFilters ? 'No projects match your filter' : 'No projects yet',
        description: hasActiveFilters
            ? 'Try a different search, status or date range.'
            : 'Create the first project and assign people to it.',
        action: hasActiveFilters ? (
            <button onClick={handleResetFilters} className={btn.secondary}>
                Clear filters
            </button>
        ) : (
            <button onClick={() => navigate('/admin/projects/new')} className={btn.primary}>
                <Plus className="w-4 h-4" strokeWidth={1.5} />
                Create project
            </button>
        ),
    };

    const rowActions = (project: Project) => (
        <div className="flex items-center gap-1">
            <button
                type="button"
                onClick={() => navigate(`/admin/projects/${project.id}/edit`)}
                className={btn.icon}
                title="Edit project"
                aria-label={`Edit ${project.name}`}
            >
                <Pencil className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button
                type="button"
                onClick={() => setDeleteTarget(project)}
                className={btn.iconDanger}
                title="Delete project"
                aria-label={`Delete ${project.name}`}
            >
                <Trash2 className="w-4 h-4" strokeWidth={1.5} />
            </button>
        </div>
    );

    return (
        <div className="space-y-6 pb-12">
            <PageHeader
                title="Projects"
                description="Track, assign and manage project lifecycles"
                actions={
                    <button id="create-project-btn" onClick={() => navigate('/admin/projects/new')} className={btn.primary}>
                        <Plus className="w-4 h-4" strokeWidth={1.5} />
                        New project
                    </button>
                }
            />

            {/* Filters and view controls */}
            <div className="space-y-3">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="relative w-full lg:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 pointer-events-none" strokeWidth={1.5} />
                        <input
                            type="text"
                            aria-label="Search projects"
                            placeholder="Search by project or client"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className={`${inputCls} h-9 pl-9 pr-9`}
                        />
                        {searchInput && (
                            <button
                                type="button"
                                onClick={() => setSearchInput('')}
                                aria-label="Clear search"
                                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-6 w-6 inline-flex items-center justify-center rounded-md text-surface-500 hover:text-surface-900 hover:bg-surface-100"
                            >
                                <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={sortBy}
                            onChange={(e) => handleSortFieldChange(e.target.value)}
                            aria-label="Sort by"
                            className={selectCls}
                        >
                            <option value="createdAt">Created date</option>
                            <option value="name">Project name</option>
                            <option value="clientName">Client name</option>
                            <option value="startDate">Start date</option>
                            <option value="endDate">End date</option>
                            <option value="status">Status</option>
                        </select>
                        <button
                            type="button"
                            onClick={handleSortOrderToggle}
                            title={sortOrder === 'ASC' ? 'Ascending, switch to descending' : 'Descending, switch to ascending'}
                            aria-label={sortOrder === 'ASC' ? 'Sort ascending' : 'Sort descending'}
                            className={`${btn.secondary} !px-0 w-9`}
                        >
                            {sortOrder === 'ASC' ? (
                                <ArrowUp className="w-4 h-4" strokeWidth={1.5} />
                            ) : (
                                <ArrowDown className="w-4 h-4" strokeWidth={1.5} />
                            )}
                        </button>
                        <Segmented
                            ariaLabel="View"
                            value={viewMode}
                            onChange={handleViewModeToggle}
                            options={[
                                { value: 'grid', title: 'Grid view', label: <LayoutGrid className="w-4 h-4" strokeWidth={1.5} /> },
                                { value: 'table', title: 'Table view', label: <List className="w-4 h-4" strokeWidth={1.5} /> },
                            ]}
                        />
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Segmented ariaLabel="Status" value={status} onChange={handleStatusFilter} options={STATUS_OPTIONS} />

                    <div className="flex items-center gap-2">
                        <select
                            value={year}
                            onChange={(e) => handleYearFilter(e.target.value)}
                            aria-label="Filter by year"
                            className={selectCls}
                        >
                            <option value="">All years</option>
                            {yearOptions.map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </select>

                        <select
                            value={month}
                            onChange={(e) => handleMonthFilter(e.target.value)}
                            aria-label="Filter by month"
                            className={selectCls}
                        >
                            <option value="">All months</option>
                            {MONTHS.map((name, i) => (
                                <option key={name} value={i + 1}>
                                    {name}
                                </option>
                            ))}
                        </select>

                        {hasActiveFilters && (
                            <button type="button" onClick={handleResetFilters} className={btn.ghost}>
                                <RotateCcw className="w-4 h-4" strokeWidth={1.5} />
                                Reset
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Results */}
            {error && projects.length === 0 ? (
                <div className="panel p-8 text-center border-red-200">
                    <p className="text-sm text-red-700">{error}</p>
                    <button onClick={refetch} className={`${btn.primary} mt-4`}>
                        Try again
                    </button>
                </div>
            ) : viewMode === 'grid' ? (
                <PaginatedGrid
                    gridClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    loading={loading}
                    isEmpty={projects.length === 0}
                    loadingFallback={<SkeletonCard variant="grid" count={6} />}
                    empty={emptyState}
                    pagination={paginationProps}
                >
                    {projects.map((project) => (
                        <div key={project.id} className="panel p-5 flex flex-col justify-between">
                            <div>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h3 className="text-base font-medium text-surface-900 truncate">{project.name}</h3>
                                        <p className="mt-0.5 text-sm text-surface-500 truncate">{project.clientName || 'Internal'}</p>
                                    </div>
                                    <StatusChip status={project.status} />
                                </div>

                                <p className="mt-3 text-sm text-surface-600 line-clamp-2 min-h-[2.5rem]">
                                    {project.description || 'No description'}
                                </p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-surface-200 flex items-center justify-between gap-3">
                                <p className="text-xs text-surface-500 tabular-nums">
                                    {timeline(project.startDate, project.endDate)}
                                    <span className="mx-1.5 text-surface-300" aria-hidden="true">
                                        ·
                                    </span>
                                    {project.assignedUserCount} assigned
                                </p>
                                {rowActions(project)}
                            </div>
                        </div>
                    ))}
                </PaginatedGrid>
            ) : (
                <PaginatedPanel
                    loading={loading}
                    isEmpty={projects.length === 0}
                    empty={emptyState}
                    pagination={paginationProps}
                    tableClassName="w-full text-left border-collapse"
                    tbodyClassName="divide-y divide-surface-100"
                    tableHead={
                        <tr className="bg-surface-50 border-b border-surface-200">
                            <th className="th">Project</th>
                            <th className="th">Status</th>
                            <th className="th">Timeline</th>
                            <th className="th">Team</th>
                            <th className="th text-right">Actions</th>
                        </tr>
                    }
                >
                    {projects.map((project) => (
                        <tr key={project.id} className="hover:bg-surface-50 transition-colors duration-150">
                            <td className="px-5 py-3">
                                <p className="text-sm font-medium text-surface-900">{project.name}</p>
                                <p className="text-xs text-surface-500">{project.clientName || 'Internal'}</p>
                            </td>
                            <td className="px-5 py-3">
                                <StatusChip status={project.status} />
                            </td>
                            <td className="px-5 py-3 text-sm text-surface-600 tabular-nums whitespace-nowrap">
                                {timeline(project.startDate, project.endDate)}
                            </td>
                            <td className="px-5 py-3 text-sm text-surface-600 tabular-nums">{project.assignedUserCount} assigned</td>
                            <td className="px-5 py-3">
                                <div className="flex justify-end">{rowActions(project)}</div>
                            </td>
                        </tr>
                    ))}
                </PaginatedPanel>
            )}

            {/* Confirm soft-delete dialog */}
            <ConfirmDialog
                isOpen={Boolean(deleteTarget)}
                title="Delete project?"
                message={`Are you sure you want to delete "${deleteTarget?.name}"? It will be removed from active listings but preserved in audit history.`}
                confirmText="Delete"
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
