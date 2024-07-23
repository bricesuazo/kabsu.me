"use client";

import type { CSSProperties } from "react";
import React from "react";
import { motion } from "framer-motion";

interface RippleProps {
  mainCircleSize?: number;
  mainCircleOpacity?: number;
  numCircles?: number;
}

const Ripple = React.memo(function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 8,
}: RippleProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 flex items-center justify-center [mask-image:linear-gradient(to_bottom,white,transparent)]"
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 70;
        const opacity = mainCircleOpacity - i * 0.03;
        const animationDelay = `${i * 0.06}s`;
        const borderStyle = i === numCircles - 1 ? "dashed" : "solid";
        const borderOpacity = 5 + i * 5;

        return (
          <div
            key={i}
            className={`absolute left-1/2 top-1/2 translate-x-1/2 translate-y-1/2 animate-ripple rounded-full border bg-gray-300 shadow-xl dark:bg-primary/50 [--i:${i}]`}
            style={
              {
                width: `${size}px`,
                height: `${size}px`,
                opacity: opacity,
                animationDelay: animationDelay,
                borderStyle: borderStyle,
                borderWidth: "1px",
                borderColor: `rgba(var(--foreground-rgb), ${borderOpacity / 100})`,
              } as CSSProperties
            }
          />
        );
      })}
    </motion.div>
  );
});

Ripple.displayName = "Ripple";

export default Ripple;
