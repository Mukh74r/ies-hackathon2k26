import React from "react"
import { ArrowDown } from "lucide-react"
import BrandLogo from "../assets/brand-logo-main.svg"

interface HeroProps {
    hideAstronaut?: boolean;
}

const Hero: React.FC<HeroProps> = ({ hideAstronaut }) => {
    return (
        <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden px-safe">
            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-foreground/[0.02] rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-accent/[0.03] rounded-full blur-[80px]" />
            </div>

            {/* Grid overlay */}
            <div
                className="absolute inset-0 opacity-[0.02] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
                    backgroundSize: "100px 100px"
                }}
            />

            <div className="container relative z-10 px-6 md:px-12">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Eyebrow & Logo */}
                    <div className="flex flex-col items-center mb-6 md:mb-8 animate-fade-in-up">
                        <p className="text-base md:text-xl lg:text-2xl font-medium tracking-tight text-white/70">
                            Welcome to the World’s First All-in-One AI Hub
                        </p>
                    </div>

                    {/* Headline — NO animation: this is the LCP element, must paint instantly */}
                    <h1 className="text-clamp-title font-light mb-6 md:mb-8">
                        AI
                        <br />
                        <span className="text-dh-brand font-semibold">for Everyone.</span>
                    </h1>

                    {/* Subheadline */}
                    <p className="
                        text-muted-foreground font-light
                        text-[clamp(1rem,2.5vw,1.25rem)]
                        max-w-xl mx-auto mb-12 md:mb-16
                        animate-fade-in-up
                    "
                    style={{ animationDelay: "0.2s" }}
                    >
                        Making AI products simple, accessible, and powerful for individuals
                        and enterprises.
                    </p>

                    {/* CTA */}
                    <div className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
                        <a
                            href="#about"
                            className="group inline-flex items-center gap-3 text-sm font-light text-foreground hover:text-accent transition-colors"
                        >
                            <span className="relative">
                                Discover our story
                                <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent transition-all group-hover:w-full" />
                            </span>
                            <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Floating cube — decorative only */}
            <div
                className="absolute bottom-20 right-20 w-12 h-12 border border-foreground/10 rotate-45 hidden lg:block animate-float"
            />

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:block opacity-0 animate-fade-in" style={{ animationDelay: "1s" }}>
                <div className="w-px h-16 bg-gradient-to-b from-transparent via-muted-foreground/50 to-transparent" />
            </div>
        </section>
    )
}

export default Hero;
