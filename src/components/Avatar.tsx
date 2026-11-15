import React from 'react';

/** Neutral initial in a circle. Colour is never used to tell people apart. */
const SIZES = { sm: 'w-6 h-6 text-xs', md: 'w-8 h-8 text-sm', lg: 'w-12 h-12 text-lg' } as const;

export const Avatar: React.FC<{ name?: string; size?: keyof typeof SIZES }> = ({ name = '', size = 'md' }) => (
    <span
        aria-hidden="true"
        className={`inline-flex items-center justify-center flex-shrink-0 rounded-full bg-surface-100 text-surface-700 font-medium ${SIZES[size]}`}
    >
        {name.trim().charAt(0).toUpperCase() || '?'}
    </span>
);
