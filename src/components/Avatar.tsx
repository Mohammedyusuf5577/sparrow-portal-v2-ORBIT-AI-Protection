import React from 'react';

/** Neutral initial in a circle. Colour is never used to tell people apart. */
export const Avatar: React.FC<{ name?: string; size?: 'sm' | 'md' }> = ({ name = '', size = 'md' }) => (
    <span
        aria-hidden="true"
        className={`inline-flex items-center justify-center flex-shrink-0 rounded-full bg-surface-100 text-surface-700 font-medium ${
            size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'
        }`}
    >
        {name.trim().charAt(0).toUpperCase() || '?'}
    </span>
);
