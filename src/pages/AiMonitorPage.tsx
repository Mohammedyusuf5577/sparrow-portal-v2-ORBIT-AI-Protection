import React, { useEffect, useState } from 'react';
import { getAiSummary, getNotifications, markNotificationRead } from '../api/services';
import type { AiSummary, Notification } from '../types';
import { usePagination } from '../hooks/usePagination';
import { PaginatedPanel } from '../components/PaginatedPanel';
import { PageHeader } from '../components/PageHeader';
import { RiskDial, RISK_LABEL, RISK_TONE, toRiskLevel } from '../components/RiskDial';
import { Status, StatusDot, type StatusTone } from '../components/StatusDot';
import { formatDateTime } from '../components/ui';
import { Bell } from 'lucide-react';

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
                <div role="status" aria-label="Loading" className="w-6 h-6 border-2 border-surface-200 border-t-orbit-600 rounded-full animate-spin" />
            </div>
        );
    }

    const level = toRiskLevel(summary?.riskLevel);

    // What the risk score is made of. Weights are the ones the score already uses.
    const factors: { label: string; value: number; weight: number; tone: StatusTone; bar: string }[] = [
        { label: 'Delayed projects', value: summary?.delayedProjects || 0, weight: 10, tone: 'negative', bar: 'bg-accent-rose' },
        { label: 'Pending leaves', value: summary?.pendingLeaves || 0, weight: 5, tone: 'warning', bar: 'bg-amber-600' },
        { label: 'Attendance anomalies', value: summary?.attendanceAnomalies || 0, weight: 5, tone: 'active', bar: 'bg-orbit-600' },
    ];

    const context = [
        { label: 'Active staff', value: summary?.activeEmployees || 0 },
        { label: 'Total projects', value: summary?.totalProjects || 0 },
        { label: 'Completed projects', value: summary?.completedProjects || 0 },
    ];

    const unread = notifications.filter((n) => !n.read).length;

    return (
        <div className="space-y-6">
            <PageHeader title="AI monitor" description="Risk detection and analysis" />

            {/* Overall risk: the one rich element on this screen */}
            <section className="panel p-6">
                <h2 className="text-sm font-medium text-surface-900">Overall risk assessment</h2>
                <div className="mt-6 flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div className="flex flex-col sm:flex-row items-center gap-8">
                        <RiskDial score={summary?.riskScore || 0} level={level} />
                        <div className="text-center sm:text-left">
                            <Status tone={RISK_TONE[level]} className="font-medium text-surface-900">
                                {RISK_LABEL[level]} risk
                            </Status>
                            <p className="mt-2 text-sm text-surface-600 max-w-xs">
                                Built from the three factors below. Each count is multiplied by its weight.
                            </p>
                        </div>
                    </div>

                    <dl className="grid grid-cols-3 gap-8 lg:gap-10">
                        {context.map((item) => (
                            <div key={item.label}>
                                <dd className="text-2xl font-medium leading-none text-surface-900 tabular-nums">{item.value}</dd>
                                <dt className="mt-2 text-sm text-surface-500">{item.label}</dt>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>

            {/* Factors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {factors.map((factor) => {
                    const impact = factor.value * factor.weight;
                    return (
                        <div key={factor.label} className="panel p-5">
                            <p className="flex items-center gap-2 h-5 text-sm text-surface-600">
                                <StatusDot tone={factor.tone} />
                                {factor.label}
                            </p>
                            <p className="mt-2 text-3xl font-medium leading-none text-surface-900 tabular-nums">{factor.value}</p>

                            <div className="mt-5 flex items-center justify-between text-sm">
                                <span className="text-surface-600">Impact on score</span>
                                <span className="font-medium text-surface-900 tabular-nums">+{impact}</span>
                            </div>
                            <div className="mt-2 h-1.5 rounded-full bg-surface-100 overflow-hidden">
                                <div className={`h-full rounded-full ${factor.bar}`} style={{ width: `${Math.min(impact, 100)}%` }} />
                            </div>
                            <p className="mt-3 text-xs text-surface-500">Count × {factor.weight}</p>
                        </div>
                    );
                })}
            </div>

            {/* Notifications */}
            <PaginatedPanel
                minBodyHeightClass="min-h-[16rem]"
                isEmpty={notifications.length === 0}
                empty={{
                    icon: Bell,
                    title: 'No notifications yet',
                    description: 'AI risk alerts and system notifications will appear here.',
                }}
                pagination={paginationProps}
                bodyClassName="divide-y divide-surface-100"
                header={
                    <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200">
                        <h3 className="text-sm font-medium text-surface-900">Alerts and notifications</h3>
                        <span className="text-xs text-surface-500 tabular-nums">{unread} unread</span>
                    </div>
                }
            >
                {pageItems.map((notif) => (
                    <div
                        key={notif.id}
                        className="flex items-start gap-3 px-5 py-4 hover:bg-surface-50 transition-colors duration-150"
                    >
                        <span className="flex items-center h-5 flex-shrink-0">
                            {notif.read ? (
                                <span className="inline-block w-1.5 h-1.5 rounded-full border border-surface-300" aria-hidden="true" />
                            ) : (
                                <StatusDot tone={notif.type === 'RISK_ALERT' ? 'negative' : 'active'} />
                            )}
                        </span>
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm ${notif.read ? 'text-surface-600' : 'font-medium text-surface-900'}`}>
                                {notif.message}
                                {!notif.read && <span className="sr-only"> (unread)</span>}
                            </p>
                            <p className="mt-0.5 text-xs text-surface-500 tabular-nums">{formatDateTime(notif.createdAt)}</p>
                        </div>
                        {!notif.read && (
                            <button
                                onClick={() => handleMarkRead(notif.id)}
                                className="flex-shrink-0 h-8 px-3 rounded-lg text-sm text-orbit-600 hover:bg-orbit-50 transition-colors duration-150"
                            >
                                Mark as read
                            </button>
                        )}
                    </div>
                ))}
            </PaginatedPanel>
        </div>
    );
};

export default AiMonitorPage;
