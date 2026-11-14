import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    onPageChange: (newPage: number) => void;
    onLimitChange: (newLimit: number) => void;
    limitOptions?: number[];
}

export const Pagination: React.FC<PaginationProps> = ({
    page,
    limit,
    totalItems,
    totalPages,
    onPageChange,
    onLimitChange,
    limitOptions = [10, 25, 50, 100],
}) => {
    if (totalItems === 0) return null;

    const startItem = Math.min((page - 1) * limit + 1, totalItems);
    const endItem = Math.min(page * limit, totalItems);

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (page > 3) pages.push('...');
            const start = Math.max(2, page - 1);
            const end = Math.min(totalPages - 1, page + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (page < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 select-none">
            {/* Left: Info & Limit Selector */}
            <div className="flex items-center gap-3 text-sm text-surface-600">
                <span>
                    Showing <span className="font-semibold text-surface-900">{startItem}</span>–
                    <span className="font-semibold text-surface-900">{endItem}</span> of{' '}
                    <span className="font-semibold text-surface-900">{totalItems}</span>
                </span>
                <span className="text-surface-300">|</span>
                <div className="flex items-center gap-1.5">
                    <label htmlFor="limit-select" className="text-xs text-surface-500">
                        Per page:
                    </label>
                    <select
                        id="limit-select"
                        value={limit}
                        onChange={(e) => onLimitChange(Number(e.target.value))}
                        className="bg-white border border-surface-200 rounded-lg px-2.5 py-1 text-xs font-medium text-surface-700 hover:border-orbit-400 focus:outline-none focus:ring-2 focus:ring-orbit-500/20 cursor-pointer transition-colors"
                    >
                        {limitOptions.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Right: Page navigation */}
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1}
                    aria-label="Previous Page"
                    className="flex items-center justify-center w-8 h-8 rounded-lg border border-surface-200 text-surface-600 hover:bg-surface-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                {getPageNumbers().map((p, idx) => {
                    if (p === '...') {
                        return (
                            <span key={`ellipsis-${idx}`} className="px-2 text-surface-400 text-xs">
                                ...
                            </span>
                        );
                    }
                    const pageNum = Number(p);
                    const isActive = pageNum === page;
                    return (
                        <button
                            key={pageNum}
                            onClick={() => onPageChange(pageNum)}
                            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                                isActive
                                    ? 'bg-gradient-orbit text-white shadow-sm'
                                    : 'border border-surface-200 text-surface-700 hover:bg-surface-50'
                            }`}
                        >
                            {pageNum}
                        </button>
                    );
                })}

                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages}
                    aria-label="Next Page"
                    className="flex items-center justify-center w-8 h-8 rounded-lg border border-surface-200 text-surface-600 hover:bg-surface-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
