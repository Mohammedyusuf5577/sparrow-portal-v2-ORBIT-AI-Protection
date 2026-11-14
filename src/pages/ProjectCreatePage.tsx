import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProject } from '../api/services';
import type { ProjectCreateRequest, ProjectStatusType } from '../types';
import { FormField } from '../components/FormField';
import { UserMultiSelect } from '../components/UserMultiSelect';
import { ArrowLeft, Save, FolderPlus, Users } from 'lucide-react';

export const ProjectCreatePage: React.FC = () => {
    const navigate = useNavigate();

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
        <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-fade-in">
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => navigate('/admin/projects')}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-surface-600 hover:text-surface-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Projects
                </button>
            </div>

            {/* Banner Header */}
            <div className="bg-gradient-orbit rounded-3xl p-8 text-white shadow-glow relative overflow-hidden">
                <div className="relative z-10 max-w-xl">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md mb-3">
                        <FolderPlus className="w-3.5 h-3.5" /> New Project
                    </span>
                    <h1 className="text-3xl font-extrabold tracking-tight">Create Enterprise Project</h1>
                    <p className="mt-2 text-orbit-100 text-sm leading-relaxed">
                        Define project milestones, assign members, and dispatch WhatsApp onboarding notifications.
                    </p>
                </div>
            </div>

            {/* Form Container */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {errors.form && (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700 font-medium">
                        {errors.form}
                    </div>
                )}

                {/* Section A: Project Core Details */}
                <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-card space-y-5">
                    <div className="flex items-center gap-2 pb-3 border-b border-surface-100">
                        <FolderPlus className="w-5 h-5 text-orbit-600" />
                        <h2 className="text-base font-bold text-surface-900">Project Information</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Project Name" required error={errors.name} htmlFor="project-name">
                            <input
                                id="project-name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Core AI Infrastructure"
                                className="w-full px-3.5 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orbit-500/20 focus:border-orbit-500 transition-all"
                            />
                        </FormField>

                        <FormField label="Client Name" required error={errors.clientName} htmlFor="client-name">
                            <input
                                id="client-name"
                                type="text"
                                value={formData.clientName}
                                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                placeholder="e.g. Acme Corporation or Internal"
                                className="w-full px-3.5 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orbit-500/20 focus:border-orbit-500 transition-all"
                            />
                        </FormField>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <FormField label="Status" required htmlFor="project-status">
                            <select
                                id="project-status"
                                value={formData.status}
                                onChange={(e) =>
                                    setFormData({ ...formData, status: e.target.value as ProjectStatusType })
                                }
                                className="w-full px-3.5 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm text-surface-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-orbit-500/20 focus:border-orbit-500 cursor-pointer"
                            >
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="DELAYED">Delayed</option>
                            </select>
                        </FormField>

                        <FormField label="Start Date" htmlFor="start-date">
                            <input
                                id="start-date"
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm text-surface-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orbit-500/20 focus:border-orbit-500"
                            />
                        </FormField>

                        <FormField label="End Date" error={errors.endDate} htmlFor="end-date">
                            <input
                                id="end-date"
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm text-surface-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orbit-500/20 focus:border-orbit-500"
                            />
                        </FormField>
                    </div>

                    <FormField label="Description" htmlFor="project-description">
                        <textarea
                            id="project-description"
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Detail project scope, deliverables, and architecture..."
                            className="w-full px-3.5 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orbit-500/20 focus:border-orbit-500 transition-all resize-none"
                        />
                    </FormField>
                </div>

                {/* Section B: Team Assignment */}
                <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-card space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-surface-100">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-orbit-600" />
                            <div>
                                <h2 className="text-base font-bold text-surface-900">Team Assignment</h2>
                                <p className="text-xs text-surface-500">
                                    Assigned members will receive automated WhatsApp notifications via outbox worker.
                                </p>
                            </div>
                        </div>
                        <span className="text-xs font-semibold text-orbit-700 bg-orbit-50 px-2.5 py-1 rounded-full">
                            {formData.assigneeIds?.length || 0} selected
                        </span>
                    </div>

                    <UserMultiSelect
                        selectedUserIds={formData.assigneeIds || []}
                        onChange={(ids) => setFormData({ ...formData, assigneeIds: ids })}
                    />
                </div>

                {/* Action Bar */}
                <div className="flex items-center justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/projects')}
                        disabled={isSubmitting}
                        className="px-5 py-2.5 rounded-xl border border-surface-200 text-sm font-semibold text-surface-700 hover:bg-surface-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-orbit text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow-glow hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {isSubmitting ? 'Creating Project...' : 'Save & Dispatch Notifications'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProjectCreatePage;
