'use client';

import React, { useState } from 'react';

export interface ColorScaleConfig {
    mode: 'AUTO' | 'MANUAL_MAXF' | 'MANUAL_MAXF_AND_STEPS';
    manualMaxF: number | null;
    manualSteps: number | null;
}

interface ColorScaleControlProps {
    config: ColorScaleConfig;
    onChange: (config: ColorScaleConfig) => void;
    currentAutoMaxF: number;
}

export default function ColorScaleControl({ config, onChange, currentAutoMaxF }: ColorScaleControlProps) {
    const [maxFInput, setMaxFInput] = useState<string>(config.manualMaxF?.toString() || '');
    const [maxFError, setMaxFError] = useState<string | null>(null);

    const handleModeChange = (newMode: ColorScaleConfig['mode']) => {
        onChange({
            ...config,
            mode: newMode,
        });
    };

    const handleMaxFChange = (value: string) => {
        setMaxFInput(value);

        // Validate input
        if (value.trim() === '') {
            setMaxFError('MaxF is required');
            return;
        }

        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
            setMaxFError('MaxF must be a valid number');
            return;
        }

        if (numValue <= 0) {
            setMaxFError('MaxF must be greater than 0');
            return;
        }

        // Valid input
        setMaxFError(null);
        onChange({
            ...config,
            manualMaxF: numValue,
        });
    };

    const handleStepsChange = (value: string) => {
        const numValue = parseInt(value, 10);
        onChange({
            ...config,
            manualSteps: numValue,
        });
    };

    const showMaxFInput = config.mode === 'MANUAL_MAXF' || config.mode === 'MANUAL_MAXF_AND_STEPS';
    const showStepsSelector = config.mode === 'MANUAL_MAXF_AND_STEPS';

    return (
        <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Color Scale</h3>

            {/* Radio Group */}
            <div className="flex gap-4 mb-4">
                <label className="flex items-center cursor-pointer">
                    <input
                        type="radio"
                        name="colorScaleMode"
                        value="AUTO"
                        checked={config.mode === 'AUTO'}
                        onChange={() => handleModeChange('AUTO')}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-medium text-gray-900">Auto</span>
                </label>

                <label className="flex items-center cursor-pointer">
                    <input
                        type="radio"
                        name="colorScaleMode"
                        value="MANUAL_MAXF"
                        checked={config.mode === 'MANUAL_MAXF'}
                        onChange={() => handleModeChange('MANUAL_MAXF')}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-medium text-gray-900">Manual MaxF</span>
                </label>

                <label className="flex items-center cursor-pointer">
                    <input
                        type="radio"
                        name="colorScaleMode"
                        value="MANUAL_MAXF_AND_STEPS"
                        checked={config.mode === 'MANUAL_MAXF_AND_STEPS'}
                        onChange={() => handleModeChange('MANUAL_MAXF_AND_STEPS')}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-medium text-gray-900">
                        Manual MaxF + Steps
                    </span>
                </label>
            </div>

            {/* Conditional Inputs */}
            {showMaxFInput && (
                <div className="mt-4">
                    <div className={showStepsSelector ? "grid grid-cols-2 gap-4" : ""}>
                        <div>
                            <label htmlFor="maxF-input" className="block text-sm font-medium text-gray-700 mb-1">
                                MaxF
                                <span className="text-gray-500 ml-2 font-normal">
                                    (Current auto: {currentAutoMaxF.toFixed(2)})
                                </span>
                            </label>
                            <input
                                id="maxF-input"
                                type="number"
                                step="0.1"
                                min="0.1"
                                value={maxFInput}
                                onChange={(e) => handleMaxFChange(e.target.value)}
                                placeholder="e.g. 100"
                                className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                                    maxFError
                                        ? 'border-red-300 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            />
                            {maxFError && (
                                <p className="text-sm text-red-600 mt-1">{maxFError}</p>
                            )}
                        </div>

                        {showStepsSelector && (
                            <div>
                                <label htmlFor="steps-selector" className="block text-sm font-medium text-gray-700 mb-1">
                                    Colour steps
                                </label>
                                <input
                                    id="steps-selector"
                                    type="number"
                                    min="3"
                                    max="20"
                                    step="1"
                                    value={config.manualSteps || 9}
                                    onChange={(e) => handleStepsChange(e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
