import { motion, useReducedMotion } from 'framer-motion';

// Hero illustration: a line draws itself between three nodes (slide 1 of the pitch deck).
const NODES = [
  { x: 70, y: 70, color: 'var(--orange)', lines: ['A problem', 'nearby'], side: 'below', delay: 0.3 },
  { x: 330, y: 205, color: 'var(--teal)', lines: ['An idle', 'skill'], side: 'left', delay: 1.0 },
  { x: 110, y: 355, color: 'var(--ink)', lines: ['ExTask connects', 'them'], side: 'right', delay: 1.6 },
];

const labelX = (n) => (n.side === 'left' ? n.x - 30 : n.side === 'below' ? n.x - 14 : n.x + 30);

export default function ConnectDiagram() {
  const reduce = useReducedMotion();
  const line = (delay) => ({
    initial: reduce ? false : { pathLength: 0 },
    animate: { pathLength: 1 },
    transition: { duration: 0.5, ease: 'easeOut', delay },
  });

  return (
    <figure className="diagram">
      <svg viewBox="0 0 420 430" role="img" aria-label="A problem nearby and an idle skill, connected by ExTask">
        <motion.path d="M70 70 C 230 40, 340 100, 330 205" fill="none" stroke="var(--ink)" strokeWidth="2.5"
          strokeDasharray="2 9" strokeLinecap="round" {...line(0.5)} />
        <motion.path d="M330 205 C 320 300, 160 280, 110 355" fill="none" stroke="var(--ink)" strokeWidth="2.5"
          strokeDasharray="2 9" strokeLinecap="round" {...line(1.15)} />

        {NODES.map((n, i) => (
          <motion.g key={i}
            initial={reduce ? false : { opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut', delay: n.delay }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          >
            <circle cx={n.x} cy={n.y} r={i === 2 ? 20 : 15} fill="var(--paper)" stroke="var(--ink)" strokeWidth="2.5" />
            <circle cx={n.x} cy={n.y} r={i === 2 ? 11 : 7} fill={n.color} />
            <text x={labelX(n)} y={n.side === 'below' ? n.y + 44 : n.y - 4}
              textAnchor={n.side === 'left' ? 'end' : 'start'} className="diagram__label">
              <tspan x={labelX(n)}>{n.lines[0]}</tspan>
              <tspan x={labelX(n)} dy="21">{n.lines[1]}</tspan>
            </text>
          </motion.g>
        ))}
      </svg>
      <figcaption>Fig. 1 · how two strangers meet</figcaption>
    </figure>
  );
}
