'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { HeatmapData } from '../utils/csvProcessor';

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface HeatmapProps {
    data: HeatmapData;
}

export default function Heatmap({ data }: HeatmapProps) {
    if (!data || !data.z || data.z.length === 0) return null;

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 w-full h-[600px]">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Fluorescence Contour Map</h3>
            <div className="w-full h-full">
                <Plot
                    data={[
                        {
                            x: data.x,
                            y: data.y,
                            z: data.z,
                            type: 'contour',
                            colorscale: 'Jet',
                            contours: {
                                coloring: 'heatmap',
                                showlabels: true,
                                labelfont: {
                                    size: 10,
                                    color: 'white',
                                },
                                size: undefined, // Auto-calculate contour spacing
                                start: undefined, // Auto-calculate start
                                end: undefined, // Auto-calculate end
                            },
                            ncontours: 50, // Increase number of contour levels for more precision
                            colorbar: {
                                title: {
                                    text: 'MaxF',
                                    side: 'right',
                                },
                                thickness: 20,
                                len: 0.9,
                            },
                            hovertemplate: 'Ex: %{x}<br>Em: %{y}<br>MaxF: %{z:.2f}<extra></extra>',
                            line: {
                                smoothing: 0.5, // Reduced smoothing for flatter contours
                                width: 0.5,
                            },
                        },
                    ]}
                    layout={{
                        autosize: true,
                        margin: { t: 20, r: 80, b: 50, l: 60 },
                        xaxis: {
                            title: { text: 'Excitation (Ex)' },
                            showgrid: false,
                        },
                        yaxis: {
                            title: { text: 'Emission (Em)' },
                            showgrid: false,
                        },
                        plot_bgcolor: '#000033',
                        paper_bgcolor: 'white',
                    }}
                    useResizeHandler={true}
                    style={{ width: '100%', height: '100%' }}
                    config={{ responsive: true }}
                />
            </div>
        </div>
    );
}
