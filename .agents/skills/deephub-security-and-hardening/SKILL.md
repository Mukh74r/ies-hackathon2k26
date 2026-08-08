---
name: deephub-security-and-hardening
description: Security standards, zero secret exposure, prompt injection sanitization, input validation, XSS prevention, and strict CSP policies for DeepHub AI. Activate when reviewing security posture, handling credentials, or auditing user input paths.
---

# DeepHub AI Security & Hardening Guide

This skill governs security policies, vulnerability prevention, and data protection across DeepHub AI.

## 1. Secret Protection & Credential Handling
- **No Raw Secrets in Context**: Never hardcode production database passwords, AWS secret access keys, or private signing keys into code.
- **Client Key Isolation**: Browser-side keys (e.g. Groq client fallback keys) must be loaded dynamically through `import.meta.env` or client localStorage, never leaked in public logs.
- **AWS Secrets Manager Integration**: Use AWS Secrets Manager agent or environment variables in server runtime.

## 2. Input Sanitization & XSS Mitigation
- **Markdown & LaTeX Rendering**: All AI outputs rendered via `ReactMarkdown` and `rehypeKatex` must prevent raw script tag execution.
- **HTML Sanitization**: Use `DOMPurify` whenever injecting raw HTML into DOM nodes.
- **Zod Validation**: Validate all incoming server requests with strict Zod schemas (`LibraryItemZodSchema`, `QuestionPaperZodSchema`).

## 3. Authentication & Authorization
- **JWT Authorization**: Enforce `Bearer <token>` headers on all gated routes (`/turbo`, `/profile`, `/circuitbrain`, `/virtualbrain`, `/latest`).
- **Safe Error Masking**: Never return raw SQL, database stack traces, or internal file paths to client API responses.
- **CSRF & Origin Protection**: Verify `origin` and `referrer` headers on sensitive payment endpoints (`/api/payment/*`).
