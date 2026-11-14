export interface EmployeePayroll {
    id: string;
    employeeId: string;
    name: string;
    mobile: string;
    email: string;
    joinDate: string;
    department: string;
    designation: string;
    employmentType: string;
    createdAt: string;
    updatedAt: string;
    netSalary: number;
    bankDetails?: BankDetails;
    taxDetails?: TaxDetails;
    salaryStructure?: SalaryStructure;
    attendance?: Attendance;
}

export interface BankDetails {
    id: string;
    accountName: string;
    bankName: string;
    accountNumber: string;
    ifsc: string;
    createdAt: string;
    updatedAt: string;
}

export interface TaxDetails {
    id: string;
    pan: string;
    aadhaar: string;
    uan: string;
    createdAt: string;
    updatedAt: string;
}

export interface SalaryStructure {
    id: string;
    basicSalary: number;
    allowance: number;
    pf: number;
    tax: number;
    otherDeduction: number;
    createdAt: string;
    updatedAt: string;
}

export interface Attendance {
    id: string;
    workingDays: number;
    presentDays: number;
    leaveDays: number;
    overtimeHours: number;
    createdAt: string;
    updatedAt: string;
}
