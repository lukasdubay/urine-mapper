# Fluorescence Spectroscopy Heatmap Tool PRD

## 1. Goal
Allow the user to upload a CSV file, apply 6 correction factors to 6 diluted columns, compute the row-wise MAX across corrected values, output a 3-column table [Ex, Em, MaxF], and render a 2D heatmap. All processing must happen client-side.

## 2. Input Specification
Input: CSV with 8 columns.
- Ex
- Em
- Six diluted sample columns. Names vary (e.g. 18u0, 18u2, 18u8, 18u32, 18u128, 18u512). Order is not guaranteed.

Example header:
`Ex,Em,18u0,18u2,18u8,18u32,18u128,18u512`

## 3. Correction Factors
Map column names to multiplication factors:
- 18u0 → 1.0
- 18u2 → 1.4
- 18u8 → 2.2
- 18u32 → 3.4
- 18u128 → 5.0
- 18u512 → 1.0

These factors must be editable through the UI.

## 4. Transformation Logic
For each row:
1. Identify the 6 diluted columns and match them to factors by column name.
2. Multiply each diluted value by its factor, producing 6 corrected values.
3. Compute MaxF = max(corrected_1 … corrected_6).

## 5. Output Table
Final output table contains exactly 3 columns:
- Ex
- Em
- MaxF

Allow the user to download this as `final_map.csv`.

## 6. 2D Visualization
Generate a heatmap (or contour plot) from the final data.

**Data preparation:**
- Extract sorted unique Ex values → x-axis.
- Extract sorted unique Em values → y-axis.
- Build z-matrix where z[row][col] = MaxF for the (Ex,Em) pair.

**Visualization requirements:**
- Render using Plotly.js or Apache ECharts.
- Must support zoom/pan.
- Must display tooltip showing Ex, Em, MaxF.
- Must show color legend.

## 7. UI Requirements
Single-page app with four sections:

**File Upload:**
- Accept CSV only.
- Parse and preview first 20 rows.
- Validate that Ex, Em, and 6 diluted columns exist.

**Factor Inputs:**
- Six numeric inputs with default values (1.0, 1.4, 2.2, 3.4, 5.0, 1.0).

**Compute:**
- Run full pipeline and display:
    - Processed table preview (first 20 rows).
    - 2D heatmap.

**Download:**
- Download processed table as `final_map.csv`.

## 8. Error Handling
- If Ex or Em columns are missing, show error.
- If fewer than 6 dilution columns are present, show error.
- If column names do not match expected pattern, show warning.
- Handle non-numeric values gracefully.
- Ignore empty rows.
- No crashes; show readable messages.

## 9. Implementation Requirements
**Technology suggestions:**
- React or Next.js App Router.
- TailwindCSS for styling.
- Papaparse for CSV parsing.
- Plotly.js for heatmap.
- All compute done client-side.
- Deploy as static site (Vercel or Netlify).

**File processing steps:**
1. Parse CSV → JS array.
2. Identify dilution columns by header names.
3. Multiply by factors.
4. Produce final rows [{ Ex, Em, MaxF }].
5. Build heatmap grid { x, y, z }.
6. Render heatmap.
7. Enable CSV download.

## 10. Non-Goals
- No backend.
- No database.
- No authentication.
- No persistence.
- No PDF generation.

## 11. Definition of Done
The generated app must:
- Parse and validate CSV files.
- Allow editing 6 factors.
- Correctly compute MaxF.
- Display preview and heatmap.
- Enable CSV download.
- Run entirely client-side.
- Have no console errors.
- Be responsive on desktop.
