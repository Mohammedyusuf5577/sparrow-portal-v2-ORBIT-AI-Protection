import React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ProjectStats } from '../types';
import { SERIES } from './chartSeries';

/**
 * Projects per month, stacked by state. Stack order, bottom to top: completed, in progress, delayed
 * (the one that needs attention sits on top). Colours come from chartSeries, shared with the legend.
 */
const STACK_ORDER = ['completed', 'inProgress', 'delayed'] as const;
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface Row {
    label: string;
    month: string;
    total: number;
    completed: number;
    inProgress: number;
    delayed: number;
}

const ChartTooltip: React.FC<{ active?: boolean; payload?: { payload: Row }[] }> = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const row = payload[0].payload;
    return (
        <div className="bg-white border border-surface-200 rounded-lg shadow-elevated px-3 py-2.5 text-sm min-w-[160px]">
            <p className="font-medium text-surface-900">{row.month}</p>
            <ul className="mt-1.5 space-y-1">
                {SERIES.map((s) => (
                    <li key={s.key} className="flex items-center justify-between gap-4 text-surface-600">
                        <span className="inline-flex items-center gap-2">
                            <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: s.color }} aria-hidden="true" />
                            {s.label}
                        </span>
                        <span className="font-medium text-surface-900 tabular-nums">{row[s.key]}</span>
                    </li>
                ))}
            </ul>
            <p className="mt-2 pt-2 border-t border-surface-200 flex items-center justify-between text-surface-600">
                Total <span className="font-medium text-surface-900 tabular-nums">{row.total}</span>
            </p>
        </div>
    );
};

const ProjectsByMonthChart: React.FC<{ stats: ProjectStats }> = ({ stats }) => {
    const data: Row[] = stats.monthlyBreakdown.map((m) => ({
        label: SHORT_MONTHS[m.month - 1] ?? m.monthName.slice(0, 3),
        month: m.monthName,
        total: m.total,
        completed: m.completed,
        inProgress: m.inProgress,
        delayed: m.delayed,
    }));

    return (
        <>
            {/* The drawing is decoration for sighted users; the table below carries the same numbers. */}
            <div className="h-full w-full" aria-hidden="true">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -12 }} barCategoryGap="28%">
                        <CartesianGrid vertical={false} stroke="#dce1ea" />
                        <XAxis
                            dataKey="label"
                            tickLine={false}
                            axisLine={{ stroke: '#dce1ea' }}
                            tick={{ fill: '#5f6a7d', fontSize: 12 }}
                            tickMargin={8}
                        />
                        <YAxis
                            allowDecimals={false}
                            tickLine={false}
                            axisLine={false}
                            width={40}
                            tick={{ fill: '#5f6a7d', fontSize: 12 }}
                            domain={[0, (max: number) => Math.max(3, max)]}
                        />
                        <Tooltip cursor={{ fill: '#e6eaf1' }} content={<ChartTooltip />} />
                        {STACK_ORDER.map((key) => {
                            const s = SERIES.find((x) => x.key === key)!;
                            return (
                                <Bar
                                    key={key}
                                    dataKey={key}
                                    name={s.label}
                                    stackId="projects"
                                    fill={s.color}
                                    stroke="#ffffff"
                                    strokeWidth={1}
                                    maxBarSize={22}
                                    isAnimationActive={false}
                                />
                            );
                        })}
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <table className="sr-only">
                <caption>Projects by month in {stats.year}</caption>
                <thead>
                    <tr>
                        <th scope="col">Month</th>
                        <th scope="col">In progress</th>
                        <th scope="col">Completed</th>
                        <th scope="col">Delayed</th>
                        <th scope="col">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row) => (
                        <tr key={row.month}>
                            <th scope="row">{row.month}</th>
                            <td>{row.inProgress}</td>
                            <td>{row.completed}</td>
                            <td>{row.delayed}</td>
                            <td>{row.total}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
};

export default ProjectsByMonthChart;
