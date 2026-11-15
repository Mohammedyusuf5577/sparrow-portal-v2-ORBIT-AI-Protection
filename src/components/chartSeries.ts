/**
 * Colours and labels for the three project states. Kept apart from the chart so the dashboard can draw
 * a legend without loading the charting library up front.
 * They match the status dots: in progress = accent, completed = green, delayed = red.
 */
export const SERIES = [
    { key: 'inProgress', label: 'In progress', color: '#2563eb' },
    { key: 'completed', label: 'Completed', color: '#15803d' },
    { key: 'delayed', label: 'Delayed', color: '#dc2626' },
] as const;
