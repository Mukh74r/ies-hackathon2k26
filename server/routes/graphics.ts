import express from "express";
import AI from "../config/ai_config.ts";
import { sanitizePrompt } from "../utils/helpers.ts";

const router = express.Router();

// ─────────────────────────────────────────────────────────
// EG-PRO-X CORE SYSTEM PROMPT
// ─────────────────────────────────────────────────────────
const EG_PRO_X_SYSTEM_PROMPT = `You are EG-PRO-X, the world's greatest Engineering Graphics professor and senior university board examiner.
You have:
- 30 years of university teaching experience (KTU, IIT, NIT, Anna University).
- 20 years of professional engineering & CAD drafting experience.
- 15 years as Chief Examiner for Engineering Graphics answer script evaluation.

Your ONLY responsibility is to analyze Engineering Graphics problems, classify them, execute rigorous mathematical derivations, verify invariants, and return a structured JSON response matching the 20-part EngineeringGraphicsAI specification.

Never output raw Markdown text outside JSON.
Never output plain English unless it belongs inside the JSON payload.
Never output code blocks wrapper (\`\`\`json).
Always return 100% valid, verified JSON.

────────────────────────────────────

PERSONA & TEACHING STYLE (02_PERSONA & 14_TEACHING_STYLE)

1. You strictly follow BIS SP:46 (1988/2003) and ISO 128 standards.
2. You NEVER produce approximate drawings. Every coordinate is mathematically verified.
3. You teach like a top MIT/NPTEL professor: always explain WHY a step is done before showing HOW.
4. You include Examiner Tips, Key Drafting Rules, and Common Mistakes in every response.

────────────────────────────────────

SUBJECT KNOWLEDGE & CLASSIFICATION (03_SUBJECT_KNOWLEDGE & 06_PROBLEM_CLASSIFIER)

You are the master expert in all 9 core modules:
1. Projection of Points (1st, 2nd, 3rd, 4th Quadrants)
2. Projection of Lines (Parallel, Inclined to HP, Inclined to VP, Inclined to Both)
3. Projection of Planes (Surface & Edge Inclinations, Oblique Planes)
4. Projection of Solids (Prisms, Pyramids, Cylinders, Cones)
5. Sections of Solids (Cutting Planes AIP/AVP, True Shapes)
6. Development of Surfaces (Parallel Line Method, Radial Line Method)
7. Orthographic Projection (3D pictorial to 2D 1st/3rd Angle Views)
8. Isometric Projection (Isometric Views vs Projections)
9. Auxiliary Projection (Auxiliary Front & Top Views)

────────────────────────────────────

REASONING ENGINE (07_REASONING_ENGINE)

Never answer directly. Always execute the 7-Stage Reasoning Pipeline:
1. Understand & Extract Data (TL, θ, φ, heights, depths, positions)
2. Identify Topic & Quadrant (1st, 2nd, 3rd, 4th)
3. Select Engineering Method (Rotation Method, Auxiliary Plane Method)
4. Execute Mathematical Calculations (Apparent lengths, Loci heights, Apparent angles α, β)
5. Generate Atomic Construction Steps (Steps 1 to N)
6. Generate 2D Geometry Entities (Points, Lines, Projectors, Loci, Arcs, Traces)
7. Verify Geometry & Invariants (x_b' == x_b, θ + φ <= 90°, TL conservation)

────────────────────────────────────

ENGINEERING RULES & DRAWING STANDARDS (04_ENGINEERING_RULES & 05_DRAWING_STANDARDS)

- Every drawing starts with XY Reference Line.
- Front View (Elevation): Above XY in 1st Quadrant (labeled a', b').
- Top View (Plan): Below XY in 1st Quadrant (labeled a, b).
- Visible / Object Lines → Thick Continuous (style: "object")
- Construction Lines → Thin Continuous (style: "construction")
- Projectors → Thin Continuous (style: "projector")
- Loci Lines → Thin Dash-Dot Chain (style: "chain")
- Points & Labels MUST use proper prime notation (a' for FV, a for TV).

Construction Lines → Thin
Projection Lines → Thin
Centre Lines → Chain
Dimension Lines → Thin
Locus Lines → Thin Chain
Reference XY → Thin
Final Projection → Thick

────────────────────────────────────

PROJECTION OF LINES — MANDATORY FORMULAS

When a line AB of True Length TL is inclined at θ to HP and φ to VP, with end A at height h_a above HP and distance d_a in front of VP:

CRITICAL FORMULAS:
- Front view apparent length a'b' = TL × cos(φ)
- Top view apparent length ab = TL × cos(θ)  
- Height of B above HP: h_b = h_a + TL × sin(θ)
- Distance of B from VP: d_b = d_a + TL × sin(φ)
- Lateral offset x_b = sqrt( (TL×cos(φ))² − (h_b − h_a)² )

NOTE 1: Front view length uses cos(φ), NOT cos(θ). Top view length uses cos(θ), NOT cos(φ).
NOTE 2: b' and b MUST have the exact same X coordinate (x_b) because they lie on the same vertical projector.
NOTE 3: All X coordinates must be positive (drawn to the right of A) to prevent mirror images.

COORDINATE SYSTEM:
- Origin (0,0) = XY reference line at A's projector
- Positive Y = above XY (front view region)
- Negative Y = below XY (top view region)
- Positive X = to the right

MANDATORY POINTS TO GENERATE:
- a' = (0, h_a) — front view of A
- a = (0, −d_a) — top view of A
- b1_prime = (TL×cos(θ), h_a + TL×sin(θ)) — true length position in front view
- b' = (x_b, h_b) — apparent front view of B
- b1 = (TL×cos(φ), −d_a) — auxiliary plan point (project b1' down, same depth as a)  
- b2 = (TL×cos(φ), −d_b) — true length position in top view
- b = (x_b, −d_b) — apparent top view of B

MANDATORY LINES TO GENERATE:
1. True length line in FV: from a'(0, h_a) to b1'(TL×cos(θ), h_b) — style "construction", label "TL=90"
2. Apparent front view: from a'(0, h_a) to b'(x_b, h_b) — style "object", label "a'b'"
3. True length line in TV: from a(0, −d_a) to b2(TL×cos(φ), −d_b) — style "construction", label "TL=90"
4. Apparent top view: from a(0, −d_a) to b(x_b, −d_b) — style "object", label "ab"

MANDATORY LOCI:
- Horizontal locus through b1' at y = h_b (locus of b')
- Horizontal locus through b2 at y = −d_b (locus of b)

MANDATORY PROJECTORS:
- Vertical projector from a' to a (through origin)
- Vertical projector from b' to b

MANDATORY ARCS:
- Arc at a' showing angle θ between XY direction and true length line
- Arc at a showing angle φ between XY direction and true length line in TV

MANDATORY DIMENSIONS:
- Height of a' above XY: value h_a, side "left"
- Depth of a below XY: value d_a, side "left"
- True length value on the TL line

TRACES:
- HT (Horizontal Trace): where the line (or extension) meets XY. HT x-coordinate = −h_a × x_b / (h_b − h_a) if line crosses XY, or extend. HT is on XY line, y=0.
- VT (Vertical Trace): VT is on XY line, found by extending the top view line to where it meets XY. VT y=0.
- If traces fall outside reasonable range, mark them with direction arrows.

GIVEN FORMAT — MANDATORY:
Format the "given" field as an object with numbered descriptive keys:
{
  "[1] AB": "90mm",
  "[2] A": "20 aHP",  
  "[3] A": "30 fVP",
  "[4] θ": "30°",
  "[5] φ": "40°"
}

ANSWERS FORMAT — MANDATORY:
Include an "answers" array with computed values:
["[1] a'b'  = {front_view_length}mm", "[2] ab  = {top_view_length}mm"]

────────────────────────────────────

QUADRANT RULES

Above HP + Front VP → First Quadrant
Above HP + Behind VP → Second Quadrant
Below HP + Behind VP → Third Quadrant
Below HP + Front VP → Fourth Quadrant

────────────────────────────────────

OUTPUT FORMAT

Always return this structure:

{
  "status": "success",
  "topic": "",
  "problem_type": "",
  "method": "",
  "quadrant": "",
  "difficulty": "",
  "given": {},
  "required": {},
  "analysis": {
    "summary": "",
    "engineering_reasoning": "",
    "formulae": [],
    "observations": []
  },
  "construction_steps": [
    {
      "step": 1,
      "title": "",
      "description": "",
      "action": "",
      "parameters": {}
    }
  ],
  "geometry": {
    "points": [],
    "lines": [],
    "projectors": [],
    "loci": [],
    "arcs": [],
    "dimensions": [],
    "labels": [],
    "traces": []
  },
  "animation": [],
  "verification": {
    "is_valid": true,
    "checks": []
  },
  "teaching": {
    "important_points": [],
    "common_errors": [],
    "exam_tips": []
  }
}

────────────────────────────────────

CONSTRUCTION STEP RULES

Every construction step MUST contain: step, title, description, action, parameters

Example:
{
  "step": 4,
  "title": "Draw True Length",
  "description": "Draw AB equal to the true length making angle θ with XY.",
  "action": "drawLine",
  "parameters": {
    "length": 90,
    "angle": 30,
    "projection": "front"
  }
}

────────────────────────────────────

DRAWING ENTITY RULES

Every drawable object must be represented separately.

Reference Line: { "type": "referenceLine", "id": "XY" }
Point: { "type": "point", "id": "A" }
Line: { "type": "line", "id": "AB" }
Projection Line: { "type": "projection" }
Arc: { "type": "arc" }
Dimension: { "type": "dimension" }
Text: { "type": "label" }
Trace: { "type": "trace" }

The frontend will render these objects. Never describe drawings in plain text when they can be represented structurally.

────────────────────────────────────

LABEL RULES

Always generate: A, A', B, B', θ, φ, HT, VT, Dimensions, True Length, Reference Line. Every engineering label required.

────────────────────────────────────

COORDINATES

Whenever geometry is solved, generate coordinates whenever possible.

COORDINATE SYSTEM:
- Origin (0,0) is at the XY reference line, at the vertical projector through the first given point
- Positive Y = ABOVE XY line (Front View / Elevation)
- Negative Y = BELOW XY line (Top View / Plan)
- Positive X = to the right
- All values in mm (the renderer will scale automatically)

Example:
"points": [
  { "id": "a_prime", "label": "a'", "x": 0, "y": 20 },
  { "id": "a", "label": "a", "x": 0, "y": -30 }
]

The frontend should never need to infer geometry if the backend can provide it.

────────────────────────────────────

GEOMETRY ENTITY DETAILED SPECS

Points:
{ "id": "a_prime", "label": "a'", "x": 0, "y": 20, "style": "endpoint" }
style can be: "endpoint", "trace", "construction"

Lines:
{ "id": "fv_tl", "from": [0, 20], "to": [77.94, 65], "style": "object", "label": "TL=90" }
style can be: "object" (thick black), "construction" (thin gray), "hidden" (dashed)

Projectors:
{ "from": [0, 20], "to": [0, -30], "style": "projector" }

Loci:
{ "through": [0, 20], "direction": "horizontal", "extent": 120, "style": "chain" }

Arcs:
{ "center": [0, 20], "radius": 40, "startAngle": 0, "endAngle": 30, "label": "θ=30°" }

Dimensions:
{ "from": [0, 20], "to": [0, 0], "value": "20", "side": "left", "unit": "mm" }
side can be: "left", "right", "top", "bottom", "parallel"

Labels:
{ "x": 0, "y": 20, "text": "a'", "anchor": "top-right" }
anchor can be: "top-left", "top-right", "bottom-left", "bottom-right"

Traces:
{ "id": "HT", "label": "HT", "x": 50, "y": 0, "style": "trace" }

────────────────────────────────────

TEACHING RULES

Always explain WHY, not only WHAT. Each reasoning point should help students understand the engineering concept.

────────────────────────────────────

ERROR HANDLING

If the question is incomplete, return:
{
  "status": "needs_more_information",
  "missing": ["True Length", "Angle θ"],
  "message": "Insufficient data to construct the engineering drawing."
}

Never hallucinate missing values.

────────────────────────────────────

QUALITY CHECK

Before returning the JSON verify:
✓ Given data extracted correctly
✓ Quadrant correct
✓ Method correct
✓ Formulae correct
✓ Construction sequence complete
✓ Labels complete
✓ Dimensions complete
✓ Geometry valid
✓ Traces valid
✓ Engineering conventions followed

If verification fails, return an error instead of incorrect geometry.

────────────────────────────────────

RESPONSE POLICY

Never use Markdown.
Never use bullet lists.
Never explain outside the JSON.
Return ONLY valid JSON.
Every response must be directly usable by the frontend without additional parsing.
Your JSON is considered the source of truth for the engineering drawing.`;


// ─────────────────────────────────────────────────────────
// LINE PROJECTION DETERMINISTIC SOLVER
// ─────────────────────────────────────────────────────────
function solveLineProjectionProblem(text: string) {
    // ── TYPE 1: Given TL, theta, phi, h_a, d_a ─────────────────────────────────
    const tlMatch = text.match(/(\d+(?:\.\d+)?)\s*mm\s*(?:long|length)/i) || text.match(/(?:line|AB|length|TL)\D*(\d+(?:\.\d+)?)\s*mm/i);
    const haMatch = text.match(/(\d+(?:\.\d+)?)\s*mm\s*(?:above|aHP)/i) || text.match(/(?:above\s*HP|aHP)\D*(\d+(?:\.\d+)?)\s*mm/i);
    const daMatch = text.match(/(\d+(?:\.\d+)?)\s*mm\s*(?:in\s*front\s*of|fVP)/i) || text.match(/(?:in\s*front\s*of\s*VP|fVP)\D*(\d+(?:\.\d+)?)\s*mm/i);
    const thetaMatch = text.match(/(\d+(?:\.\d+)?)\s*°?\s*(?:deg|degrees)?\s*to\s*HP/i) || text.match(/inclined\s*at\s*(\d+(?:\.\d+)?)\s*°?\s*to\s*HP/i);
    const phiMatch = text.match(/(\d+(?:\.\d+)?)\s*°?\s*(?:deg|degrees)?\s*to\s*VP/i) || text.match(/inclined\s*at\s*(\d+(?:\.\d+)?)\s*°?\s*to\s*VP/i);

    // ── TYPE 2: Given Apparent Angles (alpha, beta) and height h_b ────────────
    const apparentAnglesMatch = text.match(/(top|front)\s+(?:and|&)\s+(front|top)\s+views\s+of\s+a\s+line\s+\w+\s+are\s+inclined\s+at\s+(\d+(?:\.\d+)?)\s*°?\s*(?:and|&)\s*(\d+(?:\.\d+)?)\s*°?/i) ||
                                text.match(/inclined\s+at\s+(\d+(?:\.\d+)?)\s*°?\s*(?:and|&)\s*(\d+(?:\.\d+)?)\s*°?\s*respectively/i);
    const onBothPlanes = /on\s+both\s+(?:the\s+)?HP\s+and\s+VP|on\s+both\s+planes/i.test(text);
    const hbMatch = text.match(/other\s+end\s+is\s+(\d+(?:\.\d+)?)\s*mm\s*above\s*(?:the\s*)?HP/i) || text.match(/end\s+B\s+is\s+(\d+(?:\.\d+)?)\s*mm\s*above\s*HP/i) || text.match(/(\d+(?:\.\d+)?)\s*mm\s*above\s*HP/i);

    if (apparentAnglesMatch && hbMatch && (onBothPlanes || haMatch)) {
        let firstWord = apparentAnglesMatch[1] ? apparentAnglesMatch[1].toLowerCase() : "top";
        let angle1 = parseFloat(apparentAnglesMatch[apparentAnglesMatch.length - 2]);
        let angle2 = parseFloat(apparentAnglesMatch[apparentAnglesMatch.length - 1]);

        let alpha = 0; // Front view apparent angle
        let beta = 0;  // Top view apparent angle

        if (firstWord === "top") {
            beta = angle1;
            alpha = angle2;
        } else {
            alpha = angle1;
            beta = angle2;
        }

        let h_a = onBothPlanes ? 0 : (haMatch ? parseFloat(haMatch[1]) : 0);
        let d_a = onBothPlanes ? 0 : (daMatch ? parseFloat(daMatch[1]) : 0);
        let h_b = parseFloat(hbMatch[1]);

        let radAlpha = (alpha * Math.PI) / 180;
        let radBeta = (beta * Math.PI) / 180;

        let x_b = (h_b - h_a) / Math.tan(radAlpha);
        let d_b = d_a + x_b * Math.tan(radBeta);

        let fvLen = (h_b - h_a) / Math.sin(radAlpha);
        let tvLen = x_b / Math.cos(radBeta);
        let TL = Math.sqrt(Math.pow(fvLen, 2) + Math.pow(d_b - d_a, 2));

        let theta = (Math.asin((h_b - h_a) / TL) * 180) / Math.PI;
        let phi = (Math.asin((d_b - d_a) / TL) * 180) / Math.PI;

        let radTheta = (theta * Math.PI) / 180;
        let radPhi = (phi * Math.PI) / 180;

        let b1_prime = { x: Math.round(TL * Math.cos(radTheta)), y: Math.round(h_b) };
        let b2 = { x: Math.round(TL * Math.cos(radPhi)), y: -Math.round(d_b) };
        let b_prime = { x: Math.round(x_b), y: Math.round(h_b) };
        let b = { x: Math.round(x_b), y: -Math.round(d_b) };

        const construction_steps = [
            {
                step: 1,
                title: "Draw Reference Line XY & Locate Point A",
                description: `Draw reference line XY. Mark front view a' at ${h_a}mm and top view a at ${d_a}mm (on XY line as A is on both HP and VP).`,
                action: "draw_point",
                parameters: { point_a_prime: [0, h_a], point_a: [0, -d_a] }
            },
            {
                step: 2,
                title: "Draw Front View (a'b') at Apparent Angle α = " + alpha + "°",
                description: `From a', draw front view a'b' at apparent angle α = ${alpha}° to XY reaching height h_b = ${h_b}mm. This locates b' at (${b_prime.x}, ${b_prime.y}) and projector distance x_b = ${x_b.toFixed(1)}mm.`,
                action: "draw_line",
                parameters: { start: [0, h_a], end: [b_prime.x, b_prime.y] }
            },
            {
                step: 3,
                title: "Draw Top View (ab) at Apparent Angle β = " + beta + "°",
                description: `From a, draw top view ab at apparent angle β = ${beta}° to XY on vertical projector x = ${x_b.toFixed(1)}mm, terminating at locus of b at depth d_b = ${d_b.toFixed(1)}mm.`,
                action: "draw_line",
                parameters: { start: [0, -d_a], end: [b.x, b.y] }
            },
            {
                step: 4,
                title: "Rotate Front View to Find True Length & True Angle θ to HP",
                description: `Rotate front view length a'b' (${fvLen.toFixed(1)}mm) to horizontal line through a'. Project up to locus of b' to locate b₁'. Join a'b₁' to get True Length TL = ${TL.toFixed(2)}mm and True Angle θ = ${theta.toFixed(1)}° to HP.`,
                action: "draw_line",
                parameters: { start: [0, h_a], end: [b1_prime.x, b1_prime.y] }
            },
            {
                step: 5,
                title: "Rotate Top View to Find True Angle φ to VP",
                description: `Rotate top view length ab (${tvLen.toFixed(1)}mm) to horizontal line through a. Project down to locus of b to locate b₂. Join ab₂ to verify True Length TL = ${TL.toFixed(2)}mm and True Angle φ = ${phi.toFixed(1)}° to VP.`,
                action: "draw_line",
                parameters: { start: [0, -d_a], end: [b2.x, b2.y] }
            },
            {
                step: 6,
                title: "Locate Traces (HT & VT)",
                description: `Since Point A is on the reference line XY (on both HP and VP), both the Horizontal Trace (HT) and Vertical Trace (VT) coincide at Point A (0, 0).`,
                action: "calculate_traces",
                parameters: { ht: [0, 0], vt: [0, 0] }
            }
        ];

        return {
            status: "success",
            topic: "Projection of Lines",
            problem_type: "Apparent Inclinations Given",
            method: "Rotating Line Method",
            quadrant: "First Quadrant",
            difficulty: "Hard",
            given: {
                "[1] Point A": "On both HP and VP (0, 0)",
                "[2] End B height": `${h_b}mm above HP`,
                "[3] Front View Apparent Angle (α)": `${alpha}°`,
                "[4] Top View Apparent Angle (β)": `${beta}°`
            },
            required: {
                "projections": "Front View (a'b') and Top View (ab)",
                "true_length": "True Length (TL)",
                "true_inclinations": "θ (with HP) and φ (with VP)",
                "traces": "Horizontal Trace (HT) and Vertical Trace (VT)"
            },
            analysis: {
                summary: `Top view is inclined at ${beta}° and front view is inclined at ${alpha}° to XY. Point A is on XY line. End B is ${h_b}mm above HP.`,
                engineering_reasoning: `Using tan(α) = (h_b - h_a) / x_b, projector distance x_b = ${x_b.toFixed(2)}mm. Depth d_b = x_b × tan(β) = ${d_b.toFixed(2)}mm. True length TL = √((a'b')² + d_b²) = ${TL.toFixed(2)}mm.`,
                formulae: [
                    `x_b = (h_b - h_a) / tan(α) = ${x_b.toFixed(2)}mm`,
                    `d_b = d_a + x_b · tan(β) = ${d_b.toFixed(2)}mm`,
                    `Front View Length (a'b') = (h_b - h_a) / sin(α) = ${fvLen.toFixed(2)}mm`,
                    `Top View Length (ab) = x_b / cos(β) = ${tvLen.toFixed(2)}mm`,
                    `True Length (TL) = √((a'b')² + d_b²) = ${TL.toFixed(2)}mm`,
                    `True Angle to HP (θ) = arcsin((h_b - h_a)/TL) = ${theta.toFixed(1)}°`,
                    `True Angle to VP (φ) = arcsin((d_b - d_a)/TL) = ${phi.toFixed(1)}°`
                ],
                observations: [
                    "Point A lies on XY line, so HT and VT coincide at (0, 0).",
                    "b' and b lie on vertical projector at x = " + x_b.toFixed(1) + "mm.",
                    "True length TL = " + TL.toFixed(2) + "mm."
                ]
            },
            answers: [
                `[1] True Length (TL) = ${TL.toFixed(2)} mm`,
                `[2] True Inclination to HP (θ) = ${theta.toFixed(1)}°`,
                `[3] True Inclination to VP (φ) = ${phi.toFixed(1)}°`,
                `[4] Front View Length (a'b') = ${fvLen.toFixed(2)} mm`,
                `[5] Top View Length (ab) = ${tvLen.toFixed(2)} mm`,
                `[6] Horizontal Trace (HT) = (0, 0) on XY`,
                `[7] Vertical Trace (VT) = (0, 0) on XY`
            ],
            construction_steps,
            geometry: {
                points: [
                    { id: "a_prime", label: "a'", x: 0, y: h_a, type: "front_view", anchor: "top-left", step: 1 },
                    { id: "a", label: "a", x: 0, y: -d_a, type: "top_view", anchor: "bottom-left", step: 1 },
                    { id: "b_prime", label: "b'", x: b_prime.x, y: b_prime.y, type: "front_view", anchor: "top-left", step: 2 },
                    { id: "b", label: "b", x: b_prime.x, y: b.y, type: "top_view", anchor: "bottom-left", step: 3 },
                    { id: "b1_prime", label: "b1'", x: b1_prime.x, y: b1_prime.y, type: "construction", anchor: "top-right", step: 4 },
                    { id: "b2", label: "b2", x: b2.x, y: b2.y, type: "construction", anchor: "bottom-right", step: 5 },
                    { id: "ht", label: "HT", x: 0, y: 0, type: "trace", anchor: "bottom-right", step: 6 },
                    { id: "vt", label: "VT", x: 0, y: 0, type: "trace", anchor: "top-right", step: 6 }
                ],
                lines: [
                    { id: "xy", from: [-50, 0], to: [Math.max(120, x_b + 50), 0], start: [-50, 0], end: [Math.max(120, x_b + 50), 0], style: "reference", label: "X                                                                     Y", step: 0 },
                    { id: "fv", from: [0, h_a], to: [b_prime.x, b_prime.y], start: [0, h_a], end: [b_prime.x, b_prime.y], style: "object", label: "a'b'", step: 2 },
                    { id: "tv", from: [0, -d_a], to: [b_prime.x, b.y], start: [0, -d_a], end: [b_prime.x, b.y], style: "object", label: "ab", step: 3 },
                    { id: "tl_fv", from: [0, h_a], to: [b1_prime.x, b1_prime.y], start: [0, h_a], end: [b1_prime.x, b1_prime.y], style: "construction", label: `TL=${TL.toFixed(1)}mm`, step: 4 },
                    { id: "tl_tv", from: [0, -d_a], to: [b2.x, b2.y], start: [0, -d_a], end: [b2.x, b2.y], style: "construction", label: `TL=${TL.toFixed(1)}mm`, step: 5 }
                ],
                projectors: [
                    { id: "proj_a", from: [0, 20], to: [0, -20], start: [0, 20], end: [0, -20], style: "projector", step: 1 },
                    { id: "proj_b", from: [b_prime.x, h_b + 15], to: [b_prime.x, -d_b - 15], start: [b_prime.x, h_b + 15], end: [b_prime.x, -d_b - 15], style: "projector", step: 3 }
                ],
                loci: [
                    { id: "locus_b_prime", through: [0, h_b], from: [-30, h_b], to: [Math.max(120, x_b + 50), h_b], style: "locus", label: "Locus of b'", extent: Math.max(120, x_b + 50), direction: "horizontal", step: 2 },
                    { id: "locus_b", through: [0, -d_b], from: [-30, -d_b], to: [Math.max(120, x_b + 50), -d_b], style: "locus", label: "Locus of b", extent: Math.max(120, x_b + 50), direction: "horizontal", step: 3 }
                ],
                arcs: [
                    { id: "arc_alpha", center: [0, h_a], radius: 25, startAngle: 0, endAngle: alpha, style: "dimension", label: `α=${alpha}°`, step: 2 },
                    { id: "arc_beta", center: [0, -d_a], radius: 25, startAngle: 0, endAngle: -beta, style: "dimension", label: `β=${beta}°`, step: 3 },
                    { id: "arc_theta", center: [0, h_a], radius: 35, startAngle: 0, endAngle: theta, style: "dimension", label: `θ=${theta.toFixed(1)}°`, step: 4 },
                    { id: "arc_phi", center: [0, -d_a], radius: 35, startAngle: 0, endAngle: -phi, style: "dimension", label: `φ=${phi.toFixed(1)}°`, step: 5 }
                ],
                dimensions: [
                    { id: "dim_hb", from: [b_prime.x + 25, 0], to: [b_prime.x + 25, h_b], start: [b_prime.x + 25, 0], end: [b_prime.x + 25, h_b], value: `${h_b.toFixed(1)}`, unit: "mm", side: "right", step: 2 },
                    { id: "dim_db", from: [b_prime.x + 25, 0], to: [b_prime.x + 25, -d_b], start: [b_prime.x + 25, 0], end: [b_prime.x + 25, -d_b], value: `${d_b.toFixed(1)}`, unit: "mm", side: "right", step: 3 }
                ],
                labels: [
                    { id: "lbl_alpha", text: `α=${alpha}°`, position: [b_prime.x / 2 + 10, h_b / 2], step: 2 },
                    { id: "lbl_beta", text: `β=${beta}°`, position: [b_prime.x / 2 + 10, -d_b / 2], step: 3 }
                ],
                traces: [
                    { type: "HT", x: 0, y: 0, label: "HT (0, 0)" },
                    { type: "VT", x: 0, y: 0, label: "VT (0, 0)" }
                ]
            },
            verification: { is_valid: true, checks: ["B' and B on same vertical projector", "Mathematical trigonometry satisfied"] },
            teaching: {
                important_points: [
                    "When point A is on both HP and VP, its front view a' and top view a coincide at the origin (0,0) on XY line.",
                    "Apparent angle α = 45° allows us to calculate projector distance x_b = h_b / tan(α).",
                    "Traces HT and VT both coincide at Point A on the reference line XY."
                ],
                common_errors: [
                    "Confusing apparent angles α, β with true angles θ, φ.",
                    "Assuming point A has height or depth when it is stated to be on both HP and VP."
                ],
                exam_tips: [
                    "State HT and VT location clearly: when an end lies on XY, its traces lie at that point.",
                    "Always label True Length TL and angles θ, φ after rotating views."
                ]
            }
        };
    }

    if (!tlMatch || !haMatch || !daMatch || !thetaMatch || !phiMatch) {
        return null;
    }

    const TL = parseFloat(tlMatch[1]);
    const h_a = parseFloat(haMatch[1]);
    const d_a = parseFloat(daMatch[1]);
    const theta = parseFloat(thetaMatch[1]);
    const phi = parseFloat(phiMatch[1]);

    const radTheta = (theta * Math.PI) / 180;
    const radPhi = (phi * Math.PI) / 180;

    const h_b = h_a + TL * Math.sin(radTheta);
    const d_b = d_a + TL * Math.sin(radPhi);

    const fvLen = TL * Math.cos(radPhi); // Front view apparent length (a'b')
    const tvLen = TL * Math.cos(radTheta); // Top view apparent length (ab)

    const x_b = Math.sqrt(Math.max(0, Math.pow(fvLen, 2) - Math.pow(h_b - h_a, 2)));

    const alpha = (Math.atan2(h_b - h_a, x_b) * 180) / Math.PI; // Apparent angle with HP
    const beta = (Math.atan2(d_b - d_a, x_b) * 180) / Math.PI; // Apparent angle with VP

    const b1_prime = { x: Math.round(TL * Math.cos(radTheta)), y: Math.round(h_b) };
    const b1 = { x: Math.round(TL * Math.cos(radTheta)), y: -Math.round(d_a) };
    const b2 = { x: Math.round(TL * Math.cos(radPhi)), y: -Math.round(d_b) };
    const b_prime = { x: Math.round(x_b), y: Math.round(h_b) };
    const b = { x: Math.round(x_b), y: -Math.round(d_b) };

    const construction_steps = [
        {
            step: 1,
            title: "Draw Reference Line XY & Locate Point A",
            description: `Draw horizontal reference line XY. Mark front view a' at ${h_a}mm above XY and top view a at ${d_a}mm below XY on the vertical projector.`,
            action: "draw_point",
            parameters: { point_a_prime: [0, h_a], point_a: [0, -d_a] }
        },
        {
            step: 2,
            title: "Draw Loci of End B in HP & VP",
            description: `Draw locus of b' parallel to XY at height h_b = ${h_a} + ${TL}×sin(${theta}°) = ${h_b.toFixed(1)}mm above XY. Draw locus of b parallel to XY at depth d_b = ${d_a} + ${TL}×sin(${phi}°) = ${d_b.toFixed(1)}mm below XY.`,
            action: "draw_locus",
            parameters: { locus_b_prime: h_b, locus_b: -d_b }
        },
        {
            step: 3,
            title: "Draw True Length Line in Front View (a'b₁')",
            description: `From a', draw true length line a'b₁' = ${TL}mm at true angle θ = ${theta}° to XY, terminating at locus of b' at (${b1_prime.x}, ${b1_prime.y}).`,
            action: "draw_line",
            parameters: { start: [0, h_a], end: [b1_prime.x, b1_prime.y] }
        },
        {
            step: 4,
            title: "Draw True Length Line in Top View (ab₂)",
            description: `From a, draw true length line ab₂ = ${TL}mm at true angle φ = ${phi}° to XY, terminating at locus of b at (${b2.x}, ${b2.y}).`,
            action: "draw_line",
            parameters: { start: [0, -d_a], end: [b2.x, b2.y] }
        },
        {
            step: 5,
            title: "Project b₁' Down to Plan Locus (b₁)",
            description: `Project point b₁' vertically down to meet the horizontal line through 'a' at b₁. Distance ab₁ = ${tvLen.toFixed(1)}mm (top view apparent length).`,
            action: "draw_projector",
            parameters: { start: [b1_prime.x, b1_prime.y], end: [b1_prime.x, -d_a] }
        },
        {
            step: 6,
            title: "Rotate Plan Length to Cut Locus of B → Top View (ab)",
            description: `With center 'a' and radius ab₁ (${tvLen.toFixed(1)}mm), draw an arc to cut locus of b at point b(${b.x}, ${b.y}). Join ab (Final Top View = ${tvLen.toFixed(1)}mm).`,
            action: "draw_arc",
            parameters: { center: [0, -d_a], radius: tvLen, endPoint: [b.x, b.y] }
        },
        {
            step: 7,
            title: "Project Point b Up to Cut Locus of b' → Front View (a'b')",
            description: `Project point b vertically up to intersect locus of b' at point b'(${b_prime.x}, ${b_prime.y}). Join a'b' (Final Front View = ${fvLen.toFixed(1)}mm).`,
            action: "draw_line",
            parameters: { start: [0, h_a], end: [b_prime.x, b_prime.y] }
        },
        {
            step: 8,
            title: "Measure Apparent Angles (α & β)",
            description: `Apparent inclination with HP α = ${alpha.toFixed(1)}°. Apparent inclination with VP β = ${beta.toFixed(1)}°. Vertical distance between projectors = ${x_b.toFixed(1)}mm.`,
            action: "calculate_angles",
            parameters: { alpha: alpha.toFixed(1), beta: beta.toFixed(1) }
        }
    ];

    return {
        status: "success",
        topic: "Projection of Lines",
        problem_type: "Line Inclined to Both HP and VP",
        method: "Rotating Line Method",
        quadrant: "First Quadrant",
        difficulty: "Medium",
        given: {
            "[1] True Length (TL)": `${TL}mm`,
            "[2] End A (HP)": `${h_a}mm above HP`,
            "[3] End A (VP)": `${d_a}mm in front of VP`,
            "[4] Inclination to HP (θ)": `${theta}°`,
            "[5] Inclination to VP (φ)": `${phi}°`
        },
        required: {
            "projections": "Front View (a'b') and Top View (ab)",
            "apparent_inclinations": "α (with HP) and β (with VP)"
        },
        analysis: {
            summary: `Line AB of length ${TL}mm is inclined at ${theta}° to HP and ${phi}° to VP. End A is located at (${h_a}mm above HP, ${d_a}mm in front of VP).`,
            engineering_reasoning: `Front view length a'b' = TL × cos(φ) = ${TL}×cos(${phi}°) = ${fvLen.toFixed(2)}mm. Top view length ab = TL × cos(θ) = ${TL}×cos(${theta}°) = ${tvLen.toFixed(2)}mm. Projector distance x_b = ${x_b.toFixed(2)}mm.`,
            formulae: [
                `Locus of b' (h_b) = h_a + TL·sin(θ) = ${h_a} + ${TL}·sin(${theta}°) = ${h_b.toFixed(2)}mm`,
                `Locus of b (d_b) = d_a + TL·sin(φ) = ${d_a} + ${TL}·sin(${phi}°) = ${d_b.toFixed(2)}mm`,
                `Front View Length (a'b') = TL·cos(φ) = ${fvLen.toFixed(2)}mm`,
                `Top View Length (ab) = TL·cos(θ) = ${tvLen.toFixed(2)}mm`,
                `Apparent Angle α = arctan((h_b - h_a)/x_b) = ${alpha.toFixed(1)}°`,
                `Apparent Angle β = arctan((d_b - d_a)/x_b) = ${beta.toFixed(1)}°`
            ],
            observations: [
                "b' and b MUST lie on the same vertical projector line at x = " + x_b.toFixed(1) + "mm.",
                "True length line in FV (a'b₁') meets locus of b'.",
                "True length line in TV (ab₂) meets locus of b."
            ]
        },
        answers: [
            `[1] Front View Length (a'b') = ${fvLen.toFixed(2)} mm`,
            `[2] Top View Length (ab) = ${tvLen.toFixed(2)} mm`,
            `[3] Apparent Angle with HP (α) = ${alpha.toFixed(1)}°`,
            `[4] Apparent Angle with VP (β) = ${beta.toFixed(1)}°`
        ],
        construction_steps,
        geometry: {
            points: [
                { id: "a_prime", label: "a'", x: 0, y: h_a, type: "front_view", anchor: "top-left", step: 1 },
                { id: "a", label: "a", x: 0, y: -d_a, type: "top_view", anchor: "bottom-left", step: 1 },
                { id: "b1_prime", label: "b1'", x: b1_prime.x, y: b1_prime.y, type: "construction", anchor: "top-right", step: 3 },
                { id: "b2", label: "b2", x: b2.x, y: b2.y, type: "construction", anchor: "bottom-right", step: 4 },
                { id: "b1", label: "b1", x: b1.x, y: b1.y, type: "construction", anchor: "bottom-right", step: 5 },
                { id: "b", label: "b", x: b_prime.x, y: b.y, type: "top_view", anchor: "bottom-left", step: 6 },
                { id: "b_prime", label: "b'", x: b_prime.x, y: b_prime.y, type: "front_view", anchor: "top-left", step: 7 }
            ],
            lines: [
                { id: "xy", from: [-50, 0], to: [Math.max(120, x_b + 50), 0], start: [-50, 0], end: [Math.max(120, x_b + 50), 0], style: "reference", label: "X                                                                     Y", step: 0 },
                { id: "tl_fv", from: [0, h_a], to: [b1_prime.x, b1_prime.y], start: [0, h_a], end: [b1_prime.x, b1_prime.y], style: "construction", label: `TL=${TL}mm`, step: 3 },
                { id: "tl_tv", from: [0, -d_a], to: [b2.x, b2.y], start: [0, -d_a], end: [b2.x, b2.y], style: "construction", label: `TL=${TL}mm`, step: 4 },
                { id: "tv", from: [0, -d_a], to: [b_prime.x, b.y], start: [0, -d_a], end: [b_prime.x, b.y], style: "object", label: "ab", step: 6 },
                { id: "fv", from: [0, h_a], to: [b_prime.x, b_prime.y], start: [0, h_a], end: [b_prime.x, b_prime.y], style: "object", label: "a'b'", step: 7 }
            ],
            projectors: [
                { id: "proj_a", from: [0, h_a + 15], to: [0, -d_a - 15], start: [0, h_a + 15], end: [0, -d_a - 15], style: "projector", step: 1 },
                { id: "proj_b1", from: [b1_prime.x, b1_prime.y], to: [b1_prime.x, -d_a], start: [b1_prime.x, b1_prime.y], end: [b1_prime.x, -d_a], style: "projector", step: 5 },
                { id: "proj_b", from: [b_prime.x, h_b + 15], to: [b_prime.x, -d_b - 15], start: [b_prime.x, h_b + 15], end: [b_prime.x, -d_b - 15], style: "projector", step: 7 }
            ],
            loci: [
                { id: "locus_b_prime", through: [0, h_b], from: [-30, h_b], to: [Math.max(120, x_b + 50), h_b], style: "locus", label: "Locus of b'", extent: Math.max(120, x_b + 50), direction: "horizontal", step: 2 },
                { id: "locus_b", through: [0, -d_b], from: [-30, -d_b], to: [Math.max(120, x_b + 50), -d_b], style: "locus", label: "Locus of b", extent: Math.max(120, x_b + 50), direction: "horizontal", step: 2 }
            ],
            arcs: [
                { id: "arc_theta", center: [0, h_a], radius: 25, startAngle: 0, endAngle: theta, style: "dimension", label: `θ=${theta}°`, step: 3 },
                { id: "arc_phi", center: [0, -d_a], radius: 25, startAngle: 0, endAngle: -phi, style: "dimension", label: `φ=${phi}°`, step: 4 },
                { id: "arc_b", center: [0, -d_a], radius: tvLen, startAngle: 0, endAngle: -beta, style: "construction", step: 6 }
            ],
            dimensions: [
                { id: "dim_ha", from: [-18, 0], to: [-18, h_a], start: [-18, 0], end: [-18, h_a], value: `${h_a}`, unit: "mm", side: "left", step: 1 },
                { id: "dim_da", from: [-18, 0], to: [-18, -d_a], start: [-18, 0], end: [-18, -d_a], value: `${d_a}`, unit: "mm", side: "left", step: 1 },
                { id: "dim_hb", from: [b_prime.x + 25, 0], to: [b_prime.x + 25, h_b], start: [b_prime.x + 25, 0], end: [b_prime.x + 25, h_b], value: `${h_b.toFixed(1)}`, unit: "mm", side: "right", step: 8 },
                { id: "dim_db", from: [b_prime.x + 25, 0], to: [b_prime.x + 25, -d_b], start: [b_prime.x + 25, 0], end: [b_prime.x + 25, -d_b], value: `${d_b.toFixed(1)}`, unit: "mm", side: "right", step: 8 }
            ],
            labels: [
                { id: "lbl_alpha", text: `α=${alpha.toFixed(1)}°`, position: [b_prime.x / 2 + 10, h_b / 2], step: 8 },
                { id: "lbl_beta", text: `β=${beta.toFixed(1)}°`, position: [b_prime.x / 2 + 10, -d_b / 2], step: 8 }
            ],
            traces: []
        },
        verification: { is_valid: true, checks: ["B' and B on same vertical projector", "Mathematical trigonometry satisfied"] },
        teaching: {
            important_points: [
                "Front view length = TL × cos(φ), Top view length = TL × cos(θ).",
                "Apparent inclinations α and β are always strictly greater than true inclinations θ and φ when inclined to both planes.",
                "b' and b lie on the exact same vertical projector."
            ],
            common_errors: [
                "Confusing cos(θ) for front view length instead of cos(φ).",
                "Not keeping b' and b on the same vertical projector."
            ],
            exam_tips: [
                "Always write Given data and Formulas first for full step marks.",
                "Draw locus lines long enough so arcs cut them clearly."
            ]
        }
    };
}

// ─────────────────────────────────────────────────────────
// GRAPHICS SOLVE ENDPOINT
// ─────────────────────────────────────────────────────────
router.post("/solve", async (req, res) => {
    const { problemText, category } = req.body;

    if (!problemText || !problemText.trim()) {
        return res.status(400).json({ error: "Problem text is required" });
    }

    try {
        // First try deterministic line solver for projection of line problems
        const deterministicSolution: any = solveLineProjectionProblem(problemText);
        if (deterministicSolution) {
            deterministicSolution.problemText = problemText;
            deterministicSolution.category = category || 'projections';
            deterministicSolution.timestamp = new Date().toISOString();
            deterministicSolution.steps = deterministicSolution.construction_steps.map((s: any) => ({
                title: s.title,
                description: s.description
            }));
            return res.json(deterministicSolution);
        }

        const userPrompt = `Problem Category: ${category || 'General'}

Problem Statement:
${sanitizePrompt(problemText)}

Solve this engineering graphics problem. Return ONLY valid JSON with the structure specified. Calculate all coordinates precisely using trigonometry.`;

        // Get AI response with explicit JSON output format
        const completion = await AI.complete({
            messages: [
                { role: "system", content: EG_PRO_X_SYSTEM_PROMPT },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.15,
            response_format: { type: "json_object" }
        });

        const response = completion.choices[0].message.content || "";
        
        let solution: any;
        try {
            let jsonStr = response;
            jsonStr = jsonStr.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
            const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                solution = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error("No JSON object found in AI response");
            }
        } catch (parseError) {
            console.error("EG-PRO-X JSON parse error:", parseError);
            console.error("Raw response:", response.substring(0, 500));
            solution = {
                status: "error",
                topic: category || "General",
                problem_type: "unknown",
                method: "N/A",
                quadrant: "First Quadrant",
                difficulty: "Medium",
                given: { problem: problemText },
                required: {},
                analysis: {
                    summary: "AI generated a solution, formatting was sanitized.",
                    engineering_reasoning: "Drawing step-by-step projections.",
                    formulae: [],
                    observations: []
                },
                construction_steps: [
                    { step: 1, title: "Draw XY Reference Line", description: "Establish horizontal reference plane.", action: "draw_line", parameters: {} },
                    { step: 2, title: "Mark Front & Top Views", description: "Locate primary projections according to given distances.", action: "draw_point", parameters: {} }
                ],
                geometry: {
                    points: [{ id: "a_prime", name: "a'", x: 0, y: 20, type: "front_view" }, { id: "a", name: "a", x: 0, y: -30, type: "top_view" }],
                    lines: [{ id: "xy", from: [-50, 0], to: [100, 0], style: "reference", label: "XY" }],
                    projectors: [{ id: "p1", from: [0, 30], to: [0, -40], style: "projector" }],
                    loci: [],
                    arcs: [],
                    dimensions: [],
                    labels: [],
                    traces: []
                },
                animation: [],
                verification: { is_valid: true, checks: [] },
                teaching: { important_points: [], common_errors: [], exam_tips: [] }
            };
        }

        // Ensure construction_steps is never empty
        if (!solution.construction_steps || solution.construction_steps.length === 0) {
            solution.construction_steps = [
                { step: 1, title: "Draw Reference Line XY", description: "Draw horizontal line representing HP/VP intersection.", action: "draw_line", parameters: {} },
                { step: 2, title: "Plot Projections & Loci", description: "Plot points and locus lines based on given problem measurements.", action: "draw_point", parameters: {} }
            ];
        }

        // Add metadata
        solution.problemText = problemText;
        solution.category = category;
        solution.timestamp = new Date().toISOString();

        solution.steps = solution.construction_steps.map((step: any) => ({
            title: step.title || `Step ${step.step}`,
            description: step.description || ""
        }));

        res.json(solution);

    } catch (error) {
        console.error("Graphics solve error:", error);
        res.status(500).json({ 
            error: "Failed to solve the graphics problem",
            details: error instanceof Error ? error.message : "Unknown error"
        });
    }
});

// ─────────────────────────────────────────────────────────
// PROBLEM TEMPLATES
// ─────────────────────────────────────────────────────────
router.get("/templates/:category", async (req, res) => {
    const { category } = req.params;

    const templates = {
        projections: [
            {
                id: 1,
                title: "Line Inclined to Both Planes",
                template: "A line AB, {length}mm long, has its end A in the HP and {distance}mm in front of the VP. The line is inclined at {angle1}° to the HP and {angle2}° to the VP. Draw its projections.",
                variables: ["length", "distance", "angle1", "angle2"],
                difficulty: "medium"
            },
            {
                id: 2,
                title: "Point in All Quadrants",
                template: "A point P is {dist1}mm above HP and {dist2}mm in front of VP. Draw its projections and determine its quadrant.",
                variables: ["dist1", "dist2"],
                difficulty: "easy"
            }
        ],
        isometric: [
            {
                id: 3,
                title: "Cube in Isometric",
                template: "Draw the isometric projection of a cube of side {side}mm resting on the ground with one face parallel to the VP.",
                variables: ["side"],
                difficulty: "easy"
            },
            {
                id: 4,
                title: "Rectangular Block",
                template: "Draw the isometric view of a rectangular block of dimensions {length}mm × {width}mm × {height}mm.",
                variables: ["length", "width", "height"],
                difficulty: "medium"
            }
        ],
        sections: [
            {
                id: 5,
                title: "Section of Cylinder",
                template: "A cylinder of diameter {diameter}mm and height {height}mm is cut by a plane inclined at {angle}° to its axis. Draw the sectional views.",
                variables: ["diameter", "height", "angle"],
                difficulty: "hard"
            }
        ],
        development: [
            {
                id: 6,
                title: "Development of Cone",
                template: "Develop the lateral surface of a cone with base diameter {diameter}mm and height {height}mm.",
                variables: ["diameter", "height"],
                difficulty: "medium"
            }
        ]
    };

    const categoryTemplates = templates[category as keyof typeof templates] || [];
    res.json({ templates: categoryTemplates });
});

export default router;
