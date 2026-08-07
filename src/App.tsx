import React from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// IMPORT PROVIDERS & TOASTERS
import { TooltipProvider } from "./components/product/ProductTooltip";
import { ProductToaster } from "./components/product/ProductToaster";

// Existing Components
import Navbar from "./components/Navbar";
import FloatingThemeToggle from "./components/FloatingThemeToggle";

// ⚠️  MAINTENANCE MODE — set to false to go live
const MAINTENANCE_MODE = false;

// Pages
const Maintenance = React.lazy(() => import("./pages/Maintenance"));
// Aboutus is the ROOT route — eager import eliminates extra round-trip in LCP critical path
import Aboutus from "./pages/Aboutus";
const Home = React.lazy(() => import("./pages/Home"));
const Latest = React.lazy(() => import("./pages/Latest"));
const Virtualbrain = React.lazy(() => import("./pages/Virtualbrain"));
const Circuitbrain = React.lazy(() => import("./pages/Circuitbrain"));
const Profile = React.lazy(() => import("./pages/Profile"));
const Login = React.lazy(() => import("./pages/Login"));
const Signup = React.lazy(() => import("./pages/Signup"));
const Reportaissue = React.lazy(() => import("./pages/Reportaissue"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const AdminHealth = React.lazy(() => import("./pages/AdminHealth"));
const Turbo = React.lazy(() => import("./pages/Turbo"));
const Restricted = React.lazy(() => import("./pages/Restricted"));
const CompleteProfile = React.lazy(() => import("./pages/CompleteProfile"));
const TermsAndConditions = React.lazy(() => import("./pages/TermsAndConditions"));
const PrivacyPolicy = React.lazy(() => import("./pages/PrivacyPolicy"));
const RefundPolicy = React.lazy(() => import("./pages/RefundPolicy"));
const Pricing = React.lazy(() => import("./pages/Pricing"));
const ForgotPassword = React.lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));

import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

function LayoutWrapper() {
    const location = useLocation();

    // ⚠️  MAINTENANCE MODE: Intercept ALL routes
    if (MAINTENANCE_MODE) {
        return (
            <React.Suspense fallback={
                <div className="flex h-screen w-full items-center justify-center bg-[#020408]">
                    <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
                </div>
            }>
                <Maintenance />
            </React.Suspense>
        );
    }

    // DEFINITION: Routes where we want clean standalone look (No global Navbar)
    const isAboutUsPage =
        location.pathname === "/" ||
        location.pathname === "/home" ||
        location.pathname === "/admin-hq" ||
        location.pathname === "/terms" ||
        location.pathname === "/privacy" ||
        location.pathname === "/refund" ||
        location.pathname === "/pricing";

    return (
        <div className="min-h-screen flex flex-col bg-background selection:bg-amber-500/30">

            {/* 1. RESTRICTED NAVBAR: 
          Hidden on Home (/ and /home), About Us, Admin, Pricing, etc. */}
            {!isAboutUsPage && <Navbar />}

            <main className="flex-grow flex flex-col">
                <React.Suspense fallback={
                    <div className="flex h-[80vh] w-full items-center justify-center">
                        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
                    </div>
                }>
                    <Routes>
                        {/* Dedicated Root & Home Page */}
                        <Route path="/" element={<Home />} />
                        <Route path="/home" element={<Home />} />
                        <Route path="/aboutus" element={<Aboutus />} />

                        {/* Gated Core Pages */}
                        <Route path="/latest" element={<ProtectedRoute><Latest /></ProtectedRoute>} />
                        <Route path="/virtualbrain" element={<ProtectedRoute><Virtualbrain /></ProtectedRoute>} />
                        <Route path="/circuitbrain" element={<ProtectedRoute><Circuitbrain /></ProtectedRoute>} />
                        <Route path="/turbo" element={<ProtectedRoute><Turbo /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                        <Route path="/admin-hq" element={<ProtectedRoute><AdminHealth /></ProtectedRoute>} />
                        <Route path="/report" element={<ProtectedRoute><Reportaissue /></ProtectedRoute>} />
                        <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />
                        
                        {/* Account & Login Bypass - Redirect straight to /latest */}
                        <Route path="/login" element={<Navigate to="/latest" replace />} />
                        <Route path="/signup" element={<Navigate to="/latest" replace />} />
                        <Route path="/forgot-password" element={<Navigate to="/latest" replace />} />
                        <Route path="/reset-password" element={<Navigate to="/latest" replace />} />
                        <Route path="/restricted" element={<Navigate to="/latest" replace />} />

                        {/* RBI Compliance Pages */}
                        <Route path="/terms" element={<TermsAndConditions />} />
                        <Route path="/privacy" element={<PrivacyPolicy />} />
                        <Route path="/refund" element={<RefundPolicy />} />
                        <Route path="/pricing" element={<Pricing />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </React.Suspense>
            </main>

            {/* Global Theme Toggle Floating Widget */}
            <FloatingThemeToggle />

            {/* Global Feedback Provider (Shadcn/Lovable system) */}
            <ProductToaster />
        </div>
    );
}

import { AIProvider } from "./context/AIContext";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || "1052513478675-1s2pucjrq99qljnd3fdv0uv6b5j1018b.apps.googleusercontent.com";

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider delayDuration={0}>
                <AuthProvider>
                    <LanguageProvider>
                        <AIProvider>
                            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                                <LayoutWrapper />
                            </BrowserRouter>
                        </AIProvider>
                    </LanguageProvider>
                </AuthProvider>
            </TooltipProvider>
        </QueryClientProvider>
    );
}

