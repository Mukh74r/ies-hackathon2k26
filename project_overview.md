# DeepHubAI — Full Project Overview

## What It Is
**DeepHubAI** is a full-stack AI-powered EdTech / productivity web platform for students and teachers. It provides AI chat, document analysis (OCR, PDF), lesson/PPT generation, a news feed, a personal library, and a subscription ("Pro") system.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + TypeScript, Vite, TailwindCSS, shadcn/ui (Radix primitives) |
| **State** | Zustand (global), React Context (Auth, AI), TanStack Query (server state) |
| **Animations** | GSAP, Framer Motion (`motion`), Three.js |
| **Backend** | Node.js + Express 5 (TypeScript, compiled via [tsx](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/src/App.tsx)) |
| **Database** | MongoDB (Mongoose) OR AWS DynamoDB (env-switched via `USE_DYNAMODB`) |
| **AI Providers** | Groq (`llama-3.3-70b`), Google Gemini, Moonshot Kimi, Ollama (local LLM) |
| **Auth** | JWT (7-day tokens), bcryptjs, Google OAuth (`@react-oauth/google`) |
| **Payments** | Razorpay (Indian gateway — ₹66 / 3-month Pro plan) |
| **File Storage** | AWS S3 (via `multer-s3`) |
| **Email** | AWS SES via `nodemailer` |
| **Deploy** | AWS ECS/Fargate + CloudFormation; Dockerfile present; Amplify config |

---

## Running the Project

```bash
npm run dev      # Vite frontend on :5173
npm run server   # Express backend on :3001 (tsx server.ts)
```

---

## Frontend Architecture

### Entry Point
- [index.html](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/index.html) → [src/main.tsx](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/src/main.tsx) → [src/App.tsx](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/src/App.tsx)
- Providers stack: `QueryClientProvider` → `TooltipProvider` → [AuthProvider](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/src/context/AuthContext.tsx#43-85) → `AIProvider` → `BrowserRouter`

### Routing (App.tsx)
| Route | Page | Auth Required |
|---|---|---|
| `/` `/aboutus` `/home` | `Aboutus` | ❌ Public |
| `/latest` | `Latest` | ✅ Protected |
| `/virtualbrain` | `Virtualbrain` | ✅ Protected |
| `/circuitbrain` | `Circuitbrain` | ✅ Protected |
| `/turbo` | `Turbo` | ✅ Protected |
| `/profile` | `Profile` | ✅ Protected |
| `/admin-hq` | `AdminHealth` | ✅ Protected |
| `/login` `/signup` | Auth pages + GoogleOAuthProvider | ❌ Public |
| `/forgot-password` `/reset-password` | Password reset | ❌ Public |
| `/pricing` | `Pricing` | ❌ Public |
| `/terms` `/privacy` `/refund` | Legal pages | ❌ Public |

> `MAINTENANCE_MODE = false` in [App.tsx](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/src/App.tsx) — toggling it to `true` redirects all routes to [Maintenance.tsx](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/src/pages/Maintenance.tsx).

### Navbar Logic
- Routes on `isAboutUsPage` list (home, login, etc.) hide the global `Navbar`.
- Inner pages (Virtualbrain, Circuitbrain, Latest, etc.) render the global `Navbar`.

### Lazy Loading
All pages except `Aboutus` are `React.lazy()`-loaded for code splitting.

---

## Core Pages

| Page | Description |
|---|---|
| [Aboutus.tsx](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/src/pages/Aboutus.tsx) | Landing/home page (eager loaded for LCP performance) |
| [Latest.tsx](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/src/pages/Latest.tsx) | AI news feed with search bar |
| [Virtualbrain.tsx](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/src/pages/Virtualbrain.tsx) | AI chat interface (VirtualBrain mode) |
| [Circuitbrain.tsx](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/src/pages/Circuitbrain.tsx) | AI chat interface (CircuitBrain mode) |
| [Turbo.tsx](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/src/pages/Turbo.tsx) | Turbo AI (fast model) chat |
| [Profile.tsx](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/src/pages/Profile.tsx) | User profile, stats, Pro subscription UI |
| [Pricing.tsx](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/src/pages/Pricing.tsx) | Pricing tiers (Free / Pro) |
| [AdminHealth.tsx](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/src/pages/AdminHealth.tsx) | Admin dashboard (system health monitoring) |
| [CompleteProfile.tsx](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/src/pages/CompleteProfile.tsx) | Post-signup profile completion form |
| [Login.tsx](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/src/pages/Login.tsx) / [Signup.tsx](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/src/pages/Signup.tsx) | Auth flows (email/password + Google OAuth) |
| [ForgotPassword.tsx](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/src/pages/ForgotPassword.tsx) / [ResetPassword.tsx](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/src/pages/ResetPassword.tsx) | Password reset flow via email token |
| [Restricted.tsx](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/src/pages/Restricted.tsx) | Role-restricted access page |
| [Maintenance.tsx](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/src/pages/Maintenance.tsx) | Full-screen maintenance gate |

---

## Auth System

### Frontend ([src/context/AuthContext.tsx](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/src/context/AuthContext.tsx))
- [DeepHubUser](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/src/context/AuthContext.tsx#3-31) interface: `userId`, `email`, `username`, `role` (`student` / `teacher` / `admin`), `isPro`, `provider` (`local` / [google](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/server/services/AuthService.ts#82-160)), etc.
- Auth state persisted to `localStorage` (`token`, `user`)
- Exports: [useAuth()](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/src/context/AuthContext.tsx#86-93) hook, [login()](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/src/context/AuthContext.tsx#58-64), [logout()](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/src/context/AuthContext.tsx#65-71), [updateDeepHubUser()](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/src/context/AuthContext.tsx#72-78)

### Backend ([server/services/AuthService.ts](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/server/services/AuthService.ts))
- **Register**: Auto-generates username from name, hashes password (bcrypt 12 rounds), saves to Mongo or DynamoDB
- **Login**: Accepts email or username, verifies bcrypt, returns 7-day JWT
- **Google Login**: Finds or creates user from Google OAuth token; links `googleId`
- **Password Reset**: Generates random 64-char hex token, stores with 1-hr expiry, sends email via SES

### Route: `/api/auth` → [server/routes/auth.ts](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/server/routes/auth.ts)

---

## AI System

### AIService ([server/services/AIService.ts](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/server/services/AIService.ts))
A unified AI abstraction supporting 4 providers:

| Provider | Default Model | Notes |
|---|---|---|
| **Groq** | `llama-3.3-70b-versatile` | Primary (fastest) |
| **Gemini** | `gemini-2.0-flash` | Used for search-grounded responses |
| **Kimi** | Moonshot cloud | Fallback |
| **Ollama** | `llama3.2:3b` | Local inference (self-hosted) |

- Provider is selected via `DEFAULT_AI_PROVIDER` env var or per-request `provider` field
- 10-minute timeout (`NEURAL_TIMEOUT_MS = 600000`)
- Web search injection for Gemini/Groq when `webSearch: true`

### Chat Route (`/api/chat`)
- Supports `mode` (normal, etc.) → maps to system prompts from [server/config/prompts.js](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/server/config/prompts.js)
- Owner-identity shortcircuit via `isOwnerQuestion()` helper
- Broadcasts events (`broadcast()`) to admin monitoring websocket

---

## Data Layer

### Dual-Mode DB
Controlled by `USE_DYNAMODB=true/false` env var:
- **MongoDB**: Local or Atlas via `MONGO_URI`. Falls back to in-memory `MongoMemoryServer` if no local instance found
- **DynamoDB**: AWS via [DynamoService.ts](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/server/services/DynamoService.ts) (production default on AWS deployment)

### User Model (MongoDB / DynamoDB)
Key fields: `email`, `username`, `firstName`, `lastName`, `googleId`, `avatar`, `role`, `isPro`, `proExpiresAt`, `razorpayPaymentId`, `specialization`, `primaryNode`, `preferences`

### Other Models
- [LibraryItem.ts](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/server/models/LibraryItem.ts) — saved documents/resources
- [QuestionPaper.ts](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/server/models/QuestionPaper.ts) — teacher-generated question papers

---

## Payment System ([server/services/PaymentService.ts](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/server/services/PaymentService.ts))
- **Gateway**: Razorpay (India)
- **Plan**: Pro — ₹66 / 3 months
- **Flow**: [createOrder()](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/server/services/PaymentService.ts#23-55) → frontend opens Razorpay checkout → [verifyPayment()](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/server/services/PaymentService.ts#56-104) (HMAC-SHA256 signature check) → user `isPro` flag set in DB with `proExpiresAt`
- Route: `/api/payment`

---

## Backend Services Summary

| Service | Purpose |
|---|---|
| [AIService](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/server/services/AIService.ts#25-198) | Multi-provider AI completions (Groq, Gemini, Kimi, Ollama) |
| [AuthService](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/server/services/AuthService.ts#9-249) | Register, login, Google OAuth, password reset |
| `DynamoService` | AWS DynamoDB CRUD for users, usage, etc. |
| `EmailService` | SES-powered transactional emails (password reset, etc.) |
| `LibraryService` | User document library management |
| [PaymentService](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/server/services/PaymentService.ts#22-127) | Razorpay order creation and signature verification |
| `ProfileService` | User profile update operations |
| `TeacherService` | Lesson plans, question paper generation, PPT creation |
| `UsageService` | Track and limit AI usage per user |

---

## API Routes

| Prefix | Route File | Purpose |
|---|---|---|
| `/api/auth` | [auth.ts](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/server/routes/auth.ts) | Auth (register, login, Google, password reset) |
| `/api/chat` | [chat.ts](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/server/routes/chat.ts) | AI chat endpoint |
| `/api/files` | [files.ts](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/server/routes/files.ts) | File upload/management (S3) |
| `/api/ocr` | [ocr.ts](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/server/routes/ocr.ts) | OCR (Tesseract.js) |
| `/api/library` | [library.ts](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/server/routes/library.ts) | User library CRUD |
| `/api/telemetry` | [telemetry.ts](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/server/routes/telemetry.ts) | Usage/analytics events |
| `/api/ppt` | [ppt.ts](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/server/routes/ppt.ts) | AI-powered PPT generation |
| `/api/payment` | [payment.ts](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/server/routes/payment.ts) | Razorpay integration |
| `/api/admin` | [admin.ts](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/server/routes/admin.ts) | Admin health/monitoring |
| `/api` | [teacher.ts](file:///c:/Users/LENOVO/OneDrive/Desktop/DeepHubAI/server/routes/teacher.ts) | Teacher-specific endpoints |

---

## Component Architecture

### UI Layer (`src/components/product/`)
Comprehensive shadcn/ui-style component library (~48 components):
`ProductButton`, `ProductCard`, `ProductDialog`, `ProductDropdownMenu`, `ProductForm`, `ProductSidebar`, `ProductTable`, `ProductChart`, `ProductToast`, etc.

### Feature Components (`src/components/`)
- `Navbar.tsx` — Global navigation bar (19 KB, complex)
- `ProtectedRoute.tsx` — Auth guard wrapper
- `CubeLoader.tsx` — Animated loading screen
- `NeonRing.tsx` — 3D visual element
- `AIModelSwitcher.tsx` — Switch between AI providers
- `FloatingThemeToggle.tsx` — Dark/light mode toggle

---

## Security

- `helmet` — HTTP security headers with strict CSP
- `express-rate-limit` — 100 req / 15 min per IP on `/api/`
- CORS: wildcard origin (open — intended for dev/staging)
- JWT tokens: 7-day expiry
- Passwords: bcrypt with 12 rounds
- Upload directories auto-created: `uploads/`, `uploads/question-papers/`, `uploads/general/`

---

## Environment Variables (`.env`)
Key vars expected:
- `GROQ_API_KEY`, `GEMINI_API_KEY`, `KIMI_API_KEY`
- `VITE_GOOGLE_CLIENT_ID` (frontend)
- `JWT_SECRET`
- `MONGO_URI` or `USE_DYNAMODB=true`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`
- `OLLAMA_BASE_URL` (optional — for local LLM)
- `PORT` (default: 3001)
