import express from "express";
import { AIService } from "../services/AIService.ts";
import { authenticate } from "../middleware/auth.ts";
import { toolLimiter } from "../middleware/toolLimiter.ts";

const router = express.Router();

router.post("/generate", authenticate, toolLimiter('ppt-generator'), async (req, res) => {
    const { topic, grade, subject, slideCount = 5, board = "CBSE" } = req.body;

    if (!topic) {
        return res.status(400).json({ success: false, error: "Topic is required." });
    }

    const count = Math.min(Math.max(parseInt(slideCount), 3), 15);

    const prompt = `You are an elite academic presentation designer. Create a ${count}-slide presentation for the following topic.

TOPIC: ${topic}
SUBJECT: ${subject || "General"}
GRADE/CLASS: ${grade || "All"}
CURRICULUM: ${board}

Generate a structured, pedagogically sound slide deck. Return STRICT JSON with NO extra text.

JSON FORMAT:
{
  "slides": [
    {
      "type": "title",
      "title": "Slide Title",
      "bullets": ["subtitle or tagline"],
      "notes": "Speaker notes here"
    },
    {
      "type": "bullets",
      "title": "Slide Title",
      "bullets": ["Point 1", "Point 2", "Point 3"],
      "notes": "Speaker notes"
    },
    {
      "type": "diagram",
      "title": "Process/Flow Title",
      "bullets": [],
      "diagramData": {
        "steps": ["Step 1", "Step 2", "Step 3"],
        "label": "Process Label"
      },
      "notes": "Speaker notes"
    },
    {
      "type": "comparison",
      "title": "Compare Title",
      "bullets": [],
      "data": {
        "leftTitle": "Option A",
        "rightTitle": "Option B",
        "leftItems": ["Point 1", "Point 2"],
        "rightItems": ["Point 1", "Point 2"]
      },
      "notes": "Speaker notes"
    },
    {
      "type": "recap",
      "title": "Summary",
      "bullets": ["Key takeaway 1", "Key takeaway 2"],
      "reflection": "A thought-provoking question for students",
      "notes": "Speaker notes"
    }
  ]
}

Rules:
- First slide MUST be type "title"
- Last slide MUST be type "recap" with a reflection question
- Mix slide types (bullets, diagram, comparison) for variety
- 3-5 bullet points max per slide
- Bullets must be concise, academic, and clear
- Notes should be 1-2 helpful sentences for the presenter
- Total slides: exactly ${count}
- Return ONLY valid JSON, no markdown, no code blocks`;

    try {
        const completion = await AIService.complete({
            messages: [
                {
                    role: "system",
                    content: "You are an expert academic slide deck designer. Output only valid, strict JSON."
                },
                { role: "user", content: prompt }
            ],
            temperature: 0.4,
            response_format: { type: "json_object" }
        });

        const raw = completion.choices[0].message.content || "{}";
        const parsed = JSON.parse(raw);

        const slides = Array.isArray(parsed.slides) ? parsed.slides : [];

        if (slides.length === 0) {
            return res.status(500).json({ success: false, error: "AI returned empty slide deck." });
        }

        return res.json({ success: true, slides });
    } catch (err: any) {
        console.error("PPT Generation Error:", err);
        return res.status(500).json({ success: false, error: err.message || "Failed to generate presentation." });
    }
});

export default router;
