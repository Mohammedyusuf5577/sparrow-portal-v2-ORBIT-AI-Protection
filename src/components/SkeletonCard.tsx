import React from 'react';

interface SkeletonCardProps {
    variant?: 'grid' | 'table-row' | 'stat-strip';
    count?: number;
    className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
    variant = 'grid',
    count = 1,
    className = '',
}) => {
    const items = Array.from({ length: count });

    if (variant === 'table-row') {
        return (
            <>
                {items.map((_, i) => (
                    <tr key={i} className="border-b border-surface-100 animate-pulse">
                        <td className="py-4 px-4">
                            <div className="h-4 bg-surface-200 rounded w-36 mb-2"></div>
                            <div className="h-3 bg-surface-100 rounded w-24"></div>
                        </td>
                        <td className="py-4 px-4">
                            <div className="h-4 bg-surface-200 rounded w-28"></div>
                        </td>
                        <td className="py-4 px-4">
                            <div className="h-6 bg-surface-200 rounded-full w-24"></div>
                        </td>
                        <td className="py-4 px-4">
                            <div className="h-4 bg-surface-200 rounded w-20"></div>
                        </td>
                        <td className="py-4 px-4">
                            <div className="h-4 bg-surface-200 rounded w-16"></div>
                        </td>
                        <td className="py-4 px-4 text-right">
                            <div className="h-8 bg-surface-200 rounded-lg w-16 ml-auto"></div>
                        </td>
                    </tr>
                ))}
            </>
        );
    }

    if (variant === 'stat-strip') {
        return (
            <div className={`p-6 bg-white rounded-2xl border border-surface-200 shadow-card animate-pulse ${className}`}>
                <div className="h-5 bg-surface-200 rounded w-48 mb-4"></div>
                <div className="h-44 bg-surface-100 rounded-xl"></div>
            </div>
        );
    }

    // Default: grid cards
    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
            {items.map((_, i) => (
                <div
                    key={i}
                    className="p-6 bg-white rounded-2xl border border-surface-200 shadow-card animate-pulse space-y-4"
                >
                    <div className="flex items-center justify-between">
                        <div className="h-5 bg-surface-200 rounded w-32"></div>
                        <div className="h-6 bg-surface-200 rounded-full w-20"></div>
                    </div>
                    <div className="h-4 bg-surface-100 rounded w-24"></div>
                    <div className="space-y-2 pt-2">
                        <div className="h-3 bg-surface-100 rounded w-full"></div>
                        <div className="h-3 bg-surface-100 rounded w-4/5"></div>
                    </div>
                    <div className="pt-4 border-t border-surface-100 flex items-center justify-between">
                        <div className="h-4 bg-surface-200 rounded w-20"></div>
                        <div className="h-4 bg-surface-200 rounded w-16"></div>
                    </div>
                </div>
            ))}
        </div>
    );
};
