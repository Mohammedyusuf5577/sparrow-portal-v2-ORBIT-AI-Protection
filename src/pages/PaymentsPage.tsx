import React, { useEffect, useRef, useState } from 'react';
import {
    createPaymentOrder,
    verifyPayment,
    getPaymentsByEmployee,
    initiateRefund,
    type PaymentOrderResponse,
    type PaymentResponse,
} from '../api/services';
import { CreditCard } from 'lucide-react';
import { usePagination } from '../hooks/usePagination';
import { PaginatedPanel } from '../components/PaginatedPanel';

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

// ─── Status badge ────────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
        CREATED:  { bg: 'bg-blue-500/20',   text: 'text-blue-400',   label: 'Pending' },
        SUCCESS:  { bg: 'bg-green-500/20',  text: 'text-green-400',  label: 'Success' },
        FAILED:   { bg: 'bg-red-500/20',    text: 'text-red-400',    label: 'Failed' },
        REFUNDED: { bg: 'bg-amber-500/20',  text: 'text-amber-400',  label: 'Refunded' },
    };
    const c = config[status] ?? config.CREATED;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {c.label}
        </span>
    );
};

// ─── Main Page Component ──────────────────────────────────────────────────────
const PaymentsPage: React.FC = () => {
    useRazorpayScript();

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
            theme: { color: '#6366f1' },
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
                    setSuccessMessage(`✅ Payment of ₹${order.amountInr.toLocaleString('en-IN')} processed successfully!`);
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
        if (!window.confirm(`Initiate full refund of ₹${amountInr.toLocaleString('en-IN')}?`)) return;
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
        <div className="min-h-screen bg-gray-950 text-white p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Salary Payments</h1>
                    <p className="text-gray-400 text-sm mt-0.5">Manage disbursements via Razorpay</p>
                </div>
                <button
                    id="open-payment-modal"
                    onClick={() => { setShowModal(true); setError(null); setSuccessMessage(null); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 transition-colors rounded-xl font-semibold text-sm shadow-lg shadow-indigo-900/40"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Disburse Salary
                </button>
            </div>

            {/* Alerts */}
            {error && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                    {error}
                    <button className="ml-auto" onClick={() => setError(null)}>×</button>
                </div>
            )}
            {successMessage && (
                <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 text-green-300 px-4 py-3 rounded-xl text-sm">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    {successMessage}
                    <button className="ml-auto" onClick={() => setSuccessMessage(null)}>×</button>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Total Paid', value: `₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, color: 'from-indigo-600/20 to-indigo-800/10', icon: '💰' },
                    { label: 'Successful', value: successCount.toString(), color: 'from-green-600/20 to-green-800/10', icon: '✅' },
                    { label: 'Failed', value: failedCount.toString(), color: 'from-red-600/20 to-red-800/10', icon: '❌' },
                ].map(card => (
                    <div key={card.label} className={`bg-gradient-to-br ${card.color} border border-gray-800/60 rounded-2xl p-5 backdrop-blur-sm`}>
                        <div className="text-2xl mb-1">{card.icon}</div>
                        <div className="text-2xl font-bold">{card.value}</div>
                        <div className="text-gray-400 text-sm">{card.label}</div>
                    </div>
                ))}
            </div>

            {/* Payment History Table */}
            <PaginatedPanel
                variant="dark"
                loading={loading}
                isEmpty={payments.length === 0}
                loadingFallback={
                    <div className="py-16 text-center text-gray-500">
                        <div className="inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
                        <p>Loading payments...</p>
                    </div>
                }
                empty={{
                    icon: CreditCard,
                    title: 'No payment records found',
                    description: 'Salary payments you disburse will appear here.',
                }}
                pagination={paginationProps}
                tableClassName="w-full text-sm"
                header={
                    <div className="px-6 py-4 border-b border-gray-800/60">
                        <h2 className="text-lg font-semibold">Payment History</h2>
                    </div>
                }
                tableHead={
                    <tr className="border-b border-gray-800/60 text-gray-400 text-left">
                        <th className="px-6 py-3 font-medium">Employee</th>
                        <th className="px-6 py-3 font-medium">Order ID</th>
                        <th className="px-6 py-3 font-medium">Amount</th>
                        <th className="px-6 py-3 font-medium">Status</th>
                        <th className="px-6 py-3 font-medium">Date</th>
                        <th className="px-6 py-3 font-medium">Actions</th>
                    </tr>
                }
            >
                {pageItems.map((p, i) => (
                    <tr
                        key={p.id}
                        className={`border-b border-gray-800/40 hover:bg-gray-800/30 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-800/10'}`}
                    >
                        <td className="px-6 py-4">
                            <div className="font-medium">{p.employeeName}</div>
                            <div className="text-gray-500 text-xs">{p.employeeEmail}</div>
                        </td>
                        <td className="px-6 py-4">
                            <span className="font-mono text-xs bg-gray-800 px-2 py-0.5 rounded">
                                {p.razorpayOrderId?.slice(0, 16)}…
                            </span>
                        </td>
                        <td className="px-6 py-4 font-semibold">
                            ₹{p.amountInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                        <td className="px-6 py-4 text-gray-400">
                            {new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                            {p.status === 'SUCCESS' && (
                                <button
                                    onClick={() => handleRefund(p.id, p.amountInr)}
                                    disabled={refundingId === p.id}
                                    className="text-xs px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {refundingId === p.id ? 'Refunding…' : 'Refund'}
                                </button>
                            )}
                            {p.status === 'FAILED' && p.failureReason && (
                                <span className="text-xs text-red-400">{p.failureReason}</span>
                            )}
                        </td>
                    </tr>
                ))}
            </PaginatedPanel>

            {/* ── Payment Modal ── */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-md">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                            <div>
                                <h3 className="text-lg font-semibold">Disburse Salary</h3>
                                <p className="text-gray-400 text-xs mt-0.5">Payment will be processed via Razorpay</p>
                            </div>
                            <button
                                id="close-payment-modal"
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-5 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-300 mb-1.5">
                                    Payroll ID <span className="text-red-400">*</span>
                                </label>
                                <input
                                    id="payment-payroll-id"
                                    type="text"
                                    placeholder="UUID of the employee payroll record"
                                    value={payrollId}
                                    onChange={e => setPayrollId(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-300 mb-1.5">
                                    Amount (₹) <span className="text-gray-500 text-xs">— leave blank to use salary structure</span>
                                </label>
                                <input
                                    id="payment-amount"
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    placeholder="e.g. 45000.00"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-300 mb-1.5">Description</label>
                                <input
                                    id="payment-description"
                                    type="text"
                                    placeholder="e.g. March 2026 salary"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-600"
                                />
                            </div>

                            {/* Security note */}
                            <div className="flex items-start gap-2 bg-gray-800/50 rounded-xl p-3.5 text-xs text-gray-400">
                                <svg className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                <span>Payments are secured by Razorpay. Card details are never stored on our servers.</span>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-800 flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-2.5 border border-gray-700 hover:bg-gray-800 rounded-xl text-sm transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                id="submit-payment"
                                onClick={handlePay}
                                disabled={paying}
                                className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                {paying ? (
                                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing…</>
                                ) : (
                                    <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> Pay with Razorpay</>
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
