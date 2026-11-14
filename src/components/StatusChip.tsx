import React from 'react';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface StatusChipProps {
    status: string;
    className?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, className = '' }) => {
    const s = (status || '').toUpperCase();

    if (s === 'COMPLETED') {
        return (
            <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}
            >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Completed
            </span>
        );
    }

    if (s === 'DELAYED') {
        return (
            <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 ${className}`}
            >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                Delayed
            </span>
        );
    }

    // Default: IN_PROGRESS
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orbit-50 text-orbit-700 border border-orbit-200 ${className}`}
        >
            <Clock className="w-3.5 h-3.5 text-orbit-600 animate-pulse" />
            In Progress
        </span>
    );
};
