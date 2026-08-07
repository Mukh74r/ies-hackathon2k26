# 10. RENDERING PROTOCOL — Backend to Frontend Canvas Contract

The backend **NEVER** returns raw text instructions like *"Draw a line from A to B"*. Instead, it returns declarative JSON entity definitions that the HTML5 Canvas engine executes:

---

## 1. DECLARATIVE ENTITY CONTRACTS

### Line Object
```json
{
  "type": "line",
  "id": "fv_apparent",
  "from": [0, 20],
  "to": [52.26, 65.00],
  "style": "object",
  "label": "a'b'",
  "step": 7
}
```

### Point Marker
```json
{
  "type": "point",
  "id": "a_prime",
  "label": "a'",
  "x": 0,
  "y": 20,
  "style": "endpoint",
  "anchor": "top-left",
  "step": 1
}
```

### Horizontal Locus
```json
{
  "type": "locus",
  "id": "locus_b_prime",
  "through": [0, 65.00],
  "direction": "horizontal",
  "extent": 120,
  "label": "Locus of b'",
  "step": 2
}
```

### Rotation Arc
```json
{
  "type": "arc",
  "id": "arc_b_prime",
  "center": [0, 20],
  "radius": 68.94,
  "startAngle": 0,
  "endAngle": 40.73,
  "style": "construction",
  "step": 7
}
```

---

## 2. CANVAS COORDINATE TRANSFORMATION
The backend works in standard **Cartesian Engineering Coordinates** (mm):
- $x = 0$: Projector through Point $A$.
- $y = 0$: $XY$ Reference Line.
- $+y$: Front View (Above $XY$).
- $-y$: Top View (Below $XY$).

The frontend transforms Cartesian $(x, y)$ to High-DPI Canvas pixels via:
$$\text{canvasX} = C_x + x \cdot \text{scale}$$
$$\text{canvasY} = C_y - y \cdot \text{scale}$$
where $(C_x, C_y)$ is the origin shift center on the HTML5 Canvas.
