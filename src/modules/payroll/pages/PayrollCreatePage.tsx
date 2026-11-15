import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPayroll } from '../services/payrollService';
import { getEmployees } from '../../../api/services';
import { User } from '../../../types';
import { PageHeader } from '../../../components/PageHeader';
import { FormField } from '../../../components/FormField';
import { btn, inputCls } from '../../../components/ui';
import { ArrowLeft } from 'lucide-react';

const READ_ONLY = `${inputCls} bg-surface-50 text-surface-600`;

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
        <div className="max-w-3xl space-y-6 pb-16">
            <button
                onClick={() => navigate('/admin/payroll')}
                className="inline-flex items-center gap-2 text-sm text-surface-600 hover:text-surface-900 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                Back to payroll
            </button>

            <PageHeader title="New payroll profile" description="Initialize payroll for a new employee" />

            <form onSubmit={handleSubmit} className="panel p-6 space-y-8">
                {/* Basic info */}
                <section className="space-y-5">
                    <h2 className="text-base font-medium text-surface-900">Basic information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormField label="Employee" htmlFor="payroll-employee" required>
                            <select
                                id="payroll-employee"
                                required
                                value={formData.employeeId}
                                onChange={(e) => handleEmployeeChange(e.target.value)}
                                className={`${inputCls} cursor-pointer`}
                            >
                                <option value="">Select an employee</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                                ))}
                            </select>
                        </FormField>

                        <FormField label="Full name" htmlFor="payroll-name">
                            <input id="payroll-name" type="text" required readOnly value={formData.name} className={READ_ONLY} />
                        </FormField>

                        <FormField label="Email address" htmlFor="payroll-email">
                            <input id="payroll-email" type="email" required readOnly value={formData.email} className={READ_ONLY} />
                        </FormField>

                        <FormField label="Mobile number" htmlFor="payroll-mobile" required>
                            <input
                                id="payroll-mobile"
                                type="text"
                                required
                                value={formData.mobile}
                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                className={inputCls}
                                placeholder="+91 98400 10000"
                            />
                        </FormField>
                    </div>
                </section>

                {/* Employment info */}
                <section className="space-y-5">
                    <h2 className="text-base font-medium text-surface-900">Employment details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormField label="Department" htmlFor="payroll-department" required>
                            <input
                                id="payroll-department"
                                type="text"
                                required
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                className={inputCls}
                                placeholder="Engineering, Sales, etc."
                            />
                        </FormField>

                        <FormField label="Designation" htmlFor="payroll-designation" required>
                            <input
                                id="payroll-designation"
                                type="text"
                                required
                                value={formData.designation}
                                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                className={inputCls}
                                placeholder="Software Engineer, Manager, etc."
                            />
                        </FormField>

                        <FormField label="Join date" htmlFor="payroll-join" required>
                            <input
                                id="payroll-join"
                                type="date"
                                required
                                value={formData.joinDate}
                                onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                                className={inputCls}
                            />
                        </FormField>

                        <FormField label="Employment type" htmlFor="payroll-type" required>
                            <select
                                id="payroll-type"
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
                    <button type="button" onClick={() => navigate('/admin/payroll')} className={btn.secondary}>
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className={btn.primary}>
                        {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        Save and continue
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PayrollCreatePage;
