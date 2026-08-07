import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import compression from "compression";

// Import Modular Routes
import authRoutes from "./server/routes/auth.ts";
import chatRoutes from "./server/routes/chat.ts";
import fileRoutes from "./server/routes/files.ts";
import ocrRoutes from "./server/routes/ocr.ts";
import teacherRoutes from "./server/routes/teacher.ts";
import libraryRoutes from "./server/routes/library.ts";
import telemetryRoutes from "./server/routes/telemetry.ts";
import pptRoutes from "./server/routes/ppt.ts";
import paymentRoutes from "./server/routes/payment.ts";
import adminRoutes from "./server/routes/admin.ts";
import graphicsRoutes from "./server/routes/graphics.ts";


// Import Global Middleware
import { errorHandler } from "./server/middleware/error.ts";

/* ==================== APP INIT ==================== */
const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for dev tunnels / LB
app.set('trust proxy', 1);

/* ==================== DATABASE ==================== */
const USE_DYNAMODB = process.env.USE_DYNAMODB === "true";

const connectDB = async () => {
    if (USE_DYNAMODB) {
        console.log("⚡ DYNAMODB_MODE_ACTIVE: Skipping MongoDB. Neural Core runs on AWS.");
        return;
    }
    // Only import Mongoose/MongoMemoryServer if NOT in DynamoDB mode
    const { default: mongoose } = await import("mongoose");
    const MONGO_URI = process.env.MONGO_URI;
    try {
        if (MONGO_URI && MONGO_URI !== "mongodb://127.0.0.1:27017/deephub_ai" && MONGO_URI !== "NOT_USED_DYNAMODB_ACTIVE") {
            await mongoose.connect(MONGO_URI);
            console.log("🍃 DB_CONNECTED (CLUSTERING_ACTIVE)");
        } else {
            try {
                await mongoose.connect("mongodb://127.0.0.1:27017/deephub_ai", { serverSelectionTimeoutMS: 2000 });
                console.log("🍃 DB_CONNECTED (LOCAL_NODE)");
            } catch {
                console.log("⚠️  Local Node Offline. Initializing Volatile Memory Node...");
                const { MongoMemoryServer } = await import("mongodb-memory-server");
                const mongoServer = await MongoMemoryServer.create();
                const uri = mongoServer.getUri();
                await mongoose.connect(uri);
                console.log("🧠 MEMORY_NODE_ONLINE (Zero-Config Mode)");
            }
        }
    } catch (err) {
        console.error("❌ CRITICAL_DATABASE_FAILURE:", err);
    }
};

connectDB();

/* ==================== PERFORMANCE ==================== */
app.use(compression({
    filter: (req, res) => {
        if (req.url === "/api/neural-feed") return false;
        return compression.filter(req, res);
    }
}));

/* ==================== DEBUG LOGGER ==================== */
// Common automated bot scan paths to ignore in logs
const muteLogPaths = ['.env', 'phpinfo', 'config', 'xampp', 'backup', '.git', 'sftp.json', '.ssh', 'jenkins'];

app.use((req, res, next) => {
    // Only log if it's not a known bot scan
    if (!muteLogPaths.some(p => req.url.toLowerCase().includes(p))) {
        // Also suppress excessive /health checks
        if (req.url !== '/health') {
            console.log(`📡 [${req.method}] ${req.url}`);
        }
    }
    
    res.setHeader("X-Neural-Source", "DeepHub-Core-v2-Patch-20-Ollama-Optimization");
    next();
});

/* ==================== SECURITY & PERFORMANCE ==================== */
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            "default-src": ["'self'"],
            "script-src": ["'self'", "'unsafe-inline'", "blob:", "https://cdn.jsdelivr.net", "https://accounts.google.com", "https://checkout.razorpay.com", "'unsafe-eval'", "'wasm-unsafe-eval'"],
            "worker-src": ["'self'", "blob:", "https://cdn.jsdelivr.net"],
            "script-src-attr": ["'unsafe-inline'"],
            "style-src": ["'self'", "'unsafe-inline'", "https:", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net", "https://accounts.google.com"],
            "img-src": ["'self'", "data:", "blob:", "https:", "https://*.google.com", "https://*.gstatic.com", "https://images.unsplash.com", "https://github.com", "https://*.github.com"],
            "connect-src": ["'self'", "https:", "https://huggingface.co", "https://*.huggingface.co", "https://newsapi.org", "https://*.newsapi.org", "https://cdn.jsdelivr.net", "https://*.gstatic.com", "https://tessdata.projectnaptha.com", "https://accounts.google.com", "https://www.googleapis.com", "https://api.razorpay.com", "https://*.razorpay.com"],
            "font-src": ["'self'", "https:", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net", "data:"],
            "frame-src": ["'self'", "https://accounts.google.com", "https://api.razorpay.com", "https://checkout.razorpay.com"],
            "object-src": ["'none'"],
            "upgrade-insecure-requests": [],
        },
    },
    // CRITICAL: Allow Google OAuth popup to communicate back to the opener window
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per window
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'TOO_MANY_REQUESTS', message: 'Take a breath. Neural bandwidth exceeded.' }
});

app.use("/api/", limiter);

app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }),
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

/* ==================== PATH FIX (ESM) ==================== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directories exist
const uploadDirs = ["uploads", "uploads/question-papers", "uploads/general"];
uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});



/* ==================== HEALTH CHECK ==================== */
app.get(["/health", "/api/health"], (req, res) => {
    res.status(200).json({
        status: "ONLINE",
        mode: process.env.USE_DYNAMODB === "true" ? "DYNAMODB" : "MONGO",
        uptime: Math.round(process.uptime()),
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/ocr", ocrRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/telemetry", telemetryRoutes);
app.use("/api/ppt", pptRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/graphics", graphicsRoutes);
app.use("/api", teacherRoutes);

/* ==================== GLOBAL ERROR HANDLER ==================== */
app.use(errorHandler);

/* ==================== STATIC SERVING (PRODUCTION) ==================== */

const distPath = path.resolve(__dirname, "dist");
const assetsPath = path.resolve(distPath, "assets");

console.log("📂 DIST PATH:", distPath);
console.log("📂 ASSETS PATH:", assetsPath);
console.log("📂 DIST EXISTS:", fs.existsSync(distPath));
console.log("📂 ASSETS EXISTS:", fs.existsSync(assetsPath));

if (fs.existsSync(assetsPath)) {
    console.log("📦 ASSET FILES:", fs.readdirSync(assetsPath));
}

/*
 * 1. Serve Vite hashed assets.
 *
 * Browser:
 * /assets/robomaster-s1-xxxxx.jpeg
 *
 * Container:
 * /app/dist/assets/robomaster-s1-xxxxx.jpeg
 */
app.use(
    "/assets",
    express.static(assetsPath, {
        maxAge: "1y",
        immutable: true,
        index: false,

        setHeaders: (res) => {
            res.setHeader(
                "Cache-Control",
                "public, max-age=31536000, immutable"
            );
        },
    })
);


/*
 * 2. IMPORTANT:
 * If /assets/... reaches this point, the file does not exist.
 *
 * Never return React index.html for a missing asset.
 */
app.use("/assets", (req, res) => {

    console.error(
        `❌ STATIC ASSET NOT FOUND: ${req.originalUrl}`
    );

    res
        .status(404)
        .type("text/plain")
        .send("Asset not found");
});


/*
 * 3. Serve other files generated by Vite:
 *
 * favicon
 * manifest
 * etc.
 */
app.use(
    express.static(distPath, {
        maxAge: 0,
        index: false,

        setHeaders: (res, filePath) => {

            if (
                /\.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2|ttf|otf)$/i.test(
                    filePath
                )
            ) {

                res.setHeader(
                    "Cache-Control",
                    "public, max-age=31536000, immutable"
                );

            } else {

                res.setHeader(
                    "Cache-Control",
                    "no-cache"
                );
            }
        },
    })
);


/*
 * 4. React SPA fallback.
 *
 * Examples:
 *
 * /circuitbrain
 * /pricing
 * /login
 *
 * return dist/index.html.
 *
 * This MUST be after static serving.
 */
app.get("/{*path}", (req, res, next) => {

    if (
        req.path.startsWith("/api") ||
        req.path === "/health"
    ) {
        return next();
    }

    res.sendFile(
        path.join(distPath, "index.html"),
        {
            headers: {
                "Cache-Control":
                    "no-store, no-cache, must-revalidate, proxy-revalidate",
            },
        }
    );
});


/* ==================== BOOT ==================== */
const server = app.listen(PORT, () => {
    console.log("🚀 DEEPHUB CORE ONLINE (TYPESCRIPT)");
    console.log(`📡 PORT : ${PORT}`);
    console.log(`📂 MODE : ARCHITECTURAL_EVOLUTION_PHASE_2`);
});

// Set global timeout to 10 minutes for long AI tasks
server.timeout = 600000;

server.on('error', (err: any) => {
    console.error("❌ SERVER ERROR:", err);
    if (err.code === 'EADDRINUSE') {
        process.exit(1);
    }
});

server.on('close', () => {
    console.log("🛑 SERVER CLOSED");
});

// Prevent immediate exit - though app.listen should handle this
process.on('uncaughtException', (err) => {
    console.error('❌ UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ UNHANDLED REJECTION:', reason);
});
