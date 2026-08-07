import * as React from "react";
import { useRef, useEffect, useState } from "react";

interface FAQ {
    question: string;
    answer: string;
}

const faqs: FAQ[] = [
    {
        question: "What is Deephub AI?",
        answer: "Deephub AI is an all-in-one platform offering AI products, personalised assistants, and real-time AI updates. designed to simplify and enhance everyday workflows."
    },
    {
        question: "What type of robots and AI products do you offer?",
        answer: "We offer next-generation robots, smart automation tools, AI assistants, and productivity-focused solutions built for individuals, startups, and businesses."
    },
    {
        question: "Can I customize the AI tools for my needs?",
        answer: "Yes. Deephub AI provides a fully customizable platform where tools adapt to your workflow, preferences, and goals."
    },
    {
        question: "Do I need technical knowledge to use Deephub AI?",
        answer: "No. Everything is designed to be simple, intuitive, and user-friendly—anyone can start using our AI tools with ease."
    },
    {
        question: "How often do you release updates or new products?",
        answer: "We regularly release new features, AI tools, and robotics updates to keep you ahead with the latest innovations."
    },
    {
        question: "Is there a personalized AI assistant available?",
        answer: "Yes. Deephub AI includes a personalised assistant that helps with tasks, learning, recommendations, and real-time support."
    }
];

// Lightweight IntersectionObserver — no framer-motion needed
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

const Values: React.FC = () => {
    const { ref, visible } = useInViewCSS(0.1);

    return (
        <section id="values" className="py-0 md:py-0 relative bg-[#050505]">
            <div className="container px-6 md:px-12 relative z-10">

                {/* Section header */}
                <div
                    ref={ref}
                    className="max-w-4xl mb-20"
                    style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? "translateY(0)" : "translateY(40px)",
                        transition: "opacity 0.8s ease, transform 0.8s ease",
                    }}
                >
                    <h2 className="font-clash text-5xl md:text-7xl font-light leading-[0.9] tracking-[-0.04em]">
                        Frequently Asked <br />
                        <span className="font-semibold text-[#b3daff]">Questions</span>
                    </h2>
                </div>

                {/* FAQ Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    {faqs.map((faq, index) => (
                        <FAQCard key={index} faq={faq} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};

function FAQCard({ faq, index }: { faq: FAQ; index: number }) {
    const { ref, visible } = useInViewCSS(0.1);
    return (
        <div
            ref={ref}
            className="group p-8 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#b3daff]/40 transition-all duration-500 hover:bg-white/[0.05]"
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s, border-color 0.5s, background 0.5s`,
            }}
        >
            <h3 className="font-clash text-xl font-semibold mb-4 text-white group-hover:text-[#b3daff] transition-colors duration-300">
                {faq.question}
            </h3>
            <p className="text-white/50 font-sans leading-relaxed text-sm md:text-base font-light">
                {faq.answer}
            </p>
        </div>
    );
}

export default Values;

