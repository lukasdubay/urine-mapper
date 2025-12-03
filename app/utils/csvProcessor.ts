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

export const parseCSV = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => {
                resolve(results.data);
            },
            error: (error) => {
                reject(error);
            },
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
