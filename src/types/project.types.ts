export type ProjectStatusType = 'COMPLETED' | 'IN_PROGRESS' | 'DELAYED';

export interface AssignedUserSummary {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    role?: string;
}

export interface Project {
    id: string;
    name: string;
    clientName: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    status: ProjectStatusType;
    assignedUserCount: number;
    assignees?: AssignedUserSummary[];
    deletedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ProjectCreateRequest {
    name: string;
    clientName: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    status: ProjectStatusType;
    assigneeIds?: string[];
}

export interface ProjectUpdateRequest {
    name: string;
    clientName: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    status: ProjectStatusType;
    assigneeIds?: string[];
}

export interface ProjectMonthStats {
    month: number;
    monthName: string;
    total: number;
    completed: number;
    inProgress: number;
    delayed: number;
}

export interface ProjectStats {
    year: number;
    totalProjects: number;
    totalCompleted: number;
    totalInProgress: number;
    totalDelayed: number;
    monthlyBreakdown: ProjectMonthStats[];
}

export interface ProjectFilterParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: ProjectStatusType | '';
    month?: number | '';
    year?: number | '';
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
