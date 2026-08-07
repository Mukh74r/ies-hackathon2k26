import express from "express";

const router = express.Router();

router.get("/intel", async (req, res) => {
    try {
        // Use a reliable service that returns detailed IP info
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        
        // Return structured data to the frontend
        res.json({
            ip: data.ip || "0.0.0.0",
            city: data.city || "Unknown",
            country: data.country_name || "Unknown",
            isp: data.org || "System"
        });
    } catch (err: any) {
        console.error("[TELEMETRY] Failed to fetch IP intel:", err.message);
        res.status(500).json({ 
            error: "TELEMETRY_FAILURE",
            ip: "127.0.0.1",
            city: "Local",
            country: "Internal",
            isp: "System"
        });
    }
});

export default router;
