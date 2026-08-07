import React, { useRef, useEffect, useState } from "react";

interface Reason {
    title: string;
    description: string;
}

const reasons: Reason[] = [
    { title: "All-in-One AI Hub",         description: "A unified platform for everything AI." },
    { title: "Customized Platform",        description: "Solutions that adapt to your needs, workflow, and goals." },
    { title: "News & Updates",             description: "Stay ahead with real-time AI breakthroughs and insights." },
    { title: "Explore AI Products",        description: "Discover advanced robots, smart tools, and futuristic technologies." },
    { title: "Personalized AI Assistant",  description: "Your intelligent companion for tasks, learning, and decision-making." },
    { title: "Powerful AI Community",      description: "Connect, collaborate, and grow with innovators shaping the future." },
];

// Lightweight IntersectionObserver hook — replaces framer-motion useInView (saves ~50KB from homepage bundle)
function useInViewCSS(threshold = 0.15) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
            { threshold }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return { ref, visible };
}

const About: React.FC = () => {
    const { ref: headerRef, visible: headerVisible } = useInViewCSS();

    return (
        <div className="bg-[#050505] text-white selection:bg-[#b3daff]/30">
            <section id="about" className="py-0 md:py-0 relative overflow-hidden">

                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(179,218,255,0.03)_0%,transparent_70%)] pointer-events-none" />

                <div className="container px-6 md:px-12 relative z-10">

                    <div
                        ref={headerRef}
                        className="max-w-4xl mb-20 transition-all duration-700"
                        style={{
                            opacity: headerVisible ? 1 : 0,
                            transform: headerVisible ? "translateY(0)" : "translateY(40px)",
                        }}
                    >
                        <h2 className="font-clash text-5xl md:text-7xl font-light leading-[0.9] tracking-[-0.04em]">
                            Why Choose <br />
                            <span className="font-semibold text-[#b3daff]">DeepHub AI?</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reasons.map((reason, index) => (
                            <ReasonCard key={reason.title} reason={reason} index={index} />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

function ReasonCard({ reason, index }: { reason: Reason; index: number }) {
    const { ref, visible } = useInViewCSS(0.1);
    return (
        <div
            ref={ref}
            className="group p-8 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#b3daff]/50 transition-all duration-500 hover:bg-white/[0.05]"
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s, border-color 0.5s, background 0.5s`,
            }}
        >
            <h3 className="font-clash text-xl font-semibold mb-4 text-white group-hover:text-[#b3daff] transition-colors">
                {reason.title}
            </h3>
            <p className="text-white/50 font-sans leading-relaxed text-sm md:text-base font-light">
                {reason.description}
            </p>
        </div>
    );
}

export default About;
