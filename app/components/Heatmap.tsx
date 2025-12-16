'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { HeatmapData } from '../utils/csvProcessor';
import { ColorScaleConfig } from './ColorScaleControl';

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface HeatmapProps {
    data: HeatmapData;
    colorScaleConfig: ColorScaleConfig;
}

export default function Heatmap({ data, colorScaleConfig }: HeatmapProps) {
    // Calculate data maximum (shape normalization - always the same)
    const dataMax = useMemo(() => {
        if (!data || !data.z || data.z.length === 0) return 100;
        const flatValues = data.z.flat();
        return Math.max(...flatValues);
    }, [data]);

    // Normalize data for shape preservation (v_rel = v / dataMax)
    const normalizedZ = useMemo(() => {
        if (!data || !data.z || data.z.length === 0) return [];
        return data.z.map(row => row.map(val => val / dataMax));
    }, [data, dataMax]);

    // Calculate color scale maximum (intensity control)
    const colorScaleMax = useMemo(() => {
        if (colorScaleConfig.mode === 'AUTO') {
            return dataMax; // Show actual data range
        } else {
            return colorScaleConfig.manualMaxF || dataMax;
        }
    }, [colorScaleConfig.mode, colorScaleConfig.manualMaxF, dataMax]);

    // Calculate number of contours based on mode
    const ncontours = useMemo(() => {
        if (colorScaleConfig.mode === 'AUTO') {
            return 50; // Current default for auto mode
        } else if (colorScaleConfig.mode === 'MANUAL_MAXF') {
            return 9; // Constant steps for manual MaxF mode
        } else {
            // MANUAL_MAXF_AND_STEPS: use user-provided value
            return colorScaleConfig.manualSteps || 9;
        }
    }, [colorScaleConfig.mode, colorScaleConfig.manualSteps]);

    // Generate custom colorbar ticks (show actual values)
    const colorbarTicks = useMemo(() => {
        const tickvals: number[] = [];
        const ticktext: string[] = [];
        
        // Generate evenly spaced ticks
        const numTicks = Math.min(ncontours + 1, 11); // Cap at 11 ticks for readability
        
        for (let i = 0; i <= numTicks; i++) {
            const normalizedVal = i / numTicks; // 0 → 1
            const displayVal = normalizedVal * colorScaleMax; // Actual value
            
            tickvals.push(normalizedVal);
            ticktext.push(displayVal.toFixed(1));
        }
        
        return { tickvals, ticktext };
    }, [ncontours, colorScaleMax]);

    if (!data || !data.z || data.z.length === 0) return null;

    return (
        <div className="bg-white p-4 rounded-lg shadow w-full h-[600px] overflow-hidden">
            <h3 className="text-lg font-normal mb-4 text-gray-800">Fluorescence Contour Map</h3>
            <div className="w-full h-[calc(100%-2.5rem)]">
                <Plot
                    data={[
                        {
                            x: data.x,
                            y: data.y,
                            z: normalizedZ, // ✅ Always normalized 0→1
                            customdata: data.z, // ✅ Original values for hover
                            type: 'contour',
                            colorscale: 'Jet',
                            connectgaps: true,
                            zmin: 0,
                            zmax: 1, // ✅ Always 1 (normalized)
                            contours: {
                                coloring: 'heatmap',
                                showlabels: true,
                                labelfont: {
                                    size: 10,
                                    color: 'white',
                                },
                                start: 0,
                                end: 1, // ✅ Always 1 (normalized)
                                size: 1 / ncontours, // ✅ Based on normalized range
                            },
                            ncontours: ncontours,
                            colorbar: {
                                title: {
                                    text: 'MaxF',
                                    side: 'right',
                                },
                                thickness: 20,
                                len: 0.9,
                                tickvals: colorbarTicks.tickvals, // ✅ Custom tick positions
                                ticktext: colorbarTicks.ticktext, // ✅ Custom tick labels (actual values)
                            },
                            hovertemplate: 'Ex: %{x}<br>Em: %{y}<br>MaxF: %{customdata:.2f}<extra></extra>',
                            line: {
                                smoothing: 0.5,
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
                        plot_bgcolor: 'white',
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
