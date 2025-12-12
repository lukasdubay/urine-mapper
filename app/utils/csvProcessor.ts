import Papa from 'papaparse';

export interface RawRow {
    Ex: number;
    Em: number;
    [key: string]: number; // For dynamic dilution columns
}

export interface ProcessedRow {
    Ex: number;
    Em: number;
    MaxF: number;
}

export interface HeatmapData {
    x: number[];
    y: number[];
    z: number[][];
}

export interface ProcessingResult {
    tableData: ProcessedRow[];
    heatmapData: HeatmapData;
}

// Sequential default factors to apply to dilution columns in order
export const DEFAULT_FACTOR_SEQUENCE = [1.0, 1.4, 2.2, 3.4, 5.0, 1.0];

// Legacy default factors (kept for backward compatibility)
export const DEFAULT_FACTORS: Record<string, number> = {
    '18u0': 1.0,
    '18u2': 1.4,
    '18u8': 2.2,
    '18u32': 3.4,
    '18u128': 5.0,
    '18u512': 1.0,
};

// Helper to parse numbers with both comma and period decimal separators
// Also handles thousands separators
const parseNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const trimmed = value.trim();

        const hasComma = trimmed.includes(',');
        const hasPeriod = trimmed.includes('.');

        let normalized: string;

        if (hasComma && hasPeriod) {
            // Both comma and period present
            // Determine which is the decimal separator by position
            const lastCommaIndex = trimmed.lastIndexOf(',');
            const lastPeriodIndex = trimmed.lastIndexOf('.');

            if (lastCommaIndex > lastPeriodIndex) {
                // Comma appears after period
                // Check digits after comma to determine if it's decimal or thousands separator
                const digitsAfterComma = trimmed.length - lastCommaIndex - 1;

                if (digitsAfterComma === 3) {
                    // Exactly 3 digits after comma = thousands separator
                    // "1.234,567" with 3 digits = 1234567 (European thousands)
                    normalized = trimmed.replace(/\./g, '').replace(/,/g, '');
                } else {
                    // Less than 3 digits = decimal separator
                    // "1.234,56" = 1234.56 (European decimal)
                    normalized = trimmed.replace(/\./g, '').replace(',', '.');
                }
            } else {
                // Period appears after comma = period is decimal, comma is thousands
                // "1,234.56" -> remove commas
                normalized = trimmed.replace(/,/g, '');
            }
        } else if (hasComma) {
            // Only comma present
            // Check if it's thousands separator or decimal separator
            const lastCommaIndex = trimmed.lastIndexOf(',');
            const digitsAfterComma = trimmed.length - lastCommaIndex - 1;

            // Count total commas to help determine format
            const commaCount = (trimmed.match(/,/g) || []).length;

            if (digitsAfterComma === 3 && commaCount >= 1) {
                // Exactly 3 digits after last comma = likely thousands separator
                // "-185,789" = -185789
                // "1,234,567" = 1234567
                normalized = trimmed.replace(/,/g, '');
            } else {
                // Not exactly 3 digits = decimal separator
                // "246,67" = 246.67
                normalized = trimmed.replace(',', '.');
            }
        } else {
            // No comma, use as-is
            normalized = trimmed;
        }

        const parsed = parseFloat(normalized);
        return isNaN(parsed) ? NaN : parsed;
    }
    return NaN;
};

export const parseCSV = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            dynamicTyping: false, // Disable auto-typing to handle custom decimal formats
            skipEmptyLines: true,
            delimiter: '', // Auto-detect delimiter (handles both , and ; delimiters)
            transform: (value: string, field: string | number): any => {
                // Try to parse as number (handles both comma and period decimals)
                const num = parseNumber(value);
                return isNaN(num) ? value : num;
            },
            complete: (results) => {
                resolve(results.data);
            },
            error: (error) => {
                reject(error);
            }
        });
    });
};

// Helper to find a column name case-insensitively
const findColumnName = (row: any, target: string): string | undefined => {
    const keys = Object.keys(row);
    return keys.find(k => k.toLowerCase() === target.toLowerCase());
};

export const extractDilutionColumns = (data: any[]): string[] => {
    if (!data || data.length === 0) return [];
    const firstRow = data[0];
    const exCol = findColumnName(firstRow, 'ex');
    const emCol = findColumnName(firstRow, 'em');

    return Object.keys(firstRow).filter(k => k !== exCol && k !== emCol);
};

export const validateData = (data: any[]): { valid: boolean; message?: string } => {
    if (!data || data.length === 0) {
        return { valid: false, message: 'File is empty.' };
    }
    const firstRow = data[0];
    const exCol = findColumnName(firstRow, 'ex');
    const emCol = findColumnName(firstRow, 'em');

    if (!exCol || !emCol) {
        return { valid: false, message: 'Missing "Ex" or "Em" columns (case-insensitive).' };
    }

    // Check for at least some dilution columns
    const dilutionCols = extractDilutionColumns(data);
    if (dilutionCols.length < 1) {
        return { valid: false, message: 'No dilution columns found.' };
    }

    return { valid: true };
};

export const processData = (data: any[], factors: Record<string, number>): ProcessingResult => {
    const tableData: ProcessedRow[] = [];
    const xSet = new Set<number>();
    const ySet = new Set<number>();
    const zMap = new Map<string, number>();

    if (data.length === 0) return { tableData: [], heatmapData: { x: [], y: [], z: [] } };

    const firstRow = data[0];
    const exCol = findColumnName(firstRow, 'ex');
    const emCol = findColumnName(firstRow, 'em');

    if (!exCol || !emCol) {
        return { tableData: [], heatmapData: { x: [], y: [], z: [] } };
    }

    data.forEach((row) => {
        const ex = Number(row[exCol]);
        const em = Number(row[emCol]);

        if (isNaN(ex) || isNaN(em)) return;

        let maxF = 0;

        // Iterate through factors to find matching columns in the row
        Object.entries(factors).forEach(([colName, factor]) => {
            if (colName in row) {
                const val = Number(row[colName]);
                if (!isNaN(val)) {
                    const corrected = val * factor;
                    if (corrected > maxF) {
                        maxF = corrected;
                    }
                }
            }
        });

        tableData.push({ Ex: ex, Em: em, MaxF: maxF });
        xSet.add(ex);
        ySet.add(em);
        zMap.set(`${ex},${em}`, maxF);
    });

    // Sort unique Ex and Em for axes
    const x = Array.from(xSet).sort((a, b) => a - b);
    const y = Array.from(ySet).sort((a, b) => a - b);

    // Build Z matrix
    const z: number[][] = [];
    for (let i = 0; i < y.length; i++) {
        const row: number[] = [];
        for (let j = 0; j < x.length; j++) {
            const val = zMap.get(`${x[j]},${y[i]}`) || 0;
            row.push(val);
        }
        z.push(row);
    }

    return {
        tableData,
        heatmapData: { x, y, z },
    };
};

export const generateCSV = (data: ProcessedRow[]): string => {
    const header = 'Ex,Em,MaxF\n';
    const rows = data.map(row => `${row.Ex},${row.Em},${row.MaxF}`).join('\n');
    return header + rows;
};

export const calculateAutoMaxF = (data: HeatmapData): number => {
    if (!data.z || data.z.length === 0) return 100;
    const flatValues = data.z.flat();
    return Math.max(...flatValues);
};

