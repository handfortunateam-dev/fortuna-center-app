"use client";

import { CONFETTI_COLORS } from "@/constants/color";
import { useEffect, useRef, useState, useCallback } from "react";

interface ConfettiProps {
  /** 'boom' = explosion from a point, 'fall' = rain from top */
  mode?: "boom" | "fall";
  /** Horizontal origin as ratio of canvas width (0-1). Default: 0.5 */
  x?: number;
  /** Vertical origin as ratio of canvas height (0-1). Default: 0.5 */
  y?: number;
  /** Number of confetti particles */
  particleCount?: number;
  /** Initial emission angle in degrees (270 = upward) */
  deg?: number;
  /** Size of confetti particles */
  shapeSize?: number;
  /** Spread angle in degrees from the initial deg */
  spreadDeg?: number;
  /** Interval (ms) between consecutive bursts */
  effectInterval?: number;
  /** Number of bursts to fire */
  effectCount?: number;
  /** Array of hex colors */
  colors?: string[];
  /** Initial launch speed multiplier */
  launchSpeed?: number;
  /** Height ratio (0-1) where particles disappear in 'fall' mode */
  fadeOutHeight?: number;
  /** Multiplier for opacity fade speed in 'boom' mode */
  opacityDeltaMultiplier?: number;
  /** Gravity strength */
  gravity?: number;
  /** Air friction (0-1, closer to 1 = less friction) */
  friction?: number;
  /** Called when all confetti has finished */
  onConfettiComplete?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  shape: "square" | "circle" | "strip";
  opacity: number;
  life: number;
  maxLife: number;
}

export default function Confetti({
  mode = "boom",
  x = 0.5,
  y = 0.5,
  particleCount = 30,
  deg = 270,
  shapeSize = 12,
  spreadDeg = 30,
  effectInterval = 0,
  effectCount = 1,
  colors = CONFETTI_COLORS,
  // colors = ["#ff577f", "#ff884b", "#ffd384", "#fff9b0", "#a855f7", "#3b82f6"],
  launchSpeed = 1,
  fadeOutHeight = 0.8,
  opacityDeltaMultiplier = 1,
  gravity = 0.06,
  friction = 0.98,
  onConfettiComplete,
}: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  const burstsRef = useRef(0);
  const burstTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const canvasWidth = dimensions.width;
  const canvasHeight = dimensions.height;

  const degToRad = (d: number) => (d * Math.PI) / 180;

  const createBoomParticles = useCallback(() => {
    const originX = x * canvasWidth;
    const originY = y * canvasHeight;
    const baseAngle = degToRad(deg);
    const spread = degToRad(spreadDeg);

    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = baseAngle + (Math.random() * spread * 2 - spread);
      const speed = (1.5 + Math.random() * 3) * launchSpeed;
      const life = 80 + Math.random() * 60; // frames

      particles.push({
        x: originX + (Math.random() - 0.5) * 8,
        y: originY + (Math.random() - 0.5) * 8,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: shapeSize * (0.5 + Math.random() * 0.8),
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
        shape: (["square", "circle", "strip"] as const)[
          Math.floor(Math.random() * 3)
        ],
        opacity: 1,
        life: 0,
        maxLife: life,
      });
    }
    return particles;
  }, [
    x,
    y,
    canvasWidth,
    canvasHeight,
    deg,
    spreadDeg,
    particleCount,
    launchSpeed,
    colors,
    shapeSize,
  ]);

  const createFallParticles = useCallback(() => {
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvasWidth,
        y: -10 - Math.random() * 40,
        vx: (Math.random() - 0.5) * 1.5,
        vy: 0.5 + Math.random() * 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: shapeSize * (0.5 + Math.random() * 0.8),
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 6,
        shape: (["square", "circle", "strip"] as const)[
          Math.floor(Math.random() * 3)
        ],
        opacity: 1,
        life: 0,
        maxLife: 200,
      });
    }
    return particles;
  }, [canvasWidth, particleCount, colors, shapeSize]);

  useEffect(() => {
    if (!canvasRef.current || !canvasWidth) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fire first burst
    burstsRef.current = 0;
    particlesRef.current = [];

    const fireBurst = () => {
      const newParticles =
        mode === "boom" ? createBoomParticles() : createFallParticles();
      particlesRef.current.push(...newParticles);
      burstsRef.current++;

      if (burstsRef.current < effectCount && effectInterval > 0) {
        burstTimerRef.current = setTimeout(fireBurst, effectInterval);
      }
    };

    fireBurst();

    const animate = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      particlesRef.current = particlesRef.current.filter((p) => {
        // Update physics
        p.vx *= friction;
        p.vy *= friction;
        p.vy += gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.life++;

        // Fade out
        if (mode === "boom") {
          const lifeRatio = p.life / p.maxLife;
          p.opacity = Math.max(0, 1 - lifeRatio * opacityDeltaMultiplier);
        } else {
          const fadeY = fadeOutHeight * canvasHeight;
          if (p.y > fadeY) {
            p.opacity = Math.max(0, 1 - (p.y - fadeY) / (canvasHeight - fadeY));
          }
        }

        // Remove if invisible or way off screen
        if (p.opacity <= 0) return false;
        if (p.y > canvasHeight + 20 || p.x < -50 || p.x > canvasWidth + 50)
          return false;
        if (p.life > p.maxLife) return false;

        // Draw
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(degToRad(p.rotation));

        switch (p.shape) {
          case "square":
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            break;
          case "circle":
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
            break;
          case "strip":
            ctx.fillRect(-p.size / 2, -p.size / 5, p.size, p.size * 0.4);
            break;
        }

        ctx.restore();
        return true;
      });

      if (
        particlesRef.current.length === 0 &&
        burstsRef.current >= effectCount
      ) {
        onConfettiComplete?.();
        return;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (burstTimerRef.current) clearTimeout(burstTimerRef.current);
    };
  }, [
    canvasWidth,
    canvasHeight,
    mode,
    gravity,
    friction,
    opacityDeltaMultiplier,
    fadeOutHeight,
    effectCount,
    effectInterval,
    createBoomParticles,
    createFallParticles,
    onConfettiComplete,
  ]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
}
