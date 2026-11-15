import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import {
    LayoutDashboard,
    FolderKanban,
    Users,
    CalendarCheck,
    CalendarOff,
    Activity,
    Bell,
    LogOut,
    Menu,
    PanelLeftClose,
    PanelLeftOpen,
    IndianRupee,
} from 'lucide-react';
import orbitMark from '../assets/images/orbit-mark.png';

const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/projects', label: 'Projects', icon: FolderKanban },
    { path: '/admin/employees', label: 'Employees', icon: Users },
    { path: '/admin/attendance', label: 'Attendance', icon: CalendarCheck },
    { path: '/admin/leaves', label: 'Leaves', icon: CalendarOff },
    { path: '/admin/ai-monitor', label: 'AI Monitor', icon: Activity },
    { path: '/admin/payroll', label: 'Payroll', icon: IndianRupee },
];

/** Section name for the breadcrumb: the nav item whose path the current URL sits under. */
const sectionLabel = (pathname: string): string | null => {
    if (pathname.startsWith('/admin/payments')) return 'Payments';
    return navItems.find((item) => pathname === item.path || pathname.startsWith(`${item.path}/`))?.label ?? null;
};

const AdminLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const section = sectionLabel(pathname);

    // The shell never gets shorter than the sidebar's natural height (min-h-[35rem] = 560px). In a shorter window
    // (e.g. DevTools docked and enlarged) the page is cropped / scrolls instead of squeezing the menu,
    // so menu and content sizes stay constant.
    return (
        <div className="flex h-screen min-h-[35rem] bg-surface-50 overflow-hidden">
            {/* Sidebar: the deepest surface. Dark ink against the light page gives the shell its anchor. */}
            <aside
                className={`${sidebarOpen ? 'w-60' : 'w-[72px]'}
        fixed lg:relative z-30 h-full flex flex-col bg-ink-900 text-ink-300
        transition-transform duration-200 ease-orbit
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                {/* Brand */}
                <div className={`h-16 flex items-center gap-3 border-b border-ink-100/10 flex-shrink-0 ${sidebarOpen ? 'px-5' : 'justify-center'}`}>
                    <span className="w-8 h-8 flex-shrink-0 rounded-lg bg-white flex items-center justify-center overflow-hidden">
                        <img src={orbitMark} alt="" className="w-7 h-7 object-contain" />
                    </span>
                    {sidebarOpen && <span className="text-base font-medium text-ink-100">ORBIT</span>}
                </div>

                {/* Navigation */}
                <nav aria-label="Primary" className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            title={sidebarOpen ? undefined : item.label}
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-2.5 h-9 px-2.5 rounded-lg text-sm transition-colors duration-150
                ${sidebarOpen ? '' : 'justify-center'}
                ${isActive
                                    ? 'bg-ink-700 text-ink-100 font-medium shadow-[inset_0_1px_0_rgba(238,240,245,0.08)]'
                                    : 'text-ink-300 hover:bg-ink-800 hover:text-ink-100'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon
                                        className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-orbit-400' : 'text-ink-400'}`}
                                        strokeWidth={1.5}
                                    />
                                    <span className={sidebarOpen ? '' : 'sr-only'}>{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Signed-in user */}
                <div className="p-3 border-t border-ink-100/10 flex-shrink-0">
                    <div className={`flex items-center gap-2.5 px-2.5 py-2 ${sidebarOpen ? '' : 'justify-center'}`}>
                        <div
                            className="w-8 h-8 flex-shrink-0 rounded-full bg-ink-700 text-ink-100 text-sm font-medium flex items-center justify-center"
                            aria-hidden="true"
                        >
                            {user?.fullName?.charAt(0) || 'A'}
                        </div>
                        {sidebarOpen && (
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-ink-100 truncate">{user?.fullName}</p>
                                <p className="text-xs text-ink-400 truncate">{user?.email}</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleLogout}
                        title={sidebarOpen ? undefined : 'Log out'}
                        className={`flex items-center gap-2.5 h-9 w-full px-2.5 rounded-lg text-sm text-ink-300 hover:bg-ink-800 hover:text-ink-100 transition-colors duration-150 ${sidebarOpen ? '' : 'justify-center'}`}
                    >
                        <LogOut className="w-4 h-4 flex-shrink-0 text-ink-400" strokeWidth={1.5} />
                        <span className={sidebarOpen ? '' : 'sr-only'}>Log out</span>
                    </button>
                </div>
            </aside>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-ink-950/60 z-20 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar: same tone as the page, so only the hairline separates it */}
                <header className="h-16 bg-surface-50 border-b border-surface-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="lg:hidden h-9 w-9 flex items-center justify-center rounded-lg text-surface-600 hover:bg-surface-100 transition-colors"
                            aria-label="Open menu"
                        >
                            <Menu className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="hidden lg:flex h-9 w-9 items-center justify-center rounded-lg text-surface-600 hover:bg-surface-100 transition-colors"
                            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                            aria-expanded={sidebarOpen}
                        >
                            {sidebarOpen ? (
                                <PanelLeftClose className="w-4 h-4" strokeWidth={1.5} />
                            ) : (
                                <PanelLeftOpen className="w-4 h-4" strokeWidth={1.5} />
                            )}
                        </button>
                        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm min-w-0">
                            <span className="hidden sm:inline text-surface-500">Admin console</span>
                            {section && (
                                <>
                                    <span className="hidden sm:inline text-surface-300" aria-hidden="true">/</span>
                                    <span className="font-medium text-surface-900 truncate">{section}</span>
                                </>
                            )}
                        </nav>
                    </div>

                    <button
                        onClick={() => navigate('/admin/ai-monitor')}
                        className="relative h-9 w-9 flex items-center justify-center rounded-lg text-surface-600 hover:bg-surface-100 transition-colors"
                        aria-label="Open notifications"
                    >
                        <Bell className="w-4 h-4" strokeWidth={1.5} />
                        <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-accent-rose rounded-full" />
                    </button>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto overscroll-contain">
                    <div className="mx-auto w-full max-w-[1440px] px-6 py-6 lg:px-8 lg:py-8 animate-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
