import React from 'react';

interface SegmentedOption<T extends string> {
    value: T;
    label: React.ReactNode;
    /** Tooltip, also used as the accessible name when the label is only an icon. */
    title?: string;
}

interface SegmentedProps<T extends string> {
    value: T;
    onChange: (value: T) => void;
    options: SegmentedOption<T>[];
    ariaLabel: string;
}

/**
 * Small switch between a few views or filters. The selected option is a raised white surface,
 * so it reads as "selected" without spending the accent colour.
 * Outer radius 8 minus 2px padding gives the inner radius 6 (nested radius rule).
 */
export function Segmented<T extends string>({ value, onChange, options, ariaLabel }: SegmentedProps<T>) {
    return (
        <div role="group" aria-label={ariaLabel} className="inline-flex items-center p-0.5 bg-surface-100 border border-surface-200 rounded-lg">
            {options.map((option) => {
                const active = option.value === value;
                return (
                    <button
                        key={option.value || 'all'}
                        type="button"
                        aria-pressed={active}
                        aria-label={option.title}
                        title={option.title}
                        onClick={() => onChange(option.value)}
                        className={`inline-flex items-center justify-center h-8 min-w-[2rem] px-3 rounded-md text-sm whitespace-nowrap transition-colors duration-150 ${
                            active
                                ? 'bg-white text-surface-900 font-medium shadow-card'
                                : 'text-surface-600 hover:text-surface-900'
                        }`}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}
