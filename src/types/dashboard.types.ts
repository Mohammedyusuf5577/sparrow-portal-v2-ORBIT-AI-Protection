export interface DashboardSummary {
    totalProjects: number;
    inProgressProjects: number;
    delayedProjects: number;
    completedProjects: number;

    totalEmployees: number;
    activeEmployees: number;
    totalInstructors: number;
    activeInstructors: number;

    presentToday: number;
    absentToday: number;
    lateToday: number;

    pendingLeaves: number;

    riskScore: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    riskAssessment: string;
}
