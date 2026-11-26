import { motion, useReducedMotion } from 'framer-motion';

// Wraps a word with a hand-drawn orange underline that draws itself.
export default function HandUnderline({ children, delay = 0 }) {
  const reduce = useReducedMotion();
  return (
    <span className="hand-underline">
      {children}
      <svg viewBox="0 0 250 14" preserveAspectRatio="none" aria-hidden="true">
        <motion.path
          d="M3 9 C 45 3, 90 12, 150 6 S 225 10, 247 4"
          fill="none"
          stroke="var(--orange)"
          strokeWidth="5"
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: 'easeOut', delay }}
        />
      </svg>
    </span>
  );
}
