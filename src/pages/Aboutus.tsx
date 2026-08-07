import * as React from "react";
import { useRef, useEffect, useState } from "react";

// Lightweight fade-in using IntersectionObserver — no framer-motion needed
function FadeInSection({ children, className = "space-y-4" }: { children: React.ReactNode; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
            { threshold: 0.1 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.7s ease, transform 0.7s ease",
            }}
        >
            {children}
        </div>
    );
}

// Original UI Components
import Hero from "../components/Hero";
import About from "../components/About";
import Values from "../components/Values";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import Navigation from "../components/Navigation";

// Lovable Components
import ProductCard from "../components/product/ProductViewer/ProductCard";

interface Product {
    id: number;
    name: string;
    category: string;
    image: string;
    description: string;
    features: string[];
    url?: string;
    icon?: string;
}

const products: Product[] = [
    { id: 1, name: "ChatGPT", category: "Language Model", image: "", description: "OpenAI's conversational AI.", features: ["GPT-4o", "Multimodal"], url: "https://openai.com" },
    { id: 2, name: "Gemini", category: "Google AI", image: "", description: "Google's most capable AI model.", features: ["Multimodal", "1M Context"], url: "https://gemini.google.com" },
    { id: 3, name: "Claude", category: "Anthropic AI", image: "", description: "Safe and constitutional AI.", features: ["Claude 3.5 Sonnet", "Artifacts"], url: "https://claude.ai" },
    { id: 4, name: "Perplexity", category: "Search AI", image: "", description: "AI-powered search engine.", features: ["Real-time", "Citations"], url: "https://perplexity.ai" },
    { id: 5, name: "Mistral", category: "Open Source AI", image: "", description: "High-performance open models.", features: ["Mistral Large", "Efficient"], url: "https://mistral.ai" },
    { id: 6, name: "DeepSeek", category: "Reasoning AI", image: "", description: "Advanced reasoning and coding AI.", features: ["DeepSeek-V3", "Cheap API"], url: "https://deepseek.com" },
    { id: 7, name: "Groq", category: "Hardware AI", image: "", description: "Ultra-fast LLM inference.", features: ["LPU Technology", "500+ tok/s"], url: "https://groq.com" },
    { id: 8, name: "Midjourney", category: "Image Gen", image: "", description: "High-end artistic image generation.", features: ["V6 Support", "Artistic"], url: "https://midjourney.com" },
    { id: 9, name: "Runway", category: "Video AI", image: "", description: "Next-gen creative video tools.", features: ["Gen-3 Alpha", "VFX"], url: "https://runwayml.com" },
    { id: 10, name: "Pika", category: "Video AI", image: "", description: "Idea-to-video platform.", features: ["Lip Sync", "Physics"], url: "https://pika.art" },
    { id: 11, name: "HeyGen", category: "Avatar AI", image: "", description: "AI video generation with avatars.", features: ["Cloning", "Translation"], url: "https://heygen.com" },
    { id: 12, name: "ElevenLabs", category: "Audio AI", image: "", description: "Prime AI speech software.", features: ["Cloning", "Realistic"], url: "https://elevenlabs.io" },
    { id: 13, name: "GitHub Copilot", category: "Coding AI", image: "", description: "Your AI pair programmer.", features: ["Auto-complete", "Chat"], url: "https://github.com" },
    { id: 14, name: "Cursor", category: "Coding AI", image: "", description: "AI-native code editor.", features: ["Composer", "Fast"], url: "https://cursor.com" },
    { id: 15, name: "Jasper", category: "Marketing AI", image: "", description: "AI content for business teams.", features: ["Copywriting", "SEO"], url: "https://jasper.ai" },
    { id: 16, name: "Copy.ai", category: "Writing AI", image: "", description: "AI sales and marketing automation.", features: ["Workflows", "Copy"], url: "https://copy.ai" },
    { id: 17, name: "Canva Pro", category: "Design AI", image: "", description: "Magic Studio design suite.", features: ["Visuals", "Social"], url: "https://canva.com" },
    { id: 18, name: "Brisk Teaching", category: "EdTech AI", image: "", description: "AI for busy teachers.", features: ["Feedback", "Planning"], url: "https://briskteaching.com" },
    { id: 19, name: "Diffit", category: "EdTech AI", image: "", description: "Differentiated resources.", features: ["Reading", "Quizzes"], url: "https://diffit.me" },
    { id: 20, name: "Curipod", category: "EdTech AI", image: "", description: "Interactive AI lessons.", features: ["Live Polls", "Slides"], url: "https://curipod.com" },
    { id: 21, name: "Otter.ai", category: "Meeting AI", image: "", description: "AI meeting notes and transcript.", features: ["Live Notes", "Summary"], url: "https://otter.ai" },
    { id: 22, name: "Adobe Firefly", category: "Design AI", image: "", description: "Creative generative AI.", features: ["PS Integration", "Vector"], url: "https://adobe.com" },
    { id: 23, name: "Perplexity Pages", category: "Content AI", image: "", description: "AI-generated structured reports.", features: ["Research", "Publish"], url: "https://perplexity.ai" },
    { id: 24, name: "Ollama", category: "Local AI", image: "", description: "Run large models locally.", features: ["Private", "Offline"], url: "https://ollama.com" },
];

// Duplicate only once (2 copies) for seamless CSS scroll loop — was 4× before (DOM was 1512 elements)
const row1 = [...products, ...products];
const row2 = [...products.slice(12), ...products.slice(0, 12), ...products.slice(12), ...products.slice(0, 12)];

export default function Aboutus() {
    return (
        <div className="bg-[#F7F1E3] min-h-screen text-[#2B211A] relative">

            <section className="relative w-full overflow-hidden border-b border-[#D8CBB0] bg-[#FDFAF3]">
                <Hero hideAstronaut={true} />
            </section>

            <div className="sticky top-0 z-50">
                <Navigation />
            </div>

            <div className="relative z-10">
                {/* ── AI Tool Carousel ─────────────────────────────────── */}
                <section
                    id="product"
                    className="relative py-16 scroll-mt-24 overflow-hidden bg-[#F7F1E3] border-b border-[#D8CBB0]"
                >
                    <div className="max-w-7xl mx-auto px-6 mb-12">
                        <FadeInSection>
                            <h2 className="text-clamp-title font-serif-academic font-bold uppercase text-[#2B211A]">
                                Integrated <br />
                                <span className="text-[#A6522C]">Intelligence</span>
                            </h2>
                            <p className="text-[#6B5D4F] max-w-xl font-sans-academic text-lg tracking-wide">
                                Explore Academic AI Innovations for Indian Educators & Scholars.
                            </p>
                        </FadeInSection>
                    </div>

                    <div className="relative">
                        {/* Row 1 — scrolls left */}
                        <div
                            className="overflow-hidden mb-8"
                            style={{ touchAction: "pan-y", pointerEvents: "none" }}
                        >
                            <div
                                className="flex gap-4 px-8 w-max"
                                style={{ animation: "scroll-left 40s linear infinite" }}
                            >
                                {row1.map((product, i) => (
                                    <ProductCard key={`r1-${i}`} product={product as any} index={i} />
                                ))}
                            </div>
                        </div>

                        {/* Row 2 — scrolls right */}
                        <div
                            className="overflow-hidden"
                            style={{ touchAction: "pan-y", pointerEvents: "none" }}
                        >
                            <div
                                className="flex gap-4 px-8 w-max"
                                style={{ animation: "scroll-right 45s linear infinite" }}
                            >
                                {row2.map((product, i) => (
                                    <ProductCard key={`r2-${i}`} product={product as any} index={i} />
                                ))}
                            </div>
                        </div>

                        <div
                            className="absolute inset-0 pointer-events-none z-10"
                            style={{ background: "radial-gradient(circle at center, transparent 40%, #F7F1E3 98%)" }}
                        />
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-6 pb-20">
                    <section id="about" className="scroll-mt-32 py-16 border-t border-[#D8CBB0]">
                        <About />
                    </section>
                    <section id="values" className="scroll-mt-32 py-16 border-t border-[#D8CBB0]">
                        <Values />
                    </section>
                    <section id="contact" className="scroll-mt-32 py-16 border-t border-[#D8CBB0]">
                        <Contact />
                    </section>
                </div>

                <Footer />
            </div>

            {/* CSS scroll animations — no JS, no reflow */}
            <style>{`
                @keyframes scroll-left {
                    0%   { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                @keyframes scroll-right {
                    0%   { transform: translateX(-50%); }
                    100% { transform: translateX(0); }
                }
            `}</style>
        </div>
    );
}
