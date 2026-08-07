# 20. KNOWLEDGE BASE — Master Benchmark & Reference Catalogue

The Knowledge Base is the central repository of structured solutions for KTU / BIS University Examinations, fully compliant with the `08_JSON_SCHEMA.json` standard:

---

## 1. BENCHMARK SCHEMA EXAMPLE

```json
{
  "problem_type": "ProjectionOfLines",
  "question": "A line AB 90mm long has its end A 20mm above HP and 30mm in front of VP. The line is inclined at 30° to HP and 40° to VP. Draw its projections and find apparent inclinations.",
  "given": {
    "[1] True Length (TL)": "90mm",
    "[2] End A height (a')": "20mm above HP",
    "[3] End A depth (a)": "30mm in front of VP",
    "[4] True Angle to HP (θ)": "30°",
    "[5] True Angle to VP (φ)": "40°"
  },
  "required": {
    "front_view_length": "a'b'",
    "top_view_length": "ab",
    "apparent_hp_angle": "α",
    "apparent_vp_angle": "β"
  },
  "quadrant": "First Quadrant",
  "method": "Rotation Method",
  "construction_summary": [
    "Step 1: Draw XY line.",
    "Step 2: Plot a' at +20mm and a at -30mm on vertical projector.",
    "Step 3: Draw locus of b' at y = 65mm and locus of b at y = -87.85mm.",
    "Step 4: Draw TL in FV (a'b1') at 30° to XY.",
    "Step 5: Draw TL in TV (ab2) at 40° to XY.",
    "Step 6: Project b1' to b1 on locus of a.",
    "Step 7: Arc from a with radius ab1 cuts locus of b at point b.",
    "Step 8: Project b vertically up to intersect locus of b' at point b'. Join a'b' and ab."
  ],
  "geometry": {
    "a_prime": [0, 20],
    "a": [0, -30],
    "b1_prime": [77.94, 65.00],
    "b2": [68.94, -87.85],
    "b_prime": [52.26, 65.00],
    "b": [52.26, -87.85]
  },
  "answers": [
    "[1] Front View Length (a'b') = 68.94 mm",
    "[2] Top View Length (ab) = 77.94 mm",
    "[3] Apparent Angle with HP (α) = 40.73°",
    "[4] Apparent Angle with VP (β) = 47.90°"
  ],
  "verification": {
    "is_valid": true,
    "checks": [
      "Vertical Projector Alignment: x(b') == x(b) == 52.26mm",
      "Locus Height: y(b') == 65.00mm, y(b) == -87.85mm",
      "Angle Sum: θ + φ = 70° <= 90°"
    ]
  },
  "exam_notes": [
    "Always draw final projections a'b' and ab in thick dark lines.",
    "Do not erase construction arcs — examiners award 3 marks for visible arcs."
  ],
  "common_mistakes": [
    "Using cos(θ) for front view length instead of cos(φ).",
    "Failing to align b' and b on the same vertical projector."
  ]
}
```
