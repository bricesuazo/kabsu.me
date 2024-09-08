"use client";

import { motion } from "framer-motion";

import { cn } from "@kabsu.me/ui";

export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
  animate = true,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  animate?: boolean;
}) => {
  const variants = {
    initial: {
      backgroundPosition: "0 50%",
    },
    animate: {
      backgroundPosition: ["0, 50%", "100% 50%", "0 50%"],
    },
  };
  return (
    <div className={cn("group relative p-[4px]", containerClassName)}>
      <motion.div
        variants={animate ? variants : undefined}
        initial={animate ? "initial" : undefined}
        animate={animate ? "animate" : undefined}
        transition={
          animate
            ? {
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
              }
            : undefined
        }
        style={{
          backgroundSize: animate ? "600% 600%" : undefined,
        }}
        className={cn(
          "absolute inset-0 z-[1] rounded-3xl opacity-25 blur-xl transition duration-500 will-change-transform group-hover:opacity-50",
          "bg-[radial-gradient(circle_farthest-side_at_0_100%,#2FAB5C,transparent),radial-gradient(circle_farthest-side_at_100%_0,#2FAB5C,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#23C45E,transparent),radial-gradient(circle_farthest-side_at_0_0,#23C45E,#FFFFFF)]",
        )}
      />

      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
};
