'use client';

import React from 'react';
import { ProcessedRow } from '../utils/csvProcessor';

interface DataPreviewProps {
    data: ProcessedRow[];
}

export default function DataPreview({ data }: DataPreviewProps) {
    if (!data || data.length === 0) return null;

    const previewRows = data.slice(0, 20);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800">Processed Data Preview</h3>
                <p className="text-sm text-gray-500">Showing first 20 rows</p>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ex</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Em</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MaxF</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {previewRows.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.Ex}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.Em}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.MaxF.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
