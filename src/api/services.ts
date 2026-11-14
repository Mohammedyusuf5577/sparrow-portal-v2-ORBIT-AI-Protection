import api from './axios';
import type {
    ApiResponse,
    AuthResponse,
    User,
    Project,
    Attendance,
    LeaveRequest,
    Salary,
    Notification,
    AiSummary,
    Dashboard,
} from '../types';

// Auth
export const login = (email: string) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', { email });

// Employees
export const getEmployees = () =>
    api.get<ApiResponse<User[]>>('/admin/employees');

export const getEmployeesPaginated = (params?: { page?: number; limit?: number; search?: string }, signal?: AbortSignal) =>
    api.get<ApiResponse<import('../types').PageResponse<User>>>('/admin/employees', { params, signal });

export const getInstructors = () =>
    api.get<ApiResponse<User[]>>('/admin/instructors');

export const getEmployeeById = (id: string) =>
    api.get<ApiResponse<User>>(`/admin/employees/${id}`);

export const createEmployee = (data: Partial<User>) =>
    api.post<ApiResponse<User>>('/admin/employees', data);

export const updateEmployee = (id: string, data: Partial<User>) =>
    api.put<ApiResponse<User>>(`/admin/employees/${id}`, data);

export const deleteEmployee = (id: string) =>
    api.delete<ApiResponse<void>>(`/admin/employees/${id}`);

export const getSalaries = () =>
    api.get<ApiResponse<Salary[]>>('/admin/salaries');

// Projects
export const getProjects = (params?: import('../types').ProjectFilterParams, signal?: AbortSignal) =>
    api.get<ApiResponse<import('../types').PageResponse<Project>>>('/admin/projects', { params, signal });

export const getProjectById = (id: string, signal?: AbortSignal) =>
    api.get<ApiResponse<Project>>(`/admin/projects/${id}`, { signal });

export const createProject = (data: import('../types').ProjectCreateRequest) =>
    api.post<ApiResponse<Project>>('/admin/projects', data);

export const updateProject = (id: string, data: import('../types').ProjectUpdateRequest) =>
    api.put<ApiResponse<Project>>(`/admin/projects/${id}`, data);

export const softDeleteProject = (id: string) =>
    api.patch<ApiResponse<void>>(`/admin/projects/${id}/soft-delete`);

export const deleteProject = (id: string) =>
    api.patch<ApiResponse<void>>(`/admin/projects/${id}/soft-delete`);

export const getProjectStats = (year?: number, signal?: AbortSignal) =>
    api.get<ApiResponse<import('../types').ProjectStats>>('/admin/projects/stats', { params: { year }, signal });

// Attendance & Leave
export const getAttendance = () =>
    api.get<ApiResponse<Attendance[]>>('/admin/attendance');

export const updateAttendance = (id: string, data: Partial<Attendance>) =>
    api.put<ApiResponse<Attendance>>(`/admin/attendance/${id}`, data);

export const deleteAttendance = (id: string) =>
    api.delete<ApiResponse<void>>(`/admin/attendance/${id}`);

export const getLeaves = (status?: string) =>
    api.get<ApiResponse<LeaveRequest[]>>('/admin/leaves', { params: { status } });

export const approveLeave = (id: string) =>
    api.put<ApiResponse<LeaveRequest>>(`/admin/leaves/${id}/approve`);

export const rejectLeave = (id: string) =>
    api.put<ApiResponse<LeaveRequest>>(`/admin/leaves/${id}/reject`);

// AI
export const getAiSummary = () =>
    api.get<ApiResponse<AiSummary>>('/admin/ai-summary');

// Dashboard
export const getDashboard = () =>
    api.get<ApiResponse<Dashboard>>('/admin/dashboard');

export const getDashboardSummary = (signal?: AbortSignal) =>
    api.get<ApiResponse<import('../types').DashboardSummary>>('/admin/dashboard/summary', { signal });

// Notifications
export const getNotifications = () =>
    api.get<ApiResponse<Notification[]>>('/admin/notifications');

export const markNotificationRead = (id: string) =>
    api.put<ApiResponse<void>>(`/admin/notifications/${id}/read`);

// ── Payments ──────────────────────────────────────────────────────────────────

export interface CreateOrderRequest {
    payrollId: string;
    amount?: number;
    description?: string;
}

export interface PaymentVerifyRequest {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
}

export interface PaymentOrderResponse {
    id: string;
    payrollId: string;
    employeeName: string;
    employeeEmail: string;
    razorpayOrderId: string;
    amountInr: number;
    amountPaise: number;
    currency: string;
    description: string;
    status: 'CREATED' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
    createdAt: string;
}

export interface PaymentResponse {
    id: string;
    payrollId: string;
    employeeName: string;
    employeeEmail: string;
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    amountInr: number;
    currency: string;
    description: string;
    status: 'CREATED' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
    failureReason?: string;
    createdAt: string;
    updatedAt: string;
}

export const createPaymentOrder = (data: CreateOrderRequest) =>
    api.post<ApiResponse<PaymentOrderResponse>>('/payments/create-order', data);

export const verifyPayment = (data: PaymentVerifyRequest) =>
    api.post<ApiResponse<PaymentResponse>>('/payments/verify', data);

export const getPaymentsByPayroll = (payrollId: string) =>
    api.get<ApiResponse<PaymentResponse[]>>(`/payments/payroll/${payrollId}`);

export const getPaymentsByEmployee = (employeeId: string) =>
    api.get<ApiResponse<PaymentResponse[]>>(`/payments/employee/${employeeId}`);

export const getPaymentById = (paymentId: string) =>
    api.get<ApiResponse<PaymentResponse>>(`/payments/${paymentId}`);

export const initiateRefund = (paymentId: string) =>
    api.post<ApiResponse<PaymentResponse>>(`/payments/${paymentId}/refund`);
