import React from 'react';
import type { ProjectCreateRequest, ProjectStatusType } from '../types';
import { FormField } from './FormField';
import { UserMultiSelect } from './UserMultiSelect';
import { inputCls, textareaCls } from './ui';

interface ProjectFormFieldsProps {
    formData: ProjectCreateRequest;
    setFormData: (data: ProjectCreateRequest) => void;
    errors: Record<string, string>;
    /** One line under "Team", explaining who gets notified. */
    teamHint: string;
}

/** The two panels shared by the create and edit project screens. */
export const ProjectFormFields: React.FC<ProjectFormFieldsProps> = ({ formData, setFormData, errors, teamHint }) => (
    <>
        <section className="panel p-6 space-y-5">
            <h2 className="text-base font-medium text-surface-900">Project information</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField label="Project name" required error={errors.name} htmlFor="project-name">
                    <input
                        id="project-name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Vendor Portal v2"
                        className={inputCls}
                    />
                </FormField>

                <FormField label="Client name" required error={errors.clientName} htmlFor="client-name">
                    <input
                        id="client-name"
                        type="text"
                        value={formData.clientName}
                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                        placeholder="e.g. Acme Corporation or Internal"
                        className={inputCls}
                    />
                </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <FormField label="Status" required htmlFor="project-status">
                    <select
                        id="project-status"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatusType })}
                        className={`${inputCls} cursor-pointer`}
                    >
                        <option value="IN_PROGRESS">In progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="DELAYED">Delayed</option>
                    </select>
                </FormField>

                <FormField label="Start date" htmlFor="start-date">
                    <input
                        id="start-date"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className={inputCls}
                    />
                </FormField>

                <FormField label="End date" error={errors.endDate} htmlFor="end-date">
                    <input
                        id="end-date"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className={inputCls}
                    />
                </FormField>
            </div>

            <FormField label="Description" htmlFor="project-description">
                <textarea
                    id="project-description"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Scope, deliverables and milestones"
                    className={`${textareaCls} resize-none`}
                />
            </FormField>
        </section>

        <section className="panel p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-base font-medium text-surface-900">Team</h2>
                    <p className="mt-0.5 text-sm text-surface-500">{teamHint}</p>
                </div>
                <span className="text-sm text-surface-600 tabular-nums whitespace-nowrap">
                    {formData.assigneeIds?.length || 0} selected
                </span>
            </div>

            <UserMultiSelect
                selectedUserIds={formData.assigneeIds || []}
                onChange={(ids) => setFormData({ ...formData, assigneeIds: ids })}
            />
        </section>
    </>
);
