import React, { useEffect, useRef } from 'react';
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

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

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
    const dialogRef = useRef<HTMLDivElement>(null);
    const cancelRef = useRef<HTMLButtonElement>(null);
    // Callers pass inline functions; keep the latest ones in refs so the effect below only runs on open/close.
    const onCancelRef = useRef(onCancel);
    const loadingRef = useRef(isLoading);
    onCancelRef.current = onCancel;
    loadingRef.current = isLoading;

    // Keyboard: focus starts on Cancel (the safe choice), Tab stays inside the dialog, Escape cancels,
    // and focus returns to the button that opened it.
    useEffect(() => {
        if (!isOpen) return;
        const opener = document.activeElement as HTMLElement | null;
        cancelRef.current?.focus();

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !loadingRef.current) {
                e.stopPropagation();
                onCancelRef.current();
                return;
            }
            if (e.key !== 'Tab' || !dialogRef.current) return;
            const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
            if (items.length === 0) return;
            const first = items[0];
            const last = items[items.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', onKeyDown, true);
        return () => {
            document.removeEventListener('keydown', onKeyDown, true);
            opener?.focus?.();
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in"
            onMouseDown={(e) => e.target === e.currentTarget && !isLoading && onCancel()}
        >
            <div
                ref={dialogRef}
                className="bg-white rounded-xl max-w-md w-full shadow-elevated border border-surface-200 overflow-hidden animate-scale-up"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
                aria-describedby="confirm-dialog-message"
            >
                <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div
                            className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${
                                isDestructive ? 'bg-red-50 text-accent-rose' : 'bg-orbit-50 text-orbit-600'
                            }`}
                        >
                            <AlertTriangle className="w-5 h-5" strokeWidth={1.5} />
                        </div>
                        <button
                            onClick={onCancel}
                            disabled={isLoading}
                            className="text-surface-500 hover:text-surface-900 transition-colors p-1 rounded-lg"
                            aria-label="Close dialog"
                        >
                            <X className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                    </div>

                    <div className="mt-4">
                        <h3 id="confirm-dialog-title" className="text-base font-medium text-surface-900">
                            {title}
                        </h3>
                        <p id="confirm-dialog-message" className="mt-1.5 text-sm text-surface-600 leading-relaxed">
                            {message}
                        </p>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-2">
                        <button
                            ref={cancelRef}
                            type="button"
                            onClick={onCancel}
                            disabled={isLoading}
                            className="h-9 px-4 text-sm font-medium text-surface-700 bg-white border border-surface-200 hover:bg-surface-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`h-9 px-4 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${
                                isDestructive ? 'bg-accent-rose hover:bg-red-700' : 'bg-orbit-600 hover:bg-orbit-700'
                            }`}
                        >
                            {isLoading ? 'Processing' : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
