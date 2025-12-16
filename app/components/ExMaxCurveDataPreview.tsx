'use client';

import React from 'react';
import { ExMaxPoint } from '../utils/peakDetection';
import { Download } from 'lucide-react';

interface ExMaxCurveDataPreviewProps {
    data: ExMaxPoint[];
}

export default function ExMaxCurveDataPreview({ data }: ExMaxCurveDataPreviewProps) {
    if (!data || data.length === 0) return null;

    const handleDownload = () => {
        // Generate CSV content for this specific table
        const header = 'Ex,Em,MaxF\n';
        const rows = data.map(row => `${row.Ex},${row.Em},${row.MaxF}`).join('\n');
        const csvContent = header + rows;
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'ex_max_curve.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-normal text-gray-800">Excitation Maxima Data</h3>
                    <p className="text-sm text-gray-500">Showing {data.length} points from the curve</p>
                </div>
                <button
                    onClick={handleDownload}
                    className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Download CSV
                </button>
            </div>
            <div className="overflow-auto max-h-[400px]">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ex</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Em (at Max)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MaxF</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{row.Ex}</td>
                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{row.Em}</td>
                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{row.MaxF.toFixed(0)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
