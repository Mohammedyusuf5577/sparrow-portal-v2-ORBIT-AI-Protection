import React from 'react';
import type { StatusTone } from './StatusDot';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export const RISK_TONE: Record<RiskLevel, StatusTone> = { LOW: 'positive', MEDIUM: 'warning', HIGH: 'negative' };
export const RISK_LABEL: Record<RiskLevel, string> = { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High' };
const RISK_STROKE: Record<RiskLevel, string> = { LOW: '#16a34a', MEDIUM: '#d97706', HIGH: '#dc2626' };

/** Reads the API value defensively: anything unknown counts as LOW, as it always has. */
export const toRiskLevel = (value?: string | null): RiskLevel =>
    value === 'HIGH' || value === 'MEDIUM' || value === 'LOW' ? value : 'LOW';

/** The AI risk index drawn as an instrument dial. It is the one rich element on the screens that show it. */
export const RiskDial: React.FC<{ score: number; level: RiskLevel; loading?: boolean; size?: 'md' | 'lg' }> = ({
    score,
    level,
    loading = false,
    size = 'md',
}) => {
    const large = size === 'lg';
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
            className={`relative flex-shrink-0 ${large ? 'w-[320px] h-[198px]' : 'w-[240px] h-[148px]'}`}
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
                        stroke={t.major ? '#8b95a7' : '#c4ccd8'}
                        strokeWidth={1}
                    />
                ))}
                <path d={arc} fill="none" stroke="#e1e5ec" strokeWidth={10} strokeLinecap="round" pathLength={100} />
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
                <span className={`font-medium leading-none text-surface-900 tabular-nums ${large ? 'text-6xl' : 'text-4xl'}`}>
                    {loading ? '—' : score}
                </span>
                <span className={`mt-2 text-surface-500 ${large ? 'text-sm' : 'text-xs'}`}>out of 100</span>
            </div>
        </div>
    );
};
