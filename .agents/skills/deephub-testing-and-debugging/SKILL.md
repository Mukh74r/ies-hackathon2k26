---
name: deephub-testing-and-debugging
description: Comprehensive testing protocols, TypeScript type checking, static bundle verification, and runtime debugging procedures for DeepHub AI. Activate when verifying builds, testing offline resilience, or debugging runtime exceptions.
---

# DeepHub AI Testing & Debugging Guide

This skill governs testing workflows, build certification, and error diagnosis across DeepHub AI.

## 1. Automated Verification Commands
Run before concluding any engineering task:

1. **TypeScript Type Integrity**:
   ```bash
   npx tsc --noEmit
   ```
   Must exit with code 0 and zero compilation errors across all `.ts` and `.tsx` files.

2. **Production Bundle Verification**:
   ```bash
   npm run build
   ```
   Must successfully generate all minified chunks in `dist/assets/` without bundling exceptions.

3. **Git Hygiene & Clean Status**:
   ```bash
   git status -s
   ```
   Ensure all intended files are tracked and documented.

## 2. Runtime Debugging & SPA Resilience
- **SPA JSON Parsing Errors**: When deployed to static hosts (AWS Amplify / CloudFront), API routes return `index.html` unless a live backend server is mapped. Always use `safeFetchJson()` to intercept HTML before calling `.json()`.
- **Client Fallback Execution**: When server endpoints return HTML or offline status, execute `callDirectGroqInference()` or deterministic structured fallback generators to ensure seamless user experience.
- **Client Storage Hydration**: Verify that custom tools (`deephub_custom_tools`) and generated library assets (`deephub_library_items`) hydrate properly on component mount.
