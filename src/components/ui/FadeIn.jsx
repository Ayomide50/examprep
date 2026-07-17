import React from "react";
import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

// Detect mobile once at module load (client-side SPA — window always available).
// On mobile, animations are completely disabled (plain <div>, no motion.div)
// to avoid GPU compositing layers that cause black rendering artifacts on
// low-end Android GPUs. Even opacity-only motion.div elements set inline
// will-change, promoting each to a separate compositing layer — with 15+
// animated elements on a single page, the GPU runs out of memory.
const IS_MOBILE =
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(max-width: 768px)").matches;

export function FadeIn({ children, delay = 0, y = 24, className, once = true }) {
  if (IS_MOBILE) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeInLoad({ children, delay = 0, y = 24, className }) {
  if (IS_MOBILE) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerGroup({ children, className, stagger = 0.1 }) {
  if (IS_MOBILE) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, y = 24 }) {
  if (IS_MOBILE) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y },
        visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}