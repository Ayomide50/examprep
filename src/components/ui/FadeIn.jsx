import React from "react";
import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

// Detect mobile once at module load (client-side SPA — window always available).
// On mobile, animations are opacity-only (no translateY transform) to avoid
// GPU compositing layers that cause black rendering artifacts on low-end Android GPUs.
const IS_MOBILE =
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(max-width: 768px)").matches;

export function FadeIn({ children, delay = 0, y = 24, className, once = true }) {
  const actualY = IS_MOBILE ? 0 : y;
  return (
    <motion.div
      initial={{ opacity: 0, y: actualY }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration: IS_MOBILE ? 0.2 : 0.5, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeInLoad({ children, delay = 0, y = 24, className }) {
  const actualY = IS_MOBILE ? 0 : y;
  return (
    <motion.div
      initial={{ opacity: 0, y: actualY }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: IS_MOBILE ? 0.2 : 0.5, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerGroup({ children, className, stagger = 0.1 }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: IS_MOBILE ? stagger * 0.5 : stagger } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, y = 24 }) {
  const actualY = IS_MOBILE ? 0 : y;
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: actualY },
        visible: { opacity: 1, y: 0, transition: { duration: IS_MOBILE ? 0.2 : 0.45, ease: EASE } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}