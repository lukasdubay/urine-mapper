# Fluorescence Spectroscopy Heatmap Tool PRD

## 1. Goal

Allow the user to upload a CSV file, apply correction factors to diluted columns, compute the row-wise MAX across corrected values, and visualize the data. The tool provides a 2D heatmap, an Excitation Maxima curve, peak detection, and downloadable results. All processing happens client-side.

## 2. Input Specification

Input: CSV with varying columns.

- **Required**: `Ex` (Excitation) and `Em` (Emission) columns (case-insensitive).
- **Dilution Columns**: Any other columns are treated as dilution samples (e.g., `18u0`, `18u2`...).
- **Format**: Handles standard CSVs (comma-separated with dots) and European formats (semicolons, commas for decimals).

## 3. Correction Factors

Map column names to multiplication factors.

- Default sequence: `1.0, 1.4, 2.2, 3.4, 5.0, 1.0`.
- Users can edit these factors via a dedicated settings panel.

## 4. Transformation Logic

For each row:

1. Identify dilution columns.
2. Multiply values by their respective user-defined factors.
3. **MaxF Calculation**: Compute `MaxF = max(corrected_values)`.
4. Output a 3-column dataset: `[Ex, Em, MaxF]`.

## 5. peak Detection & EX Max Curve

**Logic**:

- **EX Max Curve**: For each unique Excitation wavelength, find the global maximum fluorescence value across all Emissions.
- **Peak Detection**: Identify local maxima in this curve using a direction-change algorithm (rising → falling) to capture peaks and shoulders.

**Outputs**:

- **Line Chart**: Plots Flux vs. Ex, marking detected peaks.
- **Peaks Table**: Lists detected peaks (Ex, Em, MaxF).
- **Curve Data Table**: Full table of the EX Max curve points.

## 6. Visualization

**Heatmap**:

- X-axis: Excitation (Ex).
- Y-axis: Emission (Em).
- Z-axis: MaxF (normalized 0-1 for shape, actual values for tooltips).
- **Color Scale**:
  - **Auto**: Scale based on data max.
  - **Manual MaxF**: User sets the upper limit.
  - **Manual Steps**: User defines the number of color contour steps (3-20).

## 7. UI Requirements

Layout: **Sidebar + Main Content Grid**.

**Left Sidebar (Settings)**:

- **Correction Factors**: Editable inputs.
- **Color Scale**: Radio buttons (Auto, Manual MaxF, Manual Steps) and Stepper control.

**Main Content**:

1.  **Fluorescence Contour Map**: 2D interactive heatmap.
2.  **EX Max Analysis**:
    - **Chart**: Line chart with peak markers.
    - **Peaks Table**: Detected peaks list.
3.  **Curve Data**: Table showing all points from the EX Max curve (exportable).
4.  **All Processed Data**: Full dataset preview table (exportable).

**Download Options**:

- Export "All Processed Data" as `final_map.csv`.
- Export "Excitation Maxima Data" as `ex_max_curve.csv`.

## 8. Implementation Details

- **Tech Stack**: Next.js (App Router), React, Tailwind CSS, Plotly.js.
- **Processing**: Fully client-side (no server uploads).
- **Styling**: Consistent shadows, rounded corners, "Inter" font, secondary-style action buttons.

## 9. Definition of Done

The app must:

- [x] Parse complex CSVs (European formats).
- [x] Allow real-time factor editing.
- [x] Render Heatmap with manual color scale controls.
- [x] Detect and visualize EX Max peaks (Chart + Table).
- [x] Provide data downloads for both full data and curve data.
- [x] Be responsive and styled consistently.
