export interface ApiResponse<T> {
    message?: string;
    data?: T;
    errorMessage?: string;
    errors?: Record<string, string>;
    timestamp?: string;
}

export interface AuthResponse {
    token: string;
    userId: string;
    email: string;
    fullName: string;
    role: string;
}

export * from './pagination.types';
export * from './project.types';
export * from './dashboard.types';

export interface User {
    id: string;
    email: string;
    fullName: string;
    role: string;
    status: string;
    phone?: string;
    lastLoginAt?: string;
    createdAt?: string;
    updatedAt?: string;
    // Employment Details
    department?: string;
    designation?: string;
    employmentType?: string;
    joinDate?: string;
    // Banking Details for Salary Crediting
    accountHolderName?: string;
    bankName?: string;
    accountNumber?: string;
    ifsc?: string;
    upiId?: string;
    // Tax & Compliance (KYC)
    pan?: string;
    aadhaar?: string;
    uan?: string;
    // Salary Structure
    basicSalary?: number;
    allowance?: number;
}


export interface Attendance {
    id: string;
    userId: string;
    employeeName: string;
    date: string;
    status: string;
    checkInTime?: string;
    checkOutTime?: string;
}

export interface AttendanceRequest {
    status: string;
    checkInTime?: string;
    checkOutTime?: string;
}

export interface LeaveRequest {
    id: string;
    userId: string;
    employeeName: string;
    startDate: string;
    endDate: string;
    reason?: string;
    status: string;
    createdAt?: string;
}

export interface Salary {
    id: string;
    userId: string;
    employeeName: string;
    amount: number;
    paymentDate: string;
}

export interface Notification {
    id: string;
    message: string;
    type: string;
    read: boolean;
    createdAt?: string;
}

export interface AiSummary {
    activeEmployees: number;
    totalProjects: number;
    delayedProjects: number;
    pendingLeaves: number;
    attendanceAnomalies: number;
    riskScore: number;
    riskLevel: string;
    completedProjects: number;
    inProgressProjects: number;
}

export interface Dashboard {
    totalEmployees: number;
    totalInstructors: number;
    totalProjects: number;
    activeProjects: number;
    delayedProjects: number;
    completedProjects: number;
    pendingLeaves: number;
    riskScore: number;
    riskLevel: string;
    presentToday: number;
    absentToday: number;
}
