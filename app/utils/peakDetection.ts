import { HeatmapData } from './csvProcessor';

export interface PeakResult {
  Ex: number;
  Em: number;
  MaxF: number;
}

export interface ExMaxPoint {
  Ex: number;
  MaxF: number;
  Em: number; // Em at which MaxF occurred
}

export const detectExMaxPeaks = (heatmapData: HeatmapData): { peaks: PeakResult[], exMaxSeries: ExMaxPoint[] } => {
  const { x, y, z } = heatmapData;
  
  if (!x || x.length === 0 || !z || z.length === 0) {
    return { peaks: [], exMaxSeries: [] };
  }

  // 1. Compute MaxF series for each Ex
  // z[i][j] where i is y-index (Em), j is x-index (Ex)
  // We want to iterate over Ex (columns) and find max Z in that column
  
  const exMaxSeries: ExMaxPoint[] = [];

  for (let j = 0; j < x.length; j++) {
    const currentEx = x[j];
    let maxVal = -Infinity;
    let maxEm = -1;

    for (let i = 0; i < y.length; i++) {
        // z[i] might be undefined if data is sparse or structure mismatch, safe check
        if (z[i] && typeof z[i][j] === 'number') {
            const val = z[i][j];
            if (val > maxVal) {
                maxVal = val;
                maxEm = y[i];
            }
        }
    }

    if (maxVal > -Infinity) {
        exMaxSeries.push({
            Ex: currentEx,
            MaxF: maxVal,
            Em: maxEm
        });
    }
  }

  // 2. Detect local maxima
  // We use a direction-state approach to handle plateaus and ensure sensitivity.
  // We consider a point a peak if we were rising (or flat after rising) and then drop.
  
  const peaks: PeakResult[] = [];
  
  if (exMaxSeries.length > 0) {
      let isRising = false;
      // Initialize state based on first two points if possible
      if (exMaxSeries.length > 1) {
          if (exMaxSeries[1].MaxF > exMaxSeries[0].MaxF) {
              isRising = true;
          }
      }

      for (let k = 1; k < exMaxSeries.length; k++) {
        const prev = exMaxSeries[k - 1];
        const curr = exMaxSeries[k];
        
        if (curr.MaxF > prev.MaxF) {
            isRising = true;
        } else if (curr.MaxF < prev.MaxF) {
            if (isRising) {
                // We were rising, now we are falling -> PREVIOUS point was the peak
                // (or the end of a plateau)
                peaks.push({
                    Ex: prev.Ex,
                    Em: prev.Em,
                    MaxF: prev.MaxF
                });
                isRising = false;
            }
        }
        // If equal, do not change isRising state (treat as plateau)
      }
      
      // Edge case: if we end while rising, the last point might be a peak?
      // Usually local maxima strictly require a drop afterwards. 
      // Users usually don't count the very last point as a "local" max if it doesn't go down.
      // We will stick to the standard definition: rising then falling.
  }

  return { peaks, exMaxSeries };
};
