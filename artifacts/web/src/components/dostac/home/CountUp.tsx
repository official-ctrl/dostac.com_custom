"use client";

import { useRef, useEffect } from "react";
import { useInView, animate, useReducedMotion } from "framer-motion";

interface CountUpProps {
  /** Final numeric value to count to */
  value: number;
  /** String appended after the number, e.g. "+" or "h" */
  suffix?: string;
  /** String prepended before the number */
  prefix?: string;
  /** Animation duration in seconds */
  duration?: number;
  className?: string;
}

/**
 * Counts a number from 0 → value when it enters the viewport.
 *
 * SSR-safe: the server renders the final value so there is no layout shift.
 * Respects prefers-reduced-motion by skipping the animation entirely.
 */
export function CountUp({
  value,
  suffix = "",
  prefix = "",
  duration = 1.8,
  className,
}: CountUpProps) {
  const ref            = useRef<HTMLSpanElement>(null);
  const inView         = useInView(ref, { once: true, margin: "-80px" });
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (!inView || !ref.current) return;

    if (prefersReduced) {
      ref.current.textContent = `${prefix}${value}${suffix}`;
      return;
    }

    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        if (ref.current) {
          ref.current.textContent = `${prefix}${Math.round(v)}${suffix}`;
        }
      },
    });

    return () => controls.stop();
  }, [inView, prefersReduced, value, suffix, prefix, duration]);

  return (
    <span
      ref={ref}
      aria-label={`${prefix}${value}${suffix}`}
      className={className}
    >
      {prefix}{value}{suffix}
    </span>
  );
}
