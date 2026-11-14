import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    isLoading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDestructive = true,
    isLoading = false,
    onConfirm,
    onCancel,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div
                className="bg-white rounded-2xl max-w-md w-full shadow-elevated border border-surface-200 overflow-hidden animate-slide-up"
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
            >
                <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div
                            className={`flex items-center justify-center w-12 h-12 rounded-xl shrink-0 ${
                                isDestructive ? 'bg-rose-50 text-rose-600' : 'bg-orbit-50 text-orbit-600'
                            }`}
                        >
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <button
                            onClick={onCancel}
                            disabled={isLoading}
                            className="text-surface-400 hover:text-surface-700 transition-colors p-1"
                            aria-label="Close modal"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="mt-4">
                        <h3 id="confirm-dialog-title" className="text-lg font-bold text-surface-900">
                            {title}
                        </h3>
                        <p className="mt-2 text-sm text-surface-600 leading-relaxed">{message}</p>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-semibold text-surface-700 hover:bg-surface-100 rounded-xl transition-colors disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-sm transition-all disabled:opacity-50 ${
                                isDestructive
                                    ? 'bg-rose-600 hover:bg-rose-700 focus:ring-2 focus:ring-rose-500/20'
                                    : 'bg-gradient-orbit hover:opacity-95'
                            }`}
                        >
                            {isLoading ? 'Processing...' : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
