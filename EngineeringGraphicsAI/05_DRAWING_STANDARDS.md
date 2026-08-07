# 05. DRAWING STANDARDS — BIS SP:46 / ISO 128 Specifications

## 1. LINE TYPES, WEIGHTS & STYLES

| Line Type | Application | Appearance in Canvas | Stroke Width | Hex Color |
|:---|:---|:---|:---|:---|
| **Visible Line (Type A)** | Main Outline, Final Projections ($a'b', ab$) | Solid Thick | 2.5 px | `#0f172a` (Slate 900) |
| **Construction Line (Type B)** | True Length Lines ($a'b_1', ab_2$), Helper Lines | Solid Thin | 1.0 px | `#64748b` (Slate 500) |
| **Projector Line** | Vertical projectors connecting FV & TV | Solid Ultra-Thin | 0.8 px | `#cbd5e1` (Slate 300) |
| **Hidden Line (Type F)** | Edges behind visible surfaces | Dashed `[5, 5]` | 1.2 px | `#475569` (Slate 600) |
| **Centre Line (Type G)** | Axes of rotation, symmetrical lines | Long-Short Dash `[12, 3, 3, 3]` | 1.0 px | `#2563eb` (Blue 600) |
| **Locus Line** | Loci of points ($h_b, d_b$) | Long-Short Dash `[14, 3, 2, 3]` | 1.0 px | `#475569` (Slate 600) |
| **Dimension Line** | Dimensioning lengths & heights | Solid Thin with Arrowheads | 1.0 px | `#475569` (Slate 600) |
| **Reference Line (XY)** | Baseline separating VP and HP | Solid Medium | 1.5 px | `#0f172a` (Slate 900) |

---

## 2. ARROWHEAD & DIMENSIONING CONVENTIONS
- **Arrowhead Proportion**: Length to Width ratio is $3:1$. Closed and filled black arrowheads.
- **Dimension Placement**: Aligned system according to BIS SP:46 — text placed above and parallel to the dimension line.
- **Units**: All dimensions are in **millimeters (mm)** unless explicitly specified otherwise.

---

## 3. CANVAS LAYERING ORDER (Z-INDEX)
1. **Layer 0**: Grid & Paper Background
2. **Layer 1**: $XY$ Reference Line & VP/HP Plane Labels
3. **Layer 2**: Locus Lines & Projector Lines
4. **Layer 3**: Construction Lines & Auxiliary Arcs
5. **Layer 4**: Final Projection Lines ($a'b', ab$) & Point Markers
6. **Layer 5**: Text Labels with Background Masking Pills (Pill Overlay)
