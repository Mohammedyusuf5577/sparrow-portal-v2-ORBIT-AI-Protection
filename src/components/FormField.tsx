import React from 'react';

interface FormFieldProps {
    label: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
    htmlFor?: string;
    hint?: string;
    className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
    label,
    error,
    required = false,
    children,
    htmlFor,
    hint,
    className = '',
}) => {
    return (
        <div className={`space-y-1.5 ${className}`}>
            <div className="flex items-center justify-between">
                <label htmlFor={htmlFor} className="block text-xs font-semibold text-surface-700">
                    {label}
                    {required && <span className="text-rose-500 ml-1">*</span>}
                </label>
                {hint && <span className="text-xs text-surface-400">{hint}</span>}
            </div>

            {children}

            {error && (
                <p className="text-xs text-rose-600 font-medium animate-fade-in flex items-center gap-1">
                    <span>•</span> {error}
                </p>
            )}
        </div>
    );
};
