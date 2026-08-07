import React, { useEffect, useRef } from 'react';

interface Star {
    x: number;
    y: number;
    z: number;
    size: number;
    baseAlpha: number;
    twinkleSpeed: number;
    twinklePhase: number;
    color: string;
}

interface ShootingStar {
    x: number;
    y: number;
    length: number;
    speed: number;
    angle: number;
    alpha: number;
    active: boolean;
}

export default function GraphicalBackend() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const handleResize = () => {
            if (!canvas) return;
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initStars();
        };
        window.addEventListener('resize', handleResize);

        // Mouse interaction
        const mouse = { x: -2000, y: -2000, radius: 180 };
        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };
        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                mouse.x = e.touches[0].clientX;
                mouse.y = e.touches[0].clientY;
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove);

        // Standard Star colors: Crisp Diamond White, Cyan (#00A4E4), Celestial Blue (#6E85D6)
        const starColors = [
            'rgba(255, 255, 255, ',
            'rgba(255, 255, 255, ',
            'rgba(255, 255, 255, ',
            'rgba(0, 164, 228, ',    // Cyan glow
            'rgba(110, 133, 214, ',  // Indigo glow
            'rgba(170, 190, 255, ',  // Celestial blue
        ];

        let stars: Star[] = [];
        const starCount = Math.min(Math.floor((width * height) / 4500), 280);

        const initStars = () => {
            stars = [];
            for (let i = 0; i < starCount; i++) {
                stars.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    z: Math.random() * 3 + 0.5, // 3D depth layer
                    size: Math.random() * 1.8 + 0.6,
                    baseAlpha: Math.random() * 0.7 + 0.25,
                    twinkleSpeed: Math.random() * 0.03 + 0.01,
                    twinklePhase: Math.random() * Math.PI * 2,
                    color: starColors[Math.floor(Math.random() * starColors.length)]
                });
            }
        };
        initStars();

        // Shooting Stars (Meteors)
        const shootingStars: ShootingStar[] = [];
        const spawnShootingStar = () => {
            if (shootingStars.length < 3 && Math.random() < 0.3) {
                shootingStars.push({
                    x: Math.random() * width * 0.8 + width * 0.1,
                    y: Math.random() * (height * 0.4),
                    length: Math.random() * 80 + 50,
                    speed: Math.random() * 8 + 6,
                    angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2, // ~45 deg
                    alpha: 1.0,
                    active: true
                });
            }
        };
        const shootingStarInterval = setInterval(spawnShootingStar, 2400);

        const render = () => {
            ctx.clearRect(0, 0, width, height);

            // Subtle Deep Space Nebula Auroras in Cyan & Indigo
            const nebula1 = ctx.createRadialGradient(
                width * 0.25, height * 0.3, 0,
                width * 0.25, height * 0.3, width * 0.5
            );
            nebula1.addColorStop(0, 'rgba(0, 164, 228, 0.035)');
            nebula1.addColorStop(0.6, 'rgba(110, 133, 214, 0.02)');
            nebula1.addColorStop(1, 'transparent');
            ctx.fillStyle = nebula1;
            ctx.fillRect(0, 0, width, height);

            const nebula2 = ctx.createRadialGradient(
                width * 0.75, height * 0.65, 0,
                width * 0.75, height * 0.65, width * 0.45
            );
            nebula2.addColorStop(0, 'rgba(110, 133, 214, 0.035)');
            nebula2.addColorStop(0.5, 'rgba(42, 63, 143, 0.02)');
            nebula2.addColorStop(1, 'transparent');
            ctx.fillStyle = nebula2;
            ctx.fillRect(0, 0, width, height);

            // Render Stars & Twinkle
            for (let i = 0; i < stars.length; i++) {
                const s = stars[i];

                // Slow starfield drift
                s.y -= 0.15 * s.z;
                s.x -= 0.05 * s.z;
                if (s.y < 0) s.y = height;
                if (s.x < 0) s.x = width;

                s.twinklePhase += s.twinkleSpeed;
                const twinkleAlpha = Math.max(0.1, s.baseAlpha + Math.sin(s.twinklePhase) * 0.35);

                // Mouse gravity interaction
                const dx = mouse.x - s.x;
                const dy = mouse.y - s.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                let offsetX = 0;
                let offsetY = 0;
                if (dist < mouse.radius && dist > 0) {
                    const force = (1 - dist / mouse.radius) * 12;
                    offsetX = -(dx / dist) * force;
                    offsetY = -(dy / dist) * force;
                }

                const px = s.x + offsetX;
                const py = s.y + offsetY;

                // Star core
                ctx.fillStyle = `${s.color}${twinkleAlpha})`;
                ctx.beginPath();
                ctx.arc(px, py, s.size, 0, Math.PI * 2);
                ctx.fill();

                // Star subtle halo for brighter stars
                if (s.size > 1.4) {
                    ctx.fillStyle = `${s.color}${twinkleAlpha * 0.35})`;
                    ctx.beginPath();
                    ctx.arc(px, py, s.size * 2.4, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Constellation connections to nearby stars
                for (let j = i + 1; j < stars.length; j++) {
                    const s2 = stars[j];
                    const cdx = px - s2.x;
                    const cdy = py - s2.y;
                    const cdist = Math.sqrt(cdx * cdx + cdy * cdy);

                    if (cdist < 85) {
                        const lineAlpha = (1 - cdist / 85) * 0.18;
                        ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(px, py);
                        ctx.lineTo(s2.x, s2.y);
                        ctx.stroke();
                    }
                }
            }

            // Render Shooting Stars (Meteors)
            for (let i = shootingStars.length - 1; i >= 0; i--) {
                const meteor = shootingStars[i];
                if (!meteor.active) {
                    shootingStars.splice(i, 1);
                    continue;
                }

                meteor.x += Math.cos(meteor.angle) * meteor.speed;
                meteor.y += Math.sin(meteor.angle) * meteor.speed;
                meteor.alpha -= 0.015;

                if (meteor.alpha <= 0 || meteor.x > width || meteor.y > height) {
                    meteor.active = false;
                    continue;
                }

                // Meteor tail gradient
                const tailX = meteor.x - Math.cos(meteor.angle) * meteor.length;
                const tailY = meteor.y - Math.sin(meteor.angle) * meteor.length;

                const grad = ctx.createLinearGradient(tailX, tailY, meteor.x, meteor.y);
                grad.addColorStop(0, 'transparent');
                grad.addColorStop(0.7, `rgba(0, 164, 228, ${meteor.alpha * 0.6})`);
                grad.addColorStop(1, `rgba(255, 255, 255, ${meteor.alpha})`);

                ctx.strokeStyle = grad;
                ctx.lineWidth = 1.8;
                ctx.beginPath();
                ctx.moveTo(tailX, tailY);
                ctx.lineTo(meteor.x, meteor.y);
                ctx.stroke();

                // Meteor head glow
                ctx.fillStyle = `rgba(255, 255, 255, ${meteor.alpha})`;
                ctx.beginPath();
                ctx.arc(meteor.x, meteor.y, 2, 0, Math.PI * 2);
                ctx.fill();
            }

            // Interactive mouse starlight illumination
            if (mouse.x > 0 && mouse.y > 0) {
                const mouseGlow = ctx.createRadialGradient(
                    mouse.x, mouse.y, 0,
                    mouse.x, mouse.y, mouse.radius
                );
                mouseGlow.addColorStop(0, 'rgba(0, 164, 228, 0.06)');
                mouseGlow.addColorStop(0.5, 'rgba(110, 133, 214, 0.02)');
                mouseGlow.addColorStop(1, 'transparent');

                ctx.fillStyle = mouseGlow;
                ctx.beginPath();
                ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
                ctx.fill();
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            clearInterval(shootingStarInterval);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0 opacity-90 transition-opacity duration-700"
            style={{ width: '100vw', height: '100vh', background: 'transparent' }}
        />
    );
}
