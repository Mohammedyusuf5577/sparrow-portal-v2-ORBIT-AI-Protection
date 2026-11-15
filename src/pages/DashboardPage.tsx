import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import { ArrowUpRight, RotateCcw } from 'lucide-react';
import { Status, StatusDot, type StatusTone } from '../components/StatusDot';

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

const RISK_TONE: Record<RiskLevel, StatusTone> = { LOW: 'positive', MEDIUM: 'warning', HIGH: 'negative' };
const RISK_STROKE: Record<RiskLevel, string> = { LOW: '#16a34a', MEDIUM: '#d97706', HIGH: '#dc2626' };
const RISK_LABEL: Record<RiskLevel, string> = { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High' };

/** The one rich element on this screen: the AI risk index drawn as an instrument dial. */
const RiskDial: React.FC<{ score: number; level: RiskLevel; loading: boolean }> = ({ score, level, loading }) => {
    const R = 96;
    const cx = 120;
    const cy = 120;
    const arc = `M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`;
    const clamped = Math.max(0, Math.min(100, score));
    const ticks = Array.from({ length: 11 }, (_, i) => {
        const a = Math.PI - (i / 10) * Math.PI;
        const major = i % 5 === 0;
        const r1 = R + 10;
        const r2 = R + (major ? 20 : 15);
        return {
            key: i,
            x1: cx + r1 * Math.cos(a),
            y1: cy - r1 * Math.sin(a),
            x2: cx + r2 * Math.cos(a),
            y2: cy - r2 * Math.sin(a),
            major,
        };
    });

    return (
        <div
            className="relative w-[240px] h-[148px] flex-shrink-0"
            role="img"
            aria-label={loading ? 'AI risk score loading' : `AI risk score ${score} out of 100, ${RISK_LABEL[level].toLowerCase()}`}
        >
            <svg viewBox="0 0 240 148" className="w-full h-full overflow-visible">
                {ticks.map((t) => (
                    <line
                        key={t.key}
                        x1={t.x1}
                        y1={t.y1}
                        x2={t.x2}
                        y2={t.y2}
                        stroke={t.major ? '#a1a1aa' : '#d4d4d8'}
                        strokeWidth={1}
                    />
                ))}
                <path d={arc} fill="none" stroke="#e8e8ea" strokeWidth={10} strokeLinecap="round" pathLength={100} />
                {!loading && clamped > 0 && (
                    <path
                        d={arc}
                        fill="none"
                        stroke={RISK_STROKE[level]}
                        strokeWidth={10}
                        strokeLinecap="round"
                        pathLength={100}
                        strokeDasharray={`${clamped} 100`}
                        style={{ transition: 'stroke-dasharray 600ms cubic-bezier(0.22, 1, 0.36, 1)' }}
                    />
                )}
            </svg>
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
                <span className="text-4xl font-medium leading-none text-surface-900 tabular-nums">{loading ? '—' : score}</span>
                <span className="mt-1.5 text-xs text-surface-500">out of 100</span>
            </div>
        </div>
    );
};

const StatCard: React.FC<{
    label: string;
    value: React.ReactNode;
    suffix?: string;
    to?: string;
    loading: boolean;
}> = ({ label, value, suffix, to, loading }) => {
    const navigate = useNavigate();
    const body = (
        <>
            <span className="flex items-center justify-between h-5 text-sm text-surface-600">
                {label}
                {to && <ArrowUpRight className="w-4 h-4 text-surface-400" strokeWidth={1.5} aria-hidden="true" />}
            </span>
            <span className="mt-2 block text-3xl font-medium leading-none text-surface-900 tabular-nums">
                {loading ? (
                    <span className="block h-8 w-14 rounded bg-surface-100 animate-pulse" />
                ) : (
                    <>
                        {value}
                        {suffix && <span className="ml-1 text-sm font-normal text-surface-500">{suffix}</span>}
                    </>
                )}
            </span>
        </>
    );

    if (to) {
        return (
            <button
                type="button"
                onClick={() => navigate(to)}
                className="panel p-5 text-left w-full hover:border-surface-300 transition-colors duration-150"
            >
                {body}
            </button>
        );
    }
    return <div className="panel p-5">{body}</div>;
};

const Row: React.FC<{ label: React.ReactNode; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex items-center justify-between h-8 text-sm">
        <span className="text-surface-600">{label}</span>
        <span className="font-medium text-surface-900 tabular-nums">{value}</span>
    </div>
);

export const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { summary, loading, error, refetch } = useDashboard();

    const level: RiskLevel = (summary?.riskLevel as RiskLevel) || 'LOW';
    const today = new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const total = summary?.totalProjects ?? 0;
    const projectRows: { label: string; value: number; bar: string; tone: StatusTone }[] = [
        { label: 'In progress', value: summary?.inProgressProjects ?? 0, bar: 'bg-orbit-600', tone: 'active' },
        { label: 'Completed', value: summary?.completedProjects ?? 0, bar: 'bg-accent-emerald', tone: 'positive' },
        { label: 'Delayed', value: summary?.delayedProjects ?? 0, bar: 'bg-accent-rose', tone: 'negative' },
    ];

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-medium text-surface-900">Organization overview</h1>
                    <p className="mt-1 text-sm text-surface-500">{today}</p>
                </div>
                {!loading && <Status tone={RISK_TONE[level]}>{RISK_LABEL[level]} risk</Status>}
            </div>

            {error && (
                <div
                    role="alert"
                    className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 flex items-center justify-between text-sm text-red-700"
                >
                    <span>{error}</span>
                    <button
                        onClick={refetch}
                        className="inline-flex items-center gap-1.5 h-8 px-3 bg-white border border-red-200 rounded-lg text-xs font-medium text-red-700 hover:bg-red-50 transition-colors"
                    >
                        <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} /> Retry
                    </button>
                </div>
            )}

            {/* Key figures */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total employees" value={summary?.totalEmployees ?? 0} to="/admin/employees" loading={loading} />
                <StatCard label="Total projects" value={summary?.totalProjects ?? 0} to="/admin/projects" loading={loading} />
                <StatCard label="AI risk score" value={summary?.riskScore ?? 0} suffix="/100" loading={loading} />
                <StatCard label="Pending leaves" value={summary?.pendingLeaves ?? 0} to="/admin/leaves" loading={loading} />
            </div>

            {/* Detail panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6">
                {/* Project status */}
                <section className="panel p-5 xl:col-span-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-medium text-surface-900">Project status</h2>
                        <Link to="/admin/projects" className="text-xs text-orbit-600 hover:text-orbit-700 transition-colors">
                            View all
                        </Link>
                    </div>

                    <div className="mt-4">
                        {projectRows.map((row) => (
                            <Row
                                key={row.label}
                                label={
                                    <span className="inline-flex items-center gap-2">
                                        <StatusDot tone={row.tone} />
                                        {row.label}
                                    </span>
                                }
                                value={loading ? '—' : row.value}
                            />
                        ))}
                    </div>

                    <div className="mt-4 h-1.5 rounded-full bg-surface-100 overflow-hidden flex gap-0.5" aria-hidden="true">
                        {summary && total > 0 &&
                            projectRows.map(
                                (row) =>
                                    row.value > 0 && (
                                        <div
                                            key={row.label}
                                            className={`h-full ${row.bar}`}
                                            style={{ width: `${(row.value / total) * 100}%` }}
                                        />
                                    )
                            )}
                    </div>
                </section>

                {/* Team presence */}
                <section className="panel p-5 xl:col-span-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-medium text-surface-900">Team presence</h2>
                        <Link to="/admin/employees" className="text-xs text-orbit-600 hover:text-orbit-700 transition-colors">
                            View roster
                        </Link>
                    </div>

                    <div className="mt-4">
                        <Row label="Active employees" value={loading ? '—' : summary?.activeEmployees ?? 0} />
                        <Row label="Active instructors" value={loading ? '—' : summary?.activeInstructors ?? 0} />
                        <div className="my-2 border-t border-surface-200" />
                        <Row
                            label={
                                <span className="inline-flex items-center gap-2">
                                    <StatusDot tone="positive" />
                                    Present today
                                </span>
                            }
                            value={loading ? '—' : summary?.presentToday ?? 0}
                        />
                        <Row
                            label={
                                <span className="inline-flex items-center gap-2">
                                    <StatusDot tone="negative" />
                                    Absent today
                                </span>
                            }
                            value={loading ? '—' : summary?.absentToday ?? 0}
                        />
                    </div>
                </section>

                {/* AI risk: the moment of this screen */}
                <section className="panel p-5 md:col-span-2 xl:col-span-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-medium text-surface-900">AI risk</h2>
                        <button
                            type="button"
                            onClick={() => navigate('/admin/ai-monitor')}
                            className="text-xs text-orbit-600 hover:text-orbit-700 transition-colors"
                        >
                            Open AI monitor
                        </button>
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row items-center gap-8">
                        <RiskDial score={summary?.riskScore ?? 0} level={level} loading={loading} />

                        <div className="min-w-0 text-center sm:text-left">
                            {!loading && <Status tone={RISK_TONE[level]} className="font-medium text-surface-900">{RISK_LABEL[level]} risk</Status>}
                            <p className="mt-2 text-sm leading-relaxed text-surface-600 max-w-md">
                                {loading ? 'Analyzing operational telemetry' : summary?.riskAssessment || 'No assessment available yet'}
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default DashboardPage;
