# 19. VERIFICATION ENGINE — Mathematical & Geometric Invariants

Before any geometry payload is sent to the frontend, the Verification Engine runs 8 strict sanity checks:

---

## 1. SANITY CHECK MATRIX

```
Check 1: Quadrant Sanity Check
    ├── Verify y-coordinate signs match quadrant rules
    └── (e.g., 1st Quadrant: y_fv > 0, y_tv < 0)

Check 2: Vertical Projector Alignment Check
    ├── x(a') == x(a)
    └── x(b') == x(b)

Check 3: Locus Height Consistency Check
    ├── y(b') == y(b1') == h_b
    └── y(b) == y(b2) == -d_b

Check 4: True Length Conservation Check
    ├── distance(a', b1') == TL ± 0.01mm
    └── distance(a, b2) == TL ± 0.01mm

Check 5: Arc Sweep Radius Check
    ├── radius(fv_arc) == distance(a', b1')
    └── radius(tv_arc) == distance(a, b1)

Check 6: Angle Sum Check
    └── θ + φ ≤ 90°

Check 7: Apparent Angle Dominance Check
    ├── α ≥ θ
    └── β ≥ φ

Check 8: Non-Overlapping Label Anchor Check
    └── Ensure point labels have distinct anchor offsets ('top-left', 'bottom-right', etc.)
```
