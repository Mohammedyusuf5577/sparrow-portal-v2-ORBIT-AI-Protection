import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';
import { StatusDot, type StatusTone } from './StatusDot';

/**
 * One place for feedback after an action:
 *   toast.success("Saved") / toast.error("Could not save")   - short message, bottom right
 *   await confirm({ ... })                                   - replaces window.confirm
 * Both are available anywhere under <FeedbackProvider>.
 */

interface ToastItem {
    id: number;
    tone: StatusTone;
    message: string;
}

interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    /** Red confirm button. Defaults to true because most confirmations guard a delete. */
    destructive?: boolean;
}

interface FeedbackApi {
    toast: {
        success: (message: string) => void;
        error: (message: string) => void;
        info: (message: string) => void;
    };
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const FeedbackContext = createContext<FeedbackApi | null>(null);

const DURATION: Record<string, number> = { positive: 4000, negative: 7000, neutral: 4000 };

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const nextId = useRef(1);

    const dismiss = useCallback((id: number) => {
        setToasts((current) => current.filter((t) => t.id !== id));
    }, []);

    const push = useCallback(
        (tone: StatusTone, message: string) => {
            const id = nextId.current++;
            // Keep the stack short: the newest three are enough.
            setToasts((current) => [...current.slice(-2), { id, tone, message }]);
            window.setTimeout(() => dismiss(id), DURATION[tone] ?? 4000);
        },
        [dismiss]
    );

    // ── confirm() as a promise ──
    const [pending, setPending] = useState<{ options: ConfirmOptions; resolve: (ok: boolean) => void } | null>(null);

    const confirm = useCallback(
        (options: ConfirmOptions) =>
            new Promise<boolean>((resolve) => {
                setPending({ options, resolve });
            }),
        []
    );

    const settle = (ok: boolean) => {
        pending?.resolve(ok);
        setPending(null);
    };

    const api = useMemo<FeedbackApi>(
        () => ({
            toast: {
                success: (message) => push('positive', message),
                error: (message) => push('negative', message),
                info: (message) => push('neutral', message),
            },
            confirm,
        }),
        [push, confirm]
    );

    return (
        <FeedbackContext.Provider value={api}>
            {children}

            {/* Toasts */}
            <div
                className="fixed z-[60] bottom-4 right-4 sm:bottom-6 sm:right-6 flex flex-col gap-2 w-[calc(100vw-2rem)] sm:w-[360px] pointer-events-none"
                aria-live="polite"
            >
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        role={t.tone === 'negative' ? 'alert' : 'status'}
                        className="pointer-events-auto flex items-start gap-3 bg-white border border-surface-200 rounded-lg shadow-elevated px-4 py-3 animate-slide-up"
                    >
                        <span className="flex items-center h-5 flex-shrink-0">
                            <StatusDot tone={t.tone} />
                        </span>
                        <p className="flex-1 text-sm text-surface-900">{t.message}</p>
                        <button
                            type="button"
                            onClick={() => dismiss(t.id)}
                            className="flex-shrink-0 h-5 w-5 inline-flex items-center justify-center rounded text-surface-500 hover:text-surface-900 transition-colors"
                            aria-label="Dismiss"
                        >
                            <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Confirm dialog */}
            <ConfirmDialog
                isOpen={Boolean(pending)}
                title={pending?.options.title ?? ''}
                message={pending?.options.message ?? ''}
                confirmText={pending?.options.confirmText ?? 'Confirm'}
                cancelText={pending?.options.cancelText ?? 'Cancel'}
                isDestructive={pending?.options.destructive ?? true}
                onConfirm={() => settle(true)}
                onCancel={() => settle(false)}
            />
        </FeedbackContext.Provider>
    );
};

const useFeedback = (): FeedbackApi => {
    const ctx = useContext(FeedbackContext);
    if (!ctx) throw new Error('useToast and useConfirm must be used inside <FeedbackProvider>');
    return ctx;
};

export const useToast = () => useFeedback().toast;
export const useConfirm = () => useFeedback().confirm;
