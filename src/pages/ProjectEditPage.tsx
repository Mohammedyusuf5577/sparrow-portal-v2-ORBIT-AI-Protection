import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProjectById, updateProject } from '../api/services';
import type { ProjectUpdateRequest } from '../types';
import { PageHeader } from '../components/PageHeader';
import { ProjectFormFields } from '../components/ProjectFormFields';
import { btn } from '../components/ui';
import { ArrowLeft } from 'lucide-react';

export const ProjectEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<ProjectUpdateRequest>({
        name: '',
        clientName: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'IN_PROGRESS',
        assigneeIds: [],
    });

    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!id) return;
        const controller = new AbortController();

        getProjectById(id, controller.signal)
            .then((res) => {
                if (res.data?.data) {
                    const p = res.data.data;
                    setFormData({
                        name: p.name,
                        clientName: p.clientName || '',
                        description: p.description || '',
                        startDate: p.startDate ? p.startDate.split('T')[0] : '',
                        endDate: p.endDate ? p.endDate.split('T')[0] : '',
                        status: p.status,
                        assigneeIds: p.assignees ? p.assignees.map((a) => a.id) : [],
                    });
                }
            })
            .catch((err) => {
                if (err.name !== 'CanceledError') {
                    console.error('Failed to load project details', err);
                    setErrors({ form: 'Project not found or failed to load.' });
                }
            })
            .finally(() => {
                setLoading(false);
            });

        return () => controller.abort();
    }, [id]);

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
        if (!id || !validate()) return;

        setIsSubmitting(true);
        try {
            const payload: ProjectUpdateRequest = {
                name: formData.name.trim(),
                clientName: formData.clientName.trim(),
                description: formData.description?.trim() || undefined,
                startDate: formData.startDate ? `${formData.startDate}T00:00:00` : undefined,
                endDate: formData.endDate ? `${formData.endDate}T23:59:59` : undefined,
                status: formData.status,
                assigneeIds: formData.assigneeIds || [],
            };

            await updateProject(id, payload);
            navigate('/admin/projects');
        } catch (err: any) {
            console.error('Failed to update project', err);
            const serverMsg = err.response?.data?.errorMessage || 'Failed to update project. Please check input.';
            setErrors((prev) => ({ ...prev, form: serverMsg }));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-3xl py-24 flex flex-col items-center justify-center gap-3">
                <div role="status" aria-label="Loading" className="w-6 h-6 border-2 border-surface-200 border-t-orbit-600 rounded-full animate-spin" />
                <p className="text-sm text-surface-500">Loading project</p>
            </div>
        );
    }

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
                title="Edit project"
                description="Update the project and reassign members. Newly added members receive a WhatsApp notification"
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
                    teamHint="Newly added members automatically receive a WhatsApp assignment message"
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
                        {isSubmitting ? 'Saving' : 'Save changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProjectEditPage;
