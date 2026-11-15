import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { login as loginApi } from '../api/services';
import { StatusDot, type StatusTone } from '../components/StatusDot';
import orbitMark from '../assets/images/orbit-mark.png';

// The three inputs of the AI risk score, as shown on the AI Monitor screen.
const RISK_FACTORS: { label: string; tone: StatusTone }[] = [
    { label: 'Delayed projects', tone: 'negative' },
    { label: 'Pending leaves', tone: 'warning' },
    { label: 'Attendance anomalies', tone: 'active' },
];

/** Hairline orbit rings: a flat diagram of the product name, cropped by the panel edge. */
const OrbitRings: React.FC = () => (
    <svg
        viewBox="0 0 520 520"
        className="absolute -right-48 -bottom-48 w-[520px] h-[520px] text-ink-600"
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        aria-hidden="true"
    >
        <circle cx="260" cy="260" r="96" />
        <circle cx="260" cy="260" r="160" />
        <circle cx="260" cy="260" r="224" />
        <circle cx="260" cy="260" r="4" fill="currentColor" stroke="none" />
        <circle cx="192" cy="115" r="5" className="text-orbit-400" fill="currentColor" stroke="none" />
    </svg>
);

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await loginApi(email);
            if (response.data.data) {
                login(response.data.data);
                navigate('/admin/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.errorMessage || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-50 flex">
            {/* Left: what the product is */}
            <div className="hidden lg:flex lg:w-[46%] bg-ink-900 relative overflow-hidden">
                <OrbitRings />

                <div className="relative flex flex-col justify-between w-full px-16 py-14">
                    <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-lg bg-white flex items-center justify-center overflow-hidden">
                            <img src={orbitMark} alt="" className="w-9 h-9 object-contain" />
                        </span>
                        <span className="text-xl font-medium text-ink-100">ORBIT</span>
                    </div>

                    <div>
                        <h2 className="text-4xl font-medium leading-tight text-ink-100 max-w-md">
                            Organizational risk and intelligence
                        </h2>
                        <p className="mt-5 text-base leading-relaxed text-ink-300 max-w-md">
                            Track people, projects, attendance and payroll in one console. The AI risk score shows what needs attention first.
                        </p>

                        <div className="mt-10 max-w-sm">
                            <p className="text-sm text-ink-400">What the risk score tracks</p>
                            <ul className="mt-3 border-t border-ink-100/10">
                                {RISK_FACTORS.map((factor) => (
                                    <li
                                        key={factor.label}
                                        className="flex items-center gap-3 h-10 border-b border-ink-100/10 text-sm text-ink-100"
                                    >
                                        <StatusDot tone={factor.tone} />
                                        {factor.label}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <p className="text-xs text-ink-400">ORBIT 1.0.0</p>
                </div>
            </div>

            {/* Right: sign in */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-sm">
                    {/* Mobile brand */}
                    <div className="lg:hidden flex items-center gap-3 mb-10">
                        <img src={orbitMark} alt="" className="w-9 h-9 object-contain" />
                        <span className="text-lg font-medium text-surface-900">ORBIT</span>
                    </div>

                    <h1 className="text-2xl font-medium text-surface-900">Sign in</h1>
                    <p className="mt-1.5 text-sm text-surface-600">Use your admin email to open the console</p>

                    <form onSubmit={handleLogin} className="mt-8 space-y-5">
                        <div>
                            <label htmlFor="email-input" className="block text-sm font-medium text-surface-700 mb-1.5">
                                Email address
                            </label>
                            <input
                                id="email-input"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@orbit.com"
                                required
                                autoComplete="email"
                                className="w-full h-10 px-3 rounded-lg border border-surface-200 bg-white text-sm text-surface-900
                  hover:border-surface-300 focus:outline-none focus:ring-2 focus:ring-orbit-600/20
                  focus:border-orbit-600 transition-colors duration-150"
                            />
                        </div>

                        {error && (
                            <div role="alert" className="px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 animate-fade-in">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <button
                            id="login-button"
                            type="submit"
                            disabled={loading || !email}
                            className="w-full flex items-center justify-center h-10 rounded-lg
                bg-orbit-600 text-white text-sm font-medium
                hover:bg-orbit-700 active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
                transition-[background-color,transform] duration-150"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-sm text-surface-600">
                        Demo account: <code className="font-mono text-surface-900">admin@orbit.com</code>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
