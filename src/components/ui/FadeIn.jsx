import React from "react";

// Animations have been completely removed for GPU compatibility on low-end Android devices.
// These components now render plain divs — no Framer Motion, no compositing layers.
// The same component API is preserved so all consumers continue to work without changes.

export function FadeIn({ children, className }) {
  return <div className={className}>{children}</div>;
}

export function FadeInLoad({ children, className }) {
  return <div className={className}>{children}</div>;
}

export function StaggerGroup({ children, className }) {
  return <div className={className}>{children}</div>;
}

export function StaggerItem({ children, className }) {
  return <div className={className}>{children}</div>;
}