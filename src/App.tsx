import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
import { FeedbackProvider } from './components/Feedback';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminLayout from './layout/AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import EmployeesPage from './pages/EmployeesPage';
import AttendancePage from './pages/AttendancePage';
import LeavesPage from './pages/LeavesPage';
import AiMonitorPage from './pages/AiMonitorPage';
import PayrollListPage from './modules/payroll/pages/PayrollListPage';
import PayrollCreatePage from './modules/payroll/pages/PayrollCreatePage';
import PayrollDetailsPage from './modules/payroll/pages/PayrollDetailsPage';
import PayrollEditPage from './modules/payroll/pages/PayrollEditPage';
import PaymentsPage from './pages/PaymentsPage';

// Lazy-loaded project create and edit pages
const ProjectCreatePage = lazy(() => import('./pages/ProjectCreatePage'));
const ProjectEditPage = lazy(() => import('./pages/ProjectEditPage'));

const PageFallback = () => (
    <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-surface-200 border-t-orbit-600 rounded-full animate-spin" />
    </div>
);

const App: React.FC = () => {
    return (
        <AuthProvider>
            <FeedbackProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<LoginPage />} />
                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute>
                                    <AdminLayout />
                                </ProtectedRoute>
                            }
                        >
                            <Route index element={<Navigate to="dashboard" replace />} />
                            <Route path="dashboard" element={<DashboardPage />} />
                            <Route path="projects" element={<ProjectsPage />} />
                            <Route
                                path="projects/new"
                                element={
                                    <Suspense fallback={<PageFallback />}>
                                        <ProjectCreatePage />
                                    </Suspense>
                                }
                            />
                            <Route
                                path="projects/:id/edit"
                                element={
                                    <Suspense fallback={<PageFallback />}>
                                        <ProjectEditPage />
                                    </Suspense>
                                }
                            />
                            <Route path="employees" element={<EmployeesPage />} />
                            <Route path="attendance" element={<AttendancePage />} />
                            <Route path="leaves" element={<LeavesPage />} />
                            <Route path="ai-monitor" element={<AiMonitorPage />} />

                            {/* Payroll Module */}
                            <Route path="payroll" element={<PayrollListPage />} />
                            <Route path="payroll/create" element={<PayrollCreatePage />} />
                            <Route path="payroll/details/:id" element={<PayrollDetailsPage />} />
                            <Route path="payroll/edit/:id" element={<PayrollEditPage />} />

                            {/* Payments Module */}
                            <Route path="payments" element={<PaymentsPage />} />
                        </Route>
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Router>
            </FeedbackProvider>
        </AuthProvider>
    );
};

export default App;
