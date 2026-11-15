import React from 'react';
import { StatusDot, type StatusTone } from './StatusDot';

interface StatProps {
    label: string;
    value: React.ReactNode;
    /** Adds a status dot before the label when the number carries a state (present, failed...). */
    tone?: StatusTone;
    className?: string;
}

/** A stat is a label and a figure. Nothing else: no icon, no sparkline, no tinted tile. */
export const Stat: React.FC<StatProps> = ({ label, value, tone, className = '' }) => (
    <div className={`panel p-5 ${className}`}>
        <p className="flex items-center gap-2 h-5 text-sm text-surface-600">
            {tone && <StatusDot tone={tone} />}
            {label}
        </p>
        <p className="mt-2 text-3xl font-medium leading-none text-surface-900 tabular-nums">{value}</p>
    </div>
);
