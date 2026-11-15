import React from 'react';

interface PageHeaderProps {
    title: string;
    description?: string;
    /** Buttons aligned to the right of the title. */
    actions?: React.ReactNode;
}

/** The one page title block: 24px title, quiet description, optional actions. */
export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions }) => (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="min-w-0">
            <h1 className="text-2xl font-medium text-surface-900">{title}</h1>
            {description && <p className="mt-1 text-sm text-surface-500">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
);
