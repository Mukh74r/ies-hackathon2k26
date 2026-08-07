# 17. FORMULAS — Mathematical Mechanics of Geometry

---

## 1. LINE PROJECTION FORMULAS

### Apparent Length Equations
$$\text{Front View Length } (a'b') = TL \cdot \cos\phi$$
$$\text{Top View Length } (ab) = TL \cdot \cos\theta$$

### Height & Depth Equations
$$h_b = h_a + TL \cdot \sin\theta \quad (\text{Height of locus of } b' \text{ above HP})$$
$$d_b = d_a + TL \cdot \sin\phi \quad (\text{Depth of locus of } b \text{ below VP})$$

### Lateral Offset Equation
$$x_b = \sqrt{(a'b')^2 - (h_b - h_a)^2} = \sqrt{(ab)^2 - (d_b - d_a)^2}$$

### Apparent Angle Equations
$$\tan\alpha = \frac{h_b - h_a}{x_b} \implies \alpha = \arctan\left(\frac{h_b - h_a}{x_b}\right)$$
$$\tan\beta = \frac{d_b - d_a}{x_b} \implies \beta = \arctan\left(\frac{d_b - d_a}{x_b}\right)$$

### Verification Invariant
$$\cos^2\theta + \cos^2\phi \ge 1 \quad (\text{Fundamental 3D Line Existence Constraint})$$

---

## 2. TRACE FORMULAS
- **Horizontal Trace ($HT$)**: 
  - Extend Front View $a'b'$ to meet $XY$ at point $h'$.
  - Project vertically down from $h'$ to intersect the extended Top View $ab$ at $HT$.
  - Distance of $HT$ from $XY = d_{HT} = \frac{h_a \cdot d_b - h_b \cdot d_a}{h_b - h_a}$.

- **Vertical Trace ($VT$)**: 
  - Extend Top View $ab$ to meet $XY$ at point $v$.
  - Project vertically up from $v$ to intersect the extended Front View $a'b'$ at $VT$.
  - Height of $VT$ above $XY = h_{VT} = \frac{d_a \cdot h_b - d_b \cdot h_a}{d_b - d_a}$.
