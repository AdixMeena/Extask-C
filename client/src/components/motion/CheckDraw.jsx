import { motion, useReducedMotion } from 'framer-motion';

// A circle and a checkmark that draw themselves (completion moment).
export default function CheckDraw({ size = 72 }) {
  const reduce = useReducedMotion();
  const draw = (delay) => ({
    initial: reduce ? false : { pathLength: 0 },
    animate: { pathLength: 1 },
    transition: reduce ? { duration: 0 } : { duration: 0.4, ease: 'easeOut', delay },
  });
  return (
    <svg viewBox="0 0 80 80" width={size} height={size} aria-hidden="true" fill="none">
      <motion.circle cx="40" cy="40" r="34" stroke="var(--teal)" strokeWidth="4" {...draw(0)} />
      <motion.path
        d="M24 41 l11 11 l21 -24"
        stroke="var(--teal)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...draw(0.3)}
      />
    </svg>
  );
}
