import React, { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

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

    const handleStepIncrement = () => {
        const currentSteps = config.manualSteps || 9;
        if (currentSteps < 20) {
            onChange({ ...config, manualSteps: currentSteps + 1 });
        }
    };

    const handleStepDecrement = () => {
        const currentSteps = config.manualSteps || 9;
        if (currentSteps > 3) {
            onChange({ ...config, manualSteps: currentSteps - 1 });
        }
    };

    const showMaxFInput = config.mode === 'MANUAL_MAXF' || config.mode === 'MANUAL_MAXF_AND_STEPS';
    const showStepsSelector = config.mode === 'MANUAL_MAXF_AND_STEPS';

    return (
        <div className="bg-white rounded-lg">
            <h3 className="text-base font-normal mb-4 text-gray-800">Color Scale</h3>

            {/* Radio Group */}
            <div className="flex flex-col space-y-2 mb-4">
                <label className="text-sm flex items-center cursor-pointer">
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

                <label className="text-sm flex items-center cursor-pointer">
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

                <label className="text-sm flex items-center cursor-pointer">
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
                <div className="mt-4 space-y-4">
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Colour steps
                            </label>
                            <div className="flex items-center space-x-3 mt-2">
                                <button
                                    onClick={handleStepDecrement}
                                    disabled={(config.manualSteps || 9) <= 3}
                                    className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    type="button"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                
                                <span className="text-sm font-medium text-gray-900 w-8 text-center">
                                    {config.manualSteps || 9}
                                </span>

                                <button
                                    onClick={handleStepIncrement}
                                    disabled={(config.manualSteps || 9) >= 20}
                                    className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    type="button"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
