---
name: deephub-multilingual-localization
description: Guidelines for managing the 11 Indian Regional Languages localization engine, national/state examination board alignments (CBSE, ICSE, State Boards), and visual theme presets across DeepHub AI.
---

# DeepHub AI Multilingual Localization & Theming Guide

This skill governs the regional language architecture and theme system across DeepHub AI.

## 1. Supported Indian Regional Languages
DeepHub AI supports **11 regional Indian languages + English**:

| Code | Language | Native Script | Target Regions |
| :--- | :--- | :--- | :--- |
| `en` | English | English | Pan-India & Global |
| `hi` | Hindi | हिंदी | North & Central India |
| `bn` | Bengali | বাংলা | West Bengal, Tripura, Assam |
| `te` | Telugu | తెలుగు | Andhra Pradesh, Telangana |
| `mr` | Marathi | मराठी | Maharashtra |
| `ta` | Tamil | தமிழ் | Tamil Nadu, Puducherry |
| `gu` | Gujarati | ગુજરાતી | Gujarat |
| `kn` | Kannada | ಕನ್ನಡ | Karnataka |
| `ml` | Malayalam | മലയാളം | Kerala |
| `pa` | Punjabi | ਪੰਜਾਬੀ | Punjab, Chandigarh, Delhi |
| `or` | Odia | ଓଡ଼ିଆ | Odisha |

## 2. Localization Implementation Rules
1. **Never mutate English on first load**: Always initialize strictly with `'en'` unless the user explicitly chose another language.
2. **Translate UI cleanly**: Use `t(key)` from `useLanguage()` hook in [`LanguageContext.tsx`](file:///home/ospoks/DeepHubAI-main/src/context/LanguageContext.tsx).
3. **Hide Google Translate clutter**: Always maintain the clean hidden styling for `.goog-te-banner-frame`, `iframe.skiptranslate`, and tooltips to keep the UI sleek and native.

## 3. Theme Engine
Four curated themes are defined via `data-theme` attribute on `<html>`:
- `cyber-dark` (Default high-contrast black/cyan)
- `midnight-blue` (Deep navy with indigo accents)
- `emerald-neon` (Carbon black with vivid emerald highlights)
- `light` (Solar crisp light mode for daylight reading)
