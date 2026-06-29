import React, { useEffect, useRef } from "react";

interface ConfettiProps {
  triggerCount: number;
}

export default function ConfettiEffect({ triggerCount }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (triggerCount === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let animationFrameId: number;

    const colors = ["#6366f1", "#a855f7", "#ec4899", "#10b981", "#3b82f6", "#f59e0b"];

    interface Particle {
      x: number;
      y: number;
      radius: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
    }

    const particles: Particle[] = [];

    // Spawn burst
    const spawnCount = 120;
    for (let i = 0; i < spawnCount; i++) {
      particles.push({
        // spawn at random positions along bottom or center of screen
        x: width / 2 + (Math.random() - 0.5) * 100,
        y: height - 50,
        radius: Math.random() * 5 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: (Math.random() - 0.5) * 18,
        speedY: -Math.random() * 15 - 10, // shoot up
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        opacity: 1,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const updateAndRender = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Apply physics
        p.speedY += 0.35; // gravity
        p.speedX *= 0.98; // air resistance
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.012; // fade out

        if (p.opacity <= 0) {
          particles.splice(i, 1);
          continue;
        }

        // Draw confetti square or circle
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;

        ctx.beginPath();
        if (i % 2 === 0) {
          ctx.fillRect(-p.radius, -p.radius, p.radius * 2, p.radius * 1.5);
        } else {
          ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      ctx.globalAlpha = 1.0;

      if (particles.length > 0) {
        animationFrameId = requestAnimationFrame(updateAndRender);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    updateAndRender();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [triggerCount]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-screen h-screen"
    />
  );
}
