# 11. ERROR HANDLING — Graceful Guardrails & Validation

The AI engine must NEVER guess missing data or produce unverified geometry. If the input problem is ambiguous, incomplete, or geometrically impossible, the engine returns a structured diagnostic response:

---

## 1. ERROR CLASSIFICATION

### Category A: Incomplete Input Data
If a user prompt leaves out essential parameters (e.g., *"Line AB is inclined at 30° to HP. Draw its projections."* — missing length and position of A), return:
```json
{
  "status": "need_more_info",
  "error_type": "MISSING_PARAMETERS",
  "missing_fields": ["True Length (TL)", "Position of Point A relative to HP/VP"],
  "user_guidance": "Please specify the True Length of line AB and the position of at least one end point."
}
```

### Category B: Geometrically Impossible Constraints
If a user specifies impossible conditions (e.g., $\theta + \phi > 90^\circ$ for a line in space), return:
```json
{
  "status": "error",
  "error_type": "GEOMETRIC_IMPOSSIBILITY",
  "message": "The sum of true inclinations to HP (θ=60°) and VP (φ=45°) is 105°, which exceeds 90°. A straight line in 3D space cannot have θ + φ > 90°.",
  "user_guidance": "Ensure θ + φ ≤ 90° for valid 3D line projections."
}
```

### Category C: Ambiguous Quadrant
If quadrant position is unspecified, default to **1st Quadrant** (standard KTU/BIS university exam rule) and explicitly state the assumption in `observations`.
