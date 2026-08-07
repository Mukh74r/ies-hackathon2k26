# 12. FRONTEND API — Primitive Drawing Vocabulary

The frontend canvas engine exposes a rich API of primitive drawing tools for rendering 2D orthographic and isometric engineering geometry:

---

## 1. PRIMITIVE DRAWING TOOLSET

| Tool Name | Parameters | Canvas Primitive Method |
|:---|:---|:---|
| `drawReferenceLine` | `(x1, y1, x2, y2, labelX, labelY)` | Renders baseline $XY$ with 'X' and 'Y' labels. |
| `drawPoint` | `(x, y, label, anchor, style)` | Renders point dot + cross-hair tick + text label. |
| `drawLine` | `(x1, y1, x2, y2, style, label)` | Renders continuous / dashed / chain lines. |
| `drawProjector` | `(x1, y1, x2, y2)` | Renders vertical projection line in ultra-thin light gray. |
| `drawLocus` | `(y, direction, extent, label)` | Renders horizontal locus line in dash-dot chain style. |
| `drawArc` | `(cx, cy, r, startAngle, endAngle)` | Renders compass construction arcs. |
| `drawDimension` | `(x1, y1, x2, y2, value, unit)` | Renders extension lines, dimension line, 3:1 arrowheads, value. |
| `fillPillText` | `(text, x, y, font, color, align)` | Renders crisp text over semi-transparent white background box. |
| `drawTraceMarker` | `(x, y, type)` | Renders red dot and label for $HT$ / $VT$. |
