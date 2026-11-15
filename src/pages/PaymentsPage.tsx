import React, { useEffect, useRef, useState } from 'react';
import {
    createPaymentOrder,
    verifyPayment,
    getPaymentsByEmployee,
    initiateRefund,
    type PaymentOrderResponse,
    type PaymentResponse,
} from '../api/services';
import { AlertCircle, CheckCircle2, CreditCard, Lock, Plus, X } from 'lucide-react';
import { usePagination } from '../hooks/usePagination';
import { PaginatedPanel } from '../components/PaginatedPanel';
import { PageHeader } from '../components/PageHeader';
import { FormField } from '../components/FormField';
import { Stat } from '../components/Stat';
import { Status, type StatusTone } from '../components/StatusDot';
import { btn, inputCls, formatDate, formatINR } from '../components/ui';
import { useConfirm } from '../components/Feedback';

// ─── Razorpay window type ────────────────────────────────────────────────────
declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Razorpay: any;
    }
}

// ─── Load Razorpay checkout.js script once ────────────────────────────────────
function useRazorpayScript() {
    const loaded = useRef(false);
    useEffect(() => {
        if (loaded.current || document.getElementById('razorpay-script')) return;
        const script = document.createElement('script');
        script.id = 'razorpay-script';
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        loaded.current = true;
    }, []);
}

// ─── Payment status ──────────────────────────────────────────────────────────
const PAYMENT_STATUS: Record<string, { tone: StatusTone; label: string }> = {
    CREATED: { tone: 'warning', label: 'Pending' },
    SUCCESS: { tone: 'positive', label: 'Success' },
    FAILED: { tone: 'negative', label: 'Failed' },
    REFUNDED: { tone: 'neutral', label: 'Refunded' },
};

const PaymentStatus: React.FC<{ status: string }> = ({ status }) => {
    const c = PAYMENT_STATUS[status] ?? PAYMENT_STATUS.CREATED;
    return <Status tone={c.tone}>{c.label}</Status>;
};

// ─── Main Page Component ──────────────────────────────────────────────────────
const PaymentsPage: React.FC = () => {
    useRazorpayScript();
    const confirm = useConfirm();

    // Get stored user for employee ID
    const storedUser = (() => {
        try { return JSON.parse(localStorage.getItem('orbit_user') || '{}'); }
        catch { return {}; }
    })();

    // ── State ──
    const [payments, setPayments] = useState<PaymentResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [payrollId, setPayrollId] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    // Refund
    const [refundingId, setRefundingId] = useState<string | null>(null);

    // Escape closes the dialog
    useEffect(() => {
        if (!showModal) return;
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setShowModal(false);
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [showModal]);

    // ── Fetch payments ──
    const fetchPayments = async () => {
        if (!storedUser?.id) return;
        setLoading(true);
        setError(null);
        try {
            const res = await getPaymentsByEmployee(storedUser.id);
            setPayments(res.data?.data ?? []);
        } catch {
            setError('Failed to load payment history.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPayments(); }, []);

    // ── Razorpay checkout ──
    const handlePay = async () => {
        if (!payrollId.trim()) { setError('Payroll ID is required'); return; }
        setError(null);
        setPaying(true);

        let order: PaymentOrderResponse;
        try {
            const res = await createPaymentOrder({
                payrollId,
                amount: amount ? parseFloat(amount) : undefined,
                description: description || undefined,
            });
            order = res.data.data!;
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { errorMessage?: string } } })
                ?.response?.data?.errorMessage ?? 'Could not create payment order.';
            setError(msg);
            setPaying(false);
            return;
        }

        // Open Razorpay checkout
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID ?? 'rzp_test_YOUR_KEY_ID',
            amount: order.amountPaise,
            currency: order.currency,
            name: 'Orbit AI Protection',
            description: order.description,
            order_id: order.razorpayOrderId,
            prefill: {
                name: order.employeeName,
                email: order.employeeEmail,
            },
            theme: { color: '#2563eb' },
            handler: async (response: {
                razorpay_order_id: string;
                razorpay_payment_id: string;
                razorpay_signature: string;
            }) => {
                try {
                    await verifyPayment({
                        razorpayOrderId: response.razorpay_order_id,
                        razorpayPaymentId: response.razorpay_payment_id,
                        razorpaySignature: response.razorpay_signature,
                    });
                    setSuccessMessage(`Payment of ${formatINR(order.amountInr)} processed successfully`);
                    setShowModal(false);
                    fetchPayments();
                } catch {
                    setError('Payment verification failed. Contact support.');
                } finally {
                    setPaying(false);
                }
            },
            modal: {
                ondismiss: () => {
                    setPaying(false);
                    setError('Payment was cancelled.');
                },
            },
        };

        if (!window.Razorpay) {
            setError('Razorpay SDK not loaded. Please refresh the page.');
            setPaying(false);
            return;
        }

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    // ── Refund ──
    const handleRefund = async (paymentId: string, amountInr: number) => {
        const ok = await confirm({
            title: 'Refund payment?',
            message: `Initiate full refund of ${formatINR(amountInr)}?`,
            confirmText: 'Refund',
        });
        if (!ok) return;
        setRefundingId(paymentId);
        try {
            await initiateRefund(paymentId);
            setSuccessMessage('Refund initiated successfully.');
            fetchPayments();
        } catch {
            setError('Refund failed. Please try again.');
        } finally {
            setRefundingId(null);
        }
    };

    // ── Stats ──
    const total = payments.reduce((s, p) => s + (p.status === 'SUCCESS' ? p.amountInr : 0), 0);
    const successCount = payments.filter(p => p.status === 'SUCCESS').length;
    const failedCount = payments.filter(p => p.status === 'FAILED').length;

    // ── Client-side pagination ──
    const { pageItems, paginationProps } = usePagination(payments);

    // ── Render ──
    return (
        <div className="space-y-6 pb-12">
            <PageHeader
                title="Salary payments"
                description="Manage disbursements via Razorpay"
                actions={
                    <button
                        id="open-payment-modal"
                        onClick={() => { setShowModal(true); setError(null); setSuccessMessage(null); }}
                        className={btn.primary}
                    >
                        <Plus className="w-4 h-4" strokeWidth={1.5} />
                        Disburse salary
                    </button>
                }
            />

            {/* Alerts */}
            {error && (
                <div role="alert" className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                    <span className="flex-1">{error}</span>
                    <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900" aria-label="Dismiss">
                        <X className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                </div>
            )}
            {successMessage && (
                <div role="status" className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                    <span className="flex-1">{successMessage}</span>
                    <button onClick={() => setSuccessMessage(null)} className="text-green-800 hover:text-green-900" aria-label="Dismiss">
                        <X className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                </div>
            )}

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Stat label="Total paid" value={formatINR(total)} />
                <Stat label="Successful" tone="positive" value={successCount} />
                <Stat label="Failed" tone="negative" value={failedCount} />
            </div>

            {/* Payment history */}
            <PaginatedPanel
                loading={loading}
                isEmpty={payments.length === 0}
                loadingFallback={
                    <div className="py-16 text-center text-sm text-surface-500">
                        <div className="inline-block w-6 h-6 border-2 border-surface-200 border-t-orbit-600 rounded-full animate-spin mb-3" />
                        <p>Loading payments</p>
                    </div>
                }
                empty={{
                    icon: CreditCard,
                    title: 'No payment records found',
                    description: 'Salary payments you disburse will appear here.',
                }}
                pagination={paginationProps}
                tableClassName="w-full text-sm"
                tbodyClassName="divide-y divide-surface-100"
                header={
                    <div className="px-5 py-4 border-b border-surface-200">
                        <h2 className="text-sm font-medium text-surface-900">Payment history</h2>
                    </div>
                }
                tableHead={
                    <tr className="bg-surface-50 border-b border-surface-200">
                        <th className="th">Employee</th>
                        <th className="th">Order ID</th>
                        <th className="th text-right">Amount</th>
                        <th className="th">Status</th>
                        <th className="th">Date</th>
                        <th className="th">Actions</th>
                    </tr>
                }
            >
                {pageItems.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-50 transition-colors duration-150">
                        <td className="px-5 py-3">
                            <div className="text-sm font-medium text-surface-900">{p.employeeName}</div>
                            <div className="text-xs text-surface-500">{p.employeeEmail}</div>
                        </td>
                        <td className="px-5 py-3">
                            <span className="font-mono text-xs text-surface-600">{p.razorpayOrderId?.slice(0, 16)}…</span>
                        </td>
                        <td className="px-5 py-3 text-right font-medium text-surface-900 tabular-nums">
                            {formatINR(p.amountInr)}
                        </td>
                        <td className="px-5 py-3"><PaymentStatus status={p.status} /></td>
                        <td className="px-5 py-3 text-surface-600 tabular-nums">{formatDate(p.createdAt)}</td>
                        <td className="px-5 py-3">
                            {p.status === 'SUCCESS' && (
                                <button
                                    onClick={() => handleRefund(p.id, p.amountInr)}
                                    disabled={refundingId === p.id}
                                    className={`${btn.secondary} !h-8 !px-3`}
                                >
                                    {refundingId === p.id ? 'Refunding' : 'Refund'}
                                </button>
                            )}
                            {p.status === 'FAILED' && p.failureReason && (
                                <span className="text-xs text-accent-rose">{p.failureReason}</span>
                            )}
                        </td>
                    </tr>
                ))}
            </PaginatedPanel>

            {/* Payment dialog */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in"
                    onMouseDown={(e) => e.target === e.currentTarget && setShowModal(false)}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="payment-dialog-title"
                        className="bg-white border border-surface-200 rounded-xl shadow-elevated w-full max-w-md animate-scale-up"
                    >
                        <div className="flex items-start justify-between px-6 py-4 border-b border-surface-200">
                            <div>
                                <h3 id="payment-dialog-title" className="text-base font-medium text-surface-900">Disburse salary</h3>
                                <p className="mt-0.5 text-sm text-surface-500">Payment is processed via Razorpay</p>
                            </div>
                            <button
                                id="close-payment-modal"
                                onClick={() => setShowModal(false)}
                                className={btn.icon}
                                aria-label="Close dialog"
                            >
                                <X className="w-4 h-4" strokeWidth={1.5} />
                            </button>
                        </div>

                        <div className="px-6 py-5 space-y-4">
                            <FormField label="Payroll ID" htmlFor="payment-payroll-id" required>
                                <input
                                    id="payment-payroll-id"
                                    type="text"
                                    placeholder="UUID of the employee payroll record"
                                    value={payrollId}
                                    onChange={e => setPayrollId(e.target.value)}
                                    className={inputCls}
                                />
                            </FormField>
                            <FormField label="Amount (₹)" htmlFor="payment-amount" hint="Leave blank to use the salary structure">
                                <input
                                    id="payment-amount"
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    placeholder="e.g. 45000.00"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className={inputCls}
                                />
                            </FormField>
                            <FormField label="Description" htmlFor="payment-description">
                                <input
                                    id="payment-description"
                                    type="text"
                                    placeholder="e.g. March 2026 salary"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className={inputCls}
                                />
                            </FormField>

                            <p className="flex items-start gap-2 text-xs text-surface-500">
                                <Lock className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" strokeWidth={1.5} aria-hidden="true" />
                                Payments are secured by Razorpay. Card details are never stored on our servers.
                            </p>
                        </div>

                        <div className="px-6 py-4 border-t border-surface-200 flex items-center justify-end gap-2">
                            <button onClick={() => setShowModal(false)} className={btn.secondary}>
                                Cancel
                            </button>
                            <button id="submit-payment" onClick={handlePay} disabled={paying} className={btn.primary}>
                                {paying ? (
                                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing</>
                                ) : (
                                    'Pay with Razorpay'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentsPage;
