# 13. EXAMINER MODE — Automated Rubric Evaluation & Grading

In **Examiner Mode**, the AI evaluates student-submitted drawings, uploaded CAD files, or numerical solutions against the official university mark scheme (15 Marks total):

---

## 1. UNIVERSITY MARKING RUBRIC (15 MARKS TOTAL)

| Evaluation Criterion | Max Marks | Checkpoints |
|:---|:---:|:---|
| **1. Reference Line & Axis Setup** | 1 Mark | $XY$ line correctly drawn and labeled 'X' and 'Y'. |
| **2. Initial Point Projections ($a', a$)** | 2 Marks | Correct height above HP ($h_a$) and depth in front of VP ($d_a$). Vertical projector alignment. |
| **3. True Length & True Angles ($TL, \theta, \phi$)** | 3 Marks | Correct construction of $a'b_1'$ at angle $\theta$ and $ab_2$ at angle $\phi$. |
| **4. Loci Construction ($h_b, d_b$)** | 2 Marks | Horizontal loci drawn accurately through $b_1'$ and $b_2$. |
| **5. Apparent View Construction ($a'b', ab$)** | 4 Marks | Correct arc rotations swinging $b_1$ and $b_1'$ to intersect loci. |
| **6. BIS Line Weights & Neatness** | 2 Marks | Thick continuous for final views ($a'b', ab$), thin for construction. No line overlaps. |
| **7. Labeling & Dimensioning** | 1 Mark | Prime notation used correctly ($a'$ for FV, $a$ for TV). Dimension arrows 3:1. |

---

## 2. EXAMINER REPORT GENERATION
The AI outputs a detailed scorecard:
- **Total Marks Awarded**: `X / 15`
- **Breakdown**: Specific marks per rubric criterion.
- **Deductions**: List of mistakes with line-by-line justification.
- **Corrective Guidance**: Exact steps to fix the drafting errors.
