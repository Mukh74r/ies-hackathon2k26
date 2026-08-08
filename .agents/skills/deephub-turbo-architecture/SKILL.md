---
name: deephub-turbo-architecture
description: Architectural guidelines, design patterns, and engineering standards for DeepHub AI Turbo Tools, Tool Studio, and Dynamic AI execution engines. Activate when building, extending, or debugging any pedagogical tool, prompt template, or custom AI micro-tool in DeepHub AI.
---

# DeepHub AI Turbo Architecture & Tool Engineering Guide

This skill governs the development, extension, and maintenance of all AI-powered educator tools within the DeepHub AI Turbo ecosystem.

## 1. Dual-Tier Execution Engine & Resilience
All Turbo tools follow a high-resilience architecture:

1. **Tier 1 — Backend Cloud API**:
   - Routes: `/api/tool-studio/run`, `/api/question-paper/generate`, `/api/lesson-plan/generate`, etc.
   - Uses centralized `safeFetchJson()` to safely intercept HTML fallbacks from SPA routers (e.g. AWS Amplify) without throwing `SyntaxError`.
2. **Tier 2 — Direct Client-Side Groq Inference**:
   - Function: `callDirectGroqInference(messages, systemPrompt)`
   - Uses `llama-3.3-70b-versatile` LPU acceleration with sub-second response times.
3. **Tier 3 — Deterministic Structured Fallback**:
   - Structured fallback generators that ensure the user always receives high-quality, formatted content even in complete offline scenarios.

## 2. Dynamic Tool Schema Structure
All custom tools generated in Tool Studio or stored in `localStorage` conform to `ToolSchema`:

```typescript
interface ToolSchema {
    toolId: string;
    name: string;
    description: string;
    icon: string;
    category: 'Writing' | 'Planning' | 'Assessment' | 'Communication' | 'Admin' | 'Creative';
    outputLabel: string;
    outputFormat: 'text' | 'markdown';
    fields: ToolField[];
    promptTemplate: string;
    sampleOutput?: string;
}
```

### Supported Field Types:
- `text`: Single-line text input
- `textarea`: Multi-line prompt context
- `number`: Numeric input with min, max, step
- `select`: Single-option dropdown with `options: string[]`
- `multiselect`: Multi-choice toggle chips
- `toggle`: Boolean on/off switch
- `slider`: Interactive range slider with live numerical badge
- `tags`: Dynamic tag chip adder (Enter key or click)

## 3. Prompt Template Interpolation
Prompt templates must use `{fieldId}` placeholders matching field definitions:
```
Generate an assessment rubric for "{assignmentTitle}" in {grade} {subject}.
Number of criteria: {criteriaCount}.
Scoring Scale: {scaleType}.
Specific dimensions: {specialFocus}.
```
Arrays/tags are joined with commas, booleans with "Yes"/"No".

## 4. LocalStorage Synchronization Protocol
- Custom tools are saved to `localStorage.getItem('deephub_custom_tools')`.
- All generated academic assets (question papers, lesson plans, speeches, rubrics, homework) are automatically persisted to `localStorage.getItem('deephub_library_items')`.
- This guarantees zero data loss on page refresh or across sessions.
