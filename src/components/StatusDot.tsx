import React from 'react';

/**
 * ORBIT's signature detail: a small, steady status dot followed by plain text.
 * It replaces coloured pills and tinted badges everywhere a state is shown.
 */
export type StatusTone = 'positive' | 'negative' | 'warning' | 'active' | 'neutral';

const DOT: Record<StatusTone, string> = {
    positive: 'bg-accent-emerald',
    negative: 'bg-accent-rose',
    warning: 'bg-amber-600',
    active: 'bg-orbit-600',
    neutral: 'bg-surface-300',
};

export const StatusDot: React.FC<{ tone: StatusTone; className?: string }> = ({ tone, className = '' }) => (
    <span aria-hidden="true" className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${DOT[tone]} ${className}`} />
);

interface StatusProps {
    tone: StatusTone;
    children: React.ReactNode;
    className?: string;
}

/** Dot + label. Text stays in the neutral ramp, only the dot carries colour. */
export const Status: React.FC<StatusProps> = ({ tone, children, className = '' }) => (
    <span className={`inline-flex items-center gap-2 text-sm text-surface-700 whitespace-nowrap ${className}`}>
        <StatusDot tone={tone} />
        {children}
    </span>
);

/** Maps the raw API value (ACTIVE, IN_PROGRESS, ...) to "Active", "In progress". */
export const formatEnum = (value?: string | null): string => {
    if (!value) return '';
    const spaced = value.replace(/[_-]+/g, ' ').trim().toLowerCase();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};
