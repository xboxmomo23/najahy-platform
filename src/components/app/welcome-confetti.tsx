"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

const PARTICLE_COUNT = 28;

type Particle = {
  id: number;
  left: string;
  delay: number;
  duration: number;
  size: number;
  drift: number;
};

function createParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, id) => ({
    id,
    left: `${8 + Math.random() * 84}%`,
    delay: Math.random() * 3,
    duration: 5 + Math.random() * 5,
    size: 3 + Math.random() * 5,
    drift: (Math.random() - 0.5) * 40,
  }));
}

export function WelcomeConfetti() {
  const particles = useMemo(() => createParticles(), []);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-gold-500/35"
          style={{
            left: p.left,
            top: "-5%",
            width: p.size,
            height: p.size,
          }}
          initial={{ y: 0, x: 0, opacity: 0, rotate: 0 }}
          animate={{
            y: ["0vh", "105vh"],
            x: [0, p.drift],
            opacity: [0, 0.55, 0.45, 0],
            rotate: [0, 180],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
