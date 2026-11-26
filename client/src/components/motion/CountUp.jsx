import { animate, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef } from 'react';

// Counts from 0 to `to` when scrolled into view. Writes straight to the DOM node,
// so it does not re-render React on every frame.
export default function CountUp({ to, prefix = '', suffix = '', decimals = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduce = useReducedMotion();
  const format = (v) =>
    `${prefix}${v.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;

  useEffect(() => {
    if (!inView || reduce || !ref.current) return undefined;
    const controls = animate(0, to, {
      duration: 0.5,
      ease: 'easeOut',
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = format(v);
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, to]);

  return <span ref={ref}>{format(reduce ? to : 0)}</span>;
}
