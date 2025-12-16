import React from 'react';
import { PeakResult } from '../utils/peakDetection';

interface ExMaxTableProps {
  peaks: PeakResult[];
}

export default function ExMaxTable({ peaks }: ExMaxTableProps) {
  if (!peaks || peaks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        No local maxima detected.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Detected Peaks</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                EX max
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                EM max
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                MaxF
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {peaks.map((peak, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {peak.Ex}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {peak.Em}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {peak.MaxF.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
