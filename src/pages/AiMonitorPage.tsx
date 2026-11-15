import React, { useEffect, useState } from 'react';
import { getAiSummary, getNotifications, markNotificationRead } from '../api/services';
import type { AiSummary, Notification } from '../types';
import { usePagination } from '../hooks/usePagination';
import { PaginatedPanel } from '../components/PaginatedPanel';
import {
    Brain,
    AlertTriangle,
    Activity,
    TrendingUp,
    Users,
    FolderKanban,
    CalendarOff,
    Eye,
    Bell,
    CheckCircle,
} from 'lucide-react';

const AiMonitorPage: React.FC = () => {
    const [summary, setSummary] = useState<AiSummary | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [aiRes, notifRes] = await Promise.all([getAiSummary(), getNotifications()]);
            setSummary(aiRes.data.data || null);
            setNotifications(notifRes.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkRead = async (id: string) => {
        try {
            await markNotificationRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: true } : n))
            );
        } catch (err) {
            console.error(err);
        }
    };

    // Client-side pagination for the notifications list
    const { pageItems, paginationProps } = usePagination(notifications);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-3 border-orbit-200 border-t-orbit-600 rounded-full animate-spin" />
            </div>
        );
    }

    const riskColor =
        summary?.riskLevel === 'HIGH' ? 'rose' : summary?.riskLevel === 'MEDIUM' ? 'amber' : 'emerald';

    const factors = [
        {
            label: 'Delayed Projects',
            value: summary?.delayedProjects || 0,
            impact: (summary?.delayedProjects || 0) * 10,
            icon: AlertTriangle,
            color: 'accent-rose',
        },
        {
            label: 'Pending Leaves',
            value: summary?.pendingLeaves || 0,
            impact: (summary?.pendingLeaves || 0) * 5,
            icon: CalendarOff,
            color: 'accent-amber',
        },
        {
            label: 'Attendance Anomalies',
            value: summary?.attendanceAnomalies || 0,
            impact: (summary?.attendanceAnomalies || 0) * 5,
            icon: Activity,
            color: 'accent-violet',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orbit-500 to-orbit-600 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-medium text-surface-900">AI Monitor</h1>
                    <p className="text-sm text-surface-500">Intelligent risk detection & analysis</p>
                </div>
            </div>

            {/* Risk Score Card */}
            <div className={`bg-gradient-to-r ${riskColor === 'rose' ? 'from-rose-500 to-rose-700' :
                    riskColor === 'amber' ? 'from-amber-500 to-orange-600' :
                        'from-emerald-500 to-emerald-700'
                } rounded-xl p-8 text-white shadow-elevated`}>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <p className="text-sm font-medium text-white/80 mb-1">Overall Risk Assessment</p>
                        <h2 className="text-5xl font-medium mb-2">{summary?.riskScore || 0}<span className="text-2xl font-normal text-white/60">/100</span></h2>
                        <p className="text-lg font-medium">{summary?.riskLevel} Risk Level</p>
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                        {[
                            { label: 'Active Staff', value: summary?.activeEmployees || 0, icon: Users },
                            { label: 'Total Projects', value: summary?.totalProjects || 0, icon: FolderKanban },
                            { label: 'Completed', value: summary?.completedProjects || 0, icon: CheckCircle },
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <stat.icon className="w-5 h-5 mx-auto mb-1.5 text-white/70" />
                                <p className="text-2xl font-medium">{stat.value}</p>
                                <p className="text-xs text-white/60">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Risk Factors Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {factors.map((factor, i) => (
                    <div
                        key={i}
                        className="bg-white rounded-xl p-6 shadow-card border border-surface-100"
                        style={{ animationDelay: `${i * 0.1}s` }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-10 h-10 rounded-lg bg-${factor.color}/10 flex items-center justify-center`}>
                                <factor.icon className={`w-5 h-5 text-${factor.color}`} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-surface-800">{factor.label}</p>
                                <p className="text-xs text-surface-400">Count: {factor.value}</p>
                            </div>
                        </div>
                        <div className="mb-2">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-surface-500">Impact Score</span>
                                <span className="font-medium text-surface-700">+{factor.impact}</span>
                            </div>
                            <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full bg-${factor.color} rounded-full transition-colors duration-150 ease-out`}
                                    style={{ width: `${Math.min((factor.impact / 100) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                        <p className="text-xs text-surface-400">
                            Formula: {factor.label === 'Delayed Projects' ? 'Count × 10' : 'Count × 5'}
                        </p>
                    </div>
                ))}
            </div>

            {/* Notifications */}
            <PaginatedPanel
                className=""
                style={{ animationDelay: '0.3s' }}
                minBodyHeightClass="min-h-[16rem]"
                isEmpty={notifications.length === 0}
                empty={{
                    icon: Bell,
                    title: 'No notifications yet',
                    description: 'AI risk alerts and system notifications will appear here.',
                }}
                pagination={paginationProps}
                bodyClassName="divide-y divide-surface-50"
                header={
                    <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
                        <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5 text-orbit-600" />
                            <h3 className="text-sm font-medium text-surface-800">AI Alerts & Notifications</h3>
                        </div>
                        <span className="text-xs text-surface-400">
                            {notifications.filter((n) => !n.read).length} unread
                        </span>
                    </div>
                }
            >
                {pageItems.map((notif) => (
                    <div
                        key={notif.id}
                        className={`flex items-start gap-4 px-6 py-4 transition-colors ${!notif.read ? 'bg-orbit-50/30' : 'hover:bg-surface-50'
                            }`}
                    >
                        <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${notif.type === 'RISK_ALERT' ? 'bg-accent-rose/10' : 'bg-orbit-50'
                            }`}>
                            {notif.type === 'RISK_ALERT' ? (
                                <AlertTriangle className="w-4 h-4 text-accent-rose" />
                            ) : (
                                <Activity className="w-4 h-4 text-orbit-600" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm ${!notif.read ? 'font-semibold text-surface-900' : 'text-surface-600'}`}>
                                {notif.message}
                            </p>
                            <p className="text-xs text-surface-400 mt-1">
                                {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : ''}
                            </p>
                        </div>
                        {!notif.read && (
                            <button
                                onClick={() => handleMarkRead(notif.id)}
                                className="flex-shrink-0 p-1.5 rounded-lg text-orbit-500 hover:bg-orbit-100 transition-colors"
                                title="Mark as read"
                            >
                                <Eye className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}
            </PaginatedPanel>
        </div>
    );
};

export default AiMonitorPage;
