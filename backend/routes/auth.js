import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

const router = express.Router();

/* ── helpers ─────────────────────────────────────────── */
const makeToken = (userId) =>
    jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

/* ── SIGNUP (email/password) ─────────────────────────── */
router.post("/signup", async (req, res) => {
    try {
        const { firstName, lastName, email, password, dob, occupation } = req.body;

        if (!email || !password)
            return res.status(400).json({ error: "Missing fields" });

        const exists = await User.findOne({ email });
        if (exists)
            return res.status(400).json({ error: "User already exists" });

        const hashed  = await bcrypt.hash(password, 10);
        const username = `${firstName || ""} ${lastName || ""}`.trim() || email.split("@")[0];

        const user = await User.create({
            username,
            email,
            password: hashed,
            provider: "local",
        });

        res.json({ message: "Signup successful", user: { id: user._id, email: user.email, username: user.username } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

/* ── LOGIN (email/password) ──────────────────────────── */
router.post("/login", async (req, res) => {
    try {
        const { identifier, email, password } = req.body;
        const lookup = identifier || email;

        const user = await User.findOne({ $or: [{ email: lookup }, { username: lookup }] });
        if (!user || !user.password)
            return res.status(401).json({ error: "Invalid credentials" });

        const match = await bcrypt.compare(password, user.password);
        if (!match)
            return res.status(401).json({ error: "Invalid credentials" });

        res.json({
            token: makeToken(user._id),
            user:  { id: user._id, username: user.username, email: user.email, avatar: user.avatar },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

/* ── GOOGLE OAUTH ─────────────────────────────────────
   Accepts { googleUser } — user-info object fetched from
   Google's /oauth2/v3/userinfo endpoint using an access_token.
   We trust it because the frontend fetched it directly from Google.
──────────────────────────────────────────────────────── */
router.post("/google", async (req, res) => {
    try {
        const { googleUser } = req.body;
        if (!googleUser || !googleUser.email)
            return res.status(400).json({ error: "No Google user payload provided" });

        const { sub: googleId, email, name, picture } = googleUser;

        // Find existing user by googleId or email
        let user = await User.findOne({ $or: [{ googleId }, { email }] });

        if (!user) {
            // Brand-new user — create account automatically
            user = await User.create({
                username: name || email.split("@")[0],
                email,
                googleId,
                avatar:   picture,
                provider: "google",
            });
        } else if (!user.googleId) {
            // Existing email/password user — link their Google account
            user.googleId = googleId;
            user.avatar   = user.avatar || picture;
            user.provider = "google";
            await user.save();
        }

        res.json({
            token: makeToken(user._id),
            user:  { id: user._id, username: user.username, email: user.email, avatar: user.avatar },
        });
    } catch (err) {
        console.error("Google auth error:", err);
        res.status(500).json({ error: "Google authentication failed" });
    }
});

export default router;
