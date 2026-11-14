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
import {
    ArrowLeft,
    User,
    CreditCard,
    FileText,
    DollarSign,
    CalendarCheck,
    Save,
    CheckCircle2,
    Briefcase,
    Building2,
    Calendar,
    Phone,
    Mail
} from 'lucide-react';

const PayrollDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [payroll, setPayroll] = useState<EmployeePayroll | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'info' | 'bank' | 'tax' | 'salary' | 'attendance'>('info');
    const [saving, setSaving] = useState(false);

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
            alert('Bank details updated successfully');
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    const handleSaveTax = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        setSaving(true);
        try {
            const res = await saveTaxDetails(id, taxForm);
            setPayroll(res.data.data || null);
            alert('Tax details updated successfully');
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    const handleSaveSalary = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        setSaving(true);
        try {
            const res = await saveSalary(id, salaryForm);
            setPayroll(res.data.data || null);
            alert('Salary structure updated successfully');
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    const handleSaveAttendance = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        setSaving(true);
        try {
            const res = await saveAttendance(id, attendanceForm);
            setPayroll(res.data.data || null);
            alert('Attendance data updated successfully');
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <div className="w-12 h-12 border-4 border-orbit-200 border-t-orbit-600 rounded-full animate-spin" />
        </div>
    );

    if (!payroll) return <div>Record not found</div>;

    const tabs = [
        { id: 'info', name: 'Basic Info', icon: User },
        { id: 'bank', name: 'Bank Details', icon: CreditCard },
        { id: 'tax', name: 'Tax / Compliance', icon: FileText },
        { id: 'salary', name: 'Salary Structure', icon: DollarSign },
        { id: 'attendance', name: 'Attendance', icon: CalendarCheck },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/admin/payroll')}
                    className="flex items-center gap-2 text-surface-500 hover:text-orbit-600 font-semibold transition-all group"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Back to Payroll List
                </button>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-surface-400">ID: {payroll.id.slice(0, 8)}...</span>
                </div>
            </div>

            {/* Profile Header */}
            <div className="bg-white rounded-3xl p-8 shadow-card border border-surface-100 flex flex-col md:flex-row gap-8 items-center">
                <div className="w-24 h-24 bg-gradient-to-br from-orbit-500 to-orbit-700 rounded-3xl flex items-center justify-center text-white text-4xl font-bold shadow-glow">
                    {payroll.name.charAt(0)}
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-3xl font-bold text-surface-900">{payroll.name}</h1>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 text-surface-500">
                        <span className="flex items-center gap-1.5 text-sm">
                            <Building2 className="w-4 h-4" /> {payroll.department}
                        </span>
                        <span className="flex items-center gap-1.5 text-sm">
                            <Briefcase className="w-4 h-4" /> {payroll.designation}
                        </span>
                        <span className="flex items-center gap-1.5 text-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" /> {payroll.employmentType}
                        </span>
                    </div>
                </div>
                <div className="bg-orbit-50 p-4 rounded-2xl border border-orbit-100 text-center px-8">
                    <p className="text-xs font-bold text-orbit-600 uppercase tracking-wider">Calculated Net Salary</p>
                    <p className="text-3xl font-black text-orbit-700 mt-1">${payroll.netSalary?.toLocaleString()}</p>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${activeTab === tab.id
                                ? 'bg-orbit-600 text-white shadow-glow'
                                : 'bg-white text-surface-600 border border-surface-200 hover:border-orbit-300'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.name}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-3xl p-8 shadow-card border border-surface-100 min-h-[400px]">
                {activeTab === 'info' && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-surface-900">Employment Summary</h3>
                            <button
                                onClick={() => navigate(`/admin/payroll/edit/${payroll.id}`)}
                                className="px-4 py-2 border border-orbit-200 text-orbit-600 rounded-xl text-sm font-bold hover:bg-orbit-50 transition-all"
                            >
                                Edit Profile
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-surface-400 uppercase">Email Address</p>
                                <div className="flex items-center gap-2 text-surface-900 font-semibold">
                                    <Mail className="w-4 h-4 text-orbit-500" /> {payroll.email}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-surface-400 uppercase">Mobile Number</p>
                                <div className="flex items-center gap-2 text-surface-900 font-semibold">
                                    <Phone className="w-4 h-4 text-orbit-500" /> {payroll.mobile}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-surface-400 uppercase">Joined On</p>
                                <div className="flex items-center gap-2 text-surface-900 font-semibold">
                                    <Calendar className="w-4 h-4 text-orbit-500" /> {new Date(payroll.joinDate).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-surface-400 uppercase">Status</p>
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold uppercase">Active</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-surface-400 uppercase">Payroll ID</p>
                                <p className="text-surface-900 font-mono text-sm">{payroll.id}</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'bank' && (
                    <form onSubmit={handleSaveBank} className="space-y-6 animate-fade-in">
                        <h3 className="text-xl font-bold text-surface-900">Banking Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-surface-500 uppercase mb-2">Account Holder Name</label>
                                <input
                                    type="text" required
                                    className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-orbit-500/20 outline-none"
                                    value={bankForm.accountName}
                                    onChange={e => setBankForm({ ...bankForm, accountName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-surface-500 uppercase mb-2">Bank Name</label>
                                <input
                                    type="text" required
                                    className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-orbit-500/20 outline-none"
                                    value={bankForm.bankName}
                                    onChange={e => setBankForm({ ...bankForm, bankName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-surface-500 uppercase mb-2">Account Number</label>
                                <input
                                    type="text" required
                                    className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-orbit-500/20 outline-none"
                                    value={bankForm.accountNumber}
                                    onChange={e => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-surface-500 uppercase mb-2">IFSC / Swift Code</label>
                                <input
                                    type="text" required
                                    className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-orbit-500/20 outline-none"
                                    value={bankForm.ifsc}
                                    onChange={e => setBankForm({ ...bankForm, ifsc: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="pt-4 flex justify-end">
                            <button type="submit" disabled={saving} className="flex items-center gap-2 px-8 py-3 bg-orbit-600 text-white rounded-2xl font-bold hover:bg-orbit-700 transition-all shadow-glow disabled:opacity-50">
                                {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                                Save Bank Details
                            </button>
                        </div>
                    </form>
                )}

                {activeTab === 'tax' && (
                    <form onSubmit={handleSaveTax} className="space-y-6 animate-fade-in">
                        <h3 className="text-xl font-bold text-surface-900">Tax & Compliance</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-surface-500 uppercase mb-2">PAN Card Number</label>
                                <input
                                    type="text" required
                                    className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-orbit-500/20 outline-none"
                                    value={taxForm.pan}
                                    onChange={e => setTaxForm({ ...taxForm, pan: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-surface-500 uppercase mb-2">Aadhaar Number</label>
                                <input
                                    type="text" required
                                    className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-orbit-500/20 outline-none"
                                    value={taxForm.aadhaar}
                                    onChange={e => setTaxForm({ ...taxForm, aadhaar: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-surface-500 uppercase mb-2">UAN Number (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-orbit-500/20 outline-none"
                                    value={taxForm.uan}
                                    onChange={e => setTaxForm({ ...taxForm, uan: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="pt-4 flex justify-end">
                            <button type="submit" disabled={saving} className="flex items-center gap-2 px-8 py-3 bg-orbit-600 text-white rounded-2xl font-bold hover:bg-orbit-700 transition-all shadow-glow disabled:opacity-50">
                                {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                                Save Tax Info
                            </button>
                        </div>
                    </form>
                )}

                {activeTab === 'salary' && (
                    <form onSubmit={handleSaveSalary} className="space-y-6 animate-fade-in">
                        <h3 className="text-xl font-bold text-surface-900">Salary Structure</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-4">
                                <h4 className="text-xs font-bold text-emerald-700 uppercase">Earnings</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-emerald-600 uppercase mb-1">Basic Salary</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 font-bold">$</span>
                                            <input
                                                type="number" required
                                                className="w-full pl-8 pr-4 py-2 border border-emerald-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20"
                                                value={salaryForm.basicSalary}
                                                onChange={e => setSalaryForm({ ...salaryForm, basicSalary: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-emerald-600 uppercase mb-1">Allowance</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 font-bold">$</span>
                                            <input
                                                type="number" required
                                                className="w-full pl-8 pr-4 py-2 border border-emerald-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20"
                                                value={salaryForm.allowance}
                                                onChange={e => setSalaryForm({ ...salaryForm, allowance: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-red-50 rounded-2xl border border-red-100 space-y-4">
                                <h4 className="text-xs font-bold text-red-700 uppercase">Deductions</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-red-600 uppercase mb-1">Provident Fund (PF)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-red-600 font-bold">$</span>
                                            <input
                                                type="number" required
                                                className="w-full pl-8 pr-4 py-2 border border-red-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500/20"
                                                value={salaryForm.pf}
                                                onChange={e => setSalaryForm({ ...salaryForm, pf: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-red-600 uppercase mb-1">Tax</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-red-600 font-bold">$</span>
                                            <input
                                                type="number" required
                                                className="w-full pl-8 pr-4 py-2 border border-red-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500/20"
                                                value={salaryForm.tax}
                                                onChange={e => setSalaryForm({ ...salaryForm, tax: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-red-600 uppercase mb-1">Other Deductions</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-red-600 font-bold">$</span>
                                            <input
                                                type="number" required
                                                className="w-full pl-8 pr-4 py-2 border border-red-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500/20"
                                                value={salaryForm.otherDeduction}
                                                onChange={e => setSalaryForm({ ...salaryForm, otherDeduction: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-orbit-50 rounded-2xl border border-orbit-100 flex flex-col justify-center text-center">
                                <p className="text-xs font-bold text-orbit-600 uppercase">Estimated Net Pay</p>
                                <p className="text-4xl font-black text-orbit-700 mt-2">
                                    ${(salaryForm.basicSalary + salaryForm.allowance - salaryForm.pf - salaryForm.tax - salaryForm.otherDeduction).toLocaleString()}
                                </p>
                                <p className="text-[10px] text-orbit-400 mt-2 font-bold uppercase">Final amount may vary based on attendance</p>
                            </div>
                        </div>
                        <div className="pt-4 flex justify-end">
                            <button type="submit" disabled={saving} className="flex items-center gap-2 px-8 py-3 bg-orbit-600 text-white rounded-2xl font-bold hover:bg-orbit-700 transition-all shadow-glow disabled:opacity-50">
                                {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                                Save Salary Structure
                            </button>
                        </div>
                    </form>
                )}

                {activeTab === 'attendance' && (
                    <form onSubmit={handleSaveAttendance} className="space-y-6 animate-fade-in">
                        <h3 className="text-xl font-bold text-surface-900">Monthly Attendance Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-surface-500 uppercase mb-2">Total Working Days</label>
                                <input
                                    type="number" required
                                    className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-orbit-500/20 outline-none"
                                    value={attendanceForm.workingDays}
                                    onChange={e => setAttendanceForm({ ...attendanceForm, workingDays: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-surface-500 uppercase mb-2">Present Days</label>
                                <input
                                    type="number" required
                                    className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-orbit-500/20 outline-none"
                                    value={attendanceForm.presentDays}
                                    onChange={e => setAttendanceForm({ ...attendanceForm, presentDays: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-surface-500 uppercase mb-2">Leave Days</label>
                                <input
                                    type="number" required
                                    className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-orbit-500/20 outline-none"
                                    value={attendanceForm.leaveDays}
                                    onChange={e => setAttendanceForm({ ...attendanceForm, leaveDays: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-surface-500 uppercase mb-2">Overtime Hours</label>
                                <input
                                    type="number" step="0.5" required
                                    className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-orbit-500/20 outline-none"
                                    value={attendanceForm.overtimeHours}
                                    onChange={e => setAttendanceForm({ ...attendanceForm, overtimeHours: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="pt-4 flex justify-end">
                            <button type="submit" disabled={saving} className="flex items-center gap-2 px-8 py-3 bg-orbit-600 text-white rounded-2xl font-bold hover:bg-orbit-700 transition-all shadow-glow disabled:opacity-50">
                                {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                                Update Attendance
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default PayrollDetailsPage;
