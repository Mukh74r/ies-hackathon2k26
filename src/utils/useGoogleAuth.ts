import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useAuth, DeepHubUser } from "../context/AuthContext";
import { apiEndpoint } from "./api"; // Static import for stability

/**
 * Shared hook that handles the Google OAuth flow:
 * 1. Opens Google consent popup via @react-oauth/google
 * 2. Sends the credential to our backend /api/auth/google
 * 3. Calls AuthContext login() and navigates to /latest
 */
export function useGoogleAuth() {
    const { login } = useAuth();
    const navigate  = useNavigate();

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            console.log("🚀 [GoogleAuth] Popup Success. Fetching user info...");
            window.dispatchEvent(new CustomEvent("google-auth-loading", { detail: true }));
            
            try {
                // 1. Fetch user info from Google
                const infoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                
                if (!infoRes.ok) throw new Error("Failed to fetch user info from Google");
                const googleUser = await infoRes.json();
                console.log("👤 [GoogleAuth] Google Identity Received:", googleUser.email);

                // 2. Sync with DeepHub Backend
                console.log("🛰️ [GoogleAuth] Syncing with DeepHub Backend...");
                const res = await fetch(apiEndpoint("/api/auth/google"), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ googleUser }),
                });

                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    console.error("❌ [GoogleAuth] Backend Sync Failed:", err);
                    throw new Error(err.message || err.error || "Google sync failed");
                }

                const data = await res.json();
                console.log("✅ [GoogleAuth] Authentication Complete. Redirecting...");
                
                // 3. Finalize Session
                login(data.token, data.user as DeepHubUser);
                
                // New users need to complete their profile first
                if (data.isNewUser) {
                    console.log("🆕 [GoogleAuth] New user detected → Complete Profile");
                    navigate("/complete-profile");
                } else {
                    navigate("/latest");
                }
            } catch (err) {
                console.error("💥 [GoogleAuth] Critical Error:", err);
                window.dispatchEvent(new CustomEvent("google-auth-error", { detail: String(err) }));
            } finally {
                window.dispatchEvent(new CustomEvent("google-auth-loading", { detail: false }));
            }
        },
        onError: (err) => {
            console.error("❌ [GoogleAuth] OAuth Popup Error:", err);
            window.dispatchEvent(new CustomEvent("google-auth-error", { detail: "Google sign-in was cancelled or failed." }));
        },
    });

    return { handleGoogleLogin };
}
