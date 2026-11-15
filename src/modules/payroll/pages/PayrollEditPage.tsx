import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPayrollById, updatePayroll } from '../services/payrollService';
import { PageHeader } from '../../../components/PageHeader';
import { FormField } from '../../../components/FormField';
import { btn, inputCls } from '../../../components/ui';
import { useToast } from '../../../components/Feedback';
import { ArrowLeft } from 'lucide-react';

const PayrollEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useToast();
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
            toast.success('Payroll profile updated');
            navigate(`/admin/payroll/details/${id}`);
        } catch (err) {
            console.error('Failed to update payroll', err);
            toast.error('Could not update the payroll profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div role="status" aria-label="Loading" className="w-6 h-6 border-2 border-surface-200 border-t-orbit-600 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-3xl space-y-6 pb-16">
            <button
                onClick={() => navigate(`/admin/payroll/details/${id}`)}
                className="inline-flex items-center gap-2 text-sm text-surface-600 hover:text-surface-900 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                Back to details
            </button>

            <PageHeader title="Edit payroll profile" description={`Update the basic employment profile for ${formData.name}`} />

            <form onSubmit={handleSubmit} className="panel p-6 space-y-8">
                <section className="space-y-5">
                    <h2 className="text-base font-medium text-surface-900">Basic information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormField label="Full name" htmlFor="edit-name" required>
                            <input
                                id="edit-name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={inputCls}
                            />
                        </FormField>

                        <FormField label="Email address" htmlFor="edit-email" required>
                            <input
                                id="edit-email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className={inputCls}
                            />
                        </FormField>

                        <FormField label="Mobile number" htmlFor="edit-mobile" required>
                            <input
                                id="edit-mobile"
                                type="text"
                                required
                                value={formData.mobile}
                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                className={inputCls}
                            />
                        </FormField>

                        <FormField label="Department" htmlFor="edit-department" required>
                            <input
                                id="edit-department"
                                type="text"
                                required
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                className={inputCls}
                            />
                        </FormField>

                        <FormField label="Designation" htmlFor="edit-designation" required>
                            <input
                                id="edit-designation"
                                type="text"
                                required
                                value={formData.designation}
                                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                className={inputCls}
                            />
                        </FormField>

                        <FormField label="Join date" htmlFor="edit-join" required>
                            <input
                                id="edit-join"
                                type="date"
                                required
                                value={formData.joinDate}
                                onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                                className={inputCls}
                            />
                        </FormField>

                        <FormField label="Employment type" htmlFor="edit-type" required>
                            <select
                                id="edit-type"
                                required
                                value={formData.employmentType}
                                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                                className={`${inputCls} cursor-pointer`}
                            >
                                <option value="FULL_TIME">Full time</option>
                                <option value="CONTRACT">Contract</option>
                            </select>
                        </FormField>
                    </div>
                </section>

                <div className="pt-5 border-t border-surface-200 flex items-center justify-end gap-2">
                    <button type="button" onClick={() => navigate(`/admin/payroll/details/${id}`)} className={btn.secondary}>
                        Cancel
                    </button>
                    <button type="submit" disabled={saving} className={btn.primary}>
                        {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        Update profile
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PayrollEditPage;
