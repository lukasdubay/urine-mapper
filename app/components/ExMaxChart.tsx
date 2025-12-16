import React from 'react';
import dynamic from 'next/dynamic';
import { PeakResult, ExMaxPoint } from '../utils/peakDetection';

// Dynamically import Plotly with no SSR, as it requires window
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface ExMaxChartProps {
  exMaxSeries: ExMaxPoint[];
  peaks: PeakResult[];
}

export default function ExMaxChart({ exMaxSeries, peaks }: ExMaxChartProps) {
  // Prepare data for the line chart
  const xData = exMaxSeries.map(p => p.Ex);
  const yData = exMaxSeries.map(p => p.MaxF);

  // Prepare data for the peak markers
  const peakX = peaks.map(p => p.Ex);
  const peakY = peaks.map(p => p.MaxF);
  const peakText = peaks.map(p => `Ex: ${p.Ex}, Em: ${p.Em}, F: ${p.MaxF.toFixed(0)}`);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-regular text-gray-900 mb-4 px-2">Excitation Maxima Curve</h3>
      <div className="w-full h-[400px]">
        <Plot
          data={[
            {
              x: xData,
              y: yData,
              type: 'scatter',
              mode: 'lines',
              name: 'EX Max',
              line: { color: '#2563eb' } // Blue-600
            },
            {
              x: peakX,
              y: peakY,
              type: 'scatter',
              mode: 'markers',
              name: 'Peaks',
              marker: { color: '#ef4444', size: 10 }, // Red-500
              text: peakText,
              hoverinfo: 'text'
            }
          ]}
          layout={{
            autosize: true,
            margin: { l: 50, r: 20, t: 20, b: 50 },
            xaxis: {
              title: { text: 'Excitation Wavelength (Ex)' },
              showgrid: true,
              zeroline: false
            },
            yaxis: {
              title: { text: 'Max Fluorescence' },
              showgrid: true,
              zeroline: false
            },
            showlegend: true,
            legend: {
              x: 1,
              xanchor: 'right',
              y: 1
            }
          }}
          useResizeHandler={true}
          style={{ width: '100%', height: '100%' }}
          config={{ displayModeBar: false }}
        />
      </div>
    </div>
  );
}
