/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Brand accent: the cobalt of the ORBIT mark. It marks the primary action, the selection
                // and the one figure that matters on a screen. Never a surface colour.
                orbit: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563eb', // 5.2:1 on white, safe for text and for white-on-fill
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                    950: '#172554',
                },
                // Semantic colours only. Each one is dark enough to carry text on white (4.5:1).
                accent: {
                    teal: '#0f766e',
                    amber: '#b45309',
                    rose: '#dc2626',
                    emerald: '#15803d',
                },
                // One neutral ramp for every surface, border and text role, tinted toward the world
                // (ORBIT watches from far away: cool ink, saturation kept very low so it never reads as blue).
                //   page 50, raised 100, hairline 200
                //   text roles: primary 900, secondary 600, muted 400/500
                surface: {
                    50: '#eef1f6', // page: a visible step below the white cards
                    100: '#e6eaf1', // raised: table heads, segmented tracks, hover rows
                    200: '#dce1ea', // hairline
                    300: '#c4ccd8',
                    400: '#5f6a7d',
                    500: '#5f6a7d',
                    600: '#4b5565',
                    700: '#374151',
                    800: '#1f2937',
                    900: '#111827',
                },
                // The deepest surface: the sidebar and the login brand panel.
                ink: {
                    950: '#07080d',
                    900: '#0b0d14',
                    800: '#11141c',
                    700: '#1a1e28',
                    600: '#262c3a',
                    400: '#7a8296',
                    300: '#a3a9b8',
                    100: '#eef0f5',
                },
            },
            fontFamily: {
                sans: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
                mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
            },
            // Depth is neutral, soft and small. Nothing glows.
            boxShadow: {
                card: '0 1px 2px rgba(16, 24, 40, 0.06)',
                elevated: '0 8px 24px rgba(16, 24, 40, 0.08)',
            },
            transitionTimingFunction: {
                orbit: 'cubic-bezier(0.22, 1, 0.36, 1)',
            },
            // One easing curve. Entrances are a short fade and a small rise.
            animation: {
                'fade-in': 'fadeIn 300ms cubic-bezier(0.22, 1, 0.36, 1) both',
                'slide-up': 'slideUp 360ms cubic-bezier(0.22, 1, 0.36, 1) both',
                'scale-up': 'scaleUp 200ms cubic-bezier(0.22, 1, 0.36, 1) both',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(8px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                scaleUp: {
                    '0%': { opacity: '0', transform: 'scale(0.98)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
            },
        },
    },
    plugins: [],
}
