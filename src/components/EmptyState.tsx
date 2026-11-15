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

const THEME: Record<PanelVariant, { circle: string; title: string; text: string }> = {
    light: { circle: 'bg-surface-100 text-surface-500', title: 'text-surface-900', text: 'text-surface-500' },
    dark: { circle: 'bg-gray-800 text-gray-500', title: 'text-gray-100', text: 'text-gray-400' },
};

/** Centered "nothing to show" block used inside every paginated list. */
export const EmptyState: React.FC<EmptyStateProps> = ({
    icon: Icon = FileText,
    title = 'No data available',
    description = 'There are currently no items to display. Check back later or try adjusting your filters.',
    action,
    variant = 'light',
}) => {
    const t = THEME[variant];
    return (
        <div className="flex flex-col items-center text-center max-w-sm mx-auto">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center ${t.circle}`}>
                <Icon className="w-10 h-10" strokeWidth={1.5} aria-hidden="true" />
            </div>
            <h3 className={`mt-5 text-lg font-bold ${t.title}`}>{title}</h3>
            <p className={`mt-1.5 text-sm leading-relaxed ${t.text}`}>{description}</p>
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
};
