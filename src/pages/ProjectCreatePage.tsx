import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProject } from '../api/services';
import type { ProjectCreateRequest } from '../types';
import { PageHeader } from '../components/PageHeader';
import { ProjectFormFields } from '../components/ProjectFormFields';
import { btn } from '../components/ui';
import { useToast } from '../components/Feedback';
import { ArrowLeft } from 'lucide-react';

export const ProjectCreatePage: React.FC = () => {
    const navigate = useNavigate();
    const toast = useToast();

    const [formData, setFormData] = useState<ProjectCreateRequest>({
        name: '',
        clientName: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'IN_PROGRESS',
        assigneeIds: [],
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Project name is required';
        }
        if (!formData.clientName.trim()) {
            newErrors.clientName = 'Client name is required';
        }
        if (formData.startDate && formData.endDate) {
            if (new Date(formData.startDate) > new Date(formData.endDate)) {
                newErrors.endDate = 'End date cannot be earlier than start date';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const payload: ProjectCreateRequest = {
                name: formData.name.trim(),
                clientName: formData.clientName.trim(),
                description: formData.description?.trim() || undefined,
                startDate: formData.startDate ? `${formData.startDate}T00:00:00` : undefined,
                endDate: formData.endDate ? `${formData.endDate}T23:59:59` : undefined,
                status: formData.status,
                assigneeIds: formData.assigneeIds && formData.assigneeIds.length > 0 ? formData.assigneeIds : undefined,
            };

            await createProject(payload);
            toast.success('Project created');
            navigate('/admin/projects');
        } catch (err: any) {
            console.error('Failed to create project', err);
            const serverMsg = err.response?.data?.errorMessage || 'Failed to create project. Please check input.';
            setErrors((prev) => ({ ...prev, form: serverMsg }));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl space-y-6 pb-16">
            <button
                type="button"
                onClick={() => navigate('/admin/projects')}
                className="inline-flex items-center gap-2 text-sm text-surface-600 hover:text-surface-900 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                Back to projects
            </button>

            <PageHeader
                title="New project"
                description="Define the project, assign members and send them a WhatsApp onboarding notification"
            />

            <form onSubmit={handleSubmit} className="space-y-4">
                {errors.form && (
                    <div role="alert" className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                        {errors.form}
                    </div>
                )}

                <ProjectFormFields
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    teamHint="Assigned members receive an automated WhatsApp notification"
                />

                <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/projects')}
                        disabled={isSubmitting}
                        className={btn.secondary}
                    >
                        Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting} className={btn.primary}>
                        {isSubmitting ? 'Creating' : 'Create project'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProjectCreatePage;
