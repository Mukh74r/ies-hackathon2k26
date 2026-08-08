---
name: deephub-ui-ux-design-system
description: Design tokens, glassmorphism aesthetics, responsive layout principles, typography rules, and micro-animation standards for DeepHub AI web applications. Activate when building, styling, or auditing UI/UX components.
---

# DeepHub AI UI/UX Design System & Aesthetics Guide

This skill governs the aesthetic presentation, responsive layouts, color harmony, and interaction design across DeepHub AI.

## 1. Design Philosophy & Visual Tokens
DeepHub AI utilizes a **frontier, high-contrast glassmorphic aesthetic**:
- **Background**: Deep carbon black `#020408` and `#080C14` with subtle radial gradient glows.
- **Card Surfaces**: Translucent dark layers `bg-white/[0.03]` with thin glowing borders `border-white/10`.
- **Primary Accents**: Electric Cyan `#00A4E4` and Indigo Blue `#6E85D6`.
- **Status Indicators**: Emerald Green `#10B981` (active/success), Amber `#F59E0B` (warning), Coral `#EF4444` (error).

## 2. Typography Standards
Never use default browser fonts. Always apply curated font hierarchies:
- **Headings & Display**: `font-display` (`Outfit`, `Plus Jakarta Sans`)
- **Body & Academic Text**: `font-sans-academic` (`Inter`)
- **Technical Badges & Code**: `font-mono-stamp` (`Space Mono`)

## 3. Micro-Animations & Interactivity
- **Hover Transitions**: Add `card-lift` (`transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease`) on interactive cards and buttons.
- **Active State**: Apply `active:scale-98` for tactile button feedback.
- **Loading States**: Display animated skeleton loaders (`ProductSkeleton`) or spinning pulse rings instead of empty boxes.
- **Toast / Copy Confirmation**: Provide visual checkmark icons and short countdown toasts on copy, save, and download actions.

## 4. Responsive Breakpoint Rules
- **Desktop ($\ge 1024\text{px}$)**: Fixed left sidebar (`TurboSidebar`) with collapsed/expanded modes, multi-column grid layouts.
- **Tablet ($768\text{px} - 1023\text{px}$)**: Two-column cards, collapsible drawer menus.
- **Mobile ($< 768\text{px}$)**: Full-width responsive cards, top app bar (`h-14`), slide-over drawer backdrop, and the floating **Watch Dial** quick-switcher for 1-tap navigation.
