import React from 'react';
import type { PaginationControls, PanelVariant } from '../types';
import { EmptyState } from './EmptyState';
import type { EmptyStateProps } from './EmptyState';
import { Pagination } from './Pagination';

/** Keeps the panel "full page" tall even with few or zero rows, so the pagination bar stays put. */
export const DEFAULT_MIN_BODY_HEIGHT = 'min-h-[28rem]';

const CARD: Record<PanelVariant, string> = {
    light: 'bg-white rounded-2xl shadow-card border border-surface-100 overflow-hidden',
    dark: 'bg-gray-900/60 border border-gray-800/60 rounded-2xl overflow-hidden',
};

const SPINNER: Record<PanelVariant, string> = {
    light: 'border-orbit-200 border-t-orbit-600',
    dark: 'border-indigo-900 border-t-indigo-500',
};

const Loader: React.FC<{ variant: PanelVariant }> = ({ variant }) => (
    <div
        role="status"
        aria-label="Loading"
        className={`w-9 h-9 border-4 rounded-full animate-spin ${SPINNER[variant]}`}
    />
);

interface CommonProps {
    /** Pagination state from usePagination() or built from the server's PageMeta. */
    pagination: PaginationControls;
    /** True when there is nothing to show (also while the very first load is in flight). */
    isEmpty: boolean;
    loading?: boolean;
    empty?: EmptyStateProps;
    /** Shown instead of the empty state while `loading && isEmpty` (default: a spinner). */
    loadingFallback?: React.ReactNode;
    variant?: PanelVariant;
    minBodyHeightClass?: string;
}

export interface PaginatedPanelProps extends CommonProps {
    /** Content above the body inside the card (title bar etc.). */
    header?: React.ReactNode;
    /** `<tr>` for the table header. When given, `children` are the `<tr>` rows. The header stays visible when empty. */
    tableHead?: React.ReactNode;
    tableClassName?: string;
    tbodyClassName?: string;
    /** Wrapper classes for non-table bodies (e.g. a divided list of notifications). */
    bodyClassName?: string;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
}

/**
 * One card = optional header + body (table or list) + pagination bar.
 * Handles loading, the empty state and the minimum height in one place, so every module
 * (Employees, Attendance, Payroll, Payments, notifications...) looks and behaves the same.
 */
export const PaginatedPanel: React.FC<PaginatedPanelProps> = ({
    pagination,
    isEmpty,
    loading = false,
    empty,
    loadingFallback,
    variant = 'light',
    minBodyHeightClass = DEFAULT_MIN_BODY_HEIGHT,
    header,
    tableHead,
    tableClassName = 'w-full',
    tbodyClassName = '',
    bodyClassName = '',
    className = '',
    style,
    children,
}) => {
    const dim = loading ? 'opacity-60 transition-opacity' : '';

    return (
        <section className={`flex flex-col ${CARD[variant]} ${className}`} style={style} aria-busy={loading}>
            {header}

            <div className={`flex flex-col flex-1 ${minBodyHeightClass}`}>
                {tableHead ? (
                    <div className="overflow-x-auto">
                        <table className={tableClassName}>
                            <thead>{tableHead}</thead>
                            {!isEmpty && <tbody className={`${tbodyClassName} ${dim}`}>{children}</tbody>}
                        </table>
                    </div>
                ) : (
                    !isEmpty && <div className={`${bodyClassName} ${dim}`}>{children}</div>
                )}

                {isEmpty && (
                    <div className="flex-1 flex items-center justify-center px-6 py-12">
                        {loading ? (
                            <div className="w-full">{loadingFallback ?? <div className="flex justify-center"><Loader variant={variant} /></div>}</div>
                        ) : (
                            <EmptyState variant={variant} {...empty} />
                        )}
                    </div>
                )}
            </div>

            <Pagination {...pagination} variant={variant} disabled={loading} />
        </section>
    );
};

export interface PaginatedGridProps extends CommonProps {
    /** Full grid classes, e.g. "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6". */
    gridClassName: string;
    children?: React.ReactNode;
}

/**
 * Same behaviour for card grids: the cards stay on the page background, the pagination bar sits in
 * its own card underneath, and the empty state is a full panel (so the page never looks collapsed).
 */
export const PaginatedGrid: React.FC<PaginatedGridProps> = ({
    pagination,
    isEmpty,
    loading = false,
    empty,
    loadingFallback,
    variant = 'light',
    minBodyHeightClass = DEFAULT_MIN_BODY_HEIGHT,
    gridClassName,
    children,
}) => {
    if (isEmpty) {
        return (
            <PaginatedPanel
                pagination={pagination}
                isEmpty
                loading={loading}
                empty={empty}
                loadingFallback={loadingFallback}
                variant={variant}
                minBodyHeightClass={minBodyHeightClass}
            />
        );
    }

    return (
        <div className={`flex flex-col ${minBodyHeightClass}`} aria-busy={loading}>
            <div className={`flex-1 content-start ${gridClassName} ${loading ? 'opacity-60 transition-opacity' : ''}`}>
                {children}
            </div>
            <div className={`mt-6 ${CARD[variant]}`}>
                <Pagination {...pagination} variant={variant} disabled={loading} bordered={false} />
            </div>
        </div>
    );
};
