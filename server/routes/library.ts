import express from "express";
import { LibraryController } from "../controllers/LibraryController.ts";
import { authenticate } from "../middleware/auth.ts";

const router = express.Router();

// All library routes require authentication
router.use(authenticate);

router.post("/save", LibraryController.save);
router.get("/", LibraryController.getAll);
router.delete("/:id", LibraryController.remove);

export default router;
