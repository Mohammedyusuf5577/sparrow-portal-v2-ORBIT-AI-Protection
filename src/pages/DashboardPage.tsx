import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import {
    Users,
    FolderKanban,
    CheckCircle,
    Clock,
    UserCheck,
    UserX,
    Brain,
    ArrowUpRight,
    RotateCcw,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { summary, loading, error, refetch } = useDashboard();

    const riskColor =
        summary?.riskLevel === 'HIGH' ? 'rose' : summary?.riskLevel === 'MEDIUM' ? 'amber' : 'emerald';

    const mainCards = [
        {
            label: 'Total Employees',
            value: summary?.totalEmployees ?? 0,
            icon: Users,
            color: 'orbit',
            gradient: 'from-orbit-500 to-orbit-700',
            route: '/employees',
        },
        {
            label: 'Total Projects',
            value: summary?.totalProjects ?? 0,
            icon: FolderKanban,
            color: 'violet',
            gradient: 'from-accent-violet to-purple-700',
            route: '/projects',
        },
        {
            label: 'AI Risk Score',
            value: summary?.riskScore ?? 0,
            icon: Brain,
            color: riskColor,
            gradient:
                riskColor === 'rose'
                    ? 'from-accent-rose to-rose-700'
                    : riskColor === 'amber'
                    ? 'from-accent-amber to-amber-700'
                    : 'from-accent-emerald to-emerald-700',
            suffix: '/100',
            route: undefined,
        },
        {
            label: 'Pending Leaves',
            value: summary?.pendingLeaves ?? 0,
            icon: Clock,
            color: 'amber',
            gradient: 'from-amber-500 to-orange-600',
            route: '/leaves',
        },
    ];

    return (
        <div className="space-y-6 pb-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Organization Overview</h1>
                    <p className="text-sm text-surface-500 mt-1">Real-time intelligence and resource monitoring</p>
                </div>
                {loading ? (
                    <div className="h-8 w-28 bg-surface-200 animate-pulse rounded-xl" />
                ) : (
                    <div
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-${riskColor}/10 border border-accent-${riskColor}/20`}
                    >
                        <div className={`w-2 h-2 rounded-full bg-accent-${riskColor} animate-pulse`} />
                        <span className={`text-sm font-semibold text-accent-${riskColor}`}>
                            Risk: {summary?.riskLevel || 'LOW'}
                        </span>
                    </div>
                )}
            </div>

            {/* Error banner */}
            {error && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-sm text-rose-700">
                    <span>{error}</span>
                    <button
                        onClick={refetch}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-100"
                    >
                        <RotateCcw className="w-3.5 h-3.5" /> Retry
                    </button>
                </div>
            )}

            {/* Main Stat KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {mainCards.map((card, i) => {
                    const isClickable = Boolean(card.route);
                    return (
                        <div
                            key={i}
                            onClick={() => card.route && navigate(card.route)}
                            className={`group relative bg-white rounded-2xl p-5 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 overflow-hidden animate-slide-up ${
                                isClickable ? 'cursor-pointer' : ''
                            }`}
                            style={{ animationDelay: `${i * 0.08}s` }}
                        >
                            <div
                                className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${card.gradient} opacity-5 rounded-bl-full`}
                            />
                            <div className="flex items-start justify-between mb-4">
                                <div
                                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}
                                >
                                    <card.icon className="w-5 h-5 text-white" />
                                </div>
                                {isClickable && (
                                    <ArrowUpRight className="w-4 h-4 text-surface-300 group-hover:text-orbit-500 transition-colors" />
                                )}
                            </div>
                            <div>
                                {loading ? (
                                    <div className="h-8 w-16 bg-surface-200 animate-pulse rounded mb-2" />
                                ) : (
                                    <p className="text-2xl font-bold text-surface-900">
                                        {card.value}
                                        {card.suffix && (
                                            <span className="text-sm font-normal text-surface-400">
                                                {card.suffix}
                                            </span>
                                        )}
                                    </p>
                                )}
                                <p className="text-sm text-surface-500 mt-1">{card.label}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Secondary Analytic Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* 1. Project Breakdown Panel */}
                <div
                    className="bg-white rounded-2xl p-6 shadow-card hover:shadow-elevated transition-shadow animate-slide-up cursor-pointer"
                    onClick={() => navigate('/projects')}
                    style={{ animationDelay: '0.3s' }}
                >
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-sm font-semibold text-surface-800">Project Status</h2>
                        <span className="text-xs font-semibold text-orbit-600 group-hover:underline">View all →</span>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                label: 'In Progress',
                                value: summary?.inProgressProjects ?? 0,
                                color: 'bg-orbit-500',
                                bgColor: 'bg-orbit-50 text-orbit-700',
                            },
                            {
                                label: 'Completed',
                                value: summary?.completedProjects ?? 0,
                                color: 'bg-accent-emerald',
                                bgColor: 'bg-emerald-50 text-emerald-700',
                            },
                            {
                                label: 'Delayed',
                                value: summary?.delayedProjects ?? 0,
                                color: 'bg-accent-rose',
                                bgColor: 'bg-rose-50 text-rose-700',
                            },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                                    <span className="text-sm text-surface-600">{item.label}</span>
                                </div>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${item.bgColor}`}>
                                    {loading ? '—' : item.value}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Proportional Segment Bar */}
                    <div className="mt-5 h-2.5 bg-surface-100 rounded-full overflow-hidden flex">
                        {summary && summary.totalProjects > 0 ? (
                            <>
                                <div
                                    className="h-full bg-orbit-500 transition-all duration-500"
                                    style={{
                                        width: `${(summary.inProgressProjects / summary.totalProjects) * 100}%`,
                                    }}
                                />
                                <div
                                    className="h-full bg-accent-emerald transition-all duration-500"
                                    style={{
                                        width: `${(summary.completedProjects / summary.totalProjects) * 100}%`,
                                    }}
                                />
                                <div
                                    className="h-full bg-accent-rose transition-all duration-500"
                                    style={{
                                        width: `${(summary.delayedProjects / summary.totalProjects) * 100}%`,
                                    }}
                                />
                            </>
                        ) : (
                            <div className="h-full w-full bg-surface-200" />
                        )}
                    </div>
                </div>

                {/* 2. Team Overview Panel */}
                <div
                    className="bg-white rounded-2xl p-6 shadow-card hover:shadow-elevated transition-shadow animate-slide-up cursor-pointer"
                    onClick={() => navigate('/employees')}
                    style={{ animationDelay: '0.4s' }}
                >
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-sm font-semibold text-surface-800">Team Presence (Today)</h2>
                        <span className="text-xs font-semibold text-orbit-600">View roster →</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {[
                            {
                                label: 'Active Employees',
                                value: summary?.activeEmployees ?? 0,
                                icon: Users,
                                color: 'text-orbit-600 bg-orbit-50',
                            },
                            {
                                label: 'Instructors',
                                value: summary?.activeInstructors ?? 0,
                                icon: UserCheck,
                                color: 'text-accent-violet bg-violet-50',
                            },
                            {
                                label: 'Present Today',
                                value: summary?.presentToday ?? 0,
                                icon: CheckCircle,
                                color: 'text-accent-emerald bg-emerald-50',
                            },
                            {
                                label: 'Absent Today',
                                value: summary?.absentToday ?? 0,
                                icon: UserX,
                                color: 'text-accent-rose bg-rose-50',
                            },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className={`p-4 rounded-xl ${item.color.split(' ')[1]} flex flex-col items-center justify-center`}
                            >
                                <item.icon className={`w-5 h-5 mb-1.5 ${item.color.split(' ')[0]}`} />
                                <p className="text-xl font-bold text-surface-900">
                                    {loading ? '—' : item.value}
                                </p>
                                <p className="text-[11px] font-medium text-surface-500 mt-0.5 text-center">
                                    {item.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. AI Risk Assessment Gauge Panel */}
                <div
                    className="bg-white rounded-2xl p-6 shadow-card animate-slide-up"
                    style={{ animationDelay: '0.5s' }}
                >
                    <h2 className="text-sm font-semibold text-surface-800 mb-3">AI Intelligence & Risk</h2>
                    <div className="flex flex-col items-center">
                        <div className="relative w-36 h-36 mb-3">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                                <circle cx="60" cy="60" r="50" fill="none" stroke="#e4e4e7" strokeWidth="8" />
                                <circle
                                    cx="60"
                                    cy="60"
                                    r="50"
                                    fill="none"
                                    stroke={
                                        riskColor === 'rose'
                                            ? '#f43f5e'
                                            : riskColor === 'amber'
                                            ? '#f59e0b'
                                            : '#10b981'
                                    }
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray={`${((summary?.riskScore || 0) / 100) * 314} 314`}
                                    className="transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-surface-900">
                                    {loading ? '—' : summary?.riskScore ?? 0}
                                </span>
                                <span className="text-[10px] text-surface-400 font-medium">INDEX</span>
                            </div>
                        </div>

                        <div
                            className={`px-3 py-1 rounded-full text-xs font-bold mb-2 ${
                                riskColor === 'rose'
                                    ? 'bg-rose-100 text-accent-rose'
                                    : riskColor === 'amber'
                                    ? 'bg-amber-100 text-accent-amber'
                                    : 'bg-emerald-100 text-accent-emerald'
                            }`}
                        >
                            {summary?.riskLevel || 'LOW'} Risk
                        </div>

                        <p className="text-xs text-surface-500 text-center leading-relaxed px-2">
                            {summary?.riskAssessment || 'Analyzing operational telemetry...'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
