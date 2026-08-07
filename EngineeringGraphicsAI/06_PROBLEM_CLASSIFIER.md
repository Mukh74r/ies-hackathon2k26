# 06. PROBLEM CLASSIFIER — Topic & Taxonomy Engine

Before executing mathematical solving or generating geometry, the AI MUST classify the user's input problem into a formal taxonomy tree:

---

## 1. TAXONOMY CLASSIFICATION TREE

```
Problem Input
 └── Primary Topic (e.g., Projection of Lines)
      ├── Given Parameters (e.g., TL + θ + φ + A_pos)
      ├── Quadrant (1st, 2nd, 3rd, 4th)
      ├── Solution Method (Rotation Method / Trapezoid Method / Auxiliary Plane Method)
      ├── Special Features Required (HT, VT, Apparent Angles α, β)
      └── Unknowns to Solve (Apparent View lengths, Apparent Inclinations)
```

---

## 2. PROBLEM CLASSIFICATION CATEGORIES

### Category A: Projection of Points
- **Point Position**: Above/Below HP, In front of/Behind VP.
- **Quadrant**: 1st ($+y, -y$), 2nd ($+y, +y$), 3rd ($-y, +y$), 4th ($-y, -y$).

### Category B: Projection of Lines
- **Type 1 (Standard)**: Given $TL, \theta, \phi$, position of end $A$. Solve for $a'b', ab, \alpha, \beta, HT, VT$.
- **Type 2 (Apparent Views Given)**: Given lengths $a'b', ab$ and position of $A$. Solve for $TL, \theta, \phi$.
- **Type 3 (Traces Given)**: Given $HT, VT$ and positions. Solve for $TL$ and projections.
- **Type 4 (Distance Between Projectors Given)**: Given $D$ (distance between projectors of $A$ & $B$).

### Category C: Projection of Planes
- **Surface Inclined to HP**: Plane resting on edge/corner in HP, inclined at $\theta$ to HP.
- **Surface Inclined to VP**: Plane resting on edge/corner in VP, inclined at $\phi$ to VP.
- **Oblique Plane**: Surface inclined to HP and edge inclined to VP.

### Category D: Projection of Solids
- **Simple Position**: Axis perpendicular to one plane.
- **Single Inclination**: Axis inclined to HP / parallel to VP.
- **Double Inclination**: Axis inclined to HP and VP.

### Category E: Sections & Developments
- **Section of Solid**: Cutting plane AIP / AVP intersecting solid.
- **Development**: Unwrapping surface using Parallel Line or Radial Line method.
