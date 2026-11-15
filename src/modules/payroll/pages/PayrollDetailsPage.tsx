import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    getPayrollById,
    saveBankDetails,
    saveTaxDetails,
    saveSalary,
    saveAttendance
} from '../services/payrollService';
import { EmployeePayroll } from '../types';
import { Avatar } from '../../../components/Avatar';
import { FormField } from '../../../components/FormField';
import { Status, formatEnum } from '../../../components/StatusDot';
import { btn, inputCls, formatDate, formatINR } from '../../../components/ui';
import { useToast } from '../../../components/Feedback';
import { ArrowLeft } from 'lucide-react';

type TabKey = 'info' | 'bank' | 'tax' | 'salary' | 'attendance';

const TABS: { id: TabKey; name: string }[] = [
    { id: 'info', name: 'Basic info' },
    { id: 'bank', name: 'Bank details' },
    { id: 'tax', name: 'Tax and compliance' },
    { id: 'salary', name: 'Salary structure' },
    { id: 'attendance', name: 'Attendance' },
];

/** Number input with a rupee sign inside the field. */
const MoneyInput: React.FC<{ id: string; value: number; onChange: (value: number) => void }> = ({ id, value, onChange }) => (
    <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-surface-500" aria-hidden="true">
            ₹
        </span>
        <input
            id={id}
            type="number"
            required
            className={`${inputCls} pl-7 tabular-nums`}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
        />
    </div>
);

const SaveButton: React.FC<{ saving: boolean; children: React.ReactNode }> = ({ saving, children }) => (
    <div className="pt-5 border-t border-surface-200 flex justify-end">
        <button type="submit" disabled={saving} className={btn.primary}>
            {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {children}
        </button>
    </div>
);

const PayrollDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [payroll, setPayroll] = useState<EmployeePayroll | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabKey>('info');
    const [saving, setSaving] = useState(false);
    const toast = useToast();

    // Form states for sections
    const [bankForm, setBankForm] = useState({ accountName: '', bankName: '', accountNumber: '', ifsc: '' });
    const [taxForm, setTaxForm] = useState({ pan: '', aadhaar: '', uan: '' });
    const [salaryForm, setSalaryForm] = useState({ basicSalary: 0, allowance: 0, pf: 0, tax: 0, otherDeduction: 0 });
    const [attendanceForm, setAttendanceForm] = useState({ workingDays: 0, presentDays: 0, leaveDays: 0, overtimeHours: 0 });

    useEffect(() => {
        if (id) fetchData(id);
    }, [id]);

    const fetchData = async (payrollId: string) => {
        try {
            const res = await getPayrollById(payrollId);
            const data = res.data.data;
            if (data) {
                setPayroll(data);
                if (data.bankDetails) setBankForm(data.bankDetails as any);
                if (data.taxDetails) setTaxForm(data.taxDetails as any);
                if (data.salaryStructure) setSalaryForm(data.salaryStructure as any);
                if (data.attendance) setAttendanceForm(data.attendance as any);
            }
        } catch (err) {
            console.error('Failed to fetch payroll details', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBank = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        setSaving(true);
        try {
            const res = await saveBankDetails(id, bankForm);
            setPayroll(res.data.data || null);
            toast.success('Bank details updated');
        } catch (err) { console.error(err); toast.error('Could not save bank details. Please try again.'); }
        finally { setSaving(false); }
    };

    const handleSaveTax = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        setSaving(true);
        try {
            const res = await saveTaxDetails(id, taxForm);
            setPayroll(res.data.data || null);
            toast.success('Tax details updated');
        } catch (err) { console.error(err); toast.error('Could not save tax details. Please try again.'); }
        finally { setSaving(false); }
    };

    const handleSaveSalary = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        setSaving(true);
        try {
            const res = await saveSalary(id, salaryForm);
            setPayroll(res.data.data || null);
            toast.success('Salary structure updated');
        } catch (err) { console.error(err); toast.error('Could not save salary structure. Please try again.'); }
        finally { setSaving(false); }
    };

    const handleSaveAttendance = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        setSaving(true);
        try {
            const res = await saveAttendance(id, attendanceForm);
            setPayroll(res.data.data || null);
            toast.success('Attendance data updated');
        } catch (err) { console.error(err); toast.error('Could not save attendance data. Please try again.'); }
        finally { setSaving(false); }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div role="status" aria-label="Loading" className="w-6 h-6 border-2 border-surface-200 border-t-orbit-600 rounded-full animate-spin" />
        </div>
    );

    if (!payroll) return <p className="text-sm text-surface-600">Record not found</p>;

    const estimatedNet = salaryForm.basicSalary + salaryForm.allowance - salaryForm.pf - salaryForm.tax - salaryForm.otherDeduction;

    return (
        <div className="space-y-6 pb-12">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/admin/payroll')}
                    className="inline-flex items-center gap-2 text-sm text-surface-600 hover:text-surface-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                    Back to payroll
                </button>
                <span className="font-mono text-xs text-surface-500">ID {payroll.id.slice(0, 8)}</span>
            </div>

            {/* Profile header */}
            <div className="panel p-6 flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Avatar name={payroll.name} size="lg" />
                    <div className="min-w-0">
                        <h1 className="text-2xl font-medium text-surface-900 truncate">{payroll.name}</h1>
                        <p className="mt-1 text-sm text-surface-600">
                            {payroll.department}
                            <span className="mx-2 text-surface-300" aria-hidden="true">·</span>
                            {payroll.designation}
                            <span className="mx-2 text-surface-300" aria-hidden="true">·</span>
                            {formatEnum(payroll.employmentType)}
                        </p>
                    </div>
                </div>
                <div className="md:pl-8 md:border-l md:border-surface-200">
                    <p className="text-sm text-surface-600">Calculated net salary</p>
                    <p className="mt-1 text-3xl font-medium leading-none text-surface-900 tabular-nums">{formatINR(payroll.netSalary)}</p>
                </div>
            </div>

            {/* Tabs */}
            <div role="tablist" className="flex items-center gap-6 border-b border-surface-200 overflow-x-auto">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`-mb-px h-10 text-sm whitespace-nowrap border-b-2 transition-colors duration-150 ${
                            activeTab === tab.id
                                ? 'border-orbit-600 text-surface-900 font-medium'
                                : 'border-transparent text-surface-600 hover:text-surface-900'
                        }`}
                    >
                        {tab.name}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div className="panel p-6 min-h-[360px]">
                {activeTab === 'info' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-medium text-surface-900">Employment summary</h3>
                            <button onClick={() => navigate(`/admin/payroll/edit/${payroll.id}`)} className={btn.secondary}>
                                Edit profile
                            </button>
                        </div>
                        <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                            <div>
                                <dt className="text-sm text-surface-500">Email address</dt>
                                <dd className="mt-1 text-sm text-surface-900">{payroll.email}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-surface-500">Mobile number</dt>
                                <dd className="mt-1 text-sm text-surface-900 tabular-nums">{payroll.mobile}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-surface-500">Joined on</dt>
                                <dd className="mt-1 text-sm text-surface-900 tabular-nums">{formatDate(payroll.joinDate)}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-surface-500">Status</dt>
                                <dd className="mt-1">
                                    <Status tone="positive">Active</Status>
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-surface-500">Payroll ID</dt>
                                <dd className="mt-1 font-mono text-sm text-surface-900 break-all">{payroll.id}</dd>
                            </div>
                        </dl>
                    </div>
                )}

                {activeTab === 'bank' && (
                    <form onSubmit={handleSaveBank} className="space-y-6 animate-fade-in">
                        <h3 className="text-base font-medium text-surface-900">Banking information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <FormField label="Account holder name" htmlFor="bank-holder" required>
                                <input
                                    id="bank-holder"
                                    type="text" required
                                    className={inputCls}
                                    value={bankForm.accountName}
                                    onChange={e => setBankForm({ ...bankForm, accountName: e.target.value })}
                                />
                            </FormField>
                            <FormField label="Bank name" htmlFor="bank-name" required>
                                <input
                                    id="bank-name"
                                    type="text" required
                                    className={inputCls}
                                    value={bankForm.bankName}
                                    onChange={e => setBankForm({ ...bankForm, bankName: e.target.value })}
                                />
                            </FormField>
                            <FormField label="Account number" htmlFor="bank-number" required>
                                <input
                                    id="bank-number"
                                    type="text" required
                                    className={`${inputCls} tabular-nums`}
                                    value={bankForm.accountNumber}
                                    onChange={e => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                                />
                            </FormField>
                            <FormField label="IFSC or SWIFT code" htmlFor="bank-ifsc" required>
                                <input
                                    id="bank-ifsc"
                                    type="text" required
                                    className={inputCls}
                                    value={bankForm.ifsc}
                                    onChange={e => setBankForm({ ...bankForm, ifsc: e.target.value })}
                                />
                            </FormField>
                        </div>
                        <SaveButton saving={saving}>Save bank details</SaveButton>
                    </form>
                )}

                {activeTab === 'tax' && (
                    <form onSubmit={handleSaveTax} className="space-y-6 animate-fade-in">
                        <h3 className="text-base font-medium text-surface-900">Tax and compliance</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <FormField label="PAN card number" htmlFor="tax-pan" required>
                                <input
                                    id="tax-pan"
                                    type="text" required
                                    className={inputCls}
                                    value={taxForm.pan}
                                    onChange={e => setTaxForm({ ...taxForm, pan: e.target.value })}
                                />
                            </FormField>
                            <FormField label="Aadhaar number" htmlFor="tax-aadhaar" required>
                                <input
                                    id="tax-aadhaar"
                                    type="text" required
                                    className={inputCls}
                                    value={taxForm.aadhaar}
                                    onChange={e => setTaxForm({ ...taxForm, aadhaar: e.target.value })}
                                />
                            </FormField>
                            <FormField label="UAN number" htmlFor="tax-uan" hint="Optional">
                                <input
                                    id="tax-uan"
                                    type="text"
                                    className={inputCls}
                                    value={taxForm.uan}
                                    onChange={e => setTaxForm({ ...taxForm, uan: e.target.value })}
                                />
                            </FormField>
                        </div>
                        <SaveButton saving={saving}>Save tax info</SaveButton>
                    </form>
                )}

                {activeTab === 'salary' && (
                    <form onSubmit={handleSaveSalary} className="space-y-6 animate-fade-in">
                        <h3 className="text-base font-medium text-surface-900">Salary structure</h3>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <fieldset className="space-y-4">
                                <legend className="mb-4 flex items-center gap-2 text-sm font-medium text-surface-900">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-emerald" aria-hidden="true" />
                                    Earnings
                                </legend>
                                <FormField label="Basic salary" htmlFor="salary-basic" required>
                                    <MoneyInput id="salary-basic" value={salaryForm.basicSalary} onChange={(v) => setSalaryForm({ ...salaryForm, basicSalary: v })} />
                                </FormField>
                                <FormField label="Allowance" htmlFor="salary-allowance" required>
                                    <MoneyInput id="salary-allowance" value={salaryForm.allowance} onChange={(v) => setSalaryForm({ ...salaryForm, allowance: v })} />
                                </FormField>
                            </fieldset>

                            <fieldset className="space-y-4">
                                <legend className="mb-4 flex items-center gap-2 text-sm font-medium text-surface-900">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-rose" aria-hidden="true" />
                                    Deductions
                                </legend>
                                <FormField label="Provident fund (PF)" htmlFor="salary-pf" required>
                                    <MoneyInput id="salary-pf" value={salaryForm.pf} onChange={(v) => setSalaryForm({ ...salaryForm, pf: v })} />
                                </FormField>
                                <FormField label="Tax" htmlFor="salary-tax" required>
                                    <MoneyInput id="salary-tax" value={salaryForm.tax} onChange={(v) => setSalaryForm({ ...salaryForm, tax: v })} />
                                </FormField>
                                <FormField label="Other deductions" htmlFor="salary-other" required>
                                    <MoneyInput id="salary-other" value={salaryForm.otherDeduction} onChange={(v) => setSalaryForm({ ...salaryForm, otherDeduction: v })} />
                                </FormField>
                            </fieldset>

                            <div className="lg:pl-8 lg:border-l lg:border-surface-200 flex flex-col justify-center">
                                <p className="text-sm text-surface-600">Estimated net pay</p>
                                <p className="mt-2 text-4xl font-medium leading-none text-surface-900 tabular-nums">{formatINR(estimatedNet)}</p>
                                <p className="mt-3 text-xs text-surface-500">Final amount may vary based on attendance</p>
                            </div>
                        </div>

                        <SaveButton saving={saving}>Save salary structure</SaveButton>
                    </form>
                )}

                {activeTab === 'attendance' && (
                    <form onSubmit={handleSaveAttendance} className="space-y-6 animate-fade-in">
                        <h3 className="text-base font-medium text-surface-900">Monthly attendance summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            <FormField label="Total working days" htmlFor="att-working" required>
                                <input
                                    id="att-working"
                                    type="number" required
                                    className={`${inputCls} tabular-nums`}
                                    value={attendanceForm.workingDays}
                                    onChange={e => setAttendanceForm({ ...attendanceForm, workingDays: Number(e.target.value) })}
                                />
                            </FormField>
                            <FormField label="Present days" htmlFor="att-present" required>
                                <input
                                    id="att-present"
                                    type="number" required
                                    className={`${inputCls} tabular-nums`}
                                    value={attendanceForm.presentDays}
                                    onChange={e => setAttendanceForm({ ...attendanceForm, presentDays: Number(e.target.value) })}
                                />
                            </FormField>
                            <FormField label="Leave days" htmlFor="att-leave" required>
                                <input
                                    id="att-leave"
                                    type="number" required
                                    className={`${inputCls} tabular-nums`}
                                    value={attendanceForm.leaveDays}
                                    onChange={e => setAttendanceForm({ ...attendanceForm, leaveDays: Number(e.target.value) })}
                                />
                            </FormField>
                            <FormField label="Overtime hours" htmlFor="att-overtime" required>
                                <input
                                    id="att-overtime"
                                    type="number" step="0.5" required
                                    className={`${inputCls} tabular-nums`}
                                    value={attendanceForm.overtimeHours}
                                    onChange={e => setAttendanceForm({ ...attendanceForm, overtimeHours: Number(e.target.value) })}
                                />
                            </FormField>
                        </div>
                        <SaveButton saving={saving}>Update attendance</SaveButton>
                    </form>
                )}
            </div>
        </div>
    );
};

export default PayrollDetailsPage;
