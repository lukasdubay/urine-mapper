'use client';

import React from 'react';

interface FactorInputProps {
    factors: Record<string, number>;
    onChange: (key: string, value: number) => void;
}

export default function FactorInput({ factors, onChange }: FactorInputProps) {
    return (
        <div className="bg-white rounded-lg h-full">
            <h3 className="text-base font-semibold mb-4 text-gray-800">Correction Factors</h3>
            <div className="space-y-3">
                {Object.entries(factors).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                        <label htmlFor={`factor-${key}`} className="text-sm font-medium text-gray-600 mb-1">
                            {key}
                        </label>
                        <input
                            id={`factor-${key}`}
                            type="number"
                            step="0.1"
                            value={value}
                            onChange={(e) => onChange(key, parseFloat(e.target.value))}
                            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
