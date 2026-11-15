type Cell = string | number | null | undefined;

/**
 * One CSV cell. Quotes are doubled and the value is wrapped when it holds a comma, quote or line break.
 * Text that starts with = + - @ is prefixed with an apostrophe so Excel and Sheets never run it as a formula
 * (CSV injection). Numbers are written as they are.
 */
const cell = (value: Cell): string => {
    if (value === null || value === undefined) return '';
    let text = String(value);
    if (typeof value === 'string' && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const toCsv = (headers: string[], rows: Cell[][]): string =>
    [headers, ...rows].map((row) => row.map(cell).join(',')).join('\r\n');

/** Starts a file download in the browser. A BOM is added so Excel reads UTF-8 (names, the rupee sign). */
export const downloadCsv = (filename: string, csv: string): void => {
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
};
