import React, { useRef, useState } from 'react';

interface Card3DProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    depth?: number; // max tilt angle in degrees
    perspective?: number;
    glare?: boolean;
}

export default function Card3D({
    children,
    className = '',
    onClick,
    depth = 12,
    perspective = 1000,
    glare = true
}: Card3DProps) {
    const cardRef = useRef<HTMLDivElement | null>(null);
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);
    const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotX = ((y - centerY) / centerY) * -depth;
        const rotY = ((x - centerX) / centerX) * depth;

        setRotateX(rotX);
        setRotateY(rotY);

        if (glare) {
            setGlarePos({
                x: (x / rect.width) * 100,
                y: (y / rect.height) * 100,
                opacity: 0.15
            });
        }
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setRotateX(0);
        setRotateY(0);
        setGlarePos(prev => ({ ...prev, opacity: 0 }));
    };

    return (
        <div
            style={{ perspective: `${perspective}px` }}
            className="w-full h-full transform-gpu"
        >
            <div
                ref={cardRef}
                onClick={onClick}
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{
                    transform: isHovered
                        ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(12px)`
                        : 'rotateX(0deg) rotateY(0deg) translateZ(0px)',
                    transformStyle: 'preserve-3d',
                    transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
                }}
                className={`relative overflow-hidden transition-shadow ${className}`}
            >
                {/* 3D Dynamic Content Plane */}
                <div style={{ transform: isHovered ? 'translateZ(20px)' : 'translateZ(0px)', transformStyle: 'preserve-3d', transition: 'transform 0.2s ease-out' }}>
                    {children}
                </div>

                {/* 3D Specular Glare Reflection */}
                {glare && (
                    <div
                        aria-hidden="true"
                        style={{
                            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(0, 164, 228, ${glarePos.opacity}), transparent 60%)`,
                            opacity: isHovered ? 1 : 0,
                            pointerEvents: 'none',
                            transition: 'opacity 0.3s ease'
                        }}
                        className="absolute inset-0 z-20 mix-blend-screen"
                    />
                )}
            </div>
        </div>
    );
}
