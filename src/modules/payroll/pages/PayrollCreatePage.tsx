import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPayroll } from '../services/payrollService';
import { getEmployees } from '../../../api/services';
import { User } from '../../../types';
import {
    ArrowLeft,
    Save,
    User as UserIcon,
    Mail,
    Phone,
    Building,
    UserCheck,
    Calendar,
    Briefcase
} from 'lucide-react';

const PayrollCreatePage: React.FC = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState<User[]>([]);
    const [formData, setFormData] = useState({
        employeeId: '',
        name: '',
        email: '',
        mobile: '',
        joinDate: '',
        department: '',
        designation: '',
        employmentType: 'FULL_TIME'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await getEmployees();
                setEmployees(res.data.data || []);
            } catch (err) {
                console.error('Failed to fetch employees', err);
            }
        };
        fetchEmployees();
    }, []);

    const handleEmployeeChange = (id: string) => {
        const emp = employees.find(e => e.id === id);
        if (emp) {
            setFormData({
                ...formData,
                employeeId: id,
                name: emp.fullName,
                email: emp.email
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createPayroll(formData);
            navigate('/admin/payroll');
        } catch (err) {
            console.error('Failed to create payroll', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <button
                onClick={() => navigate('/admin/payroll')}
                className="flex items-center gap-2 text-surface-500 hover:text-orbit-600 font-semibold transition-all group"
            >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Back to List
            </button>

            <div className="bg-white rounded-3xl shadow-card overflow-hidden border border-surface-100">
                <div className="px-8 py-6 bg-gradient-to-r from-orbit-600 to-orbit-800 text-white">
                    <h1 className="text-2xl font-bold">New Payroll Profile</h1>
                    <p className="text-white/80 mt-1">Initialize payroll for a new employee</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Basic Info */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-2 pb-2 border-b border-surface-100">
                            <UserIcon className="w-5 h-5 text-orbit-600" />
                            <h2 className="text-lg font-bold text-surface-900">Basic Information</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">Select Employee</label>
                                <div className="relative">
                                    <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                                    <select
                                        required
                                        value={formData.employeeId}
                                        onChange={(e) => handleEmployeeChange(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 focus:ring-2 focus:ring-orbit-500/20 focus:border-orbit-500 outline-none transition-all appearance-none bg-white"
                                    >
                                        <option value="">Select an employee...</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">Full Name</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                                    <input
                                        type="text"
                                        required
                                        readOnly
                                        value={formData.name}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 bg-surface-50 text-surface-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                                    <input
                                        type="email"
                                        required
                                        readOnly
                                        value={formData.email}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 bg-surface-50 text-surface-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">Mobile Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                                    <input
                                        type="text"
                                        required
                                        value={formData.mobile}
                                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 focus:ring-2 focus:ring-orbit-500/20 focus:border-orbit-500 outline-none transition-all"
                                        placeholder="+1 234 567 890"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Employment Info */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-2 pb-2 border-b border-surface-100">
                            <Briefcase className="w-5 h-5 text-accent-violet" />
                            <h2 className="text-lg font-bold text-surface-900">Employment Details</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">Department</label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                                    <input
                                        type="text"
                                        required
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 focus:ring-2 focus:ring-orbit-500/20 focus:border-orbit-500 outline-none transition-all"
                                        placeholder="Engineering, Sales, etc."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">Designation</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                                    <input
                                        type="text"
                                        required
                                        value={formData.designation}
                                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 focus:ring-2 focus:ring-orbit-500/20 focus:border-orbit-500 outline-none transition-all"
                                        placeholder="Software Engineer, Manager, etc."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">Join Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                                    <input
                                        type="date"
                                        required
                                        value={formData.joinDate}
                                        onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 focus:ring-2 focus:ring-orbit-500/20 focus:border-orbit-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">Employment Type</label>
                                <select
                                    required
                                    value={formData.employmentType}
                                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:ring-2 focus:ring-orbit-500/20 focus:border-orbit-500 outline-none transition-all appearance-none bg-white"
                                >
                                    <option value="FULL_TIME">Full Time</option>
                                    <option value="CONTRACT">Contract</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <div className="pt-6 border-t border-surface-100 flex items-center justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/payroll')}
                            className="px-6 py-3 rounded-xl border border-surface-200 text-surface-600 font-bold hover:bg-surface-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-10 py-3 bg-orbit-600 text-white rounded-2xl font-bold shadow-glow hover:bg-orbit-700 transition-all transform active:scale-95 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            Save & Continue
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PayrollCreatePage;
