import React, { useRef, useEffect, useState } from "react";

// Native IntersectionObserver — no framer-motion needed for a single fade-in
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

const Contact: React.FC = () => {
    const { ref, visible } = useInViewCSS();

    return (
        <section id="contact" className="py-0 md:py-0 relative bg-transparent">
            <div className="container px-6 md:px-12">
                <div
                    ref={ref}
                    className="max-w-4xl mx-auto text-center"
                    style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? "translateY(0)" : "translateY(60px)",
                        transition: "opacity 0.8s ease, transform 0.8s ease",
                    }}
                >
                    <h2 className="font-clash text-5xl md:text-7xl lg:text-8xl font-light leading-[0.9] tracking-[-0.04em] mb-8">
                        We Value Your <br />
                        <span className="font-semibold text-[#b3daff]">Feedback</span>
                    </h2>

                    <p className="text-lg text-white/50 font-sans font-light max-w-xl mx-auto mb-12 leading-relaxed">
                        Help us improve by sharing your thoughts and suggestions.
                    </p>

                    <a
                        href="mailto:deephubai.org@gmail.com"
                        aria-label="Send feedback via email"
                        className="group inline-flex items-center px-8 py-2 rounded-full border-2 border-white bg-transparent text-white text-sm font-semibold hover:bg-white hover:text-black transition-all duration-300 active:scale-95"
                        style={{ transition: "background 0.3s, color 0.3s, transform 0.15s" }}
                    >
                        Share Feedback
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Contact;
