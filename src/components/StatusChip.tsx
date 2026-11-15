import React from 'react';
import { Status, type StatusTone } from './StatusDot';

interface StatusChipProps {
    status: string;
    className?: string;
}

const STATES: Record<string, { tone: StatusTone; label: string }> = {
    COMPLETED: { tone: 'positive', label: 'Completed' },
    DELAYED: { tone: 'negative', label: 'Delayed' },
    IN_PROGRESS: { tone: 'active', label: 'In progress' },
};

/** Project state as a status dot and plain text. Unknown values fall back to "In progress". */
export const StatusChip: React.FC<StatusChipProps> = ({ status, className = '' }) => {
    const state = STATES[(status || '').toUpperCase()] ?? STATES.IN_PROGRESS;
    return (
        <Status tone={state.tone} className={className}>
            {state.label}
        </Status>
    );
};
