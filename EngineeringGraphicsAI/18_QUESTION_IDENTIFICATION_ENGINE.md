# 18. QUESTION IDENTIFICATION ENGINE — Intent & Pattern Classifier

The Question Identification Engine analyzes raw student/teacher prompt text using pattern-matching rules and natural language heuristics to route problem types:

---

## 1. REGEX & KEYWORD ROUTING PATTERNS

| Target Module | Key Trigger Phrases | Example Prompt |
|:---|:---|:---|
| **Projection of Points** | `"point P"`, `"above HP"`, `"in front of VP"`, `"behind VP"`, `"below HP"` | *"Point P is 40mm above HP and 25mm in front of VP."* |
| **Projection of Lines** | `"line AB"`, `"True Length"`, `"inclined at ... to HP"`, `"inclined at ... to VP"`, `"apparent angles"` | *"A line AB 90mm long has its end A 20mm above HP and 30mm in front of VP..."* |
| **Projection of Planes** | `"surface inclined"`, `"pentagonal plate"`, `"circular lamina"`, `"resting on edge"` | *"A regular pentagonal plate of side 30mm has one edge on HP inclined at 45° to VP..."* |
| **Projection of Solids** | `"pentagonal prism"`, `"cone of base diameter"`, `"axis inclined"`, `"resting on generator"` | *"A cone of base diameter 50mm and axis 70mm rests on HP on a point of its base rim..."* |
| **Sections of Solids** | `"cutting plane"`, `"section plane"`, `"sectional front view"`, `"true shape of section"` | *"A square pyramid is cut by a section plane perpendicular to VP and inclined at 45° to HP..."* |
| **Developments** | `"develop surface"`, `"unwrapping"`, `"parallel line method"`, `"radial line method"` | *"Draw the development of the lateral surface of the truncated cylinder..."* |
| **Isometric Projection** | `"isometric view"`, `"isometric scale"`, `"pictorial view"` | *"Draw the isometric view of a sphere resting on top of a square prism..."* |
