'use client';

import React from 'react';
import { ProcessedRow } from '../utils/csvProcessor';

interface DataPreviewProps {
    data: ProcessedRow[];
}

export default function DataPreview({ data }: DataPreviewProps) {
    if (!data || data.length === 0) return null;

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-normal text-gray-800">All Processed Data</h3>
                <p className="text-sm text-gray-500">Showing all {data.length} rows</p>
            </div>
            <div className="overflow-auto max-h-[400px]">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ex</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Em</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MaxF</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{row.Ex}</td>
                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{row.Em}</td>
                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{row.MaxF.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
