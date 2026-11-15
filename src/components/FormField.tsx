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
                <label htmlFor={htmlFor} className="block text-sm font-medium text-surface-700">
                    {label}
                    {required && <span className="text-accent-rose ml-1">*</span>}
                </label>
                {hint && <span className="text-xs text-surface-500">{hint}</span>}
            </div>

            {children}

            {error && (
                <p role="alert" className="text-xs text-accent-rose animate-fade-in">
                    {error}
                </p>
            )}
        </div>
    );
};
