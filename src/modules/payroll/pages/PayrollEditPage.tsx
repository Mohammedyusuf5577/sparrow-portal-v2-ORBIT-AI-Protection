import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPayrollById, updatePayroll } from '../services/payrollService';
import {
    ArrowLeft,
    Save,
    User as UserIcon,
    Mail,
    Phone,
    Building,
    Calendar,
    Briefcase
} from 'lucide-react';

const PayrollEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        joinDate: '',
        department: '',
        designation: '',
        employmentType: 'FULL_TIME'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (id) fetchData(id);
    }, [id]);

    const fetchData = async (payrollId: string) => {
        try {
            const res = await getPayrollById(payrollId);
            const data = res.data.data;
            if (data) {
                setFormData({
                    name: data.name,
                    email: data.email,
                    mobile: data.mobile,
                    joinDate: data.joinDate,
                    department: data.department,
                    designation: data.designation,
                    employmentType: data.employmentType
                });
            }
        } catch (err) {
            console.error('Failed to fetch payroll details', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        setSaving(true);
        try {
            await updatePayroll(id, formData);
            navigate(`/admin/payroll/details/${id}`);
        } catch (err) {
            console.error('Failed to update payroll', err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <div className="w-12 h-12 border-4 border-orbit-200 border-t-orbit-600 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <button
                onClick={() => navigate(`/admin/payroll/details/${id}`)}
                className="flex items-center gap-2 text-surface-500 hover:text-orbit-600 font-semibold transition-all group"
            >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Back to Details
            </button>

            <div className="bg-white rounded-3xl shadow-card overflow-hidden border border-surface-100">
                <div className="px-8 py-6 bg-gradient-to-r from-accent-violet to-purple-800 text-white">
                    <h1 className="text-2xl font-bold">Edit Payroll Profile</h1>
                    <p className="text-white/80 mt-1">Update basic employment profile for {formData.name}</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    <section className="space-y-6">
                        <div className="flex items-center gap-2 pb-2 border-b border-surface-100">
                            <UserIcon className="w-5 h-5 text-accent-violet" />
                            <h2 className="text-lg font-bold text-surface-900">Basic Information</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">Full Name</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 focus:ring-2 focus:ring-accent-violet/20 focus:border-accent-violet outline-none transition-all"
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
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 focus:ring-2 focus:ring-accent-violet/20 focus:border-accent-violet outline-none transition-all"
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
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 focus:ring-2 focus:ring-accent-violet/20 focus:border-accent-violet outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">Department</label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                                    <input
                                        type="text"
                                        required
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 focus:ring-2 focus:ring-accent-violet/20 focus:border-accent-violet outline-none transition-all"
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
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 focus:ring-2 focus:ring-accent-violet/20 focus:border-accent-violet outline-none transition-all"
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
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 focus:ring-2 focus:ring-accent-violet/20 focus:border-accent-violet outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">Employment Type</label>
                                <select
                                    required
                                    value={formData.employmentType}
                                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:ring-2 focus:ring-accent-violet/20 focus:border-accent-violet outline-none transition-all appearance-none bg-white"
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
                            onClick={() => navigate(`/admin/payroll/details/${id}`)}
                            className="px-6 py-3 rounded-xl border border-surface-200 text-surface-600 font-bold hover:bg-surface-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-10 py-3 bg-accent-violet text-white rounded-2xl font-bold shadow-lg hover:bg-purple-700 transition-all transform active:scale-95 disabled:opacity-50"
                        >
                            {saving ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            Update Profile
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PayrollEditPage;
