# 15. DATASET — Structured KTU/BIS University Exam Bank

The `15_DATASET/` directory contains structured JSON benchmarks for all 7 modules of university-level Engineering Graphics examinations:

---

## DIRECTORY STRUCTURE

- `ProjectionOfLines/`: 50 solved standard line projection problems.
- `ProjectionOfPlanes/`: 30 solved plane inclination problems.
- `ProjectionOfSolids/`: 30 solved solid inclination problems (prisms, pyramids, cones).
- `Sections/`: 25 section plane cut problems.
- `Developments/`: 20 surface unwrapping problems.
- `Orthographic/`: 15 3D-to-2D conversion problems.
- `Isometric/`: 15 orthographic-to-isometric conversion problems.

---

## SAMPLE DATASET ENTRY FORMAT (`ProjectionOfLines/sample_01.json`)

```json
{
  "problem_id": "LINE_001",
  "university": "KTU / Anna University / VTU",
  "input": "A line AB 90mm long has its end A 20mm above HP and 30mm in front of VP. The line is inclined at 30° to HP and 40° to VP. Draw its projections and find apparent inclinations.",
  "classification": {
    "topic": "Projection of Lines",
    "quadrant": "First",
    "method": "Rotation Method"
  },
  "given": {
    "[1] AB": "90mm",
    "[2] A": "20 aHP",
    "[3] A": "30 fVP",
    "[4] θ": "30°",
    "[5] φ": "40°"
  },
  "answers": [
    "[1] Front View Length (a'b') = 68.94 mm",
    "[2] Top View Length (ab) = 77.94 mm",
    "[3] Apparent Angle with HP (α) = 40.73°",
    "[4] Apparent Angle with VP (β) = 47.90°"
  ]
}
```
