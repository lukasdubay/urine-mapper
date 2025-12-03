'use client';

import React, { useState, useEffect, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import FactorInput from './components/FactorInput';
import DataPreview from './components/DataPreview';
import Heatmap from './components/Heatmap';
import {
  parseCSV,
  validateData,
  processData,
  generateCSV,
  DEFAULT_FACTORS,
  DEFAULT_FACTOR_SEQUENCE,
  ProcessingResult,
  extractDilutionColumns
} from './utils/csvProcessor';
import { Download, AlertCircle } from 'lucide-react';

export default function Home() {
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [rawData, setRawData] = useState<any[] | null>(null);
  const [factors, setFactors] = useState<Record<string, number>>(DEFAULT_FACTORS);
  const [processedData, setProcessedData] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = async (file: File) => {
    setError(null);
    setRawFile(file);
    setIsProcessing(true);
    try {
      const data = await parseCSV(file);
      const validation = validateData(data);
      if (!validation.valid) {
        setError(validation.message || 'Invalid CSV file.');
        setRawData(null);
        setProcessedData(null);
      } else {
        setRawData(data);

        // Extract columns and initialize factors with sequential defaults
        const columns = extractDilutionColumns(data);
        const newFactors: Record<string, number> = {};

        columns.forEach((col, index) => {
          // Use sequential default values, cycling if more than 6 columns
          const defaultValue = DEFAULT_FACTOR_SEQUENCE[index % DEFAULT_FACTOR_SEQUENCE.length];
          newFactors[col] = defaultValue;
        });

        setFactors(newFactors);

        // Auto-process on upload with new factors
        const result = processData(data, newFactors);
        setProcessedData(result);
      }
    } catch (err) {
      setError('Failed to parse CSV file.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFactorChange = useCallback((key: string, value: number) => {
    setFactors((prev) => {
      const newFactors = { ...prev, [key]: value };
      return newFactors;
    });
  }, []);

  // Re-process when factors or rawData change
  useEffect(() => {
    if (rawData) {
      const result = processData(rawData, factors);
      setProcessedData(result);
    }
  }, [rawData, factors]);

  const handleDownload = () => {
    if (!processedData) return;
    const csvContent = generateCSV(processedData.tableData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'final_map.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Urine Fluorescence Heatmap</h1>
        </header>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* File Upload */}
        <section>
          <FileUpload onFileSelect={handleFileSelect} />
          {rawFile && !error && (
            <p className="mt-2 text-sm text-green-600 text-center">
              File loaded: <span className="font-medium">{rawFile.name}</span>
            </p>
          )}
        </section>

        {/* Main Content Area - Only shown after upload */}
        {processedData && (
          <>
            {/* Correction Factors (left) and Heatmap (right) */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Correction Factors - Takes up 1 column */}
              <div className="lg:col-span-1">
                <FactorInput factors={factors} onChange={handleFactorChange} />
              </div>

              {/* Heatmap - Takes up 3 columns */}
              <div className="lg:col-span-3">
                <Heatmap data={processedData.heatmapData} />
              </div>
            </div>

            {/* Data Preview with Download Button */}
            <section className="relative">
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={handleDownload}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV
                </button>
              </div>
              <DataPreview data={processedData.tableData} />
            </section>
          </>
        )}
      </div>
    </div>
  );
}
