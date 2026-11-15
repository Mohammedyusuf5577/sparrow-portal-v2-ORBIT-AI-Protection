import React from 'react';
import { FileText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { PanelVariant } from '../types';

export interface EmptyStateProps {
    icon?: LucideIcon;
    title?: string;
    description?: string;
    /** Optional call-to-action, e.g. a "Create" or "Clear filters" button. */
    action?: React.ReactNode;
    variant?: PanelVariant;
}

const THEME: Record<PanelVariant, { icon: string; title: string; text: string }> = {
    light: { icon: 'text-surface-400', title: 'text-surface-900', text: 'text-surface-600' },
    dark: { icon: 'text-surface-300', title: 'text-white', text: 'text-surface-300' },
};

/** Centered "nothing to show" block used inside every paginated list. */
export const EmptyState: React.FC<EmptyStateProps> = ({
    icon: Icon = FileText,
    title = 'Nothing here yet',
    description = 'There is nothing to show right now. Try adjusting your filters.',
    action,
    variant = 'light',
}) => {
    const t = THEME[variant];
    return (
        <div className="flex flex-col items-center text-center max-w-sm mx-auto">
            <Icon className={`w-6 h-6 ${t.icon}`} strokeWidth={1.5} aria-hidden="true" />
            <h3 className={`mt-3 text-sm font-medium ${t.title}`}>{title}</h3>
            <p className={`mt-1 text-sm ${t.text}`}>{description}</p>
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
};
