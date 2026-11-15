import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import {
    LayoutDashboard,
    FolderKanban,
    Users,
    CalendarCheck,
    CalendarOff,
    Brain,
    Bell,
    LogOut,
    Menu,
    X,
    ChevronRight,
    DollarSign,
} from 'lucide-react';
import orbitMark from '../assets/images/orbit-mark.png';

const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/projects', label: 'Projects', icon: FolderKanban },
    { path: '/admin/employees', label: 'Employees', icon: Users },
    { path: '/admin/attendance', label: 'Attendance', icon: CalendarCheck },
    { path: '/admin/leaves', label: 'Leaves', icon: CalendarOff },
    { path: '/admin/ai-monitor', label: 'AI Monitor', icon: Brain },
    { path: '/admin/payroll', label: 'Payroll', icon: DollarSign },
];

const AdminLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // The shell never gets shorter than the sidebar's natural height (min-h-[35rem] = 560px). In a shorter window
    // (e.g. DevTools docked and enlarged) the page is cropped / scrolls instead of squeezing the menu,
    // so menu and content sizes stay constant.
    return (
        <div className="flex h-screen min-h-[35rem] bg-surface-50 overflow-hidden">
            {/* Sidebar */}
            <aside
                className={`${sidebarOpen ? 'w-64' : 'w-20'
                    } fixed lg:relative z-30 h-full transition-all duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        bg-gradient-dark text-white flex flex-col shadow-elevated`}
            >
                {/* Logo */}
                <div className="flex items-center justify-between px-5 py-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-white flex items-center justify-center shadow-glow overflow-hidden">
                            <img src={orbitMark} alt="ORBIT logo" className="w-full h-full object-contain" />
                        </div>
                        {sidebarOpen && (
                            <div className="animate-fade-in">
                                <h1 className="text-lg font-bold tracking-tight">ORBIT</h1>
                                <p className="text-[10px] text-orbit-200 font-medium tracking-wider uppercase">AI Intelligence</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="hidden lg:flex p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <ChevronRight className={`w-4 h-4 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                ${isActive
                                    ? 'bg-white/15 text-white shadow-lg shadow-white/5'
                                    : 'text-white/60 hover:text-white hover:bg-white/8'
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            {sidebarOpen && <span className="animate-fade-in">{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                {/* User */}
                <div className="p-4 border-t border-white/10">
                    {sidebarOpen && (
                        <div className="mb-3 animate-fade-in">
                            <p className="text-sm font-semibold truncate">{user?.fullName}</p>
                            <p className="text-xs text-orbit-200 truncate">{user?.email}</p>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-rose-500/20 transition-all"
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Navbar */}
                <header className="h-16 bg-white border-b border-surface-200 flex items-center justify-between px-6 flex-shrink-0 shadow-card">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="lg:hidden p-2 rounded-lg hover:bg-surface-100 transition-colors"
                        >
                            <Menu className="w-5 h-5 text-surface-600" />
                        </button>
                        <div>
                            <h2 className="text-sm font-semibold text-surface-800">Admin Console</h2>
                            <p className="text-xs text-surface-400">ORBIT Intelligence Platform</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/admin/ai-monitor')}
                            className="relative p-2.5 rounded-xl hover:bg-orbit-50 transition-colors group"
                        >
                            <Bell className="w-5 h-5 text-surface-500 group-hover:text-orbit-600 transition-colors" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-rose rounded-full animate-pulse" />
                        </button>
                        <div className="w-9 h-9 rounded-xl bg-gradient-orbit flex items-center justify-center text-white text-sm font-bold shadow-glow">
                            {user?.fullName?.charAt(0) || 'A'}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto overscroll-contain p-6 animate-fade-in">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
