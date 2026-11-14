import api from '../../../api/axios';
import { ApiResponse } from '../../../types';
import {
    EmployeePayroll,
    BankDetails,
    TaxDetails,
    SalaryStructure,
    Attendance
} from '../types';

const BASE_URL = '/admin/payroll';

export const createPayroll = (data: Partial<EmployeePayroll>) =>
    api.post<ApiResponse<EmployeePayroll>>(`${BASE_URL}/employee`, data);

export const updatePayroll = (id: string, data: Partial<EmployeePayroll>) =>
    api.put<ApiResponse<EmployeePayroll>>(`${BASE_URL}/employee/${id}`, data);

export const getPayrollById = (id: string) =>
    api.get<ApiResponse<EmployeePayroll>>(`${BASE_URL}/employee/${id}`);

export const getAllPayroll = () =>
    api.get<ApiResponse<EmployeePayroll[]>>(`${BASE_URL}/employee`);

export const deletePayroll = (id: string) =>
    api.delete<ApiResponse<void>>(`${BASE_URL}/employee/${id}`);

export const saveBankDetails = (id: string, data: Partial<BankDetails>) =>
    api.post<ApiResponse<EmployeePayroll>>(`${BASE_URL}/${id}/bank`, data);

export const saveTaxDetails = (id: string, data: Partial<TaxDetails>) =>
    api.post<ApiResponse<EmployeePayroll>>(`${BASE_URL}/${id}/tax`, data);

export const saveSalary = (id: string, data: Partial<SalaryStructure>) =>
    api.post<ApiResponse<EmployeePayroll>>(`${BASE_URL}/${id}/salary`, data);

export const saveAttendance = (id: string, data: Partial<Attendance>) =>
    api.post<ApiResponse<EmployeePayroll>>(`${BASE_URL}/${id}/attendance`, data);
